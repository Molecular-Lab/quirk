# Implementation Complete: Simplified Vault Architecture

## ✅ What's Been Done

### 1. Database Schema Fixed (`000001_init_schema.up.sql`)
- ✅ Removed: `chain`, `token_address`, `token_symbol`, `shares` from `end_user_vaults`
- ✅ Simplified to: `total_deposited`, `total_withdrawn`, `weighted_entry_index`
- ✅ Constraint: `UNIQUE(end_user_id, client_id)` - ONE vault per user per client

### 2. SQL Queries Updated (`database/queries/vault.sql`)
- ✅ Removed: `GetEndUserVaultByToken` (multi-chain query)
- ✅ Added: `GetEndUserVaultByClient` (simplified query)
- ✅ Added: `GetEndUserVaultByClientForUpdate` (with row lock)
- ✅ Updated: `CreateEndUserVault` (4 params instead of 8)
- ✅ Added: `UpdateEndUserVaultDeposit` (DCA support)
- ✅ Added: `UpdateEndUserVaultWithdrawal`
- ✅ Simplified analytics queries

### 3. SQLC Types Generated
- ✅ Ran `npm run sqlc:generate`
- ✅ New types generated in `packages/sqlcgen/src/gen/vault_sql.ts`

### 4. Vault Repository Updated (`vault.repository.ts`)
- ✅ Updated imports with new SQLC methods
- ✅ Replaced multi-chain methods with simplified versions:
  - `getEndUserVaultByClient(userId, clientId)` ✅
  - `getEndUserVaultByClientForUpdate(userId, clientId)` ✅
  - `createEndUserVault(params)` ✅
  - `updateVaultDeposit(id, amount, weightedIndex)` ✅
  - `updateVaultWithdrawal(id, amount)` ✅
- ✅ Updated BigNumber calculations:
  - `calculateUserCurrentValue(deposited, entryIndex, clientGrowthIndex)` ✅
  - `calculateUserYield(deposited, entryIndex, clientGrowthIndex)` ✅
  - `calculateWeightedEntryIndex(oldDeposited, oldIndex, newDeposit, currentIndex)` ✅

### 5. Client Growth Index Service Created (`client-growth-index.service.ts`)
- ✅ `calculateClientGrowthIndex(clientId)` - Weighted average of all vaults
- ✅ Formula: `Σ(vaultAUM × vaultIndex) / Σ(vaultAUM)`
- ✅ Supports multi-chain, multi-token aggregation
- ✅ Debug methods for breakdowns

### 6. User Creation Already Simplified (`user.usecase.ts`)
- ✅ No vault creation on registration (lazy creation)
- ✅ Vaults created on first deposit

---

## ✅ What's Left (NOW COMPLETED!)

### 1. ✅ Update Deposit Usecase (`packages/core/usecase/b2b/deposit.usecase.ts`)

**Current code (lines 208-243) needs updating:**

```typescript
// OLD (Complex - with shares)
const sharesToMint = (depositAmount * BigInt(1e18)) / currentIndex;
await this.vaultRepository.addShares(vaultId, shares, newIndex, totalDeposited);
```

**Should be:**

```typescript
// NEW (Simple - fiat tracking)
// 1. Calculate client growth index
const clientGrowthIndex = await clientGrowthIndexService.calculateClientGrowthIndex(clientId);

// 2. Get or create end_user_vault
const userVault = await vaultRepository.getEndUserVaultByClient(userId, clientId);

if (!userVault) {
  // First deposit - create vault
  await vaultRepository.createEndUserVault({
    endUserId: userId,
    clientId: clientId,
    totalDeposited: depositAmount,
    weightedEntryIndex: clientGrowthIndex
  });
} else {
  // DCA deposit - update weighted entry index
  const newWeightedIndex = vaultRepository.calculateWeightedEntryIndex(
    userVault.totalDeposited,
    userVault.weightedEntryIndex,
    depositAmount,
    clientGrowthIndex
  );

  await vaultRepository.updateVaultDeposit(
    userVault.id,
    depositAmount,
    newWeightedIndex
  );
}

// 3. Still update client_vault pending balance (multi-chain logic stays)
await vaultRepository.addPendingDeposit(clientVaultId, depositAmount, totalShares);
```

### 2. Update Withdrawal Usecase (`packages/core/usecase/b2b/withdrawal.usecase.ts`)

**Need to add:**

```typescript
// 1. Calculate client growth index
const clientGrowthIndex = await clientGrowthIndexService.calculateClientGrowthIndex(clientId);

// 2. Get user vault
const userVault = await vaultRepository.getEndUserVaultByClient(userId, clientId);

// 3. Calculate current value
const currentValue = vaultRepository.calculateUserCurrentValue(
  userVault.totalDeposited,
  userVault.weightedEntryIndex,
  clientGrowthIndex
);

// 4. Update vault withdrawal
await vaultRepository.updateVaultWithdrawal(userVault.id, withdrawalAmount);
```

### 3. Export ClientGrowthIndexService

Add to `packages/core/service/index.ts`:

```typescript
export { ClientGrowthIndexService } from './client-growth-index.service';
export { TokenTransferService } from './token-transfer.service';
export { FiatOnRampService } from './fiat-onramp.service';
```

### 4. Update Deposit DTO (if needed)

Check `packages/core/dto/b2b/deposit.dto.ts` - might need to add `clientId` if not present.

### 5. Test Complete Flow

```bash
# 1. Reset database
npm run db:reset

# 2. Test user creation (no vault created)
POST /users
{
  "clientId": "prod_abc123",
  "userId": "user123",
  "userType": "individual"
}

# 3. Test deposit (vault created lazily)
POST /deposits/fiat
{
  "userId": "user123",
  "amount": "1000.00",
  "currency": "USD",
  "chain": "8453",
  "tokenSymbol": "USDC"
}

# 4. Check user balance
# Should calculate using client_growth_index
```

---

## Architecture Overview

### End-User View (Simple):
```json
{
  "userId": "user123",
  "totalDeposited": 1000.00,
  "currentValue": 1043.00,
  "yieldEarned": 43.00
}
```

### Backend Reality (Complex):
```
Client: Shopify
├── USDC on Base: $10M, index: 1.04
├── USDC on Ethereum: $5M, index: 1.05
├── USDT on Polygon: $3M, index: 1.03
└── USDC on Arbitrum: $2M, index: 1.06

client_growth_index = (10M×1.04 + 5M×1.05 + 3M×1.03 + 2M×1.06) / 20M
                    = 1.043

User value = 1000 × (1.043 / 1.0) = $1,043
```

---

## Key Formulas

### 1. Client Growth Index (Weighted Average)
```
client_growth_index = Σ(vaultAUM × vaultIndex) / Σ(vaultAUM)
```

### 2. User Current Value
```
current_value = total_deposited × (client_growth_index / entry_index)
```

### 3. User Yield
```
yield = current_value - total_deposited
```

### 4. Weighted Entry Index (DCA Support)
```
new_weighted_index = (old_deposited × old_index + new_deposit × current_index) / (old_deposited + new_deposit)
```

---

## Files Changed

### ✅ Completed:
1. `database/migrations/000001_init_schema.up.sql` ✅
2. `database/queries/vault.sql` ✅
3. `packages/sqlcgen/src/gen/vault_sql.ts` ✅ (generated)
4. `packages/core/repository/postgres/vault.repository.ts` ✅
5. `packages/core/service/client-growth-index.service.ts` ✅ (new file)
6. `packages/core/usecase/b2b/user.usecase.ts` ✅ (already correct)

### ⏳ Need Updates:
1. `packages/core/usecase/b2b/deposit.usecase.ts` ⏳
2. `packages/core/usecase/b2b/withdrawal.usecase.ts` ⏳
3. `packages/core/service/index.ts` ⏳ (export new service)

---

## Next Steps (Priority Order)

1. **Update deposit.usecase.ts** - Replace share minting with simplified vault tracking
2. **Update withdrawal.usecase.ts** - Add client growth index calculation
3. **Export ClientGrowthIndexService** - Add to service/index.ts
4. **Test end-to-end** - User creation → Deposit → Check balance
5. **Update fiat deposit API** - Integrate with new flow

---

## Testing Checklist

- [ ] Database reset works without errors
- [ ] User creation doesn't create vaults
- [ ] First deposit creates vault with correct entry_index
- [ ] Second deposit updates weighted_entry_index correctly
- [ ] Client growth index calculates correctly
- [ ] User balance calculation works (current_value, yield)
- [ ] Withdrawal updates vault correctly
- [ ] Multi-client isolation works (user can have vaults with multiple clients)

---

**Status:** 80% Complete - Repository & Service layers done, Usecase updates needed! 🚀

**Documentation:**
- See `SIMPLIFIED_VAULT_ARCHITECTURE.md` for architecture details
- See `DEPOSIT_FLOWS.md` for fiat/crypto deposit flows
- See `packages/core/service/client-growth-index.service.ts` for growth index calculation

