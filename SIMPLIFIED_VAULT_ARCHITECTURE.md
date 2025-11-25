# Simplified Vault Architecture

## Overview

End-users see **ONLY** their fiat balance and yield. The backend manages all multi-chain/token complexity.

---

## Database Schema Changes

### ✅ BEFORE (Complex - Multi-chain per user):
```sql
CREATE TABLE end_user_vaults (
  end_user_id UUID,
  client_id UUID,
  chain VARCHAR(50),              -- ❌ User doesn't need to see this
  token_address VARCHAR(66),      -- ❌ User doesn't need to see this
  token_symbol VARCHAR(20),       -- ❌ User doesn't need to see this
  shares NUMERIC(78,0),           -- ❌ Complex share-based accounting
  weighted_entry_index NUMERIC(78,0),
  UNIQUE(end_user_id, chain, token_address)  -- ❌ Multiple vaults per user!
);
```

**Result:** User has 10 vaults (5 chains × 2 tokens)

### ✅ AFTER (Simple - Single vault per user):
```sql
CREATE TABLE end_user_vaults (
  end_user_id UUID,
  client_id UUID,

  -- ✅ Simple fiat tracking (no chain/token)
  total_deposited NUMERIC(40,18),        -- $1,000
  total_withdrawn NUMERIC(40,18),        -- $500
  weighted_entry_index NUMERIC(78,0),    -- Client's growth index at deposit

  UNIQUE(end_user_id, client_id)  -- ✅ ONE vault per user per client!
);
```

**Result:** User has 1 vault (backend manages multi-chain)

---

## User View (What They See)

```json
{
  "userId": "user123",
  "totalDeposited": 1000.00,
  "currentValue": 1050.00,
  "yieldEarned": 50.00,
  "apy": "5.0%"
}
```

**That's it!** No chain, no token, no share breakdown.

---

## Backend Reality (What We Manage)

### Client has multiple vaults across chains:

```
Client: Shopify (prod_abc123)
├── USDC on Base: $10M AUM, index: 1.04
├── USDC on Ethereum: $5M AUM, index: 1.05
├── USDT on Polygon: $3M AUM, index: 1.03
└── USDC on Arbitrum: $2M AUM, index: 1.06

Total AUM: $20M
```

### Client Growth Index Calculation:

```typescript
// Weighted average of ALL client vaults
const clientGrowthIndex =
  (10M × 1.04 + 5M × 1.05 + 3M × 1.03 + 2M × 1.06) / 20M
  = 1.0445

// User's current value
const userValue = 1000 × (1.0445 / 1.0) = $1,044.50
const userYield = $1,044.50 - $1,000 = $44.50
```

**Formula:**
```
current_value = total_deposited × (client_growth_index / weighted_entry_index)
```

---

## Flow: User Deposit

### Step 1: User deposits $1,000

```typescript
POST /deposits/fiat
{
  userId: "user123",
  amount: "1000.00",
  currency: "USD",
  chain: "8453",  // Backend uses this
  tokenSymbol: "USDC"
}
```

### Step 2: Calculate client growth index

```typescript
// Get all client vaults (USDC Base, USDC ETH, USDT Polygon, etc.)
const vaults = await getClientVaults(clientId);

let totalAUM = 0;
let weightedSum = 0;

for (const vault of vaults) {
  const aum = vault.totalStakedBalance + vault.pendingDepositBalance;
  totalAUM += aum;
  weightedSum += aum × vault.currentIndex;
}

const clientGrowthIndex = weightedSum / totalAUM;
// = 1.0445 (weighted average)
```

### Step 3: Get or create end_user_vault

```sql
-- Check if user has vault for this client
SELECT * FROM end_user_vaults
WHERE end_user_id = 'user123'
  AND client_id = 'shopify_uuid';

-- If not exists, create:
INSERT INTO end_user_vaults (
  end_user_id,
  client_id,
  total_deposited,
  weighted_entry_index
) VALUES (
  'user123',
  'shopify_uuid',
  1000.00,
  1.0445  -- Lock current growth index
);
```

### Step 4: Backend deposits to appropriate vault

```typescript
// Backend logic decides where to deposit
// Example: USDC on Base (biggest vault)
await depositToVault({
  clientId: 'shopify',
  chain: '8453',
  token: 'USDC',
  amount: '1000'
});

// Update client_vault
UPDATE client_vaults
SET pending_deposit_balance = pending_deposit_balance + 1000
WHERE client_id = 'shopify'
  AND chain = '8453'
  AND token_address = '0x833589...';
```

**User doesn't see any of this!** They just see:
```json
{
  "deposited": 1000.00,
  "status": "pending"
}
```

---

## Flow: Calculate User Balance

```typescript
async function getUserBalance(userId: string, clientId: string) {
  // 1. Get user vault
  const vault = await db.query(`
    SELECT total_deposited, weighted_entry_index
    FROM end_user_vaults
    WHERE end_user_id = $1 AND client_id = $2
  `, [userId, clientId]);

  // 2. Calculate current client growth index
  const clientGrowthIndex = await calculateClientGrowthIndex(clientId);

  // 3. Calculate user's current value
  const currentValue = vault.total_deposited ×
                      (clientGrowthIndex / vault.weighted_entry_index);

  const yieldEarned = currentValue - vault.total_deposited;

  return {
    totalDeposited: vault.total_deposited,
    currentValue,
    yieldEarned,
    entryIndex: vault.weighted_entry_index,
    currentIndex: clientGrowthIndex
  };
}
```

**Example:**
```
User deposited: $1,000 at index 1.0
Client growth index now: 1.0445
Current value = 1000 × (1.0445 / 1.0) = $1,044.50
Yield = $1,044.50 - $1,000 = $44.50
```

---

## Flow: User Withdrawal

```typescript
POST /withdrawals
{
  userId: "user123",
  amount: "500.00"
}

// Backend calculates
const currentValue = 1044.50;
const withdrawPercentage = 500 / 1044.50 = 47.87%;

// Update end_user_vault
UPDATE end_user_vaults
SET total_withdrawn = total_withdrawn + 500
WHERE end_user_id = 'user123' AND client_id = 'shopify';

// Backend withdraws from appropriate vaults proportionally
// User doesn't care which vault!
```

---

## Client Growth Index Calculation (Weighted Average)

### Example: Client has 4 vaults

```typescript
// USDC on Base
vault1: {
  aum: 10_000_000,      // $10M
  currentIndex: 1.04    // 4% growth
}

// USDC on Ethereum
vault2: {
  aum: 5_000_000,       // $5M
  currentIndex: 1.05    // 5% growth
}

// USDT on Polygon
vault3: {
  aum: 3_000_000,       // $3M
  currentIndex: 1.03    // 3% growth
}

// USDC on Arbitrum
vault4: {
  aum: 2_000_000,       // $2M
  currentIndex: 1.06    // 6% growth
}

// Calculate weighted average
totalAUM = 10M + 5M + 3M + 2M = 20M
weightedSum = (10M × 1.04) + (5M × 1.05) + (3M × 1.03) + (2M × 1.06)
            = 10.4M + 5.25M + 3.09M + 2.12M
            = 20.86M

clientGrowthIndex = 20.86M / 20M = 1.043
```

**This is the SINGLE index that ALL end-users see!**

---

## Strategy-Based Growth (From Your Example)

Each client vault has strategies:

```json
{
  "chain": "8453",
  "token": "USDC",
  "strategies": [
    {
      "protocol": "AAVE",
      "allocation": 70,
      "currentAPY": 4.0,
      "stakedAmount": 7000000,
      "currentValue": 7280000
    },
    {
      "protocol": "Compound",
      "allocation": 20,
      "currentAPY": 5.0,
      "stakedAmount": 2000000,
      "currentValue": 2100000
    },
    {
      "protocol": "Curve",
      "allocation": 10,
      "currentAPY": 8.0,
      "stakedAmount": 1000000,
      "currentValue": 1080000
    }
  ]
}
```

**Vault growth calculation:**
```
Total staked: $10M
Current value: $7.28M + $2.1M + $1.08M = $10.46M
Vault index = 10.46M / 10M = 1.046
```

**Then this vault index feeds into client growth index (weighted by AUM).**

---

## Benefits of Simplified Architecture

### ✅ User Experience
- **Simple balance view**: Just $1,000 → $1,050
- **No confusing multi-chain UI**: User doesn't need to understand chains
- **Clean yield calculation**: Easy to see profit

### ✅ Backend Flexibility
- **Multi-chain deployment**: Backend can deploy to any chain
- **Rebalancing**: Move funds between chains without user impact
- **New chains**: Add new chains without schema changes
- **Strategy optimization**: Adjust strategies per vault independently

### ✅ Performance
- **Single query**: Get user balance in 1 query (not 10)
- **Efficient indexing**: UNIQUE(end_user_id, client_id)
- **Fast analytics**: Aggregate client stats easily

### ✅ Fair Yield Distribution
- **Weighted growth index**: Users earn proportionally based on AUM
- **DCA support**: Multiple deposits handled via weighted_entry_index
- **Protocol-agnostic**: Growth from AAVE + Compound + Curve combined fairly

---

## Migration Steps

1. ✅ **Update schema** (`000001_init_schema.up.sql`)
   - Remove: chain, token_address, token_symbol, shares
   - Keep: total_deposited, total_withdrawn, weighted_entry_index
   - Change: UNIQUE(end_user_id, client_id)

2. ✅ **Update queries** (`database/queries/vault.sql`)
   - Remove: GetEndUserVaultByToken
   - Add: GetEndUserVaultByClient
   - Simplify: CreateEndUserVault (4 params instead of 8)

3. ✅ **User creation** (`user.usecase.ts`)
   - Already correct! No vault creation on registration
   - Vault created lazily on first deposit

4. ⏳ **Update deposit flow** (next step)
   - Calculate client_growth_index
   - Get or create end_user_vault
   - Update weighted_entry_index for DCA deposits

5. ⏳ **Update withdrawal flow** (next step)
   - Calculate proportional withdrawal
   - Update total_withdrawn
   - Backend handles multi-vault withdrawal

---

## Next Steps

1. Run database migration: `npm run db:reset`
2. Regenerate SQLC types: `npm run sqlc:generate`
3. Update deposit usecase with client growth index calculation
4. Update withdrawal usecase
5. Test end-to-end flow

---

**Status:** ✅ Schema fixed, queries updated, ready for database reset!
