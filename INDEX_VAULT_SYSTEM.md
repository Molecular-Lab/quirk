# Index-Based Vault System - Complete Documentation

> **Complete technical documentation for Proxify's index-based custodial vault system with pooled DeFi deployment**

## Table of Contents

1. [Overview](#overview)
2. [Database Schema](#database-schema)
3. [Index Calculation Formulas](#index-calculation-formulas)
4. [Complete Flow Visualizations](#complete-flow-visualizations)
5. [Database Invariants](#database-invariants)

---

## Overview

### Concept: Money Market Fund Model

The index-based vault system works like a traditional money market fund:

- **Users buy "shares"** at the current index price
- **As yield accrues**, the index grows
- **User's effective balance** = shares × current_index / 1e18
- **No per-user yield tracking** needed - index handles everything automatically

### Key Benefits

✅ **Scalable**: Single index update affects all users
✅ **Fair**: Everyone earns proportional to their entry point
✅ **Gas-efficient**: No per-user writes for yield distribution
✅ **Supports DCA**: Weighted entry index handles multiple deposits

---

## Database Schema

### 1. END_USER_VAULTS (Index-Based Accounting)

Stores individual user vault positions using share-based accounting.

```sql
CREATE TABLE end_user_vaults (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relationships
  end_user_id UUID NOT NULL REFERENCES end_users(id),
  client_id UUID NOT NULL REFERENCES client_organizations(id),

  -- Chain & Token
  chain VARCHAR(50) NOT NULL,
  token_address VARCHAR(66) NOT NULL,
  token_symbol VARCHAR(20) NOT NULL,

  -- Index-Based Accounting (scaled by 1e18)
  shares NUMERIC(78,0) NOT NULL DEFAULT 0,
  -- shares = "normalized" units user owns
  -- effective_balance = shares * current_index / 1e18

  weighted_entry_index NUMERIC(78,0) NOT NULL DEFAULT 1000000000000000000,
  -- weighted average index across all deposits
  -- starts at 1.0 (scaled: 1e18)

  -- Historical tracking
  total_deposited NUMERIC(40,18) DEFAULT 0,
  total_withdrawn NUMERIC(40,18) DEFAULT 0,

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(end_user_id, chain, token_address)
);

CREATE INDEX idx_end_user_vaults_user ON end_user_vaults(end_user_id);
CREATE INDEX idx_end_user_vaults_client ON end_user_vaults(client_id);
CREATE INDEX idx_end_user_vaults_active ON end_user_vaults(is_active) WHERE is_active = true;
```

**Key Fields Explained:**

- `shares`: Normalized balance units (like vault shares in ERC-4626)
- `weighted_entry_index`: Average index at which user deposited (handles DCA)
- `effective_balance`: Calculated as `shares * current_index / 1e18`

---

### 2. CLIENT_VAULTS (Growth Index)

Stores the client's aggregated vault with the growth index.

```sql
CREATE TABLE client_vaults (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  client_id UUID NOT NULL REFERENCES client_organizations(id),

  chain VARCHAR(50) NOT NULL,
  token_address VARCHAR(66) NOT NULL,
  token_symbol VARCHAR(20) NOT NULL,

  -- Total shares issued to all users
  total_shares NUMERIC(78,0) DEFAULT 0,

  -- Growth Index (scaled by 1e18)
  current_index NUMERIC(78,0) DEFAULT 1000000000000000000,
  -- starts at 1.0 (1e18)
  -- grows as yield accrues: new_index = old_index * (1 + yield%)

  last_index_update TIMESTAMPTZ DEFAULT now(),

  -- Actual balances
  pending_deposit_balance NUMERIC(40,18) DEFAULT 0,
  total_staked_balance NUMERIC(40,18) DEFAULT 0,
  cumulative_yield NUMERIC(40,18) DEFAULT 0,

  -- Performance tracking
  apy_7d NUMERIC(10,4),
  apy_30d NUMERIC(10,4),

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(client_id, chain, token_address)
);

CREATE INDEX idx_client_vaults_client ON client_vaults(client_id);
CREATE INDEX idx_client_vaults_chain_token ON client_vaults(chain, token_address);
CREATE INDEX idx_client_vaults_pending ON client_vaults(pending_deposit_balance)
  WHERE pending_deposit_balance >= 10000;
```

**Key Fields Explained:**

- `current_index`: Growth multiplier (starts at 1.0, increases with yield)
- `total_shares`: Sum of all user shares
- `pending_deposit_balance`: Funds waiting to be staked
- `total_staked_balance`: Funds actively deployed in DeFi

---

### 3. DEPOSIT_BATCH_QUEUE

Tracks deposits waiting to be batched and staked.

```sql
CREATE TABLE deposit_batch_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  client_vault_id UUID NOT NULL REFERENCES client_vaults(id),
  deposit_transaction_id UUID NOT NULL REFERENCES deposit_transactions(id),

  amount NUMERIC(40,18) NOT NULL,

  status VARCHAR(20) DEFAULT 'pending',
  -- pending | batched | staked

  batched_at TIMESTAMPTZ,
  staked_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_deposit_queue_vault ON deposit_batch_queue(client_vault_id);
CREATE INDEX idx_deposit_queue_status ON deposit_batch_queue(status);
CREATE INDEX idx_deposit_queue_pending ON deposit_batch_queue(created_at)
  WHERE status = 'pending';
```

---

### 4. WITHDRAWAL_QUEUE

Manages withdrawal requests requiring DeFi unstaking.

```sql
CREATE TABLE withdrawal_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  client_id UUID NOT NULL REFERENCES client_organizations(id),
  withdrawal_transaction_id UUID NOT NULL REFERENCES withdrawal_transactions(id),

  end_user_vault_id UUID NOT NULL REFERENCES end_user_vaults(id),

  -- Withdrawal details
  shares_to_burn NUMERIC(78,0) NOT NULL,
  estimated_amount NUMERIC(40,18) NOT NULL,
  actual_amount NUMERIC(40,18),

  -- Unstaking details
  protocols_to_unstake JSONB,
  -- [{protocol_id, amount_to_unstake}]

  priority INTEGER DEFAULT 0,
  -- higher priority = process first

  status VARCHAR(20) DEFAULT 'queued',
  -- queued | unstaking | ready | processing | completed | failed

  queued_at TIMESTAMPTZ DEFAULT now(),
  unstaking_started_at TIMESTAMPTZ,
  ready_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  error_message TEXT
);

CREATE INDEX idx_withdrawal_queue_client ON withdrawal_queue(client_id);
CREATE INDEX idx_withdrawal_queue_status ON withdrawal_queue(status);
CREATE INDEX idx_withdrawal_queue_priority ON withdrawal_queue(priority DESC, queued_at ASC)
  WHERE status = 'queued';
```

---

## Index Calculation Formulas

### Concept Overview

```
Like a money market fund:
- Users buy "shares" at current index
- As yield accrues, index grows
- User's effective balance = shares * current_index / 1e18
```

### 1. DEPOSIT: Calculate Shares to Mint

```typescript
function calculateSharesForDeposit(
  depositAmount: bigint,      // e.g., 1000 USDC (scaled: 1000e18)
  currentIndex: bigint         // e.g., 1.05e18 (5% growth)
): bigint {
  // shares = depositAmount * 1e18 / currentIndex
  const shares = (depositAmount * 1_000_000_000_000_000_000n) / currentIndex;

  return shares;

  // Example:
  // User deposits 1000 USDC when index is 1.05
  // shares = 1000e18 * 1e18 / 1.05e18
  //        = 952.38e18 shares
}
```

---

### 2. WEIGHTED ENTRY INDEX (DCA Handling)

```typescript
function calculateNewWeightedEntryIndex(
  oldShares: bigint,           // User's existing shares
  oldWeightedIndex: bigint,    // User's current weighted entry index
  newShares: bigint,           // New shares from this deposit
  currentIndex: bigint         // Current client vault index
): bigint {
  if (oldShares === 0n) {
    // First deposit - just use current index
    return currentIndex;
  }

  // Weighted average calculation
  // new_weighted_index = (old_shares * old_index + new_shares * current_index) / (old_shares + new_shares)

  const oldValue = oldShares * oldWeightedIndex;
  const newValue = newShares * currentIndex;
  const totalShares = oldShares + newShares;

  const newWeightedIndex = (oldValue + newValue) / totalShares;

  return newWeightedIndex;

  // Example:
  // User has 1000 shares at entry index 1.0
  // User deposits again, gets 500 shares at current index 1.1
  // new_weighted = (1000 * 1.0 + 500 * 1.1) / 1500
  //              = (1000 + 550) / 1500
  //              = 1.0333
}
```

---

### 3. EFFECTIVE BALANCE (User's Current Value)

```typescript
function calculateEffectiveBalance(
  shares: bigint,              // User's shares
  currentIndex: bigint         // Current vault index
): bigint {
  // effective_balance = shares * current_index / 1e18
  const effectiveBalance = (shares * currentIndex) / 1_000_000_000_000_000_000n;

  return effectiveBalance;

  // Example:
  // User has 952.38 shares
  // Current index: 1.10 (10% total growth)
  // effective_balance = 952.38e18 * 1.10e18 / 1e18
  //                   = 1047.62 USDC
  // User's gain: 47.62 USDC (4.76%)
}
```

---

### 4. USER'S YIELD EARNED

```typescript
function calculateUserYield(
  shares: bigint,
  weightedEntryIndex: bigint,
  currentIndex: bigint
): bigint {
  const effectiveBalance = (shares * currentIndex) / 1_000_000_000_000_000_000n;
  const originalBalance = (shares * weightedEntryIndex) / 1_000_000_000_000_000_000n;

  const yieldEarned = effectiveBalance - originalBalance;

  return yieldEarned;

  // Example:
  // shares: 952.38e18
  // weighted_entry_index: 1.0e18
  // current_index: 1.10e18
  //
  // effective = 952.38 * 1.10 / 1 = 1047.62
  // original = 952.38 * 1.0 / 1 = 952.38
  // yield = 1047.62 - 952.38 = 95.24 USDC (10% gain)
}
```

---

### 5. INDEX GROWTH (From Yield)

```typescript
function updateIndexWithYield(
  oldIndex: bigint,
  totalStaked: bigint,         // Total assets in vault
  yieldEarned: bigint          // New yield earned
): bigint {
  if (totalStaked === 0n) return oldIndex;

  // growth_rate = yield_earned / total_staked
  // new_index = old_index * (1 + growth_rate)

  const growthRate = (yieldEarned * 1_000_000_000_000_000_000n) / totalStaked;
  const newIndex = oldIndex + (oldIndex * growthRate) / 1_000_000_000_000_000_000n;

  return newIndex;

  // Example:
  // old_index: 1.0e18
  // total_staked: 100,000 USDC
  // yield_earned: 5,000 USDC (5%)
  // growth_rate = 5000 / 100000 = 0.05 = 5%
  // new_index = 1.0 * 1.05 = 1.05e18
}
```

---

### 6. WITHDRAWAL: Calculate Shares to Burn

```typescript
function calculateSharesToBurn(
  withdrawalAmount: bigint,    // Amount user wants to withdraw
  userShares: bigint,          // User's total shares
  currentIndex: bigint         // Current vault index
): bigint {
  // Calculate user's effective balance
  const effectiveBalance = (userShares * currentIndex) / 1_000_000_000_000_000_000n;

  if (withdrawalAmount >= effectiveBalance) {
    // Withdrawing everything
    return userShares;
  }

  // Proportional burn
  const sharesToBurn = (withdrawalAmount * userShares) / effectiveBalance;

  return sharesToBurn;

  // Example:
  // User wants to withdraw 500 USDC
  // User has 952.38 shares
  // Current index: 1.10
  // Effective balance: 1047.62 USDC
  //
  // shares_to_burn = 500 * 952.38 / 1047.62
  //                = 454.35 shares
  //
  // Remaining: 498.03 shares
  // New effective balance: 498.03 * 1.10 = 547.62 USDC ✓
}
```

---

## Complete Flow Visualizations

### FLOW 1: Client Registration

```
┌─────────────────────────────────────────────┐
│  CLIENT REGISTRATION FLOW                   │
├─────────────────────────────────────────────┤
│                                              │
│  Step 1: Client Signs Up                    │
│  POST /api/v1/clients/register              │
│  {                                           │
│    company_name: "GrabPay",                 │
│    business_type: "fintech",                │
│    privy_organization_id: "privy_org_123"   │
│  }                                           │
│                                              │
│  ┌─────────────────────────────────────┐   │
│  │ DATABASE OPERATIONS:                 │   │
│  ├─────────────────────────────────────┤   │
│  │                                      │   │
│  │ 1. INSERT INTO client_organizations │   │
│  │    (                                 │   │
│  │      product_id: 'grab_prod_xyz',   │   │
│  │      company_name: 'GrabPay',       │   │
│  │      privy_organization_id: '...',  │   │
│  │      api_key_hash: hash('pk_live...')│  │
│  │      platform_fee: 1.0,             │   │
│  │      end_user_yield_portion: 90.0   │   │
│  │    )                                 │   │
│  │    RETURNING id                      │   │
│  │                                      │   │
│  │ 2. INSERT INTO client_balances       │   │
│  │    (                                 │   │
│  │      client_id: <from step 1>,      │   │
│  │      available: 0,                   │   │
│  │      reserved: 0                     │   │
│  │    )                                 │   │
│  │                                      │   │
│  │ 3. INSERT INTO audit_logs            │   │
│  │    (                                 │   │
│  │      client_id: <from step 1>,      │   │
│  │      action: 'client.registered',   │   │
│  │      actor_type: 'client'            │   │
│  │    )                                 │   │
│  └─────────────────────────────────────┘   │
│                                              │
│  Response:                                  │
│  {                                           │
│    client_id: "uuid...",                    │
│    api_key: "pk_live_abc123...",            │
│    webhook_secret: "whsec_xyz..."           │
│  }                                           │
└─────────────────────────────────────────────┘
```

---

### FLOW 2: Client Configures Strategies

```
┌─────────────────────────────────────────────┐
│  STRATEGY CONFIGURATION FLOW                │
├─────────────────────────────────────────────┤
│                                              │
│  Step 1: Client Defines Strategy            │
│  POST /api/v1/clients/{id}/strategies       │
│  {                                           │
│    chain: "ethereum",                       │
│    token_address: "0xA0b8...USDC",          │
│    strategies: [                            │
│      {category: "lending", target: 50},     │
│      {category: "lp", target: 30},          │
│      {category: "staking", target: 20}      │
│    ]                                         │
│  }                                           │
│                                              │
│  ┌─────────────────────────────────────┐   │
│  │ DATABASE OPERATIONS:                 │   │
│  ├─────────────────────────────────────┤   │
│  │                                      │   │
│  │ 1. Check if client_vault exists:    │   │
│  │    SELECT id FROM client_vaults     │   │
│  │    WHERE client_id = $1             │   │
│  │      AND chain = 'ethereum'         │   │
│  │      AND token_address = '0xA0b8...'│   │
│  │                                      │   │
│  │ 2. If NOT exists, CREATE vault:     │   │
│  │    INSERT INTO client_vaults        │   │
│  │    (                                 │   │
│  │      client_id: 'uuid...',          │   │
│  │      chain: 'ethereum',             │   │
│  │      token_address: '0xA0b8...',    │   │
│  │      token_symbol: 'USDC',          │   │
│  │      total_shares: 0,                │   │
│  │      current_index: 1e18,           │   │
│  │      pending_deposit_balance: 0,    │   │
│  │      total_staked_balance: 0        │   │
│  │    )                                 │   │
│  │    RETURNING id                      │   │
│  │                                      │   │
│  │ 3. INSERT strategies (bulk):        │   │
│  │    INSERT INTO vault_strategies     │   │
│  │    VALUES                            │   │
│  │      (vault_id, 'lending', 50.00),  │   │
│  │      (vault_id, 'lp', 30.00),       │   │
│  │      (vault_id, 'staking', 20.00)   │   │
│  │    ON CONFLICT (vault_id, category) │   │
│  │    DO UPDATE SET target_percent = ..│   │
│  │                                      │   │
│  │ 4. INSERT INTO audit_logs            │   │
│  │    (action: 'vault.strategy_configured')│
│  └─────────────────────────────────────┘   │
│                                              │
│  Response:                                  │
│  {                                           │
│    vault_id: "uuid...",                     │
│    strategies: [...]                        │
│  }                                           │
└─────────────────────────────────────────────┘
```

---

### FLOW 3: End-User Account Creation

```
┌─────────────────────────────────────────────┐
│  END-USER ONBOARDING FLOW                   │
├─────────────────────────────────────────────┤
│                                              │
│  Scenario: Grab driver signs up for Earn    │
│                                              │
│  Step 1: GrabPay calls Proxify API          │
│  POST /api/v1/users                         │
│  Headers:                                   │
│    Authorization: Bearer pk_live_abc123...  │
│  Body:                                       │
│  {                                           │
│    user_id: "grab_driver_12345",            │
│    user_type: "custodial"                   │
│  }                                           │
│                                              │
│  ┌─────────────────────────────────────┐   │
│  │ DATABASE OPERATIONS:                 │   │
│  ├─────────────────────────────────────┤   │
│  │                                      │   │
│  │ 1. Verify API key & get client_id:  │   │
│  │    SELECT id FROM client_organizations│  │
│  │    WHERE api_key_hash = hash($apiKey)│  │
│  │                                      │   │
│  │ 2. Check if user already exists:    │   │
│  │    SELECT id FROM end_users         │   │
│  │    WHERE client_id = $1             │   │
│  │      AND user_id = 'grab_driver_...'│   │
│  │                                      │   │
│  │ 3. If NOT exists, INSERT user:      │   │
│  │    INSERT INTO end_users            │   │
│  │    (                                 │   │
│  │      client_id: <from API key>,     │   │
│  │      user_id: 'grab_driver_12345',  │   │
│  │      user_type: 'custodial',        │   │
│  │      is_active: true                 │   │
│  │    )                                 │   │
│  │    RETURNING id                      │   │
│  │                                      │   │
│  │ 4. INSERT INTO audit_logs            │   │
│  │    (                                 │   │
│  │      client_id: ...,                │   │
│  │      user_id: 'grab_driver_12345',  │   │
│  │      action: 'user.created',        │   │
│  │      actor_type: 'client'            │   │
│  │    )                                 │   │
│  └─────────────────────────────────────┘   │
│                                              │
│  Response:                                  │
│  {                                           │
│    user_id: "uuid...",                      │
│    status: "active"                         │
│  }                                           │
│                                              │
│  NOTE: Vault is created on FIRST DEPOSIT   │
└─────────────────────────────────────────────┘
```

---

### FLOW 4: Deposit via On-Ramp (External)

```
┌─────────────────────────────────────────────────────────────────┐
│  EXTERNAL DEPOSIT FLOW (via Bitkub/Transak)                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Scenario: User deposits 10,000 THB via PromptPay               │
│                                                                   │
│  Step 1: GrabPay initiates deposit                              │
│  POST /api/v1/deposits                                          │
│  {                                                               │
│    user_id: "grab_driver_12345",                                │
│    amount: 10000,                                               │
│    currency: "THB",                                             │
│    chain: "ethereum",                                           │
│    token: "USDC",                                               │
│    payment_method: "promptpay"                                  │
│  }                                                               │
│                                                                   │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ DATABASE OPERATIONS (Phase 1: Initiate)                │    │
│  ├────────────────────────────────────────────────────────┤    │
│  │                                                         │    │
│  │ 1. Generate order_id:                                  │    │
│  │    order_id = `dep_${timestamp}_${random}`             │    │
│  │                                                         │    │
│  │ 2. INSERT INTO deposit_transactions                    │    │
│  │    (                                                    │    │
│  │      order_id: 'dep_1234567890_abc',                   │    │
│  │      client_id: <from API key>,                        │    │
│  │      user_id: 'grab_driver_12345',                     │    │
│  │      deposit_type: 'external',                         │    │
│  │      payment_method: 'promptpay',                      │    │
│  │      fiat_amount: 10000,                               │    │
│  │      currency: 'THB',                                  │    │
│  │      crypto_currency: 'USDC',                          │    │
│  │      status: 'pending',                                │    │
│  │      expires_at: now() + interval '1 hour'             │    │
│  │    )                                                    │    │
│  │    RETURNING id                                         │    │
│  │                                                         │    │
│  │ 3. Call Bitkub API (external):                         │    │
│  │    POST https://api.bitkub.com/api/v1/deposit          │    │
│  │    Returns: {payment_url, qr_code, gateway_order_id}   │    │
│  │                                                         │    │
│  │ 4. UPDATE deposit_transactions                         │    │
│  │    SET payment_url = <from Bitkub>,                    │    │
│  │        gateway_order_id = <from Bitkub>                │    │
│  │    WHERE id = <from step 2>                            │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                   │
│  Response to GrabPay:                                           │
│  {                                                               │
│    order_id: "dep_1234567890_abc",                              │
│    payment_url: "https://pay.bitkub.com/...",                   │
│    qr_code: "data:image/png;base64,...",                        │
│    expires_at: "2024-01-15T10:00:00Z"                           │
│  }                                                               │
│                                                                   │
│  ─────────────────────────────────────────────────────────────  │
│                                                                   │
│  Step 2: User pays via PromptPay                                │
│  (Happens outside Proxify - in banking app)                     │
│                                                                   │
│  ─────────────────────────────────────────────────────────────  │
│                                                                   │
│  Step 3: Bitkub webhook callback                                │
│  POST /webhooks/bitkub                                          │
│  {                                                               │
│    gateway_order_id: "btkb_xyz123",                             │
│    status: "completed",                                         │
│    fiat_amount: 10000,                                          │
│    crypto_amount: 285.71,  // 10000 THB / 35 THB/USDC          │
│    tx_hash: "0xabc...def"                                       │
│  }                                                               │
│                                                                   │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ DATABASE OPERATIONS (Phase 2: Confirm)                 │    │
│  ├────────────────────────────────────────────────────────┤    │
│  │                                                         │    │
│  │ BEGIN TRANSACTION;                                      │    │
│  │                                                         │    │
│  │ 1. Find deposit record:                                │    │
│  │    SELECT * FROM deposit_transactions                  │    │
│  │    WHERE gateway_order_id = 'btkb_xyz123'              │    │
│  │    FOR UPDATE;  -- Lock row                            │    │
│  │                                                         │    │
│  │ 2. UPDATE deposit_transactions                         │    │
│  │    SET status = 'completed',                           │    │
│  │        crypto_amount = 285.71,                         │    │
│  │        completed_at = now()                            │    │
│  │    WHERE id = <from step 1>                            │    │
│  │                                                         │    │
│  │ 3. Get or create end_user:                            │    │
│  │    SELECT id FROM end_users                            │    │
│  │    WHERE client_id = ... AND user_id = '...'           │    │
│  │                                                         │    │
│  │ 4. Get or create client_vault:                        │    │
│  │    SELECT id, current_index, total_shares              │    │
│  │    FROM client_vaults                                  │    │
│  │    WHERE client_id = ...                               │    │
│  │      AND chain = 'ethereum'                            │    │
│  │      AND token_address = '0xA0b8...' -- USDC           │    │
│  │    FOR UPDATE;  -- Lock vault                          │    │
│  │                                                         │    │
│  │    If NOT exists:                                      │    │
│  │      INSERT INTO client_vaults                         │    │
│  │      (client_id, chain, token_address,                 │    │
│  │       token_symbol: 'USDC',                            │    │
│  │       current_index: 1000000000000000000,  -- 1.0e18   │    │
│  │       total_shares: 0)                                 │    │
│  │      RETURNING id, current_index                       │    │
│  │                                                         │    │
│  │ 5. Calculate shares to mint:                          │    │
│  │    deposit_amount_scaled = 285.71 * 1e18               │    │
│  │    shares = deposit_amount * 1e18 / current_index      │    │
│  │           = 285.71e18 * 1e18 / 1.0e18                  │    │
│  │           = 285.71e18 shares                           │    │
│  │                                                         │    │
│  │ 6. Get or create end_user_vault:                      │    │
│  │    SELECT * FROM end_user_vaults                       │    │
│  │    WHERE end_user_id = ...                             │    │
│  │      AND chain = 'ethereum'                            │    │
│  │      AND token_address = '0xA0b8...'                   │    │
│  │    FOR UPDATE;  -- Lock user vault                     │    │
│  │                                                         │    │
│  │    If NOT exists:                                      │    │
│  │      INSERT INTO end_user_vaults                       │    │
│  │      (end_user_id, client_id, chain,                   │    │
│  │       token_address, token_symbol: 'USDC',             │    │
│  │       shares: 0,                                       │    │
│  │       weighted_entry_index: 1e18)                      │    │
│  │                                                         │    │
│  │ 7. Calculate new weighted entry index:                │    │
│  │    old_shares = <current user shares>                  │    │
│  │    old_weighted_index = <current weighted_entry_index> │    │
│  │    new_shares = 285.71e18                              │    │
│  │    current_index = 1.0e18                              │    │
│  │                                                         │    │
│  │    If old_shares == 0:                                 │    │
│  │      new_weighted_index = current_index                │    │
│  │    Else:                                               │    │
│  │      new_weighted_index =                              │    │
│  │        (old_shares * old_weighted_index +              │    │
│  │         new_shares * current_index) /                  │    │
│  │        (old_shares + new_shares)                       │    │
│  │                                                         │    │
│  │ 8. UPDATE end_user_vaults                              │    │
│  │    SET shares = shares + 285.71e18,                    │    │
│  │        weighted_entry_index = <from step 7>,           │    │
│  │        total_deposited = total_deposited + 285.71,     │    │
│  │        last_deposit_at = now(),                        │    │
│  │        updated_at = now()                              │    │
│  │    WHERE id = <from step 6>                            │    │
│  │                                                         │    │
│  │ 9. UPDATE client_vaults                                │    │
│  │    SET total_shares = total_shares + 285.71e18,        │    │
│  │        pending_deposit_balance =                       │    │
│  │          pending_deposit_balance + 285.71,             │    │
│  │        updated_at = now()                              │    │
│  │    WHERE id = <vault_id>                               │    │
│  │                                                         │    │
│  │ 10. INSERT INTO deposit_batch_queue                    │    │
│  │     (                                                   │    │
│  │       client_vault_id: <vault_id>,                     │    │
│  │       deposit_transaction_id: <deposit_id>,            │    │
│  │       amount: 285.71,                                  │    │
│  │       status: 'pending'                                │    │
│  │     )                                                   │    │
│  │                                                         │    │
│  │ 11. UPDATE end_users                                   │    │
│  │     SET last_deposit_at = now()                        │    │
│  │     WHERE id = <end_user_id>                           │    │
│  │                                                         │    │
│  │ 12. INSERT INTO audit_logs                             │    │
│  │     (                                                   │    │
│  │       client_id: ...,                                  │    │
│  │       user_id: 'grab_driver_12345',                    │    │
│  │       action: 'deposit.completed',                     │    │
│  │       resource_type: 'deposit',                        │    │
│  │       resource_id: <deposit_id>,                       │    │
│  │       metadata: {                                       │    │
│  │         amount: 285.71,                                │    │
│  │         shares_minted: 285.71e18,                      │    │
│  │         entry_index: 1.0e18                            │    │
│  │       }                                                 │    │
│  │     )                                                   │    │
│  │                                                         │    │
│  │ COMMIT;                                                 │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                   │
│  Webhook response to GrabPay:                                   │
│  POST https://grab.com/webhooks/proxify                         │
│  {                                                               │
│    event: "deposit.completed",                                  │
│    order_id: "dep_1234567890_abc",                              │
│    user_id: "grab_driver_12345",                                │
│    amount: 285.71,                                              │
│    currency: "USDC",                                            │
│    status: "completed"                                          │
│  }                                                               │
└─────────────────────────────────────────────────────────────────┘

DATABASE STATE AFTER DEPOSIT:

client_vaults:
┌──────────┬────────┬─────────────┬────────────┬──────────────┐
│ chain    │ token  │ total_shares│ current_idx│ pending_bal  │
├──────────┼────────┼─────────────┼────────────┼──────────────┤
│ ethereum │ USDC   │ 285.71e18   │ 1.0e18     │ 285.71       │
└──────────┴────────┴─────────────┴────────────┴──────────────┘

end_user_vaults:
┌──────────┬────────┬───────────┬─────────────────────┬──────────────┐
│ user_id  │ chain  │ shares    │ weighted_entry_idx  │ total_dep    │
├──────────┼────────┼───────────┼─────────────────────┼──────────────┤
│ grab_... │ eth    │ 285.71e18 │ 1.0e18              │ 285.71       │
└──────────┴────────┴───────────┴─────────────────────┴──────────────┘

Effective Balance Calculation:
effective_balance = shares * current_index / 1e18
                  = 285.71e18 * 1.0e18 / 1e18
                  = 285.71 USDC ✓
```

---

### FLOW 5: User Views Vault Balance (Pre-Stake)

```
┌─────────────────────────────────────────────┐
│  GET USER BALANCE API                       │
├─────────────────────────────────────────────┤
│                                              │
│  GET /api/v1/users/{user_id}/balance        │
│  Query params:                              │
│    chain: ethereum                          │
│    token: USDC                              │
│                                              │
│  ┌─────────────────────────────────────┐   │
│  │ DATABASE QUERY:                      │   │
│  ├─────────────────────────────────────┤   │
│  │                                      │   │
│  │ SELECT                               │   │
│  │   euv.shares,                        │   │
│  │   euv.weighted_entry_index,          │   │
│  │   euv.total_deposited,               │   │
│  │   cv.current_index,                  │   │
│  │   cv.total_staked_balance,           │   │
│  │   cv.pending_deposit_balance         │   │
│  │ FROM end_user_vaults euv             │   │
│  │ JOIN client_vaults cv                │   │
│  │   ON euv.client_id = cv.client_id    │   │
│  │   AND euv.chain = cv.chain           │   │
│  │   AND euv.token_address = cv.token_address│
│  │ WHERE euv.end_user_id = (            │   │
│  │   SELECT id FROM end_users           │   │
│  │   WHERE client_id = ... AND user_id = ...│
│  │ )                                     │   │
│  │   AND euv.chain = 'ethereum'         │   │
│  │   AND cv.token_symbol = 'USDC';      │   │
│  └─────────────────────────────────────┘   │
│                                              │
│  Calculation:                               │
│  effective_balance = shares * current_index / 1e18│
│                    = 285.71e18 * 1.0e18 / 1e18│
│                    = 285.71 USDC             │
│                                              │
│  yield_earned = effective_balance - total_deposited│
│               = 285.71 - 285.71              │
│               = 0 USDC (no yield yet)        │
│                                              │
│  Response:                                  │
│  {                                           │
│    balance: 285.71,                         │
│    currency: "USDC",                        │
│    yield_earned: 0,                         │
│    apy: 0,                                  │
│    status: "pending_stake",                 │
│    shares: "285710000000000000000",         │
│    entry_index: "1000000000000000000",      │
│    current_index: "1000000000000000000"     │
│  }                                           │
└─────────────────────────────────────────────┘
```

---

### FLOW 6: Daily Staking Execution

```
┌──────────────────────────────────────────────────────────────────┐
│  DAILY STAKING BATCH JOB                                         │
│  Runs: Every day at 00:00 UTC or when pending > $10,000         │
├──────────────────────────────────────────────────────────────────┤
│                                                                    │
│  Scenario: $50,000 USDC accumulated across 50 users              │
│                                                                    │
│  Step 1: Find vaults ready for staking                           │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ QUERY: Find vaults with pending deposits                 │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │                                                           │   │
│  │ SELECT                                                    │   │
│  │   cv.id AS vault_id,                                      │   │
│  │   cv.client_id,                                           │   │
│  │   cv.chain,                                               │   │
│  │   cv.token_address,                                       │   │
│  │   cv.token_symbol,                                        │   │
│  │   cv.pending_deposit_balance,                             │   │
│  │   cv.current_index,                                       │   │
│  │   cv.total_shares                                         │   │
│  │ FROM client_vaults cv                                     │   │
│  │ WHERE cv.pending_deposit_balance >= 10000  -- $10K min    │   │
│  │   AND cv.is_active = true                                 │   │
│  │ ORDER BY cv.pending_deposit_balance DESC;                 │   │
│  │                                                           │   │
│  │ Result:                                                   │   │
│  │ vault_id: uuid-123                                        │   │
│  │ pending_balance: 50,000 USDC                              │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                    │
│  Step 2: Get vault strategies                                    │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ SELECT category, target_percent                          │   │
│  │ FROM vault_strategies                                     │   │
│  │ WHERE client_vault_id = 'uuid-123';                       │   │
│  │                                                           │   │
│  │ Result:                                                   │   │
│  │ lending: 50%  → $25,000                                   │   │
│  │ lp: 30%       → $15,000                                   │   │
│  │ staking: 20%  → $10,000                                   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                    │
│  Step 3: Get active protocols for each category                  │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ SELECT id, name, address_book, apy                        │   │
│  │ FROM supported_defi_protocols                             │   │
│  │ WHERE chain = 'ethereum'                                  │   │
│  │   AND category = 'lending'                                │   │
│  │   AND is_active = true                                    │   │
│  │ ORDER BY apy DESC;                                        │   │
│  │                                                           │   │
│  │ Result (Lending):                                         │   │
│  │ - Aave: 4.8% APY                                          │   │
│  │ - Compound: 4.2% APY                                      │   │
│  │                                                           │   │
│  │ Allocation strategy (within lending):                    │   │
│  │ - Aave: 60% of $25K = $15,000                             │   │
│  │ - Compound: 40% of $25K = $10,000                         │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                    │
│  Step 4: Execute stakes on-chain                                 │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ BLOCKCHAIN TRANSACTIONS:                                  │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │                                                           │   │
│  │ Transaction 1: Stake to Aave                              │   │
│  │ ────────────────────────────────────────────────────────  │   │
│  │ 1. Approve USDC to Aave Pool:                            │   │
│  │    USDC.approve(aavePool, 15000e6)                        │   │
│  │    → tx_hash_approve: 0xaaa...                            │   │
│  │                                                           │   │
│  │ 2. Supply to Aave:                                        │   │
│  │    aavePool.supply(USDC, 15000e6, onBehalfOf, 0)         │   │
│  │    → tx_hash_supply: 0xbbb...                             │   │
│  │    → Receive aUSDC (interest-bearing token)              │   │
│  │                                                           │   │
│  │ Transaction 2: Stake to Compound                          │   │
│  │ ────────────────────────────────────────────────────────  │   │
│  │ 1. Approve USDC to Compound:                              │   │
│  │    USDC.approve(cUSDC, 10000e6)                           │   │
│  │    → tx_hash_approve: 0xccc...                            │   │
│  │                                                           │   │
│  │ 2. Supply to Compound:                                    │   │
│  │    cUSDC.mint(10000e6)                                    │   │
│  │    → tx_hash_mint: 0xddd...                               │   │
│  │    → Receive cUSDC (interest-bearing token)              │   │
│  │                                                           │   │
│  │ Transaction 3: LP on Curve                                │   │
│  │ ────────────────────────────────────────────────────────  │   │
│  │ (Similar for remaining $25K to LP and staking)            │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                    │
│  Step 5: Update database after successful stakes                 │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ DATABASE UPDATES:                                         │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │                                                           │   │
│  │ BEGIN TRANSACTION;                                        │   │
│  │                                                           │   │
│  │ 1. Lock client vault:                                    │   │
│  │    SELECT * FROM client_vaults                           │   │
│  │    WHERE id = 'uuid-123'                                 │   │
│  │    FOR UPDATE;                                            │   │
│  │                                                           │   │
│  │ 2. INSERT/UPDATE defi_allocations (Aave):                │   │
│  │    INSERT INTO defi_allocations                          │   │
│  │    (                                                      │   │
│  │      client_id: <client_id>,                             │   │
│  │      client_vault_id: 'uuid-123',                        │   │
│  │      protocol_id: <aave_protocol_id>,                    │   │
│  │      category: 'lending',                                │   │
│  │      chain: 'ethereum',                                  │   │
│  │      token_address: '0xA0b8...', -- USDC                 │   │
│  │      token_symbol: 'USDC',                               │   │
│  │      balance: 15000000000000000000000,  -- 15000 * 1e18  │   │
│  │      percentage_allocation: 60.00,                       │   │
│  │      apy: 4.8,                                           │   │
│  │      tx_hash: '0xbbb...',                                │   │
│  │      status: 'active',                                   │   │
│  │      deployed_at: now()                                  │   │
│  │    )                                                      │   │
│  │    ON CONFLICT (client_vault_id, protocol_id)            │   │
│  │    DO UPDATE SET                                         │   │
│  │      balance = defi_allocations.balance + 15000e18,      │   │
│  │      last_rebalance_at = now();                          │   │
│  │                                                           │   │
│  │ 3. INSERT/UPDATE defi_allocations (Compound):            │   │
│  │    (Similar to above, amount: 10000)                     │   │
│  │                                                           │   │
│  │ 4. INSERT/UPDATE defi_allocations (LP protocols):        │   │
│  │    (Similar for remaining $25K)                          │   │
│  │                                                           │   │
│  │ 5. UPDATE client_vaults:                                 │   │
│  │    UPDATE client_vaults                                  │   │
│  │    SET pending_deposit_balance = 0,                      │   │
│  │        total_staked_balance = 50000,                     │   │
│  │        updated_at = now()                                │   │
│  │    WHERE id = 'uuid-123';                                │   │
│  │                                                           │   │
│  │ 6. UPDATE deposit_batch_queue:                           │   │
│  │    UPDATE deposit_batch_queue                            │   │
│  │    SET status = 'staked',                                │   │
│  │        staked_at = now()                                 │   │
│  │    WHERE client_vault_id = 'uuid-123'                    │   │
│  │      AND status = 'pending';                             │   │
│  │                                                           │   │
│  │ 7. INSERT INTO audit_logs:                               │   │
│  │    INSERT INTO audit_logs                                │   │
│  │    (                                                      │   │
│  │      client_id: <client_id>,                             │   │
│  │      action: 'vault.staked',                             │   │
│  │      actor_type: 'system',                               │   │
│  │      resource_type: 'vault',                             │   │
│  │      resource_id: 'uuid-123',                            │   │
│  │      metadata: {                                          │   │
│  │        amount_staked: 50000,                             │   │
│  │        protocols: [                                       │   │
│  │          {name: 'Aave', amount: 15000},                  │   │
│  │          {name: 'Compound', amount: 10000},              │   │
│  │          ...                                              │   │
│  │        ]                                                  │   │
│  │      }                                                    │   │
│  │    );                                                     │   │
│  │                                                           │   │
│  │ COMMIT;                                                   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                    │
│  DATABASE STATE AFTER STAKING:                                   │
│                                                                    │
│  client_vaults:                                                   │
│  ┌────────┬──────────────┬──────────────┬────────────┐          │
│  │ token  │ pending_bal  │ staked_bal   │ current_idx│          │
│  ├────────┼──────────────┼──────────────┼────────────┤          │
│  │ USDC   │ 0            │ 50,000       │ 1.0e18     │          │
│  └────────┴──────────────┴──────────────┴────────────┘          │
│                                                                    │
│  defi_allocations:                                                │
│  ┌──────────┬──────────┬────────────┬──────┬────────┐           │
│  │ protocol │ category │ balance    │ apy  │ status │           │
│  ├──────────┼──────────┼────────────┼──────┼────────┤           │
│  │ Aave     │ lending  │ 15,000     │ 4.8% │ active │           │
│  │ Compound │ lending  │ 10,000     │ 4.2% │ active │           │
│  │ Curve    │ lp       │ 15,000     │ 5.2% │ active │           │
│  │ ...      │ ...      │ ...        │ ...  │ ...    │           │
│  └──────────┴──────────┴────────────┴──────┴────────┘           │
└──────────────────────────────────────────────────────────────────┘
```

---

### FLOW 7: Daily Yield Accrual & Index Update

```
┌──────────────────────────────────────────────────────────────────┐
│  DAILY YIELD HARVEST & INDEX UPDATE                              │
│  Runs: Every day at 01:00 UTC (after staking job)               │
├──────────────────────────────────────────────────────────────────┤
│                                                                    │
│  Step 1: Query current balances from protocols                   │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ ON-CHAIN QUERIES:                                         │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │                                                           │   │
│  │ 1. Check Aave balance:                                    │   │
│  │    aUSDC.balanceOf(proxifyVaultAddress)                   │   │
│  │    → Result: 15,006.02 USDC                               │   │
│  │    → Yield: 6.02 USDC (daily = ~4.8% APY)                │   │
│  │                                                           │   │
│  │ 2. Check Compound balance:                                │   │
│  │    cUSDC.balanceOfUnderlying(proxifyVaultAddress)         │   │
│  │    → Result: 10,003.84 USDC                               │   │
│  │    → Yield: 3.84 USDC                                     │   │
│  │                                                           │   │
│  │ 3. Check Curve LP:                                        │   │
│  │    curvePool.calc_withdraw_one_coin(lpBalance, USDC_idx)  │   │
│  │    → Result: 15,005.85 USDC                               │   │
│  │    → Yield: 5.85 USDC                                     │   │
│  │                                                           │   │
│  │ TOTAL YIELD EARNED: 15.71 USDC (daily)                   │   │
│  │ ANNUALIZED APY: ~4.7%                                     │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                    │
│  Step 2: Update database with yields                             │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ DATABASE UPDATES:                                         │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │                                                           │   │
│  │ BEGIN TRANSACTION;                                        │   │
│  │                                                           │   │
│  │ 1. Lock client vault:                                    │   │
│  │    SELECT * FROM client_vaults                           │   │
│  │    WHERE id = 'uuid-123'                                 │   │
│  │    FOR UPDATE;                                            │   │
│  │                                                           │   │
│  │ 2. UPDATE defi_allocations (each protocol):              │   │
│  │    UPDATE defi_allocations                               │   │
│  │    SET balance = 15006020000000000000000,  -- new bal    │   │
│  │        yield_earned = yield_earned + 6020000000000000000,│   │
│  │        updated_at = now()                                │   │
│  │    WHERE client_vault_id = 'uuid-123'                    │   │
│  │      AND protocol_id = <aave_id>;                        │   │
│  │                                                           │   │
│  │    (Repeat for Compound, Curve, etc.)                    │   │
│  │                                                           │   │
│  │ 3. Calculate new index:                                  │   │
│  │    old_index = 1.0e18                                    │   │
│  │    total_staked = 50,000                                 │   │
│  │    yield_earned = 15.71                                  │   │
│  │                                                           │   │
│  │    growth_rate = 15.71 / 50000 = 0.0003142 (0.03142%)   │   │
│  │    new_index = old_index * (1 + growth_rate)             │   │
│  │              = 1.0e18 * 1.0003142                        │   │
│  │              = 1.0003142e18                              │   │
│  │              = 1000314200000000000                       │   │
│  │                                                           │   │
│  │ 4. UPDATE client_vaults:                                 │   │
│  │    UPDATE client_vaults                                  │   │
│  │    SET current_index = 1000314200000000000,              │   │
│  │        total_staked_balance = 50015.71,                  │   │
│  │        cumulative_yield = cumulative_yield + 15.71,      │   │
│  │        last_index_update = now(),                        │   │
│  │        updated_at = now()                                │   │
│  │    WHERE id = 'uuid-123';                                │   │
│  │                                                           │   │
│  │ 5. Calculate APY (7-day and 30-day):                    │   │
│  │    (Query historical index values and compute)            │   │
│  │                                                           │   │
│  │ 6. INSERT INTO audit_logs:                               │   │
│  │    INSERT INTO audit_logs                                │   │
│  │    (                                                      │   │
│  │      action: 'vault.yield_updated',                      │   │
│  │      metadata: {                                          │   │
│  │        yield_earned: 15.71,                              │   │
│  │        old_index: '1.0e18',                              │   │
│  │        new_index: '1.0003142e18',                        │   │
│  │        apy: 4.7                                          │   │
│  │      }                                                    │   │
│  │    );                                                     │   │
│  │                                                           │   │
│  │ COMMIT;                                                   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                    │
│  Step 3: All users benefit automatically!                        │
│                                                                    │
│  User's new balance calculation:                                 │
│  ────────────────────────────────────────────────────────────    │
│  User deposited: 285.71 USDC                                     │
│  User's shares: 285.71e18                                        │
│  User's entry index: 1.0e18                                      │
│                                                                    │
│  NEW effective balance:                                          │
│  = shares * current_index / 1e18                                 │
│  = 285.71e18 * 1.0003142e18 / 1e18                               │
│  = 285.80 USDC                                                   │
│                                                                    │
│  User's yield: 285.80 - 285.71 = 0.09 USDC                      │
│                                                                    │
│  NO DATABASE UPDATE NEEDED FOR INDIVIDUAL USERS! ✓               │
│  Index-based accounting handles it automatically.                │
└──────────────────────────────────────────────────────────────────┘
```

---

### FLOW 8: User Initiates Withdrawal

```
┌──────────────────────────────────────────────────────────────────┐
│  WITHDRAWAL REQUEST FLOW                                         │
├──────────────────────────────────────────────────────────────────┤
│                                                                    │
│  Scenario: User wants to withdraw 150 USDC                       │
│                                                                    │
│  Step 1: GrabPay calls withdrawal API                            │
│  POST /api/v1/withdrawals                                        │
│  {                                                                │
│    user_id: "grab_driver_12345",                                 │
│    amount: 150,                                                  │
│    currency: "USDC",                                             │
│    chain: "ethereum",                                            │
│    destination_type: "bank_account",                             │
│    destination_details: {                                         │
│      bank_code: "BBL",                                           │
│      account_number: "1234567890"                                │
│    }                                                              │
│  }                                                                │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ DATABASE OPERATIONS (Phase 1: Validate & Queue)          │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │                                                           │   │
│  │ BEGIN TRANSACTION;                                        │   │
│  │                                                           │   │
│  │ 1. Get user vault and lock:                              │   │
│  │    SELECT                                                 │   │
│  │      euv.*,                                               │   │
│  │      cv.current_index,                                    │   │
│  │      cv.total_staked_balance                              │   │
│  │    FROM end_user_vaults euv                               │   │
│  │    JOIN client_vaults cv                                  │   │
│  │      ON euv.client_id = cv.client_id                      │   │
│  │      AND euv.chain = cv.chain                             │   │
│  │      AND euv.token_address = cv.token_address             │   │
│  │    WHERE euv.end_user_id = (...)                          │   │
│  │      AND euv.chain = 'ethereum'                           │   │
│  │      AND euv.token_symbol = 'USDC'                        │   │
│  │    FOR UPDATE;                                            │   │
│  │                                                           │   │
│  │    Result:                                                │   │
│  │    shares: 285.71e18                                      │   │
│  │    weighted_entry_index: 1.0e18                           │   │
│  │    current_index: 1.0003142e18                            │   │
│  │                                                           │   │
│  │ 2. Calculate effective balance:                          │   │
│  │    effective_balance = 285.71e18 * 1.0003142e18 / 1e18   │   │
│  │                      = 285.80 USDC                        │   │
│  │                                                           │   │
│  │ 3. Validate withdrawal amount:                           │   │
│  │    IF 150 > 285.80:                                       │   │
│  │      ROLLBACK;                                            │   │
│  │      RETURN error: "Insufficient balance"                │   │
│  │                                                           │   │
│  │ 4. Calculate shares to burn:                             │   │
│  │    shares_to_burn = 150 * 285.71e18 / 285.80             │   │
│  │                   = 150.01e18 shares                      │   │
│  │                                                           │   │
│  │ 5. Generate withdrawal order:                            │   │
│  │    order_id = `wth_${timestamp}_${random}`               │   │
│  │                                                           │   │
│  │ 6. INSERT INTO withdrawal_transactions:                  │   │
│  │    INSERT INTO withdrawal_transactions                   │   │
│  │    (                                                      │   │
│  │      order_id: 'wth_1234567890_xyz',                     │   │
│  │      client_id: <client_id>,                             │   │
│  │      user_id: 'grab_driver_12345',                       │   │
│  │      requested_amount: 150,                              │   │
│  │      currency: 'USDC',                                   │   │
│  │      destination_type: 'bank_account',                   │   │
│  │      destination_details: {...},                          │   │
│  │      status: 'pending'                                   │   │
│  │    )                                                      │   │
│  │    RETURNING id;                                          │   │
│  │                                                           │   │
│  │ 7. Get DeFi allocations to unstake from:                 │   │
│  │    SELECT                                                 │   │
│  │      da.protocol_id,                                      │   │
│  │      da.balance,                                          │   │
│  │      da.category,                                         │   │
│  │      sdp.name                                             │   │
│  │    FROM defi_allocations da                               │   │
│  │    JOIN supported_defi_protocols sdp                      │   │
│  │      ON da.protocol_id = sdp.id                           │   │
│  │    WHERE da.client_vault_id = <vault_id>                 │   │
│  │      AND da.status = 'active'                            │   │
│  │    ORDER BY da.balance ASC;  -- Unstake from smallest    │   │
│  │                                                           │   │
│  │    Result:                                                │   │
│  │    Compound: 10,003.84 USDC                               │   │
│  │    Aave: 15,006.02 USDC                                   │   │
│  │    Curve: 15,005.85 USDC                                  │   │
│  │                                                           │   │
│  │    Unstaking plan:                                        │   │
│  │    - Compound: Withdraw 150 USDC                          │   │
│  │      (still have 9,853.84 left)                           │   │
│  │                                                           │   │
│  │ 8. INSERT INTO withdrawal_queue:                         │   │
│  │    INSERT INTO withdrawal_queue                          │   │
│  │    (                                                      │   │
│  │      client_id: <client_id>,                             │   │
│  │      withdrawal_transaction_id: <from step 6>,           │   │
│  │      end_user_vault_id: <vault_id>,                      │   │
│  │      shares_to_burn: 150010000000000000000,              │   │
│  │      estimated_amount: 150,                              │   │
│  │      protocols_to_unstake: [                             │   │
│  │        {protocol_id: <compound_id>, amount: 150}         │   │
│  │      ],                                                   │   │
│  │      priority: 0,                                        │   │
│  │      status: 'queued',                                   │   │
│  │      queued_at: now()                                    │   │
│  │    );                                                     │   │
│  │                                                           │   │
│  │ 9. INSERT INTO audit_logs:                               │   │
│  │    (action: 'withdrawal.requested')                      │   │
│  │                                                           │   │
│  │ COMMIT;                                                   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                    │
│  Response to GrabPay:                                            │
│  {                                                                │
│    order_id: "wth_1234567890_xyz",                               │
│    status: "queued",                                             │
│    estimated_completion: "2-24 hours",                           │
│    amount: 150,                                                  │
│    currency: "USDC"                                              │
│  }                                                                │
│                                                                    │
│  DATABASE STATE:                                                 │
│  ─────────────────────────────────────────────────────────────   │
│  withdrawal_queue:                                               │
│  ┌──────────┬─────────┬──────────────┬──────────┐              │
│  │ order_id │ shares  │ est_amount   │ status   │              │
│  ├──────────┼─────────┼──────────────┼──────────┤              │
│  │ wth_...  │ 150.01e18│ 150 USDC    │ queued   │              │
│  └──────────┴─────────┴──────────────┴──────────┘              │
│                                                                    │
│  NOTE: User's shares NOT burned yet!                             │
│        Balance still shows 285.80 USDC                           │
│        Withdrawal is queued for processing                       │
└──────────────────────────────────────────────────────────────────┘
```

---

### FLOW 9: Withdrawal Batch Execution

```
┌──────────────────────────────────────────────────────────────────┐
│  WITHDRAWAL BATCH PROCESSING JOB                                 │
│  Runs: Every 4 hours or when queue > $50,000                    │
├──────────────────────────────────────────────────────────────────┤
│                                                                    │
│  Step 1: Fetch queued withdrawals                                │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ SELECT * FROM withdrawal_queue                            │   │
│  │ WHERE status = 'queued'                                   │   │
│  │ ORDER BY priority DESC, queued_at ASC                     │   │
│  │ LIMIT 100;                                                │   │
│  │                                                           │   │
│  │ Result: 20 withdrawals totaling $3,500                   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                    │
│  Step 2: Group by protocol & execute unstakes                    │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ AGGREGATE UNSTAKING PLAN:                                 │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │                                                           │   │
│  │ Compound: $1,500 to unstake                               │   │
│  │ Aave: $1,200 to unstake                                   │   │
│  │ Curve LP: $800 to unstake                                 │   │
│  │                                                           │   │
│  │ BLOCKCHAIN TRANSACTIONS:                                  │   │
│  │ ──────────────────────────────────────────────────────── │   │
│  │                                                           │   │
│  │ 1. Unstake from Compound:                                 │   │
│  │    cUSDC.redeemUnderlying(1500e6)                         │   │
│  │    → tx_hash: 0xeee...                                    │   │
│  │    → Received: 1,500.12 USDC (slightly more due to yield)│   │
│  │                                                           │   │
│  │ 2. Unstake from Aave:                                     │   │
│  │    aavePool.withdraw(USDC, 1200e6, recipient, 0)         │   │
│  │    → tx_hash: 0xfff...                                    │   │
│  │    → Received: 1,200.08 USDC                              │   │
│  │                                                           │   │
│  │ 3. Remove liquidity from Curve:                           │   │
│  │    curvePool.remove_liquidity_one_coin(lpAmount, ...)    │   │
│  │    → tx_hash: 0xggg...                                    │   │
│  │    → Received: 800.05 USDC                                │   │
│  │                                                           │   │
│  │ TOTAL RECEIVED: 3,500.25 USDC                             │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                    │
│  Step 3: Update all database records                             │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ DATABASE UPDATES (For each withdrawal):                   │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │                                                           │   │
│  │ FOR EACH withdrawal IN queue:                            │   │
│  │                                                           │   │
│  │   BEGIN TRANSACTION;                                      │   │
│  │                                                           │   │
│  │   1. Lock all relevant records:                          │   │
│  │      SELECT * FROM withdrawal_queue                      │   │
│  │      WHERE id = <withdrawal_id> FOR UPDATE;              │   │
│  │                                                           │   │
│  │      SELECT * FROM end_user_vaults                       │   │
│  │      WHERE id = <vault_id> FOR UPDATE;                   │   │
│  │                                                           │   │
│  │      SELECT * FROM client_vaults                         │   │
│  │      WHERE id = <client_vault_id> FOR UPDATE;            │   │
│  │                                                           │   │
│  │   2. UPDATE end_user_vaults (BURN SHARES):               │   │
│  │      UPDATE end_user_vaults                              │   │
│  │      SET shares = shares - 150010000000000000000,        │   │
│  │          total_withdrawn = total_withdrawn + 150,        │   │
│  │          last_withdrawal_at = now(),                     │   │
│  │          updated_at = now()                              │   │
│  │      WHERE id = <vault_id>;                              │   │
│  │                                                           │   │
│  │      New state:                                          │   │
│  │      shares: 285.71e18 - 150.01e18 = 135.70e18          │   │
│  │      effective_balance = 135.70e18 * 1.0003142e18 / 1e18│   │
│  │                        = 135.74 USDC ✓                   │   │
│  │                                                           │   │
│  │   3. UPDATE client_vaults (REDUCE TOTALS):               │   │
│  │      UPDATE client_vaults                                │   │
│  │      SET total_shares = total_shares - 150010000000000000000,│
│  │          total_staked_balance = total_staked_balance - 150,│
│  │          updated_at = now()                              │   │
│  │      WHERE id = <client_vault_id>;                       │   │
│  │                                                           │   │
│  │   4. UPDATE defi_allocations (REDUCE BALANCES):          │   │
│  │      -- Compound (unstaked 150)                          │   │
│  │      UPDATE defi_allocations                             │   │
│  │      SET balance = balance - 150000000000000000000,      │   │
│  │          updated_at = now()                              │   │
│  │      WHERE client_vault_id = <vault_id>                  │   │
│  │        AND protocol_id = <compound_id>;                  │   │
│  │                                                           │   │
│  │   5. UPDATE withdrawal_transactions:                     │   │
│  │      UPDATE withdrawal_transactions                      │   │
│  │      SET status = 'processing',                          │   │
│  │          actual_amount = 150.02,  -- slightly more       │   │
│  │      WHERE order_id = 'wth_1234567890_xyz';              │   │
│  │                                                           │   │
│  │   6. UPDATE withdrawal_queue:                            │   │
│  │      UPDATE withdrawal_queue                             │   │
│  │      SET status = 'ready',                               │   │
│  │          actual_amount = 150.02,                         │   │
│  │          ready_at = now()                                │   │
│  │      WHERE id = <withdrawal_id>;                         │   │
│  │                                                           │   │
│  │   7. INSERT INTO audit_logs:                             │   │
│  │      (action: 'withdrawal.unstaked')                     │   │
│  │                                                           │   │
│  │   COMMIT;                                                 │   │
│  │                                                           │   │
│  │ END FOR EACH;                                             │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                    │
│  Step 4: Send to off-ramp (Bitkub/Transak)                      │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ OFF-RAMP PROCESSING:                                      │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │                                                           │   │
│  │ FOR EACH withdrawal IN ready_queue:                      │   │
│  │                                                           │   │
│  │   1. Call Bitkub off-ramp API:                           │   │
│  │      POST https://api.bitkub.com/api/v1/withdraw         │   │
│  │      {                                                    │   │
│  │        amount: 150.02,                                   │   │
│  │        currency_from: "USDC",                            │   │
│  │        currency_to: "THB",                               │   │
│  │        destination: {                                     │   │
│  │          type: "bank_account",                           │   │
│  │          bank_code: "BBL",                               │   │
│  │          account_number: "1234567890"                    │   │
│  │        }                                                  │   │
│  │      }                                                    │   │
│  │                                                           │   │
│  │      Response:                                           │   │
│  │      {                                                    │   │
│  │        gateway_order_id: "btkb_withdraw_xyz",            │   │
│  │        estimated_thb: 5,250.70,  -- 150 * 35 THB/USDC   │   │
│  │        fee: 0.5%,                                        │   │
│  │        net_amount: 5,224.45,                             │   │
│  │        eta: "1-2 hours"                                  │   │
│  │      }                                                    │   │
│  │                                                           │   │
│  │   2. UPDATE withdrawal_transactions:                     │   │
│  │      UPDATE withdrawal_transactions                      │   │
│  │      SET status = 'processing',                          │   │
│  │          gateway_order_id = 'btkb_withdraw_xyz',         │   │
│  │          withdrawal_fee = 26.25  -- 0.5% fee            │   │
│  │      WHERE order_id = 'wth_1234567890_xyz';              │   │
│  │                                                           │   │
│  │   3. UPDATE withdrawal_queue:                            │   │
│  │      UPDATE withdrawal_queue                             │   │
│  │      SET status = 'processing'                           │   │
│  │      WHERE id = <withdrawal_id>;                         │   │
│  │                                                           │   │
│  │ END FOR EACH;                                             │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                    │
│  Step 5: Bitkub webhook - Transfer complete                     │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ WEBHOOK: POST /webhooks/bitkub/withdraw                  │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │                                                           │   │
│  │ {                                                         │   │
│  │   gateway_order_id: "btkb_withdraw_xyz",                 │   │
│  │   status: "completed",                                   │   │
│  │   thb_sent: 5224.45,                                     │   │
│  │   tx_reference: "BBL_TXN_123456"                         │   │
│  │ }                                                         │   │
│  │                                                           │   │
│  │ DATABASE UPDATE:                                          │   │
│  │ ────────────────────────────────────────────────────────  │   │
│  │                                                           │   │
│  │ BEGIN TRANSACTION;                                        │   │
│  │                                                           │   │
│  │ 1. UPDATE withdrawal_transactions:                       │   │
│  │    UPDATE withdrawal_transactions                        │   │
│  │    SET status = 'completed',                             │   │
│  │        completed_at = now()                              │   │
│  │    WHERE gateway_order_id = 'btkb_withdraw_xyz';         │   │
│  │                                                           │   │
│  │ 2. UPDATE withdrawal_queue:                              │   │
│  │    UPDATE withdrawal_queue                               │   │
│  │    SET status = 'completed',                             │   │
│  │        completed_at = now()                              │   │
│  │    WHERE withdrawal_transaction_id = <txn_id>;           │   │
│  │                                                           │   │
│  │ 3. UPDATE end_users:                                     │   │
│  │    UPDATE end_users                                      │   │
│  │    SET last_withdrawal_at = now()                        │   │
│  │    WHERE id = <end_user_id>;                             │   │
│  │                                                           │   │
│  │ 4. INSERT INTO audit_logs:                               │   │
│  │    (action: 'withdrawal.completed')                      │   │
│  │                                                           │   │
│  │ COMMIT;                                                   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                    │
│  Step 6: Notify GrabPay                                          │
│                                                                    │
│  POST https://grab.com/webhooks/proxify                          │
│  {                                                                │
│    event: "withdrawal.completed",                                │
│    order_id: "wth_1234567890_xyz",                               │
│    user_id: "grab_driver_12345",                                 │
│    amount: 150.02,                                               │
│    currency: "USDC",                                             │
│    fiat_amount: 5224.45,                                         │
│    fiat_currency: "THB",                                         │
│    status: "completed"                                           │
│  }                                                                │
│                                                                    │
│  FINAL DATABASE STATE:                                           │
│  ─────────────────────────────────────────────────────────────   │
│                                                                    │
│  end_user_vaults (User's vault):                                 │
│  ┌──────────┬───────────┬─────────────────┬──────────────┐      │
│  │ user_id  │ shares    │ weighted_entry  │ total_withdr │      │
│  ├──────────┼───────────┼─────────────────┼──────────────┤      │
│  │ grab_... │ 135.70e18 │ 1.0e18          │ 150          │      │
│  └──────────┴───────────┴─────────────────┴──────────────┘      │
│                                                                    │
│  Effective balance: 135.70e18 * 1.0003142e18 / 1e18 = 135.74 ✓  │
│                                                                    │
│  client_vaults:                                                   │
│  ┌────────┬──────────────┬──────────────┬────────────┐          │
│  │ token  │ total_shares │ staked_bal   │ current_idx│          │
│  ├────────┼──────────────┼──────────────┼────────────┤          │
│  │ USDC   │ 49,850e18    │ 49,865.71    │ 1.0003142e18│         │
│  └────────┴──────────────┴──────────────┴────────────┘          │
│                                                                    │
│  defi_allocations:                                                │
│  ┌──────────┬────────────┬──────┬────────┐                      │
│  │ protocol │ balance    │ apy  │ status │                      │
│  ├──────────┼────────────┼──────┼────────┤                      │
│  │ Aave     │ 15,006.02  │ 4.8% │ active │                      │
│  │ Compound │ 9,853.84   │ 4.2% │ active │  ← Reduced           │
│  │ Curve    │ 15,005.85  │ 5.2% │ active │                      │
│  └──────────┴────────────┴──────┴────────┘                      │
│                                                                    │
│  ✓ ALL RECORDS CONSISTENT                                        │
│  ✓ USER RECEIVED THB IN BANK                                     │
│  ✓ SHARES BURNED                                                 │
│  ✓ VAULT BALANCES UPDATED                                        │
│  ✓ DEFI ALLOCATIONS REDUCED                                      │
└──────────────────────────────────────────────────────────────────┘
```

---

## Database Invariants

These rules **MUST** always be true in the database:

### 1. Share Conservation

```
∑(end_user_vaults.shares) == client_vaults.total_shares
```

All user shares must sum exactly to the vault's total shares.

---

### 2. Staked Balance Matches Allocations

```
client_vaults.total_staked_balance == ∑(defi_allocations.balance)
```

The vault's staked balance must equal the sum of all DeFi protocol allocations.

---

### 3. Effective Balance Calculation

```
effective_balance = (shares * current_index) / entry_index
```

User's balance is always calculated from shares and index - never stored directly.

---

### 4. Index Only Grows

```
new_index >= old_index
```

The growth index can never decrease (yield-only, no losses tracked via index).

---

### 5. Proportional Withdrawal

```
shares_burned / user_shares == withdrawal_amount / effective_balance
```

Shares burned must be proportional to the amount withdrawn.

---

## Key Advantages

### Scalability

- ✅ **O(1) yield updates**: Single index write affects all users
- ✅ **No per-user yield writes**: Database writes scale with deposits/withdrawals only
- ✅ **Supports millions of users**: Each user only has one vault record

### Fairness

- ✅ **Pro-rata distribution**: Everyone earns proportional to their position
- ✅ **DCA-friendly**: Weighted entry index handles multiple deposits correctly
- ✅ **Instant compounding**: Yield automatically compounds into effective balance

### Simplicity

- ✅ **No complex accounting**: Just shares, index, and simple formulas
- ✅ **Easy auditing**: All yield in one index value
- ✅ **Battle-tested pattern**: Used in AAVE, Compound, Yearn, etc.

---

## Related Documentation

- **Database Schema**: See existing tables in `database/migrations/`
- **SQLC Queries**: See `database/queries/` for query definitions
- **Index Concept**: Originally from `apps/proxify-contract/VAULT_INDEX_EXPLAINED.md` (archived)
- **Product Vision**: See `PRODUCT_OWNER_FLOW.md` for complete business context

---

**Last Updated**: 2025-11-17
**Status**: Documentation Complete - Ready for Implementation
**Next Steps**: Create database migrations + SQLC queries + Go entities
