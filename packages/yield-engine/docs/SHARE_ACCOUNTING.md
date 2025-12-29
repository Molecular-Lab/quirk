# Share-Based Yield Tracking

> Complete guide to Proxify's index-based accounting system for tracking individual user yields in a pooled wallet architecture

**Last Updated**: December 2024

---

## Table of Contents

- [Overview](#overview)
- [Why Share-Based Accounting?](#why-share-based-accounting)
- [Core Concepts](#core-concepts)
- [Database Schema](#database-schema)
- [Yield Calculation](#yield-calculation)
- [Deposit Flow](#deposit-flow)
- [Withdrawal Flow](#withdrawal-flow)
- [Index Update Process](#index-update-process)
- [DCA Support](#dca-support)
- [Examples](#examples)

---

## Overview

Proxify uses **index-based share accounting** to track individual user yields when multiple users share a single pooled wallet. This model is similar to how AAVE's aTokens work, but adapted for a B2B embedded finance context.

### The Challenge

**Quirk** (Proxify's embedded finance SDK) enables web2 apps to offer yield-earning to their users. The architecture uses:

- **ONE pooled Privy MPC wallet** per client (web2 app)
- **Multiple end-users** depositing into the same wallet
- **Individual yield tracking** for each end-user despite pooled deposits

**Question**: How do we track each user's yield when all funds are in one wallet?

**Answer**: Share-based accounting with growth indices.

---

## Why Share-Based Accounting?

### Alternative Approaches (and why we don't use them)

❌ **Individual Wallets per User**
- **Problem**: High gas costs (separate wallet for each user)
- **Problem**: Complex wallet management
- **Problem**: Poor capital efficiency (fragmented liquidity)

❌ **Event-Based Tracking**
- **Problem**: Must store every deposit/withdrawal/yield event
- **Problem**: Expensive to calculate balances (replay all events)
- **Problem**: Database grows infinitely

❌ **Fixed Rate Calculations**
- **Problem**: Inaccurate (APY changes constantly)
- **Problem**: Doesn't account for compounding
- **Problem**: Complex to adjust for protocol changes

✅ **Share-Based Accounting**
- **Advantage**: One pooled wallet = lower gas costs
- **Advantage**: Constant-time balance queries
- **Advantage**: Automatically tracks compounding yield
- **Advantage**: DCA-friendly (weighted entry index)
- **Advantage**: Used by proven protocols (AAVE, Compound, Morpho)

---

## Core Concepts

### 1. Growth Index

The **growth index** is a multiplier that increases over time as yield accrues.

```
Initial index: 1.0 (scaled to 1e18 = 1000000000000000000)
After 1 day:   1.0001 (if daily yield is 0.01%)
After 30 days: 1.003  (if average daily yield is 0.01%)
After 1 year:  1.0365 (if APY is 3.65%)
```

**Formula**:
```
new_index = current_index × (1 + daily_yield_percentage)
```

### 2. Share Issuance

When a user deposits, they receive **shares** based on the current index:

```
shares_issued = deposit_amount / current_index
```

**Example**:
- User deposits $1000
- Current index = 1.05
- Shares issued = 1000 / 1.05 = **952.38 shares**

### 3. Share Value

The value of shares increases as the index grows:

```
current_value = shares × current_index
```

**Example** (30 days later):
- User has 952.38 shares
- Current index = 1.0642
- Current value = 952.38 × 1.0642 = **$1013.52**
- Yield = $1013.52 - $1000 = **$13.52**

### 4. Weighted Entry Index (for DCA)

When users make multiple deposits, we track a **weighted average entry index**:

```
new_weighted_index = (
  (old_deposits × old_index) + (new_deposit × current_index)
) / (old_deposits + new_deposit)
```

This ensures accurate yield calculation for dollar-cost averaging.

---

## Database Schema

### Client Vault (Aggregated)

One vault per client per chain/token combination.

```sql
CREATE TABLE client_vaults (
  id UUID PRIMARY KEY,
  client_id UUID NOT NULL,

  -- Chain & Token
  chain VARCHAR(20) NOT NULL,           -- 'base', 'ethereum', etc.
  token_address VARCHAR(66) NOT NULL,
  token_symbol VARCHAR(20) NOT NULL,    -- 'USDC', 'USDT'

  -- Share Accounting
  total_shares NUMERIC(78,0) NOT NULL DEFAULT 0,
  current_index NUMERIC(78,18) NOT NULL DEFAULT 1000000000000000000, -- 1e18

  -- Balances
  pending_deposit_balance NUMERIC(78,0) NOT NULL DEFAULT 0,
  total_staked_balance NUMERIC(78,0) NOT NULL DEFAULT 0,
  cumulative_yield NUMERIC(20,6) NOT NULL DEFAULT 0,

  -- Performance Metrics
  apy_7d NUMERIC(10,4),
  apy_30d NUMERIC(10,4),

  -- Strategy (JSONB)
  strategies JSONB,  -- [{ protocol: 'aave', percentage: 60 }, ...]

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(client_id, chain, token_symbol)
)
```

### End-User Vault (Individual)

One vault per user per client (simplified - no chain/token exposure).

```sql
CREATE TABLE end_user_vaults (
  id UUID PRIMARY KEY,
  end_user_id UUID NOT NULL,
  client_id UUID NOT NULL,

  -- User Position
  total_deposited NUMERIC(20,6) NOT NULL DEFAULT 0,
  total_withdrawn NUMERIC(20,6) NOT NULL DEFAULT 0,
  weighted_entry_index NUMERIC(78,18) NOT NULL DEFAULT 1000000000000000000,

  -- Timestamps
  last_deposit_at TIMESTAMPTZ,
  last_withdrawal_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(end_user_id, client_id)
)
```

**Note**: End-users don't see chain/token complexity. Backend manages multi-chain allocation behind the scenes.

### DeFi Allocations (Where Money Lives)

Tracks which protocols hold the funds.

```sql
CREATE TABLE defi_allocations (
  id UUID PRIMARY KEY,
  client_id UUID NOT NULL,
  client_vault_id UUID NOT NULL,
  protocol_id UUID NOT NULL,

  -- Allocation
  category VARCHAR(50) NOT NULL,  -- 'lending', 'lp', 'staking'
  balance NUMERIC(78,0) NOT NULL DEFAULT 0,
  percentage_allocation NUMERIC(5,2) NOT NULL,  -- 0-100

  -- Performance
  apy NUMERIC(10,4),
  yield_earned NUMERIC(20,6) NOT NULL DEFAULT 0,

  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'active',  -- active, withdrawn, rebalancing

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
)
```

---

## Yield Calculation

### Formula

**User's current value**:
```
current_value = total_deposited × (current_index / weighted_entry_index)
```

**Yield earned**:
```
yield = current_value - total_deposited
```

**Effective APY** (for user's holding period):
```
effective_apy = ((current_value / total_deposited) - 1) × (365 / days_held) × 100
```

### Code Example

```typescript
interface UserVault {
  totalDeposited: number  // $1000
  weightedEntryIndex: number  // 1.05 (scaled from 1.05e18)
}

interface ClientVault {
  currentIndex: number  // 1.0642 (scaled from 1.0642e18)
}

function calculateYield(
  userVault: UserVault,
  clientVault: ClientVault
): { currentValue: number; yield: number; apy: number } {
  // Current value
  const currentValue = userVault.totalDeposited *
    (clientVault.currentIndex / userVault.weightedEntryIndex)

  // Yield
  const yieldEarned = currentValue - userVault.totalDeposited

  // APY (assuming 30 days holding)
  const daysHeld = 30
  const effectiveAPY = ((currentValue / userVault.totalDeposited) - 1) *
    (365 / daysHeld) * 100

  return {
    currentValue,   // $1013.52
    yield: yieldEarned,  // $13.52
    apy: effectiveAPY,   // 16.4% annualized
  }
}
```

### Database Query

```sql
-- Get user's current value and yield
SELECT
  euv.total_deposited,
  euv.total_withdrawn,
  euv.weighted_entry_index,
  cv.current_index,

  -- Calculate current value
  euv.total_deposited * (cv.current_index / euv.weighted_entry_index) AS current_value,

  -- Calculate yield
  (euv.total_deposited * (cv.current_index / euv.weighted_entry_index)) - euv.total_deposited AS yield_earned

FROM end_user_vaults euv
JOIN client_vaults cv ON cv.client_id = euv.client_id
WHERE euv.end_user_id = $1
  AND euv.client_id = $2
```

---

## Deposit Flow

### Step-by-Step

```
1. User initiates deposit: $1000 USDC
   ↓
2. Get current client vault index: 1.05
   ↓
3. Calculate shares to issue:
   shares = 1000 / 1.05 = 952.38
   ↓
4. Update client vault:
   total_shares += 952.38
   pending_deposit_balance += 1000
   ↓
5. Update end-user vault:
   Calculate new weighted entry index (see DCA section)
   total_deposited += 1000
   last_deposit_at = now()
   ↓
6. Execute DeFi deployment (via BatchExecutor):
   Split $1000 across protocols per allocation strategy
   ↓
7. Update after deployment:
   pending_deposit_balance -= 1000
   total_staked_balance += 1000
   ↓
8. Record in defi_allocations:
   Insert/update allocation rows for each protocol
```

### Code Example

```typescript
async function processDeposit(
  clientId: string,
  userId: string,
  depositAmount: number
) {
  // 1. Get vaults
  const clientVault = await getClientVault(clientId)
  const userVault = await getUserVault(userId, clientId)

  // 2. Calculate shares
  const currentIndex = Number(clientVault.current_index) / 1e18
  const shares = depositAmount / currentIndex

  // 3. Calculate new weighted entry index
  const oldDeposited = Number(userVault.total_deposited)
  const oldIndex = Number(userVault.weighted_entry_index) / 1e18

  const newWeightedIndex = (
    (oldDeposited * oldIndex) + (depositAmount * currentIndex)
  ) / (oldDeposited + depositAmount)

  // 4. Update client vault
  await db.query(`
    UPDATE client_vaults
    SET total_shares = total_shares + $1,
        pending_deposit_balance = pending_deposit_balance + $2,
        updated_at = now()
    WHERE id = $3
  `, [shares, depositAmount, clientVault.id])

  // 5. Update user vault
  await db.query(`
    UPDATE end_user_vaults
    SET total_deposited = total_deposited + $1,
        weighted_entry_index = $2,
        last_deposit_at = now(),
        updated_at = now()
    WHERE id = $3
  `, [depositAmount, BigInt(newWeightedIndex * 1e18), userVault.id])

  // 6. Execute DeFi deployment
  const allocation = calculateAllocation(depositAmount, clientVault.strategies)
  const receipt = await executeBatchDeposit(allocation)

  // 7. Update balances after deployment
  await db.query(`
    UPDATE client_vaults
    SET pending_deposit_balance = pending_deposit_balance - $1,
        total_staked_balance = total_staked_balance + $1,
        updated_at = now()
    WHERE id = $2
  `, [depositAmount, clientVault.id])

  return receipt
}
```

---

## Withdrawal Flow

### Step-by-Step

```
1. User requests withdrawal: 50% of position
   ↓
2. Calculate current value:
   current_value = total_deposited × (current_index / entry_index)
   = $1000 × (1.0642 / 1.05) = $1013.52
   ↓
3. Calculate withdrawal amount:
   withdrawal = current_value × 50% = $506.76
   ↓
4. Calculate shares to burn:
   shares_to_burn = total_shares × 50%
   ↓
5. Execute DeFi withdrawals:
   Withdraw $506.76 from protocols proportionally
   ↓
6. Update client vault:
   total_shares -= shares_to_burn
   total_staked_balance -= 506.76
   ↓
7. Update end-user vault:
   total_withdrawn += 506.76
   (weighted_entry_index unchanged - remaining 50% unaffected)
   ↓
8. Transfer USDC to user's destination
```

### Code Example

```typescript
async function processWithdrawal(
  clientId: string,
  userId: string,
  withdrawalPercentage: number  // 0-100
) {
  // 1. Get vaults
  const clientVault = await getClientVault(clientId)
  const userVault = await getUserVault(userId, clientId)

  // 2. Calculate current value
  const currentIndex = Number(clientVault.current_index) / 1e18
  const entryIndex = Number(userVault.weighted_entry_index) / 1e18
  const currentValue = Number(userVault.total_deposited) * (currentIndex / entryIndex)

  // 3. Calculate withdrawal amount
  const withdrawalAmount = currentValue * (withdrawalPercentage / 100)

  // 4. Calculate shares to burn
  const userShares = Number(userVault.total_deposited) / entryIndex
  const sharesToBurn = userShares * (withdrawalPercentage / 100)

  // 5. Execute DeFi withdrawals
  const allocation = calculateWithdrawalAllocation(withdrawalAmount, clientVault.strategies)
  const receipt = await executeBatchWithdrawal(allocation)

  // 6. Update client vault
  await db.query(`
    UPDATE client_vaults
    SET total_shares = total_shares - $1,
        total_staked_balance = total_staked_balance - $2,
        updated_at = now()
    WHERE id = $3
  `, [sharesToBurn, withdrawalAmount, clientVault.id])

  // 7. Update user vault
  await db.query(`
    UPDATE end_user_vaults
    SET total_withdrawn = total_withdrawn + $1,
        last_withdrawal_at = now(),
        updated_at = now()
    WHERE id = $2
  `, [withdrawalAmount, userVault.id])

  // 8. Transfer to user
  await transferToUser(userId, withdrawalAmount)

  return receipt
}
```

---

## Index Update Process

### Daily Cron Job

The index is updated daily to reflect yield accrual.

```
1. For each client vault:
   ↓
2. Fetch current APY from all protocol allocations
   ↓
3. Calculate weighted average APY:
   weighted_apy = Σ(protocol_apy × allocation_percentage)
   ↓
4. Calculate daily yield:
   daily_yield_percentage = weighted_apy / 365
   total_staked = vault.total_staked_balance
   yield_usd = total_staked × (daily_yield_percentage / 100)
   ↓
5. Update index:
   new_index = current_index × (1 + daily_yield_percentage / 100)
   ↓
6. Save to database:
   current_index = new_index
   cumulative_yield += yield_usd
```

### Code Example

```typescript
async function updateVaultIndex(vaultId: string) {
  const vault = await getClientVault(vaultId)

  // 1. Get allocations
  const allocations = await db.query(`
    SELECT protocol_id, apy, percentage_allocation
    FROM defi_allocations
    WHERE client_vault_id = $1 AND status = 'active'
  `, [vaultId])

  // 2. Calculate weighted APY
  const weightedAPY = allocations.rows.reduce((sum, alloc) => {
    return sum + (Number(alloc.apy) * Number(alloc.percentage_allocation) / 100)
  }, 0)

  // 3. Calculate daily yield
  const dailyYieldPercentage = weightedAPY / 365
  const totalStaked = Number(vault.total_staked_balance)
  const yieldUSD = totalStaked * (dailyYieldPercentage / 100)

  // 4. Update index
  const currentIndex = Number(vault.current_index) / 1e18
  const newIndex = currentIndex * (1 + dailyYieldPercentage / 100)

  // 5. Save to database
  await db.query(`
    UPDATE client_vaults
    SET current_index = $1,
        cumulative_yield = cumulative_yield + $2,
        updated_at = now()
    WHERE id = $3
  `, [BigInt(newIndex * 1e18), yieldUSD, vaultId])

  console.log(`Updated vault ${vaultId}:`, {
    weightedAPY,
    dailyYield: yieldUSD,
    newIndex,
  })
}

// Run for all vaults
async function runIndexUpdateCron() {
  const vaults = await db.query(`SELECT id FROM client_vaults`)

  for (const vault of vaults.rows) {
    await updateVaultIndex(vault.id)
  }
}
```

---

## DCA Support

### Weighted Entry Index

When users make multiple deposits at different times, we track a **weighted average entry index**.

### Formula

```
new_weighted_index = (
  (existing_deposits × old_weighted_index) +
  (new_deposit × current_index)
) / (existing_deposits + new_deposit)
```

### Example

**Initial deposit**:
```
Deposit: $1000
Current index: 1.05
Weighted entry index: 1.05
```

**Second deposit** (30 days later):
```
Existing deposits: $1000
Old weighted index: 1.05
New deposit: $500
Current index: 1.0642

New weighted index = (1000 × 1.05 + 500 × 1.0642) / (1000 + 500)
                   = (1050 + 532.1) / 1500
                   = 1582.1 / 1500
                   = 1.0547
```

**User's position** (after 2nd deposit):
```
Total deposited: $1500
Weighted entry index: 1.0547
Current index: 1.0642

Current value = 1500 × (1.0642 / 1.0547) = $1513.52
Yield = $13.52 (accurate for DCA)
```

### Code Example

```typescript
function calculateWeightedEntryIndex(
  existingDeposits: number,
  oldWeightedIndex: number,
  newDeposit: number,
  currentIndex: number
): number {
  return (
    (existingDeposits * oldWeightedIndex) + (newDeposit * currentIndex)
  ) / (existingDeposits + newDeposit)
}

// Usage
const newIndex = calculateWeightedEntryIndex(
  1000,    // Existing deposits
  1.05,    // Old weighted index
  500,     // New deposit
  1.0642   // Current index
)

console.log(newIndex) // 1.0547
```

---

## Examples

### Example 1: Single Deposit, 30 Days

```
Day 0:
- User deposits: $1000
- Current index: 1.05
- Shares issued: 1000 / 1.05 = 952.38
- Weighted entry index: 1.05

Day 30:
- Current index: 1.0642 (after daily updates)
- Current value: 1000 × (1.0642 / 1.05) = $1013.52
- Yield: $13.52
- APY: ((1013.52 / 1000) - 1) × (365 / 30) × 100 = 16.4%
```

### Example 2: Dollar-Cost Averaging

```
Day 0:
- Deposit: $1000
- Index: 1.05
- Weighted entry: 1.05

Day 15:
- Deposit: $500
- Index: 1.0570
- Old weighted: 1.05
- New weighted: (1000 × 1.05 + 500 × 1.057) / 1500 = 1.0523

Day 30:
- Index: 1.0642
- Total deposited: $1500
- Current value: 1500 × (1.0642 / 1.0523) = $1516.95
- Yield: $16.95
```

### Example 3: Partial Withdrawal

```
Day 0:
- Deposit: $1000
- Index: 1.05
- Entry: 1.05

Day 30:
- Index: 1.0642
- Current value: $1013.52
- Withdraw 50%: $506.76

After withdrawal:
- Total deposited: $1000 (unchanged)
- Total withdrawn: $506.76
- Weighted entry: 1.05 (unchanged for remaining position)
- Remaining value: $506.76
```

### Example 4: Real-World Scenario

```
Client: "CryptoSavings App"
Users: 100 users, various deposit amounts

Day 0 - Initial Deposits:
User 1: $10,000
User 2: $5,000
User 3: $2,000
...
Total deposited: $250,000
Index: 1.0

Day 1 - Index Update:
Weighted APY: 4.2%
Daily yield: 4.2% / 365 = 0.0115%
Total staked: $250,000
Yield generated: $250,000 × 0.000115 = $28.77
New index: 1.0 × 1.000115 = 1.000115

Day 30 - User 1 Checks Balance:
User 1 deposited: $10,000
Entry index: 1.0
Current index: 1.0035 (after 30 updates)
Current value: $10,000 × (1.0035 / 1.0) = $10,035
Yield: $35
```

---

## Summary

### Key Benefits

✅ **Capital Efficient**: One pooled wallet per client
✅ **Accurate Tracking**: Individual yield calculation per user
✅ **DCA Support**: Weighted entry index handles multiple deposits
✅ **Scalable**: Constant-time balance queries
✅ **Compound-Friendly**: Automatically tracks compounding
✅ **Proven Model**: Used by AAVE, Compound, Morpho

### Implementation Checklist

- [ ] `client_vaults` table with `current_index`
- [ ] `end_user_vaults` table with `weighted_entry_index`
- [ ] Daily cron job for index updates
- [ ] Deposit flow with share issuance
- [ ] Withdrawal flow with share burning
- [ ] DCA-aware entry index calculation
- [ ] Balance query endpoints
- [ ] Yield calculation queries

---

**Related Documentation**:
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System overview
- [EXECUTION.md](./EXECUTION.md) - How to execute deposits/withdrawals
- [MULTI_PROTOCOL_BATCHING.md](./MULTI_PROTOCOL_BATCHING.md) - Batching patterns
