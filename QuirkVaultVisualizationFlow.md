# Quirk Vault System Flow - Complete Visualization

> **Last Updated:** 2025-11-29
> **Status:** Architecture Design - Pending Implementation

## Table of Contents

1. [Overview](#overview)
2. [Weighted APY Calculation Flow](#weighted-apy-calculation-flow)
3. [DeFi Protocol Integration (Wrapped Tokens)](#defi-protocol-integration-wrapped-tokens)
4. [Deposit Flow (Entry Index Tracking)](#deposit-flow-entry-index-tracking)
5. [Withdrawal Flow (Impact on Growth)](#withdrawal-flow-impact-on-growth)
6. [Full Timeline Example](#full-timeline-example)
7. [Database Schema Requirements](#database-schema-requirements)

---

## Overview

### System Architecture

```
Product Owner → Multiple Products → Multiple Custodial Wallets
                                          ↓
                              DeFi Protocols (AAVE, Compound, Morpho, Curve)
                                          ↓
                              Wrapped Tokens (aUSDC, cUSDC, etc.)
                                          ↓
                              Index-Based Yield Tracking
                                          ↓
                              Fair Distribution to End Users
```

### Key Concepts

- **One Product Owner** can have **multiple products** (e.g., GrabPay, GrabFood)
- **Each product** has **one Privy custodial wallet**
- **Each custodial wallet** deploys to **multiple DeFi protocols**
- **Each protocol** returns **wrapped tokens** (aUSDC, cUSDC, mUSDC, etc.)
- **Wrapped token balances** must be tracked per wallet per protocol
- **Exchange rate** between wrapped token and real token determines growth

---

## Weighted APY Calculation Flow

### 1. Daily Cron Job (Midnight UTC)

```
┌─────────────────────────────────────────────────────────────┐
│ Daily Cron Job Starts                                       │
│ Time: 00:00 UTC                                             │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 1: Get All Active Client Vaults                        │   
│ ─────────────────────────────────────────────────────────   │ WrappedToken.balanceOf(ClientAddress) * WrappedToken
│ Query: SELECT * FROM client_vaults                          │ ClientGrowthIndex 1.03 
│        WHERE is_active = true                               │
│        AND total_staked_balance > 0                         │
│                                                             │
│ Example Result:                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Vault ID: vault_grabpay_001                             │ │
│ │ Client: GrabPay (product_id: prod_grabpay)              │ │
│ │ Custodial Wallet: 0xABC...123                           │ │
│ │ Total Staked: $1,000,000                                │ │
│ │ Current Index: 1.03 (1030000000000000000)               │ │
│ │ Strategies:                                             │ │
│ │   - AAVE: 60% ($600,000)                                │ │
│ │   - Compound: 40% ($400,000)                            │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 2: For Each Vault, Check Wrapped Token Balances        │
│ ─────────────────────────────────────────────────────────   │
│ IMPORTANT: We don't fetch generic APY from APIs!            │
│ Instead, we check ACTUAL wrapped token balances.            │
│                                                             │
│ For GrabPay's wallet (0xABC...123):                         │
│                                                             │
│ ┌─ AAVE Protocol ────────────────────────────────────────┐  │
│ │ 1. Get aUSDC balance:                                  │  │
│ │    aUSDC.balanceOf(0xABC...123)                        │  │
│ │    → Result: 605,000 aUSDC                             │  │
│ │                                                        │  │
│ │ 2. Get exchange rate:                                  │  │
│ │    aUSDC.convertToAssets(1e18)                         │  │
│ │    → 1 aUSDC = 1.008333 USDC                           │  │
│ │                                                        │  │
│ │ 3. Calculate real value:                               │  │
│ │    Real USDC = 605,000 × 1.008333 = $610,041.47        │  │
│ │                                                        │  │
│ │ 4. Calculate growth:                                   │  │
│ │    Original deposit: $600,000                          │  │
│ │    Current value: $610,041.47                          │  │
│ │    Growth: $10,041.47 (1.674% since deposit)           │  │
│ └────────────────────────────────────────────────────────┘  │
│                                                             │
│ ┌─ Compound Protocol ────────────────────────────────────┐  │
│ │ 1. Get cUSDC balance:                                  │  │
│ │    cUSDC.balanceOf(0xABC...123)                        │  │
│ │    → Result: 19,523,809 cUSDC (scaled by 1e8)          │  │
│ │                                                        │  │
│ │ 2. Get exchange rate:                                  │  │
│ │    cUSDC.exchangeRateStored()                          │  │
│ │    → 0.020512 USDC per cUSDC                           │  │
│ │                                                        │  │
│ │ 3. Calculate real value:                               │  │
│ │    Real USDC = 19,523,809 × 0.020512 = $400,368.09     │  │
│ │                                                        │  │
│ │ 4. Calculate growth:                                   │  │
│ │    Original deposit: $400,000                          │  │
│ │    Current value: $400,368.09                          │  │
│ │    Growth: $368.09 (0.092% since deposit)              │  │
│ └────────────────────────────────────────────────────────┘  │
│                                                             │
│ Total Portfolio Value: $1,010,409.56                        │
│ Total Growth: $10,409.56                                    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 3: Update Wrapped Token Tracking in Database           │
│ ─────────────────────────────────────────────────────────   │
│ INSERT INTO client_wrapped_tokens (                         │
│   vault_id,                                                 │
│   protocol,                                                 │
│   wrapped_token_address,                                    │
│   wrapped_token_symbol,                                     │
│   wrapped_balance,          ← 605,000 aUSDC                 │
│   exchange_rate,            ← 1.008333 USDC per aUSDC       │
│   real_value,               ← $610,041.47                   │
│   recorded_at                                               │
│ )                                                           │
│ ON CONFLICT (vault_id, protocol) DO UPDATE                  │
│ SET wrapped_balance = EXCLUDED.wrapped_balance,             │
│     exchange_rate = EXCLUDED.exchange_rate,                 │
│     real_value = EXCLUDED.real_value,                       │
│     recorded_at = now()                                     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 4: Calculate Daily Growth Rate                         │
│ ─────────────────────────────────────────────────────────   │
│ Yesterday's Total Value: $1,000,000                         │
│ Today's Total Value: $1,010,409.56                          │
│                                                             │
│ Daily Growth Amount: $10,409.56                             │
│ Daily Growth Rate: ($10,409.56 / $1,000,000) = 1.041%      │
│                                                             │
│ This is the ACTUAL yield earned, not estimated from APY!    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 5: Update Growth Index                                 │
│ ─────────────────────────────────────────────────────────   │
│ Formula: new_index = current_index × (today_value / yesterday_value) │
│                                                             │
│ Example:                                                    │
│ • Current Index: 1.03                                       │
│ • Growth Multiplier: $1,010,409.56 / $1,000,000 = 1.010410 │
│ ───────────────────────────────────────────────────────     │
│ • New Index: 1.03 × 1.010410 = 1.040722                    │
│                                                             │
│ Safety Checks:                                              │
│ ✓ Index never decreases                                    │
│ ✓ Index doesn't grow more than 2× per day (unrealistic)    │
│ ✓ Exchange rate is valid (> 0)                              │
│ ✓ Wrapped balance matches expected range                   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 6: Save Index Update to Database                       │
│ ─────────────────────────────────────────────────────────   │
│ UPDATE client_vaults                                        │
│ SET current_index = 1040722000000000000,                    │
│     cumulative_yield = cumulative_yield + 10409.56,         │
│     total_staked_balance = 1010409.56,  ← Updated!          │
│     last_index_update = now()                               │
│ WHERE id = 'vault_grabpay_001'                              │
└─────────────────────────────────────────────────────────────┘
```

---

## DeFi Protocol Integration (Wrapped Tokens)

### Architecture for Multi-Product Owner

```
Product Owner: Grab
├─ Product: GrabPay (prod_grabpay)
│  ├─ Custodial Wallet: 0xABC...123
│  ├─ Total Staked: $1,000,000
│  └─ DeFi Deployments:
│     ├─ AAVE: $600,000 → 595,000 aUSDC (exchange rate: 1.008403)
│     └─ Compound: $400,000 → 19,500,000 cUSDC (exchange rate: 0.020512)
│
└─ Product: GrabFood (prod_grabfood)
   ├─ Custodial Wallet: 0xDEF...456
   ├─ Total Staked: $500,000
   └─ DeFi Deployments:
      ├─ AAVE: $300,000 → 297,500 aUSDC (exchange rate: 1.008403)
      └─ Morpho: $200,000 → 198,000 mUSDC (exchange rate: 1.010101)
```

### Wrapped Token Tracking Table Schema

```sql
CREATE TABLE client_wrapped_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relationships
  vault_id UUID NOT NULL REFERENCES client_vaults(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES client_organizations(id) ON DELETE CASCADE,

  -- Protocol Info
  protocol VARCHAR(50) NOT NULL, -- 'AAVE', 'COMPOUND', 'MORPHO', 'CURVE'
  wrapped_token_address VARCHAR(66) NOT NULL, -- aUSDC, cUSDC, etc.
  wrapped_token_symbol VARCHAR(20) NOT NULL, -- 'aUSDC', 'cUSDC'

  -- Balance Tracking
  wrapped_balance NUMERIC(78,18) NOT NULL DEFAULT 0, -- Wrapped token balance
  exchange_rate NUMERIC(40,18) NOT NULL, -- Wrapped → Real conversion rate
  real_value NUMERIC(40,18) NOT NULL, -- Calculated real USDC value

  -- Original Deposit (for growth calculation)
  original_deposit NUMERIC(40,18) NOT NULL DEFAULT 0,

  -- Growth Metrics
  growth_amount NUMERIC(40,18) GENERATED ALWAYS AS (real_value - original_deposit) STORED,
  growth_percentage NUMERIC(10,4) GENERATED ALWAYS AS
    (CASE WHEN original_deposit > 0
     THEN ((real_value - original_deposit) / original_deposit * 100)
     ELSE 0 END) STORED,

  -- Timestamps
  last_sync_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  UNIQUE(vault_id, protocol),
  CHECK (wrapped_balance >= 0),
  CHECK (exchange_rate > 0),
  CHECK (real_value >= 0)
);

CREATE INDEX idx_wrapped_tokens_vault ON client_wrapped_tokens(vault_id);
CREATE INDEX idx_wrapped_tokens_protocol ON client_wrapped_tokens(protocol);
CREATE INDEX idx_wrapped_tokens_sync ON client_wrapped_tokens(last_sync_at);

COMMENT ON TABLE client_wrapped_tokens IS 'Tracks wrapped token balances per vault per protocol for accurate yield calculation';
COMMENT ON COLUMN client_wrapped_tokens.exchange_rate IS 'Current exchange rate: 1 wrapped token = X real tokens';
COMMENT ON COLUMN client_wrapped_tokens.real_value IS 'wrapped_balance × exchange_rate = real USDC value';
```

### Protocol-Specific Exchange Rate Fetching

#### AAVE (aTokens)

```typescript
// aUSDC on Base Sepolia
const aUSDC_ADDRESS = '0x...'

// Get wrapped balance
const wrappedBalance = await aUSDC.balanceOf(custodialWallet)

// AAVE uses 1:1 with internal index
// Exchange rate = shares converted to assets
const exchangeRate = await aUSDC.convertToAssets(1e18) // How much USDC for 1 aUSDC
const realValue = (wrappedBalance * exchangeRate) / 1e18

// Example:
// wrappedBalance: 605000000000 (605,000 aUSDC with 6 decimals)
// exchangeRate: 1008333000000000000 (1.008333 with 18 decimals)
// realValue = (605000000000 × 1008333000000000000) / 1e18 = 610,041.47 USDC
```

#### Compound (cTokens)

```typescript
// cUSDC on Base Sepolia
const cUSDC_ADDRESS = '0x...'

// Get wrapped balance (cTokens use 8 decimals)
const wrappedBalance = await cUSDC.balanceOf(custodialWallet)

// Get exchange rate (how much USDC per 1 cUSDC)
const exchangeRate = await cUSDC.exchangeRateStored() // Returns with 18 decimals

// Convert cUSDC to USDC
const realValue = (wrappedBalance * exchangeRate) / 1e18

// Example:
// wrappedBalance: 1952380900 (19,523,809 cUSDC with 8 decimals)
// exchangeRate: 20512000000000000 (0.020512 with 18 decimals)
// realValue = (1952380900 × 20512000000000000) / 1e18 = 400,368.09 USDC
```

#### Morpho (Vault Shares)

```typescript
// Morpho Vault on Base Sepolia
const morphoVault_ADDRESS = '0x...'

// Get wrapped balance (shares)
const wrappedBalance = await morphoVault.balanceOf(custodialWallet)

// Get exchange rate (convertToAssets)
const exchangeRate = await morphoVault.convertToAssets(1e18)

// Convert shares to USDC
const realValue = (wrappedBalance * exchangeRate) / 1e18
```

### Daily Sync Flow

```typescript
async function syncWrappedTokenBalances(vaultId: string) {
  const vault = await getVaultById(vaultId)
  const custodialWallet = vault.custodial_wallet_address

  for (const strategy of vault.strategies) {
    const protocol = strategy.protocol // 'AAVE', 'COMPOUND', etc.

    // Get wrapped token contract
    const wrappedToken = getWrappedTokenContract(protocol, vault.chain)

    // Fetch current balance
    const wrappedBalance = await wrappedToken.balanceOf(custodialWallet)

    // Fetch exchange rate
    const exchangeRate = await getExchangeRate(wrappedToken, protocol)

    // Calculate real value
    const realValue = calculateRealValue(wrappedBalance, exchangeRate, protocol)

    // Save to database
    await upsertWrappedTokenTracking({
      vault_id: vaultId,
      protocol,
      wrapped_token_address: wrappedToken.address,
      wrapped_balance: wrappedBalance.toString(),
      exchange_rate: exchangeRate.toString(),
      real_value: realValue.toString(),
    })
  }
}
```

---

## Deposit Flow (Entry Index Tracking)

```
┌─────────────────────────────────────────────────────────────┐
│ End-User Deposits $100 via GrabPay App                      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 1: Get Current Client Growth Index                     │
│ ─────────────────────────────────────────────────────────   │
│ SELECT current_index FROM client_vaults                     │
│ WHERE client_id = 'prod_grabpay'                            │
│   AND chain = 'base-sepolia'                                │
│   AND token_symbol = 'USDC'                                 │
│                                                             │
│ Current Index: 1.040722000000000000                         │
│                                                             │
│ This is the "price" user is buying in at today!             │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 2: Check if User Already Has Vault                     │
│ ─────────────────────────────────────────────────────────   │
│ SELECT * FROM end_user_vaults                               │
│ WHERE end_user_id = 'user_123'                              │
│   AND client_id = 'prod_grabpay'                            │
│                                                             │
│ Case A: First Deposit (No existing vault)                   │
│ └─> Create new vault with entry index = 1.040722           │
│                                                             │
│ Case B: Additional Deposit (DCA - Dollar Cost Averaging)    │
│ └─> Recalculate weighted entry index                       │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 3A: First Deposit - Create Vault                       │
│ ─────────────────────────────────────────────────────────   │
│ INSERT INTO end_user_vaults (                               │
│   end_user_id,                                              │
│   client_id,                                                │
│   total_deposited,                                          │
│   weighted_entry_index  ← LOCK IN CURRENT INDEX             │
│ ) VALUES (                                                  │
│   'user_123',                                               │
│   'prod_grabpay',                                           │
│   100.00,                                                   │
│   1040722000000000000  ← Entry index at deposit time        │
│ )                                                           │
│                                                             │
│ User's entry index: 1.040722                                │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 3B: Additional Deposit - Weighted Entry Index          │
│ ─────────────────────────────────────────────────────────   │
│ User's Existing Vault:                                      │
│ • Previous deposit: $100                                    │
│ • Previous entry index: 1.040722                            │
│                                                             │
│ New Deposit:                                                │
│ • New deposit: $50                                          │
│ • Current index: 1.045000 (7 days later)                    │
│                                                             │
│ Weighted Entry Index Formula:                               │
│ new_weighted = (old_deposited × old_index +                 │
│                 new_deposit × current_index) /              │
│                (old_deposited + new_deposit)                │
│                                                             │
│ Calculation:                                                │
│ new_weighted = (100 × 1.040722 + 50 × 1.045000) / 150       │
│              = (104.0722 + 52.25) / 150                     │
│              = 156.3222 / 150                               │
│              = 1.042148                                     │
│                                                             │
│ UPDATE end_user_vaults                                      │
│ SET total_deposited = 150.00,                               │
│     weighted_entry_index = 1042148000000000000              │
│ WHERE end_user_id = 'user_123'                              │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 4: Update Client Vault Total Staked                    │
│ ─────────────────────────────────────────────────────────   │
│ UPDATE client_vaults                                        │
│ SET total_staked_balance = total_staked_balance + 100,      │
│     pending_deposit_balance = pending_deposit_balance + 100 │
│ WHERE client_id = 'prod_grabpay'                            │
│                                                             │
│ Old Total: $1,010,409.56 → New: $1,010,509.56              │
│                                                             │
│ Pending will be deployed to DeFi in next batch              │
└─────────────────────────────────────────────────────────────┘
```

---

## Withdrawal Flow (Impact on Growth)

```
┌─────────────────────────────────────────────────────────────┐
│ End-User Requests Withdrawal of $50                         │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 1: Get User's Vault & Current Index                    │
│ ─────────────────────────────────────────────────────────   │
│ User Vault (end_user_vaults):                               │
│ • total_deposited: $100                                     │
│ • weighted_entry_index: 1.040722                            │
│ • total_withdrawn: $0                                       │
│                                                             │
│ Client Vault (client_vaults):                               │
│ • current_index: 1.050000 (30 days later)                   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 2: Calculate User's Current Value                      │
│ ─────────────────────────────────────────────────────────   │
│ Formula: current_value = deposited × (current_index / entry_index) │
│                                                             │
│ Calculation:                                                │
│ current_value = $100 × (1.050000 / 1.040722)                │
│               = $100 × 1.008916                             │
│               = $100.89                                     │
│                                                             │
│ Yield Earned: $100.89 - $100 = $0.89                        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 3: Validate Withdrawal Amount                          │
│ ─────────────────────────────────────────────────────────   │
│ Withdrawal Request: $50                                     │
│ User's Current Value: $100.89                               │
│ ───────────────────────────────────────────────────────     │
│ ✓ VALID: User has enough balance                            │
│                                                             │
│ After withdrawal:                                           │
│ • Remaining value: $100.89 - $50 = $50.89                   │
│ • Remaining continues earning yield!                        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 4: Execute Withdrawal                                  │
│ ─────────────────────────────────────────────────────────   │
│ 1. Update end_user_vaults:                                  │
│    UPDATE end_user_vaults                                   │
│    SET total_withdrawn = total_withdrawn + 50,              │
│        last_withdrawal_at = now()                           │
│    WHERE end_user_id = 'user_123'                           │
│                                                             │
│    Note: We DON'T reduce total_deposited!                   │
│    • total_deposited: $100 (unchanged)                      │
│    • weighted_entry_index: 1.040722 (unchanged)             │
│    • total_withdrawn: $50                                   │
│                                                             │
│ 2. Update client_vaults total_staked:                       │
│    UPDATE client_vaults                                     │
│    SET total_staked_balance = total_staked_balance - 50     │
│    WHERE client_id = 'prod_grabpay'                         │
│                                                             │
│    Old: $1,010,509.56 → New: $1,010,459.56                 │
│                                                             │
│ 3. Withdraw from DeFi protocols:                            │
│    Based on vault.strategies allocation:                    │
│    • Withdraw $30 from AAVE (60%)                           │
│    • Withdraw $20 from Compound (40%)                       │
│                                                             │
│ 4. Transfer USDC to user's wallet                           │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 5: Impact on Next Day's Yield                          │
│ ─────────────────────────────────────────────────────────   │
│ Before Withdrawal:                                          │
│ • Total Staked: $1,010,509.56                               │
│ • Daily Growth: ~$277 (assumes 10% APY)                     │
│                                                             │
│ After Withdrawal:                                           │
│ • Total Staked: $1,010,459.56                               │
│ • Daily Growth: ~$276.86 (slightly less)                    │
│ ───────────────────────────────────────────────────────     │
│ • Growth Reduction: -$0.14/day                              │
│                                                             │
│ Index Still Grows:                                          │
│ • Current Index: 1.050000                                   │
│ • Next Day Index: 1.050274 (grows by smaller $ amount)      │
│                                                             │
│ User's Remaining Balance Still Earns:                       │
│ • User has $50.89 remaining                                 │
│ • Entry index: 1.040722 (unchanged)                         │
│ • After 30 more days at 1.060000:                           │
│   value = $100 × (1.060000 / 1.040722) - $50 = $51.76      │
│   (Remaining balance grew from $50.89 to $51.76)            │
└─────────────────────────────────────────────────────────────┘
```

---

## Full Timeline Example

### Scenario: GrabPay with 2 End-Users

```
┌─────────────────────────────────────────────────────────────┐
│ Day 0 (Jan 1, 2025)                                         │
│ ─────────────────────────────────────────────────────────   │
│ GrabPay Vault Setup:                                        │
│ • Total Staked: $0                                          │
│ • Index: 1.000000000                                        │
│ • Strategies:                                               │
│   - AAVE: 60%                                               │
│   - Compound: 40%                                           │
│                                                             │
│ User A deposits $1,000:                                     │
│ • Entry Index: 1.000000000                                  │
│                                                             │
│ User B deposits $500:                                       │
│ • Entry Index: 1.000000000                                  │
│                                                             │
│ GrabPay Vault After Deposits:                               │
│ • Total Staked: $1,500                                      │
│ • Index: 1.000000000                                        │
│                                                             │
│ Deploy to DeFi:                                             │
│ • AAVE: $900 → 895 aUSDC (exchange rate: 1.005587)          │
│ • Compound: $600 → 29,268,293 cUSDC (exchange rate: 0.0205) │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Day 1 (Jan 2, 2025) - First Index Update                    │
│ ─────────────────────────────────────────────────────────   │
│ Sync Wrapped Tokens:                                        │
│ • aUSDC balance: 895 → Exchange rate: 1.005862 → $902.24    │
│ • cUSDC balance: 29,268,293 → Rate: 0.020506 → $600.12      │
│                                                             │
│ Total Value: $1,502.36                                      │
│ Growth: $1,502.36 - $1,500 = $2.36                          │
│ Daily Growth Rate: $2.36 / $1,500 = 0.157%                  │
│                                                             │
│ Index Update:                                               │
│ • Old: 1.000000000                                          │
│ • New: 1.000000000 × ($1,502.36 / $1,500) = 1.001573       │
│                                                             │
│ User Values:                                                │
│ • User A: $1,000 × (1.001573 / 1.0) = $1,001.57            │
│ • User B: $500 × (1.001573 / 1.0) = $500.79                │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Day 15 (Jan 15, 2025) - User C Deposits                     │
│ ─────────────────────────────────────────────────────────   │
│ Current State:                                              │
│ • Total Staked: $1,523.45 (after 14 days of growth)         │
│ • Index: 1.015633                                           │
│                                                             │
│ User C deposits $2,000:                                     │
│ • Entry Index: 1.015633 ← Buying in at higher price!        │
│                                                             │
│ Updated Vault:                                              │
│ • Total Staked: $3,523.45                                   │
│ • Index: 1.015633 (unchanged)                               │
│                                                             │
│ Deploy new $2,000 to DeFi:                                  │
│ • AAVE: $1,200 → +1,192 aUSDC                               │
│ • Compound: $800 → +39,000,000 cUSDC                        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Day 30 (Jan 30, 2025) - User A Withdraws                    │
│ ─────────────────────────────────────────────────────────   │
│ Current State:                                              │
│ • Total Staked: $3,578.92                                   │
│ • Index: 1.030500                                           │
│                                                             │
│ User A's Value:                                             │
│ • Deposited: $1,000                                         │
│ • Entry Index: 1.000000                                     │
│ • Current Value: $1,000 × (1.030500 / 1.0) = $1,030.50     │
│ • Yield Earned: $30.50                                      │
│                                                             │
│ User A withdraws $500:                                      │
│ • Remaining value: $1,030.50 - $500 = $530.50              │
│ • Entry index: 1.000000 (unchanged)                         │
│ • total_deposited: $1,000 (unchanged)                       │
│ • total_withdrawn: $500                                     │
│                                                             │
│ Updated Vault:                                              │
│ • Total Staked: $3,578.92 - $500 = $3,078.92               │
│ • Index: 1.030500 (unchanged)                               │
│                                                             │
│ Withdraw from DeFi:                                         │
│ • AAVE: Redeem $300 worth of aUSDC                          │
│ • Compound: Redeem $200 worth of cUSDC                      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Day 60 (Mar 1, 2025) - 60 Days Later                        │
│ ─────────────────────────────────────────────────────────   │
│ Current State:                                              │
│ • Total Staked: $3,170.23 (grew from $3,078.92)             │
│ • Index: 1.062000                                           │
│                                                             │
│ User A's Remaining Value:                                   │
│ • Formula: $1,000 × (1.062 / 1.0) - $500                    │
│ • Value: $1,062 - $500 = $562                               │
│ • Grew from $530.50 to $562 = +$31.50 more yield!           │
│                                                             │
│ User B's Value:                                             │
│ • Deposited: $500                                           │
│ • Entry Index: 1.000000                                     │
│ • Current Value: $500 × (1.062 / 1.0) = $531               │
│ • Total Yield: $31 (never withdrew)                         │
│                                                             │
│ User C's Value:                                             │
│ • Deposited: $2,000                                         │
│ • Entry Index: 1.015633 (higher entry point)                │
│ • Current Value: $2,000 × (1.062 / 1.015633) = $2,091.29   │
│ • Yield: $91.29 (less % yield than A & B due to later entry) │
└─────────────────────────────────────────────────────────────┘
```

---

## Database Schema Requirements

### New Table: `client_wrapped_tokens`

See [DeFi Protocol Integration](#defi-protocol-integration-wrapped-tokens) section for full schema.

### Updates to `client_vaults`

```sql
-- Add wrapped token sync timestamp
ALTER TABLE client_vaults
ADD COLUMN last_wrapped_sync TIMESTAMPTZ;

-- Add previous day's total value for growth calculation
ALTER TABLE client_vaults
ADD COLUMN previous_day_value NUMERIC(40,18);

COMMENT ON COLUMN client_vaults.last_wrapped_sync IS 'Last time wrapped token balances were synced from blockchain';
COMMENT ON COLUMN client_vaults.previous_day_value IS 'Total value from yesterday for calculating daily growth rate';
```

### Required Queries

```sql
-- name: UpsertWrappedTokenTracking :one
INSERT INTO client_wrapped_tokens (
  vault_id,
  client_id,
  protocol,
  wrapped_token_address,
  wrapped_token_symbol,
  wrapped_balance,
  exchange_rate,
  real_value,
  original_deposit
) VALUES (
  $1, $2, $3, $4, $5, $6, $7, $8, $9
)
ON CONFLICT (vault_id, protocol) DO UPDATE
SET wrapped_balance = EXCLUDED.wrapped_balance,
    exchange_rate = EXCLUDED.exchange_rate,
    real_value = EXCLUDED.real_value,
    last_sync_at = now(),
    updated_at = now()
RETURNING *;

-- name: GetWrappedTokensForVault :many
SELECT * FROM client_wrapped_tokens
WHERE vault_id = $1
ORDER BY protocol;

-- name: GetTotalRealValueForVault :one
SELECT COALESCE(SUM(real_value), 0) as total_real_value
FROM client_wrapped_tokens
WHERE vault_id = $1;
```

---

## Implementation Checklist

### Phase 1: Database Setup
- [ ] Create `client_wrapped_tokens` table migration
- [ ] Add columns to `client_vaults` for wrapped token tracking
- [ ] Add SQLC queries for wrapped token operations

### Phase 2: DeFi Protocol Integration
- [ ] Implement AAVE wrapped token balance fetching
- [ ] Implement Compound wrapped token balance fetching
- [ ] Implement Morpho wrapped token balance fetching
- [ ] Implement Curve wrapped token balance fetching
- [ ] Create exchange rate fetching utilities per protocol

### Phase 3: Index Update Service
- [ ] Update `YieldCalculationService` to use real wrapped token values
- [ ] Implement daily cron job for wrapped token sync
- [ ] Implement index update based on actual growth (not estimated APY)
- [ ] Add safety checks for exchange rate validity

### Phase 4: Deposit/Withdrawal Flow
- [ ] Update deposit flow to lock entry index
- [ ] Implement weighted entry index for DCA deposits
- [ ] Update withdrawal flow to reduce total_staked_balance
- [ ] Implement proportional withdrawal from DeFi protocols

### Phase 5: Testing
- [ ] Test wrapped token sync with mock contracts
- [ ] Test index growth accuracy
- [ ] Test withdrawal impact on next day's yield
- [ ] Test multi-product-owner scenario

---

**Last Updated:** 2025-11-29
**Status:** Ready for implementation after review
