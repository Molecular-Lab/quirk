# Index-Based Vault System - Complete Documentation

> **Complete technical documentation for Proxify's index-based custodial vault system with pooled DeFi deployment**

## Table of Contents

1. [🎯 Ultra-Simplified Architecture (NEW!)](#ultra-simplified-architecture-new)
2. [📋 Implementation TODOs for Next Agent](#implementation-todos-for-next-agent)
3. [Complete System Flow](#complete-system-flow)
4. [Overview](#overview)
5. [Database Schema](#database-schema)
6. [Index Calculation Formulas](#index-calculation-formulas)
7. [Complete Flow Visualizations](#complete-flow-visualizations)
8. [Database Invariants](#database-invariants)

---

## 📋 Implementation TODOs for Next Agent

### ✅ COMPLETED (Database Layer)

1. **Database Schema Migration** ✅
   - File: `database/migrations/000001_init_schema.up.sql`
   - Changed: Simplified `end_user_vaults` table
   - Removed: `chain`, `token_address`, `token_symbol`, `shares`
   - Added: `total_deposited`, unique constraint on `(end_user_id, client_id)`
   - Status: **Schema updated and migrated**

2. **SQLC Queries** ✅
   - File: `database/queries/vault.sql`
   - Updated: `CreateEndUserVault` - only 4 params (no chain/token/shares)
   - Updated: `GetEndUserVaultByClient` - new query using clientId only
   - Removed: Multi-chain queries
   - Status: **Queries updated, need to regenerate types**

---

### ⏳ TODO: Repository Layer

**Priority: HIGH** - These changes are required for deposit/withdrawal to work

#### 1. Regenerate SQLC Types
```bash
cd /Users/wtshai/Work/Protocolcamp/proxify
npm run sqlc:generate
# or
sqlc generate
```
**Expected Output**: New TypeScript types in `packages/sqlcgen/src/gen/vault.ts`
- `CreateEndUserVaultParams` - should have only 4 fields
- `GetEndUserVaultByClientRow` - should return simplified vault

---

#### 2. Update `packages/core/repository/postgres/vault.repository.ts`

**Location**: Lines 150-250 (approximate)

**Changes Needed**:

```typescript
// ❌ REMOVE: Old multi-chain method
async getEndUserVault(
  userId: string, 
  chain: string, 
  tokenAddress: string
): Promise<GetEndUserVaultRow | null>

// ✅ ADD: Simplified single-client method
async getEndUserVaultByClient(
  userId: string,
  clientId: string
): Promise<GetEndUserVaultByClientRow | null> {
  const rows = await GetEndUserVaultByClient(this.sql, {
    endUserId: userId,
    clientId: clientId,
  });
  return rows[0] || null;
}

// ❌ REMOVE: Share-based methods
async addShares(vaultId: string, shares: string): Promise<void>
async burnShares(vaultId: string, shares: string): Promise<void>

// ✅ ADD: Fiat-based methods
async updateVaultDeposit(
  vaultId: string,
  depositAmount: string,
  newWeightedEntryIndex: string
): Promise<void> {
  await this.sql`
    UPDATE end_user_vaults
    SET 
      total_deposited = total_deposited + ${depositAmount}::numeric,
      weighted_entry_index = ${newWeightedEntryIndex}::numeric,
      last_deposit_at = NOW(),
      updated_at = NOW()
    WHERE id = ${vaultId}
  `;
}

async updateVaultWithdrawal(
  vaultId: string,
  withdrawalAmount: string
): Promise<void> {
  await this.sql`
    UPDATE end_user_vaults
    SET 
      total_deposited = total_deposited - ${withdrawalAmount}::numeric,
      last_withdrawal_at = NOW(),
      updated_at = NOW()
    WHERE id = ${vaultId}
  `;
}

// ❌ REMOVE: createEndUserVault with 7 params
// ✅ KEEP: createEndUserVault with 4 params (already updated in SQLC)
```

**Files to Edit**:
- `packages/core/repository/postgres/vault.repository.ts`
- Export updated methods from `packages/core/repository/index.ts`

---

### ⏳ TODO: Service Layer

**Priority: HIGH** - Required for deposit flow

#### 3. Create `packages/core/service/client-growth-index.service.ts` (NEW FILE)

**Purpose**: Calculate weighted average growth index across all client vaults

```typescript
/**
 * Client Growth Index Service
 * Calculates weighted average of all client vault indexes
 */

import type { VaultRepository } from '../repository';

export class ClientGrowthIndexService {
  constructor(private vaultRepository: VaultRepository) {}

  /**
   * Calculate client's weighted average growth index
   * 
   * Formula: clientGrowthIndex = Σ(vaultAUM × vaultIndex) / Σ(vaultAUM)
   * 
   * Example:
   *   Vault 1: $10M AUM, index 1.04e18
   *   Vault 2: $5M AUM, index 1.05e18
   *   Vault 3: $3M AUM, index 1.03e18
   *   
   *   Total AUM = 18M
   *   Weighted Sum = (10M × 1.04e18) + (5M × 1.05e18) + (3M × 1.03e18)
   *   Growth Index = Weighted Sum / 18M = 1.0406e18
   */
  async calculateClientGrowthIndex(clientId: string): Promise<bigint> {
    // Get all client vaults (multi-chain, multi-token)
    const vaults = await this.vaultRepository.listClientVaults(clientId);

    if (vaults.length === 0) {
      return BigInt(1e18); // Default: 1.0 if no vaults
    }

    let totalAUM = BigInt(0);
    let weightedIndexSum = BigInt(0);

    for (const vault of vaults) {
      // AUM = staked + pending
      const vaultAUM = BigInt(vault.totalStakedBalance) + 
                       BigInt(vault.pendingDepositBalance);
      
      const vaultIndex = BigInt(vault.currentIndex);

      totalAUM += vaultAUM;
      weightedIndexSum += vaultAUM * vaultIndex;
    }

    if (totalAUM === BigInt(0)) {
      return BigInt(1e18); // Default: 1.0 if no AUM
    }

    // Weighted average
    const clientGrowthIndex = weightedIndexSum / totalAUM;

    return clientGrowthIndex;
  }

  /**
   * Calculate user's current value using client growth index
   * 
   * Formula: currentValue = totalDeposited × (clientGrowthIndex / entryIndex)
   */
  async calculateUserCurrentValue(
    totalDeposited: string,
    entryIndex: string,
    clientId: string
  ): Promise<string> {
    const clientGrowthIndex = await this.calculateClientGrowthIndex(clientId);
    
    const depositedBigInt = BigInt(totalDeposited);
    const entryIndexBigInt = BigInt(entryIndex);

    // currentValue = deposited × (growthIndex / entryIndex)
    const currentValue = (depositedBigInt * clientGrowthIndex) / entryIndexBigInt;

    return currentValue.toString();
  }
}
```

**Files to Create**:
- `packages/core/service/client-growth-index.service.ts`
- Export from `packages/core/service/index.ts`
- Export from `packages/core/index.ts`

---

### ⏳ TODO: UseCase Layer

**Priority: HIGH** - Core business logic

#### 4. Update `packages/core/usecase/b2b/deposit.usecase.ts`

**Location**: Lines 80-200 (completeDeposit method)

**Before (Share-based)**:
```typescript
// Calculate shares to mint
const sharesToMint = (depositAmount * 1e18) / currentIndex;

// Update vault shares
await vaultRepository.addShares(vaultId, sharesToMint);
```

**After (Fiat-based with Client Growth Index)**:
```typescript
// Step 1: Calculate client growth index
const clientGrowthIndex = await this.clientGrowthIndexService
  .calculateClientGrowthIndex(clientId);

// Step 2: Get or create end_user_vault (simplified - no chain/token)
let userVault = await this.vaultRepository.getEndUserVaultByClient(
  userId,
  clientId
);

if (!userVault) {
  // First deposit - create vault with current growth index as entry
  userVault = await this.vaultRepository.createEndUserVault({
    endUserId: userId,
    clientId: clientId,
    totalDeposited: depositAmount,
    weightedEntryIndex: clientGrowthIndex.toString(),
  });
} else {
  // Subsequent deposit - recalculate weighted entry index (DCA support)
  const oldDeposited = BigInt(userVault.totalDeposited);
  const oldEntryIndex = BigInt(userVault.weightedEntryIndex);
  const newDeposited = BigInt(depositAmount);
  
  const totalDeposited = oldDeposited + newDeposited;
  
  // Weighted average entry index
  const newWeightedEntryIndex = 
    (oldDeposited * oldEntryIndex + newDeposited * clientGrowthIndex) / 
    totalDeposited;

  // Update vault
  await this.vaultRepository.updateVaultDeposit(
    userVault.id,
    depositAmount,
    newWeightedEntryIndex.toString()
  );
}

// Step 3: Update client vault pending balance (unchanged)
await this.vaultRepository.updateClientVaultPendingBalance(
  clientVaultId,
  depositAmount
);
```

**Dependencies**:
- Add `clientGrowthIndexService: ClientGrowthIndexService` to constructor
- Import `ClientGrowthIndexService`

---

#### 5. Update `packages/core/usecase/b2b/withdrawal.usecase.ts`

**Location**: Lines 60-150 (createWithdrawal method)

**Before (Share-based)**:
```typescript
const shares = BigInt(userVault.shares);
const currentIndex = BigInt(clientVault.currentIndex);
const effectiveBalance = (shares * currentIndex) / 1e18;
const sharesToBurn = (withdrawAmount * shares) / effectiveBalance;
```

**After (Fiat-based with Client Growth Index)**:
```typescript
// Calculate current value using client growth index
const totalDeposited = BigInt(userVault.totalDeposited);
const entryIndex = BigInt(userVault.weightedEntryIndex);
const clientGrowthIndex = await this.clientGrowthIndexService
  .calculateClientGrowthIndex(clientId);

// Current value = deposited × (growthIndex / entryIndex)
const currentValue = (totalDeposited * clientGrowthIndex) / entryIndex;

// Check sufficient balance
if (withdrawAmount > currentValue) {
  throw new Error('Insufficient balance');
}

// Calculate new deposited amount (proportional reduction)
const newDeposited = withdrawAmount >= currentValue
  ? BigInt(0) // Full withdrawal
  : (totalDeposited * (currentValue - withdrawAmount)) / currentValue;

// Update vault
await this.vaultRepository.updateVaultWithdrawal(
  userVault.id,
  (totalDeposited - newDeposited).toString()
);
```

**Dependencies**:
- Add `clientGrowthIndexService: ClientGrowthIndexService` to constructor

---

#### 6. Update `packages/core/repository/postgres/end_user.repository.ts`

**Location**: Portfolio query methods

**Change**: Remove multi-chain breakdown, return single aggregated balance

**Before**:
```typescript
async getPortfolio(userId: string): Promise<UserPortfolio> {
  // Returns array of vaults per chain/token
  return {
    vaults: [
      { chain: 'base', token: 'USDC', balance: '1000' },
      { chain: 'polygon', token: 'USDT', balance: '500' },
    ]
  };
}
```

**After**:
```typescript
async getPortfolio(userId: string, clientId: string): Promise<UserPortfolio> {
  const vault = await this.vaultRepository.getEndUserVaultByClient(userId, clientId);
  
  if (!vault) {
    return { totalDeposited: '0', currentValue: '0', yieldEarned: '0' };
  }

  const currentValue = await this.clientGrowthIndexService
    .calculateUserCurrentValue(
      vault.totalDeposited,
      vault.weightedEntryIndex,
      clientId
    );

  const yieldEarned = BigInt(currentValue) - BigInt(vault.totalDeposited);

  return {
    totalDeposited: vault.totalDeposited,
    currentValue: currentValue,
    yieldEarned: yieldEarned.toString(),
  };
}
```

---

### ⏳ TODO: Testing

**Priority: MEDIUM** - After core implementation

#### 7. Test Deposit Flow

**Test Case 1: First Deposit**
```typescript
// Given: User has no vault
// When: User deposits $1,000
// Then: 
//   - end_user_vault created
//   - total_deposited = 1000
//   - weighted_entry_index = client_growth_index (e.g., 1.0406e18)
```

**Test Case 2: Second Deposit (DCA)**
```typescript
// Given: User deposited $1,000 at index 1.00
// When: User deposits $500 at index 1.10
// Then:
//   - total_deposited = 1500
//   - weighted_entry_index = (1000×1.00 + 500×1.10) / 1500 = 1.0333
```

#### 8. Test User Balance Query

**Test Case**:
```typescript
// Given:
//   - User deposited $1,000 at entry index 1.00
//   - Client growth index now 1.05
// When: Query user balance
// Then:
//   - totalDeposited: $1,000
//   - currentValue: $1,050 (= 1000 × 1.05 / 1.00)
//   - yieldEarned: $50
```

---

### 📝 Implementation Checklist

Copy this checklist and mark items as you complete them:

```markdown
## Repository Layer
- [ ] Run `sqlc generate` to regenerate types
- [ ] Update `vault.repository.ts` - remove multi-chain methods
- [ ] Add `getEndUserVaultByClient(userId, clientId)` method
- [ ] Add `updateVaultDeposit(vaultId, amount, newWeightedIndex)` method
- [ ] Add `updateVaultWithdrawal(vaultId, amount)` method
- [ ] Remove `addShares()` and `burnShares()` methods
- [ ] Export new methods from `repository/index.ts`

## Service Layer
- [ ] Create `service/client-growth-index.service.ts`
- [ ] Implement `calculateClientGrowthIndex(clientId)` method
- [ ] Implement `calculateUserCurrentValue(deposited, entryIndex, clientId)` method
- [ ] Export from `service/index.ts`
- [ ] Export from `core/index.ts`

## UseCase Layer
- [ ] Update `deposit.usecase.ts` - add `ClientGrowthIndexService` dependency
- [ ] Update `completeDeposit()` - use client growth index instead of shares
- [ ] Implement DCA logic - recalculate weighted entry index on 2nd+ deposit
- [ ] Update `withdrawal.usecase.ts` - add `ClientGrowthIndexService` dependency
- [ ] Update `createWithdrawal()` - calculate balance using growth index
- [ ] Update `end_user.repository.ts` - simplify portfolio query

## Testing
- [ ] Test first deposit - vault created with growth index as entry
- [ ] Test second deposit - weighted entry index recalculated (DCA)
- [ ] Test user balance query - correct yield calculation
- [ ] Test withdrawal - proportional reduction of deposited amount
- [ ] Test multi-vault client - growth index weighted average correct

## Documentation
- [ ] Update API documentation with simplified vault structure
- [ ] Document client growth index calculation
- [ ] Add examples of DCA entry index calculation
```

---

### 🎯 Key Architecture Points for Next Agent

1. **No More Shares**: End-users don't have shares anymore. They have `total_deposited` (fiat amount).

2. **Client Growth Index**: This is the weighted average of ALL client vault indexes. It replaces individual vault indexes for end-users.

3. **Entry Index**: Captured once when user first deposits (or recalculated for DCA). This is the client growth index at deposit time.

4. **Current Value Formula**: 
   ```
   currentValue = totalDeposited × (clientGrowthIndex / entryIndex)
   ```

5. **DCA Support**: When user deposits multiple times, we recalculate weighted entry index:
   ```
   newEntryIndex = (oldDeposited × oldEntryIndex + newDeposited × currentGrowthIndex) / totalDeposited
   ```

6. **Simplified Vault**: `end_user_vaults` table now has:
   - `total_deposited` (fiat amount)
   - `weighted_entry_index` (client growth index at deposit)
   - No `chain`, `token_address`, `token_symbol`, `shares`

---

## 🎯 Ultra-Simplified Architecture (NEW!)

### Key Innovation: Client Growth Index

**End-User Sees (Simple)**:
- Total deposited: $1,000
- Current value: $1,050
- Yield earned: $50
- ✅ **NO multi-chain/token tracking shown to user!**

**Backend Manages (Complex)**:
- Multiple vaults across chains (USDC Base, USDT Polygon, PYUSD Ethereum)
- Different DeFi strategies per vault (AAVE, Curve, Uniswap)
- **Client Growth Index** = Weighted average of ALL vault indexes

### Client Growth Index Formula

```typescript
/**
 * Calculate client's weighted average growth index
 * Aggregates ALL vaults (multi-chain, multi-token, multi-protocol)
 */
clientGrowthIndex = Σ(vaultAUM × vaultIndex) / Σ(vaultAUM)

Example:
  Vault 1: USDC Base     - $10M AUM, index: 1.04e18
  Vault 2: USDC Ethereum - $5M AUM,  index: 1.05e18
  Vault 3: USDT Polygon  - $3M AUM,  index: 1.03e18
  
  Total AUM = $18M
  Weighted Sum = (10M × 1.04) + (5M × 1.05) + (3M × 1.03) = $18.74M
  Client Growth Index = 18.74M / 18M = 1.0406e18
  
  User deposited $1,000 at index 1.0
  Current value = $1,000 × (1.0406 / 1.0) = $1,040.60
  Yield earned = $40.60
```

### Simplified Database Schema

```sql
-- ✅ NEW: Simplified end_user_vaults
CREATE TABLE end_user_vaults (
  id UUID PRIMARY KEY,
  end_user_id UUID REFERENCES end_users(id),
  client_id UUID REFERENCES client_organizations(id),
  
  -- Fiat tracking (what user sees)
  total_deposited NUMERIC(40,18) DEFAULT 0,      -- $1,000
  weighted_entry_index NUMERIC(78,0) NOT NULL,   -- Client growth index at deposit
  
  -- Activity
  last_deposit_at TIMESTAMPTZ,
  last_withdrawal_at TIMESTAMPTZ,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- ✅ ONE vault per user per client (not per chain!)
  UNIQUE(end_user_id, client_id),
  CHECK (total_deposited >= 0)
);

-- ❌ REMOVED: chain, token_address, token_symbol, shares
-- User doesn't need to see multi-chain breakdown!
```

---

## 📋 Implementation TODOs

### ☐ Phase 1: Simplify Database Schema (PRIORITY 1 - START HERE!)

**Goal**: Remove multi-chain complexity from end_user_vaults

**Tasks**:
- [ ] Create migration `000009_simplify_end_user_vaults.up.sql`
  - Remove columns: `chain`, `token_address`, `token_symbol`, `shares`
  - Keep columns: `total_deposited`, `weighted_entry_index`
  - Change unique constraint: `(end_user_id, chain, token_address)` → `(end_user_id, client_id)`
  
- [ ] Update SQLC queries in `database/queries/vault.sql`:
  - `GetEndUserVault`: Filter by `(end_user_id, client_id)` only
  - `CreateEndUserVault`: Remove chain/token parameters
  - `UpdateEndUserVault`: Update `total_deposited` instead of `shares`

**Files to create**:
- `database/migrations/000009_simplify_end_user_vaults.up.sql`
- `database/migrations/000009_simplify_end_user_vaults.down.sql`

**Files to modify**:
- `database/queries/vault.sql`

---

### ☐ Phase 2: Implement Client Growth Index (PRIORITY 1)

**Goal**: Calculate weighted average index across all client vaults

**Tasks**:
- [ ] Create `packages/core/service/vault-index.service.ts`
  - Method: `calculateClientGrowthIndex(clientId: string): Promise<bigint>`
  - Logic: Weighted average of all vault indexes by AUM
  - Formula: `Σ(vaultAUM × vaultIndex) / Σ(vaultAUM)`
  
- [ ] Add caching layer (Redis optional, in-memory for now)
  - Cache key: `client_growth_index:${clientId}`
  - TTL: 5 minutes
  - Invalidate on vault index update

**Files to create**:
- `packages/core/service/vault-index.service.ts`

---

### ☐ Phase 3: Update Deposit Flow (PRIORITY 2)

**Goal**: Deposit uses client growth index, not per-vault shares

**Tasks**:
- [ ] Modify `packages/core/usecase/b2b/deposit.usecase.ts`:
  - Get current client growth index (not individual vault index)
  - Create/update single `end_user_vault` record (no chain filtering!)
  - Store fiat amount in `total_deposited`
  - Store client growth index in `weighted_entry_index`
  - Remove share minting logic
  
- [ ] Update `completeDeposit()` flow:
  ```typescript
  // OLD (remove):
  const shares = (depositAmount * 1e18) / vaultIndex;
  await updateEndUserVault({ shares });
  
  // NEW (implement):
  const clientGrowthIndex = await vaultIndexService.calculateClientGrowthIndex(clientId);
  await updateEndUserVault({ 
    total_deposited: total_deposited + depositAmount,
    weighted_entry_index: clientGrowthIndex // Capture at deposit time
  });
  ```

**Files to modify**:
- `packages/core/usecase/b2b/deposit.usecase.ts`
- `packages/core/repository/vault.repository.ts`

---

### ☐ Phase 4: Update Portfolio Query (PRIORITY 2)

**Goal**: Show user simple USD balance + yield

**Tasks**:
- [ ] Create new query in `database/queries/vault.sql`:
  ```sql
  -- name: GetUserPortfolioSimplified :one
  SELECT 
    euv.total_deposited,
    euv.weighted_entry_index,
    -- Calculate client's current growth index
    (SELECT Σ(AUM × index) / Σ(AUM) FROM client_vaults WHERE client_id = $2) as current_client_index,
    -- Calculate current value
    euv.total_deposited * current_client_index / euv.weighted_entry_index as current_value
  FROM end_user_vaults euv
  WHERE euv.end_user_id = $1 AND euv.client_id = $2;
  ```
  
- [ ] Update API response in `packages/core/usecase/b2b/user-vault.usecase.ts`:
  ```typescript
  return {
    totalDeposited: "1000.00",
    currentValue: "1040.60",
    yieldEarned: "40.60",
    yieldPercentage: "4.06%"
  };
  ```

**Files to modify**:
- `database/queries/vault.sql`
- `packages/core/usecase/b2b/user-vault.usecase.ts`

---

### ☐ Phase 5: Update Withdrawal Flow (PRIORITY 3)

**Goal**: Withdraw uses fiat amount, not shares

**Tasks**:
- [ ] Modify `packages/core/usecase/b2b/withdrawal.usecase.ts`:
  - Calculate withdrawal amount in fiat (not shares)
  - Reduce `total_deposited` proportionally
  - Backend determines which vault(s) to withdraw from
  
- [ ] Add smart withdrawal routing:
  - Option A: Withdraw from vault with lowest yield first (tax optimization)
  - Option B: Withdraw proportionally from all vaults (fair distribution)

**Files to modify**:
- `packages/core/usecase/b2b/withdrawal.usecase.ts`

---

### ☐ Phase 6: Add Client Growth Index Tracking (PRIORITY 3)

**Goal**: Store historical growth index for analytics

**Tasks**:
- [ ] Create new table `client_growth_index_history`:
  ```sql
  CREATE TABLE client_growth_index_history (
    id UUID PRIMARY KEY,
    client_id UUID REFERENCES client_organizations(id),
    growth_index NUMERIC(78,0) NOT NULL,
    total_aum NUMERIC(40,18) NOT NULL,
    snapshot_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );
  ```
  
- [ ] Create CRON job to snapshot every hour
- [ ] Use for analytics dashboard

**Files to create**:
- `database/migrations/000010_client_growth_index_history.up.sql`

---

## 🎯 Complete System Flow

### Multi-Organization Single Wallet Architecture

**CRITICAL UNDERSTANDING**: One Privy User = One Custodial Wallet, Multiple Organizations

**SIMPLIFIED B2B ESCROW**: End-users only track fiat balance + entry index (no multi-chain complexity)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  MULTI-ORG SINGLE WALLET + SIMPLIFIED TRACKING                               │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│  👤 Privy User: john@grab.com                                                 │
│  🔐 DID: did:privy:abc123xyz                                                  │
│  💼 Custodial Wallet: 0x3F450bC83942c44d38C0Be82CAe8194ce8FE5FE5 (ONE WALLET)│
│                                                                                │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  Organization 1: GrabPay (prod_grabpay_123)                         │    │
│  ├─────────────────────────────────────────────────────────────────────┤    │
│  │  client_vaults (backend manages multi-chain):                       │    │
│  │  ├─ USDC on Base (0x833589fCD6...)                                 │    │
│  │  │  ├─ total_shares: 10,000e18                                     │    │
│  │  │  ├─ current_index: 1.05e18 (5% yield growth)                   │    │
│  │  │  ├─ strategies: 70% AAVE, 20% Curve, 10% Uniswap              │    │
│  │  │                                                                  │    │
│  │  └─ PYUSD on Base (0x...)  (backend decides which chain to use)   │    │
│  │     └─ total_shares: 0 (not yet configured)                        │    │
│  │                                                                       │    │
│  │  end_user_vaults (SIMPLE FIAT TRACKING):                            │    │
│  │  ├─ driver_001:                                                      │    │
│  │  │  ├─ fiat_balance: $5,250 (what they see)                        │    │
│  │  │  ├─ entry_index: 1.00e18 (when they first deposited)           │    │
│  │  │  └─ current_value: $5,250 * (1.05/1.00) = $5,512.50            │    │
│  │  │                                                                   │    │
│  │  └─ driver_002:                                                      │    │
│  │     ├─ fiat_balance: $5,000                                         │    │
│  │     ├─ entry_index: 1.03e18 (deposited later)                      │    │
│  │     └─ current_value: $5,000 * (1.05/1.03) = $5,097.09             │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                                │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  Organization 2: GrabFood (prod_grabfood_456)                       │    │
│  ├─────────────────────────────────────────────────────────────────────┤    │
│  │  client_vaults:                                                      │    │
│  │  ├─ USDC on Base (same wallet, different index!)                   │    │
│  │  │  ├─ current_index: 1.08e18 (8% yield - different strategy!)    │    │
│  │  │  ├─ strategies: 40% AAVE, 40% Yearn, 20% Curve                 │    │
│  │  │                                                                   │    │
│  │  └─ USDT on Polygon (backend manages multi-chain)                  │    │
│  │     └─ current_index: 1.06e18                                       │    │
│  │                                                                       │    │
│  │  end_user_vaults:                                                    │    │
│  │  ├─ driver_001: (SAME USER, DIFFERENT ORG)                          │    │
│  │  │  ├─ fiat_balance: $32,000                                        │    │
│  │  │  ├─ entry_index: 1.00e18                                         │    │
│  │  │  └─ current_value: $32,000 * (1.08/1.00) = $34,560              │    │
│  │  │                                                                   │    │
│  │  ├─ driver_003:                                                      │    │
│  │  │  ├─ fiat_balance: $10,000                                        │    │
│  │  │  └─ current_value: $10,000 * (1.08/1.00) = $10,800              │    │
│  │  │                                                                   │    │
│  │  └─ driver_007:                                                      │    │
│  │     └─ fiat_balance: $10,000                                         │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                                │
│  📊 KEY INSIGHTS:                                                             │
│  ✅ ONE entry_index per user (not per chain!) - simpler!                     │
│  ✅ Entry index = Product Owner's current_index at deposit time              │
│  ✅ Backend manages multi-chain (USDC, USDT, PYUSD) - user doesn't care     │
│  ✅ User sees: fiat balance + yield (current_value - fiat_balance)           │
│  ✅ Each org has different index growth (different DeFi strategies)          │
│                                                                                │
│  🔒 ISOLATION MECHANISM:                                                     │
│  ├─ client_vaults.client_id (FK to client_organizations)                    │
│  ├─ end_user_vaults.client_id (FK to client_organizations)                  │
│  └─ Queries MUST filter by client_id to avoid mixing orgs                   │
│                                                                                │
│  ⚠️  CRITICAL SAFETY RULES:                                                  │
│  1. ALWAYS filter by client_id when querying vaults                         │
│  2. Frontend MUST show active organization clearly                          │
│  3. driver_001 can have DIFFERENT balances in different orgs                │
│  4. Backend chooses chain (USDC/USDT/PYUSD) - user just sees USD            │
│  5. Entry index captured ONCE on first deposit (not per chain)              │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

### 🎬 Complete 6-Flow System (USDC Focused, Multi-Asset Ready)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  FLOW 1: LOGIN & PRIVY ACCOUNT CREATION                                      │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│  Frontend (Privy Auth):                                                       │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  1. User clicks "Login with Privy"                                   │   │
│  │  2. Privy SDK creates/logs into account                              │   │
│  │  3. Privy creates embedded wallet (custodial)                        │   │
│  │  4. Frontend receives:                                                │   │
│  │     - user.id (DID)                                                   │   │
│  │     - user.email.address                                              │   │
│  │     - user.wallet.address (0x...)                                     │   │
│  │  5. Store in UserStore (Zustand):                                    │   │
│  │     - privyUserId: user.id                                           │   │
│  │     - privyWalletAddress: user.wallet.address                        │   │
│  │     - email: user.email.address                                      │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                                │
│  Backend: No API call yet! (Frontend-only flow)                              │
│                                                                                │
│  ✅ RESULT:                                                                   │
│  - User authenticated with Privy                                             │
│  - Custodial wallet created (ONE wallet for ALL orgs)                       │
│  - Ready to register client organizations                                   │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│  FLOW 2A: CLIENT ORGANIZATION CREATION (AUTO-CREATE VAULT)                   │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│  Frontend → Backend:                                                         │
│  POST /api/v1/clients                                                        │
│  {                                                                            │
│    "companyName": "GrabPay",                                                 │
│    "businessType": "fintech",                                                │
│    "walletType": "MANAGED",                                                  │
│    "privyOrganizationId": "did:privy:abc123xyz",  ← From Privy login        │
│    "privyWalletAddress": "0x3F450bC8...",         ← From Privy login        │
│    "privyEmail": "john@grab.com"                   ← From Privy login        │
│  }                                                                            │
│                                                                                │
│  Backend Processing (client.service.ts):                                     │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  1. Create privy_accounts record (idempotent):                       │   │
│  │     INSERT INTO privy_accounts (                                     │   │
│  │       privy_organization_id,                                         │   │
│  │       privy_wallet_address,                                          │   │
│  │       privy_email,                                                   │   │
│  │       wallet_type                                                    │   │
│  │     ) ON CONFLICT (privy_organization_id) DO NOTHING                │   │
│  │                                                                       │   │
│  │  2. Create client_organizations record:                              │   │
│  │     INSERT INTO client_organizations (                               │   │
│  │       privy_account_id,    ← FK to privy_accounts                   │   │
│  │       product_id,          ← Generated: "prod_grabpay_xyz"          │   │
│  │       company_name,                                                  │   │
│  │       business_type,                                                 │   │
│  │       api_key_hash,        ← Generated: "pk_live_..."               │   │
│  │       platform_fee,        ← Default: 1.0%                          │   │
│  │       end_user_yield_portion ← Default: 90%                         │   │
│  │     )                                                                 │   │
│  │                                                                       │   │
│  │  3. Create client_balances:                                          │   │
│  │     INSERT INTO client_balances (                                    │   │
│  │       client_id,                                                     │   │
│  │       available: 0,                                                  │   │
│  │       reserved: 0,                                                   │   │
│  │       currency: 'USDC'                                               │   │
│  │     )                                                                 │   │
│  │                                                                       │   │
│  │  ✨ 4. AUTO-CREATE DEFAULT USDC VAULT:                               │   │
│  │     const vault = await getOrCreateVault({                          │   │
│  │       clientId: client.id,                                          │   │
│  │       chain: "8453",  // Base mainnet chain ID                     │   │
│  │       tokenAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", │   │
│  │       tokenSymbol: "USDC"                                           │   │
│  │     });                                                              │   │
│  │                                                                       │   │
│  │     INSERT INTO client_vaults (                                      │   │
│  │       client_id,                                                     │   │
│  │       chain: "8453",  // Base mainnet                              │   │
│  │       token_address: "0x833589fCD6...",                            │   │
│  │       token_symbol: "USDC",                                         │   │
│  │       total_shares: "0",                                            │   │
│  │       current_index: "1000000000000000000",  ← 1.0e18 (initial)   │   │
│  │       pending_deposit_balance: "0",                                 │   │
│  │       total_staked_balance: "0",                                    │   │
│  │       cumulative_yield: "0"                                         │   │
│  │     )                                                                 │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                                │
│  Response:                                                                   │
│  {                                                                            │
│    "id": "client-uuid-...",                                                  │
│    "productId": "prod_grabpay_xyz",                                          │
│    "companyName": "GrabPay",                                                 │
│    "defaultVaultId": "vault-uuid-...",  ← NEW! Auto-created USDC vault      │
│    "apiKey": "pk_live_abc123...",                                            │
│    "webhookSecret": "whsec_xyz..."                                           │
│  }                                                                            │
│                                                                                │
│  ✅ RESULT:                                                                   │
│  - Client organization created                                               │
│  - Default USDC vault auto-created on Base                                  │
│  - Ready to configure strategies                                            │
│  - Can later create USDT/PYUSD vaults via strategy config                  │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│  FLOW 2B: CONFIGURE VAULT STRATEGIES (MULTI-ASSET FLEXIBLE)                  │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│  Frontend → Backend:                                                         │
│  POST /api/v1/products/{productId}/strategies                                │
│  {                                                                            │
│    "chain": "8453",           ← Base mainnet chain ID                        │
│    "tokenAddress": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",  ← USDC    │
│    "tokenSymbol": "USDC",     ← Can be: USDC, USDT, PYUSD                   │
│    "strategies": [                                                            │
│      { "category": "lending", "target": 70 },  ← AAVE, Compound             │
│      { "category": "lp", "target": 20 },       ← Curve, Uniswap             │
│      { "category": "staking", "target": 10 }   ← Lido, Rocket Pool          │
│    ]                                                                          │
│  }                                                                            │
│                                                                                │
│  Validation:                                                                 │
│  ✅ strategies.reduce((sum, s) => sum + s.target, 0) === 100                │
│                                                                                │
│  Backend Processing (client.usecase.ts):                                     │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  1. Get client by productId                                          │   │
│  │  2. Get or create client_vault:                                      │   │
│  │     SELECT * FROM client_vaults                                      │   │
│  │     WHERE client_id = $1                                             │   │
│  │       AND chain = '8453'  -- Base mainnet                           │   │
│  │       AND token_address = '0x833589fCD6...'                         │   │
│  │                                                                       │   │
│  │     If not exists:                                                   │   │
│  │       INSERT INTO client_vaults (...same as FLOW 2A...)             │   │
│  │                                                                       │   │
│  │  3. Delete old strategies:                                           │   │
│  │     DELETE FROM vault_strategies                                     │   │
│  │     WHERE client_vault_id = $1                                       │   │
│  │                                                                       │   │
│  │  4. Insert new strategies:                                           │   │
│  │     INSERT INTO vault_strategies (                                   │   │
│  │       client_vault_id,                                               │   │
│  │       category,                                                      │   │
│  │       target_percent                                                 │   │
│  │     ) VALUES                                                          │   │
│  │       ($1, 'lending', 70.00),                                        │   │
│  │       ($1, 'lp', 20.00),                                            │   │
│  │       ($1, 'staking', 10.00)                                        │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                                │
│  Multi-Asset Example:                                                        │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  // Configure USDC on Base                                           │   │
│  │  POST /strategies { chain: "8453", token: USDC, ... }               │   │
│  │                                                                       │   │
│  │  // Later: Configure USDT on Polygon                                 │   │
│  │  POST /strategies {                                                  │   │
│  │    chain: "137",  // Polygon mainnet                                │   │
│  │    tokenAddress: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",     │   │
│  │    tokenSymbol: "USDT",                                             │   │
│  │    strategies: [ ... ]                                               │   │
│  │  }                                                                    │   │
│  │  → Creates SECOND vault for same client!                            │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                                │
│  ✅ RESULT:                                                                   │
│  - Vault strategies configured                                               │
│  - Client can have multiple vaults (USDC, USDT, PYUSD)                      │
│  - Each vault has independent index and strategies                          │
│  - Ready for end-user deposits                                              │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│  FLOW 3: END-USER REGISTRATION (SIMPLIFIED B2B ESCROW)                       │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│  🎯 CRITICAL: End-user vaults are created LAZILY on first deposit!           │
│     No need to track multiple chains - just fiat balance + entry index       │
│                                                                                │
│  Frontend → Backend:                                                         │
│  POST /api/v1/users                                                          │
│  {                                                                            │
│    "clientId": "prod_grabpay_xyz",     ← Active organization's productId    │
│    "clientUserId": "driver_12345",     ← Client's internal user ID          │
│    "email": "driver@example.com",                                            │
│    "walletAddress": "0x3F450bC8..."    ← Optional (custodial wallet)        │
│  }                                                                            │
│                                                                                │
│  Backend Processing:                                                         │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  1. Validate productId & get client:                                 │   │
│  │     SELECT id FROM client_organizations                              │   │
│  │     WHERE product_id = 'prod_grabpay_xyz'                           │   │
│  │                                                                       │   │
│  │  2. Check if user already exists:                                    │   │
│  │     SELECT * FROM end_users                                          │   │
│  │     WHERE client_id = $1                                             │   │
│  │       AND user_id = 'driver_12345'                                   │   │
│  │                                                                       │   │
│  │  3. If not exists, create:                                           │   │
│  │     INSERT INTO end_users (                                          │   │
│  │       client_id,          ← UUID from client_organizations          │   │
│  │       user_id,            ← "driver_12345" (client's ID)            │   │
│  │       user_type,          ← "custodial" (B2B escrow)                │   │
│  │       email,                                                         │   │
│  │       wallet_address,     ← Optional                                │   │
│  │       is_active: true                                                │   │
│  │     )                                                                 │   │
│  │                                                                       │   │
│  │  ✨ 4. NO VAULT CREATION HERE!                                       │   │
│  │     Vaults are created on first deposit (FLOW 4)                    │   │
│  │     This captures entry index at the right time                     │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                                │
│  Multi-Org Behavior:                                                         │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  // Same driver, different organizations:                            │   │
│  │                                                                       │   │
│  │  GrabPay:  end_users { client_id: grabpay_uuid, user_id: "d_123" }  │   │
│  │  GrabFood: end_users { client_id: grabfood_uuid, user_id: "d_123" } │   │
│  │  GrabMart: end_users { client_id: grabmart_uuid, user_id: "d_123" } │   │
│  │                                                                       │   │
│  │  ✅ Same user_id, different client_id = separate accounts            │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                                │
│  ✅ RESULT:                                                                   │
│  - End-user account created for organization                                │
│  - Ready to receive deposits                                                │
│  - No end_user_vault created yet (lazy creation on first deposit)           │
│  - Simpler architecture: one entry index, tracked at deposit time           │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│  FLOW 4A: FIAT DEPOSIT (B2B ESCROW → ON-RAMP → STAKING)                     │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│  🎯 CRITICAL ARCHITECTURE: Client (Shopify) holds end-user's fiat money      │
│     in their traditional banking system. NOT end-user's crypto wallet!       │
│                                                                                │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  SHOPIFY (Client App)                                                │   │
│  │  • End-user has $1000 revenue in Shopify balance                    │   │
│  │  • User clicks "Start Earning Yield" in Shopify dashboard           │   │
│  │  • Shopify backend calls Proxify API on behalf of user              │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                                │
│  Client Backend → Proxify API:                                               │
│  POST /api/v1/deposits/fiat                                                  │
│  Headers: { Authorization: "Bearer pk_live_shopify_abc123..." }              │
│  {                                                                            │
│    "clientUserId": "seller_12345",    ← Shopify's internal user ID          │
│    "amount": "1000.00",               ← $1000 USD (fiat)                    │
│    "currency": "USD",                                                        │
│    "chain": "8453",                   ← Target: Base mainnet                │
│    "tokenSymbol": "USDC",             ← Convert to USDC                     │
│    "onRampProvider": "circle"         ← circle | coinbase | bridge          │
│  }                                                                            │
│                                                                                │
│  Backend Processing - Step 1: Initiate Fiat Deposit                          │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  1. Get client from API key:                                         │   │
│  │     client = getByApiKey(req.headers.authorization)                 │   │
│  │     user = getByClientUserId(client.id, 'seller_12345')             │   │
│  │                                                                       │   │
│  │  2. Get client_vault:                                                │   │
│  │     vault = getClientVault(client.id, '8453', USDC_ADDRESS)         │   │
│  │                                                                       │   │
│  │  3. Create deposit record (status: awaiting_fiat):                  │   │
│  │     INSERT INTO deposit_transactions (                               │   │
│  │       client_id,                                                     │   │
│  │       user_id,                                                       │   │
│  │       vault_id,                                                      │   │
│  │       deposit_type: 'fiat_onramp',                                  │   │
│  │       fiat_amount: '1000.00',                                       │   │
│  │       fiat_currency: 'USD',                                         │   │
│  │       crypto_amount: null,  ← Will be set after on-ramp            │   │
│  │       status: 'awaiting_fiat',                                      │   │
│  │       on_ramp_provider: 'circle',                                   │   │
│  │       on_ramp_order_id: null  ← Will be set next                   │   │
│  │     ) RETURNING order_id                                             │   │
│  │                                                                       │   │
│  │  4. Initiate traditional banking payment:                           │   │
│  │     paymentInstruction = await bankingGateway.createPayment({      │   │
│  │       orderId: deposit.order_id,                                    │   │
│  │       amount: 1000.00,                                              │   │
│  │       currency: 'USD',                                              │   │
│  │       source: 'shopify_account',  ← Client's bank account          │   │
│  │       destination: 'proxify_escrow_account',                       │   │
│  │       reference: `DEPOSIT_${orderId}`                              │   │
│  │     });                                                              │   │
│  │                                                                       │   │
│  │     UPDATE deposit_transactions SET                                  │   │
│  │       banking_payment_id = paymentInstruction.paymentId,            │   │
│  │       banking_reference = paymentInstruction.reference              │   │
│  │     WHERE order_id = $1                                              │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                                │
│  Response to Client:                                                         │
│  {                                                                            │
│    "orderId": "dep_abc123xyz",                                               │
│    "status": "awaiting_fiat",                                                │
│    "paymentInstruction": {                                                   │
│      "paymentId": "stripe_pi_xyz...",                                        │
│      "amount": "1000.00",                                                    │
│      "currency": "USD",                                                      │
│      "reference": "DEPOSIT_dep_abc123xyz",                                   │
│      "bankDetails": {  ← For wire transfer                                  │
│        "accountNumber": "123456789",                                         │
│        "routingNumber": "987654321",                                         │
│        "accountName": "Proxify Escrow"                                       │
│      }                                                                        │
│    }                                                                          │
│  }                                                                            │
│                                                                                │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  TRADITIONAL BANKING FLOW (Fiat Transfer)                            │   │
│  │  • Shopify initiates $1000 transfer from their bank                 │   │
│  │  • Transfer goes to Proxify's escrow bank account                   │   │
│  │  • Banking provider (Stripe/Plaid) sends webhook to Proxify         │   │
│  │  • Webhook: POST /webhooks/banking/payment-received                 │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                                │
│  Backend Processing - Step 2: Fiat Received Webhook                          │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  POST /webhooks/banking/payment-received                             │   │
│  │  {                                                                    │   │
│  │    "paymentId": "stripe_pi_xyz...",                                  │   │
│  │    "amount": "1000.00",                                              │   │
│  │    "currency": "USD",                                                │   │
│  │    "status": "completed",                                            │   │
│  │    "reference": "DEPOSIT_dep_abc123xyz"                              │   │
│  │  }                                                                    │   │
│  │                                                                       │   │
│  │  1. Find deposit by reference:                                       │   │
│  │     deposit = getByReference('DEPOSIT_dep_abc123xyz')               │   │
│  │                                                                       │   │
│  │  2. Update deposit status:                                           │   │
│  │     UPDATE deposit_transactions SET                                  │   │
│  │       status = 'fiat_received',                                      │   │
│  │       fiat_received_at = NOW()                                       │   │
│  │     WHERE order_id = $1                                              │   │
│  │                                                                       │   │
│  │  3. Initiate on-ramp (Fiat → USDC):                                 │   │
│  │     onRampOrder = await circleAPI.createTransfer({                  │   │
│  │       amount: 1000.00,                                               │   │
│  │       currency: 'USD',                                               │   │
│  │       chain: 'ETH',  ← Circle uses Ethereum/Base                    │   │
│  │       destinationAddress: vault.custodial_wallet_address,           │   │
│  │       walletId: client.circle_wallet_id                             │   │
│  │     });                                                              │   │
│  │                                                                       │   │
│  │     // Circle API Response:                                          │   │
│  │     {                                                                 │   │
│  │       "id": "circle_transfer_123",                                   │   │
│  │       "amount": { "amount": "1000.00", "currency": "USD" },         │   │
│  │       "fees": { "amount": "1.00", "currency": "USD" },  ← Fee       │   │
│  │       "destination": "0x3F450bC8...",                                │   │
│  │       "status": "pending",                                           │   │
│  │       "estimatedUSDC": "999.50"  ← After fees                       │   │
│  │     }                                                                 │   │
│  │                                                                       │   │
│  │  4. Update deposit with on-ramp info:                                │   │
│  │     UPDATE deposit_transactions SET                                  │   │
│  │       status = 'onramp_pending',                                     │   │
│  │       on_ramp_order_id = 'circle_transfer_123',                     │   │
│  │       crypto_amount = '999.50',  ← Estimated USDC                   │   │
│  │       on_ramp_initiated_at = NOW()                                   │   │
│  │     WHERE order_id = $1                                              │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                                │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  ON-RAMP PROVIDER FLOW (Circle USDC Minting)                         │   │
│  │  • Circle converts $1000 → 999.50 USDC (minus fees)                 │   │
│  │  • Circle sends USDC to custodial wallet on Base                    │   │
│  │  • Circle sends webhook to Proxify                                  │   │
│  │  • Webhook: POST /webhooks/circle/transfer-completed                │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                                │
│  Backend Processing - Step 3: On-Ramp Completed Webhook                      │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  POST /webhooks/circle/transfer-completed                            │   │
│  │  {                                                                    │   │
│  │    "transferId": "circle_transfer_123",                              │   │
│  │    "status": "completed",                                            │   │
│  │    "amount": { "amount": "999.50", "currency": "USD" },             │   │
│  │    "blockchain": {                                                   │   │
│  │      "network": "ETH",                                               │   │
│  │      "transactionHash": "0xabc123def456..."                         │   │
│  │    }                                                                  │   │
│  │  }                                                                    │   │
│  │                                                                       │   │
│  │  1. Find deposit by on-ramp order ID:                                │   │
│  │     deposit = getByOnRampOrderId('circle_transfer_123')            │   │
│  │                                                                       │   │
│  │  2. Verify on-chain USDC transfer:                                   │   │
│  │     verification = await tokenTransferService.verifyTransfer({      │   │
│  │       chain: '8453',  // Base mainnet                               │   │
│  │       tokenAddress: USDC_ADDRESS,                                   │   │
│  │       transactionHash: '0xabc123def456...',                         │   │
│  │       toAddress: vault.custodial_wallet_address,                    │   │
│  │       expectedAmount: '999500000'  ← 999.50 USDC (6 decimals)      │   │
│  │     });                                                              │   │
│  │                                                                       │   │
│  │  3. If verified, complete deposit (same as FLOW 4B below):          │   │
│  │     await completeDeposit({                                          │   │
│  │       orderId: deposit.order_id,                                    │   │
│  │       actualCryptoAmount: '999.50',                                 │   │
│  │       transactionHash: '0xabc123def456...',                         │   │
│  │       currentIndex: vault.current_index                             │   │
│  │     });                                                              │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                                │
│  ✅ RESULT (Fiat Deposit):                                                   │
│  - Client's fiat money → Proxify escrow → USDC on-chain                     │
│  - USDC lands in Client's custodial wallet (Privy-managed)                  │
│  - Shares minted for end-user (off-chain accounting)                        │
│  - User starts earning yield immediately                                    │
│  - Multi-org safe: Each client has separate custodial wallet                │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│  FLOW 4B: CRYPTO DEPOSIT (End-user sends USDC directly)                     │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│  🎯 USE CASE: End-user already has USDC in their personal wallet            │
│     and wants to deposit directly (less common for B2B escrow)               │
│                                                                                │
│  Frontend → Backend:                                                         │
│  POST /api/v1/deposits/crypto/initiate                                       │
│  {                                                                            │
│    "clientId": "prod_grabpay_xyz",                                           │
│    "clientUserId": "driver_12345",                                           │
│    "amount": "1000",              ← 1000 USDC                                │
│    "chain": "base",                                                          │
│    "tokenSymbol": "USDC"                                                     │
│  }                                                                            │
│                                                                                │
│  Backend Processing:                                                         │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  1. Get client & user:                                               │   │
│  │     client = getByProductId('prod_grabpay_xyz')                     │   │
│  │     user = getByClientUserId(client.id, 'driver_12345')             │   │
│  │                                                                       │   │
│  │                                                                       │   │
│  │  3. Create deposit record:                                           │   │
│  │     INSERT INTO deposit_transactions (                               │   │
│  │       client_id,                                                     │   │
│  │       user_id,                                                       │   │
│  │       vault_id,                                                      │   │
│  │       deposit_type: 'external',                                      │   │
│  │       amount: '1000',                                                │   │
│  │       status: 'pending',                                             │   │
│  │       transaction_hash: '0xmock1234...'  ← Mock hash                │   │
│  │     )                                                                 │   │
│  │                                                                       │   │
│  │  ✨ 4. AUTO-COMPLETE (for mock_mint):                                │   │
│  │     completeDeposit(depositId, vaultId, amount, txHash)             │   │
│  │                                                                       │   │
│  │     a) Lock client_vault:                                            │   │
│  │        SELECT * FROM client_vaults                                   │   │
│  │        WHERE id = $1 FOR UPDATE                                      │   │
│  │                                                                       │   │
│  │     b) Calculate shares to mint:                                     │   │
│  │        depositAmount = 1000 * 1e18  (BigInt)                        │   │
│  │        currentIndex = vault.current_index (e.g., 1.05e18)           │   │
│  │        sharesToMint = (depositAmount * 1e18) / currentIndex         │   │
│  │                                                                       │   │
│  │        Example:                                                      │   │
│  │        sharesToMint = (1000e18 * 1e18) / 1.05e18                   │   │
│  │                     = 952.38e18 shares                              │   │
│  │                                                                       │   │
│  │     c) Get or create end_user_vault:                                │   │
│  │        SELECT * FROM end_user_vaults                                │   │
│  │        WHERE end_user_id = $1                                        │   │
│  │          AND client_id = $2                                          │   │
│  │          AND chain = 'base'                                          │   │
│  │          AND token_address = USDC_ADDRESS                           │   │
│  │                                                                       │   │
│  │        If not exists:                                                │   │
│  │          INSERT INTO end_user_vaults (                               │   │
│  │            end_user_id,                                              │   │
│  │            client_id,                                                │   │
│  │            chain,                                                    │   │
│  │            token_address,                                            │   │
│  │            token_symbol,                                             │   │
│  │            shares: "0",                                              │   │
│  │            weighted_entry_index: "1000000000000000000",             │   │
│  │            total_deposited: "0",                                     │   │
│  │            total_withdrawn: "0"                                      │   │
│  │          )                                                            │   │
│  │                                                                       │   │
│  │     d) Calculate new weighted entry index (DCA support):            │   │
│  │        oldShares = BigInt(userVault.shares)                         │   │
│  │        oldWeightedIndex = BigInt(userVault.weighted_entry_index)    │   │
│  │        totalShares = oldShares + sharesToMint                       │   │
│  │                                                                       │   │
│  │        newWeightedIndex = oldShares === 0n                          │   │
│  │          ? currentIndex  // First deposit                           │   │
│  │          : (oldShares * oldWeightedIndex + sharesToMint * currentIndex) │
│  │            / totalShares                                             │   │
│  │                                                                       │   │
│  │        Example (first deposit):                                      │   │
│  │        newWeightedIndex = 1.05e18                                   │   │
│  │                                                                       │   │
│  │     e) Update end_user_vault:                                        │   │
│  │        UPDATE end_user_vaults SET                                    │   │
│  │          shares = totalShares,                                       │   │
│  │          weighted_entry_index = newWeightedIndex,                   │   │
│  │          total_deposited = total_deposited + 1000                   │   │
│  │        WHERE id = $1                                                 │   │
│  │                                                                       │   │
│  │     f) Update client_vault:                                          │   │
│  │        UPDATE client_vaults SET                                      │   │
│  │          total_shares = total_shares + sharesToMint,                │   │
│  │          pending_deposit_balance = pending_deposit_balance + 1000   │   │
│  │        WHERE id = $1                                                 │   │
│  │                                                                       │   │
│  │     g) Mark deposit completed:                                       │   │
│  │        UPDATE deposit_transactions SET                               │   │
│  │          status = 'completed',                                       │   │
│  │          completed_at = NOW()                                        │   │
│  │        WHERE id = $1                                                 │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                                │
│  ✅ RESULT (Crypto Deposit):                                                 │
│  - User sends USDC directly to custodial wallet                              │
│  - Shares minted after on-chain verification                                 │
│  - Less common for B2B escrow use case                                       │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│  SHARED LOGIC: completeDeposit() - Mint Shares After Token Verification     │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│  Called by both FLOW 4A (fiat on-ramp webhook) and FLOW 4B (crypto complete) │
│                                                                                │
│  Backend Processing Steps:                                                   │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  Step 0: Get vault with custodial wallet address (via JOIN)         │   │
│  │    SELECT cv.*, pa.privy_wallet_address as custodial_wallet_address │   │
│  │    FROM client_vaults cv                                             │   │
│  │    JOIN client_organizations co ON cv.client_id = co.id             │   │
│  │    JOIN privy_accounts pa ON co.privy_account_id = pa.id            │   │
│  │    WHERE cv.id = $1 FOR UPDATE                                       │   │
│  │                                                                       │   │
│  │  Step 0.5: Verify token transfer on-chain (TokenTransferService)    │   │
│  │    const verification = await tokenTransferService.verifyTransfer({ │   │
│  │      chain: vault.chain,                                             │   │
│  │      tokenAddress: vault.token_address,                              │   │
│  │      transactionHash: params.transactionHash,                        │   │
│  │      toAddress: vault.custodial_wallet_address,  ← From JOIN        │   │
│  │      expectedAmount: params.crypto_amount                            │   │
│  │    });                                                                │   │
│  │                                                                       │   │
│  │    if (!verification.verified) {                                     │   │
│  │      UPDATE deposit_transactions SET                                 │   │
│  │        status = 'failed',                                            │   │
│  │        error_message = verification.error                            │   │
│  │      throw new Error('Token verification failed');                  │   │
│  │    }                                                                  │   │
│  │                                                                       │   │
│  │  Step 1: Calculate shares to mint                                    │   │
│  │    depositAmount = BigInt(params.crypto_amount) * 1e18              │   │
│  │    currentIndex = BigInt(vault.current_index)                       │   │
│  │    sharesToMint = (depositAmount * 1e18) / currentIndex             │   │
│  │                                                                       │   │
│  │    Example:                                                          │   │
│  │    depositAmount = 999.50 USDC (from on-ramp)                       │   │
│  │    currentIndex = 1.05e18                                            │   │
│  │    sharesToMint = (999.50e18 * 1e18) / 1.05e18 = 951.90e18         │   │
│  │                                                                       │   │
│  │  Step 2: Get or create end_user_vault                                │   │
│  │    SELECT * FROM end_user_vaults                                     │   │
│  │    WHERE end_user_id = $1                                            │   │
│  │      AND client_id = $2                                              │   │
│  │      AND chain = $3                                                  │   │
│  │      AND token_address = $4                                          │   │
│  │                                                                       │   │
│  │    If not exists:                                                    │   │
│  │      INSERT INTO end_user_vaults (                                   │   │
│  │        end_user_id, client_id, chain, token_address,                │   │
│  │        token_symbol,                                                 │   │
│  │        shares: "0",                                                  │   │
│  │        weighted_entry_index: "1000000000000000000",                 │   │
│  │        total_deposited: "0",                                         │   │
│  │        total_withdrawn: "0"                                          │   │
│  │      )                                                                │   │
│  │                                                                       │   │
│  │  Step 3: Calculate new weighted entry index (DCA support)           │   │
│  │    oldShares = BigInt(userVault.shares)                             │   │
│  │    oldWeightedIndex = BigInt(userVault.weighted_entry_index)        │   │
│  │    totalShares = oldShares + sharesToMint                           │   │
│  │                                                                       │   │
│  │    newWeightedIndex = oldShares === 0n                              │   │
│  │      ? currentIndex  // First deposit                               │   │
│  │      : (oldShares * oldWeightedIndex + sharesToMint * currentIndex) │   │
│  │        / totalShares                                                 │   │
│  │                                                                       │   │
│  │  Step 4: Update end_user_vault                                       │   │
│  │    UPDATE end_user_vaults SET                                        │   │
│  │      shares = totalShares,                                           │   │
│  │      weighted_entry_index = newWeightedIndex,                       │   │
│  │      total_deposited = total_deposited + crypto_amount              │   │
│  │    WHERE id = $1                                                     │   │
│  │                                                                       │   │
│  │  Step 5: Update client_vault                                         │   │
│  │    UPDATE client_vaults SET                                          │   │
│  │      total_shares = total_shares + sharesToMint,                    │   │
│  │      pending_deposit_balance = pending_deposit_balance + crypto_amount │
│  │    WHERE id = $1                                                     │   │
│  │                                                                       │   │
│  │  Step 6: Mark deposit completed                                      │   │
│  │    UPDATE deposit_transactions SET                                   │   │
│  │      status = 'completed',                                           │   │
│  │      completed_at = NOW()                                            │   │
│  │    WHERE order_id = $1                                               │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                                │
│  Database State After Deposit (Example):                                     │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  deposit_transactions:                                                │   │
│  │    fiat_amount: 1000.00 USD                                          │   │
│  │    crypto_amount: 999.50 USDC (after on-ramp fees)                  │   │
│  │    status: 'completed'                                               │   │
│  │                                                                       │   │
│  │  client_vaults:                                                       │   │
│  │    total_shares: 951.90e18                                           │   │
│  │    current_index: 1.05e18 (unchanged)                               │   │
│  │    pending_deposit_balance: 999.50 USDC                             │   │
│  │                                                                       │   │
│  │  end_user_vaults:                                                     │   │
│  │    shares: 951.90e18                                                 │   │
│  │    weighted_entry_index: 1.05e18                                    │   │
│  │    total_deposited: 999.50                                           │   │
│  │                                                                       │   │
│  │  Effective Balance:                                                  │   │
│  │    = shares * current_index / 1e18                                   │   │
│  │    = 951.90e18 * 1.05e18 / 1e18                                     │   │
│  │    = 999.50 USDC ✓                                                   │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│  FLOW 5: END-USER WITHDRAWAL (MOCK FIAT OFF-RAMP)                            │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│  Frontend → Backend:                                                         │
│  POST /api/v1/withdrawals                                                    │
│  {                                                                            │
│    "clientId": "prod_grabpay_xyz",                                           │
│    "clientUserId": "driver_12345",                                           │
│    "amount": "500",               ← Withdraw 500 USDC                        │
│    "chain": "base",                                                          │
│    "tokenSymbol": "USDC",                                                    │
│    "destinationMethod": "mock_fiat",  ← Mock bank transfer                  │
│    "destinationDetails": "BCA 1234567890"                                    │
│  }                                                                            │
│                                                                                │
│  Backend Processing (withdrawal.service.ts):                                 │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  1. Get client, user, and vaults:                                    │   │
│  │     client = getByProductId('prod_grabpay_xyz')                     │   │
│  │     user = getByClientUserId(client.id, 'driver_12345')             │   │
│  │     userVault = getUserVault(user.id, 'base', USDC_ADDRESS)         │   │
│  │     clientVault = getClientVault(client.id, 'base', USDC_ADDRESS)   │   │
│  │                                                                       │   │
│  │  2. Calculate effective balance & shares to burn:                   │   │
│  │     shares = BigInt(userVault.shares)  // e.g., 952.38e18           │   │
│  │     currentIndex = BigInt(clientVault.current_index)  // 1.10e18   │   │
│  │                                                                       │   │
│  │     effectiveBalance = (shares * currentIndex) / 1e18               │   │
│  │                      = (952.38e18 * 1.10e18) / 1e18                │   │
│  │                      = 1047.62 USDC                                 │   │
│  │                                                                       │   │
│  │     withdrawAmount = 500 * 1e18  (BigInt)                           │   │
│  │                                                                       │   │
│  │  3. Check sufficient balance:                                        │   │
│  │     if (withdrawAmount > effectiveBalance) {                        │   │
│  │       throw Error("Insufficient balance");                          │   │
│  │     }                                                                 │   │
│  │                                                                       │   │
│  │  4. Calculate shares to burn (proportional):                        │   │
│  │     sharesToBurn = withdrawAmount >= effectiveBalance               │   │
│  │       ? shares  // Withdraw everything                              │   │
│  │       : (withdrawAmount * shares) / effectiveBalance                │   │
│  │                                                                       │   │
│  │     Example:                                                         │   │
│  │     sharesToBurn = (500e18 * 952.38e18) / 1047.62e18               │   │
│  │                  = 454.35e18 shares                                 │   │
│  │                                                                       │   │
│  │  5. Create withdrawal record:                                        │   │
│  │     INSERT INTO withdrawal_queue (                                   │   │
│  │       client_id,                                                     │   │
│  │       user_id,                                                       │   │
│  │       vault_id: clientVault.id,                                     │   │
│  │       end_user_vault_id: userVault.id,                              │   │
│  │       shares_to_burn: sharesToBurn,                                 │   │
│  │       estimated_amount: "500",                                       │   │
│  │       destination_method: "mock_fiat",                              │   │
│  │       destination_details: "BCA 1234567890",                        │   │
│  │       status: "pending"                                              │   │
│  │     )                                                                 │   │
│  │                                                                       │   │
│  │  ✨ 6. AUTO-COMPLETE (for mock_fiat):                                │   │
│  │     completeWithdrawal(withdrawalId, actualAmount)                  │   │
│  │                                                                       │   │
│  │     a) Lock vaults:                                                  │   │
│  │        SELECT * FROM end_user_vaults WHERE id = $1 FOR UPDATE       │   │
│  │        SELECT * FROM client_vaults WHERE id = $2 FOR UPDATE         │   │
│  │                                                                       │   │
│  │     b) Burn shares from user vault:                                 │   │
│  │        remainingShares = BigInt(userVault.shares) - sharesToBurn    │   │
│  │                        = 952.38e18 - 454.35e18                      │   │
│  │                        = 498.03e18                                   │   │
│  │                                                                       │   │
│  │        UPDATE end_user_vaults SET                                    │   │
│  │          shares = remainingShares,                                   │   │
│  │          total_withdrawn = total_withdrawn + 500                    │   │
│  │        WHERE id = $1                                                 │   │
│  │                                                                       │   │
│  │     c) Burn shares from client vault:                                │   │
│  │        UPDATE client_vaults SET                                      │   │
│  │          total_shares = total_shares - sharesToBurn,                │   │
│  │          total_staked_balance = total_staked_balance - 500          │   │
│  │        WHERE id = $1                                                 │   │
│  │                                                                       │   │
│  │     d) Mark withdrawal completed:                                    │   │
│  │        UPDATE withdrawal_queue SET                                   │   │
│  │          status = 'completed',                                       │   │
│  │          actual_amount = '500',                                      │   │
│  │          completed_at = NOW()                                        │   │
│  │        WHERE id = $1                                                 │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                                │
│  Database State After Withdrawal:                                            │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  end_user_vaults:                                                     │   │
│  │    shares: 498.03e18 (burned 454.35e18)                             │   │
│  │    weighted_entry_index: 1.05e18 (unchanged)                        │   │
│  │    total_withdrawn: 500                                              │   │
│  │                                                                       │   │
│  │  New Effective Balance:                                              │   │
│  │    = 498.03e18 * 1.10e18 / 1e18                                     │   │
│  │    = 547.62 USDC ✓                                                   │   │
│  │                                                                       │   │
│  │  User Yield Earned:                                                  │   │
│  │    = (deposited - withdrawn) - remaining_balance                    │   │
│  │    = (1000 - 500) - 547.62                                          │   │
│  │    = -47.62 (user withdrew profit!)                                 │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                                │
│  ✅ RESULT:                                                                   │
│  - Shares burned proportionally                                              │
│  - User receives mock fiat transfer                                          │
│  - Remaining balance earns yield on reduced shares                           │
│  - Multi-org safe: withdrawal only affects active organization's vault       │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│  FLOW 6: USER VIEWS BALANCE                                                  │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│  Frontend → Backend:                                                         │
│  GET /api/v1/users/{clientUserId}/portfolio?productId={productId}            │
│                                                                                │
│  Backend Processing:                                                         │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  1. Get client & user:                                               │   │
│  │     client = getByProductId(productId)                              │   │
│  │     user = getByClientUserId(client.id, clientUserId)               │   │
│  │                                                                       │   │
│  │  2. Get all user's vaults for this client:                          │   │
│  │     SELECT euv.*, cv.current_index, cv.chain, cv.token_symbol       │   │
│  │     FROM end_user_vaults euv                                         │   │
│  │     JOIN client_vaults cv ON euv.client_id = cv.client_id           │   │
│  │       AND euv.chain = cv.chain                                       │   │
│  │       AND euv.token_address = cv.token_address                      │   │
│  │     WHERE euv.end_user_id = $1                                       │   │
│  │       AND euv.client_id = $2                                         │   │
│  │       AND euv.is_active = true                                       │   │
│  │                                                                       │   │
│  │  3. Calculate effective balance for each vault:                     │   │
│  │     for (const vault of userVaults) {                               │   │
│  │       effectiveBalance = (vault.shares * vault.current_index) / 1e18│   │
│  │       originalDeposit = vault.total_deposited - vault.total_withdrawn│
│  │       yield = effectiveBalance - originalDeposit                    │   │
│  │     }                                                                 │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                                │
│  Response:                                                                   │
│  {                                                                            │
│    "userId": "driver_12345",                                                 │
│    "vaults": [                                                               │
│      {                                                                        │
│        "chain": "base",                                                      │
│        "tokenSymbol": "USDC",                                                │
│        "shares": "498.03",                                                   │
│        "effectiveBalance": "547.62",  ← Real-time balance                   │
│        "totalDeposited": "1000.00",                                          │
│        "totalWithdrawn": "500.00",                                           │
│        "yieldEarned": "47.62",        ← Profit from yield                   │
│        "weightedEntryIndex": "1.05",                                         │
│        "currentIndex": "1.10"         ← Growth index                        │
│      }                                                                        │
│    ],                                                                         │
│    "totalValue": "547.62"             ← Sum across all vaults               │
│  }                                                                            │
│                                                                                │
│  Multi-Org Example:                                                          │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  // Same driver, different organizations:                            │   │
│  │                                                                       │   │
│  │  GET /portfolio?productId=prod_grabpay_xyz                           │   │
│  │  → Returns GrabPay vaults only                                       │   │
│  │                                                                       │   │
│  │  GET /portfolio?productId=prod_grabfood_456                          │   │
│  │  → Returns GrabFood vaults only (different balance!)                │   │
│  │                                                                       │   │
│  │  Frontend MUST show active organization clearly to avoid confusion  │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                                │
│  ✅ RESULT:                                                                   │
│  - User sees current balance with yield included                             │
│  - Supports multiple vaults (USDC, USDT, PYUSD)                             │
│  - Multi-org safe: only shows vaults for active organization                │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 🚨 Implementation Status & Gaps Analysis

### ✅ COMPLETED & WORKING

1. **End-User Creation (FLOW 3)** ✅
   - Creates `end_users` record
   - Auto-creates 10 `end_user_vaults` (5 chains × 2 tokens)
   - Initializes shares at 0 with correct weighted_entry_index
   - **Status**: Production ready

2. **Deposit Initiation (FLOW 4A)** ✅
   - Creates `deposit_transactions` record
   - Tracks order_id, amounts, status
   - **Status**: Production ready

3. **Share Minting Math (FLOW 4B)** ✅
   - Correct formula: `shares = depositAmount * 1e18 / currentIndex`
   - Weighted entry index calculation for DCA
   - Updates `end_user_vaults.shares` and `client_vaults.total_shares`
   - **Status**: Math verified, production ready

4. **Pending Balance Tracking (FLOW 4B)** ✅
   - Updates `client_vaults.pending_deposit_balance`
   - Separates pending vs staked funds
   - **Status**: Database logic correct

5. **Strategy Storage** ✅
   - `client_vault_strategies` table with JSONB
   - Stores allocation percentages per protocol
   - **Status**: Schema ready, needs strategy configuration API

---

### ❌ MISSING CRITICAL COMPONENTS

#### 1. **Token Transfer Verification** ⚠️ CRITICAL

**Current State**: Deposits complete WITHOUT verifying on-chain token receipt!

**Problem**:
```typescript
// deposit.usecase.ts line 139
async completeDeposit(request: CompleteDepositRequest): Promise<void> {
  // ❌ NO verification that tokens actually arrived!
  const deposit = await this.depositRepository.getByOrderId(request.orderId);
  // ... directly updates balances
}
```

**Required Implementation**:
```typescript
// Step 1: Verify transaction on-chain
const tokenReceived = await this.tokenTransferService.verifyTransfer({
  chain: vault.chain,
  tokenAddress: vault.tokenAddress,
  expectedAmount: request.cryptoAmount,
  transactionHash: request.transactionHash,
  toAddress: vault.custodialWalletAddress, // ❌ Field doesn't exist!
});

if (!tokenReceived && process.env.NODE_ENV === 'production') {
  throw new Error('Token transfer not confirmed on-chain');
}
```

**Database Schema Gap**:
```sql
-- ❌ MISSING: Custodial wallet address in client_vaults
ALTER TABLE client_vaults
ADD COLUMN custodial_wallet_address VARCHAR(66);

-- Populate from privy_accounts (one-time migration)
UPDATE client_vaults cv
SET custodial_wallet_address = pa.privy_wallet_address
FROM client_organizations co
JOIN privy_accounts pa ON co.privy_account_id = pa.id
WHERE cv.client_id = co.id;
```

**Priority**: 🔴 **CRITICAL** - Must implement before mainnet

---

#### 2. **Batch Staking Process** ⚠️ HIGH PRIORITY

**Current State**: Funds stay in `pending_deposit_balance` forever!

**What's Missing**:
- Background CRON job to process pending deposits
- DeFi protocol integration (AAVE, Curve, Compound)
- Transaction signing with Privy custodial wallet
- Gas fee management

**Required Implementation**:

**File**: `packages/core/service/staking.service.ts` (NEW)
```typescript
export class StakingService {
  /**
   * Batch stake pending deposits across all vaults
   * Runs every 15 minutes via CRON job
   */
  async processBatchStaking(): Promise<void> {
    // 1. Get vaults with pending >= $10,000 threshold
    const vaults = await this.vaultRepository.listVaultsPendingStake('10000');
    
    for (const vault of vaults) {
      try {
        // 2. Get strategy allocation
        const strategies = await this.getVaultStrategies(vault.id);
        
        // 3. Calculate distribution
        const distributions = this.calculateDistribution(
          vault.pendingDepositBalance,
          strategies
        );
        
        // 4. Execute DeFi deposits
        for (const dist of distributions) {
          const txHash = await this.executeDefiDeposit({
            chain: vault.chain,
            tokenAddress: vault.tokenAddress,
            protocol: dist.protocol,
            amount: dist.amount,
            custodialWallet: vault.custodialWalletAddress,
          });
          
          console.log(`✅ Staked ${dist.amount} to ${dist.protocol}: ${txHash}`);
        }
        
        // 5. Move pending → staked in database
        await this.vaultRepository.movePendingToStakedBalance(
          vault.id,
          vault.pendingDepositBalance
        );
        
        // 6. Record staking batch
        await this.auditRepository.create({
          clientId: vault.clientId,
          action: 'funds_staked',
          metadata: { vaultId: vault.id, amount: vault.pendingDepositBalance },
        });
        
      } catch (error) {
        console.error(`❌ Failed to stake vault ${vault.id}:`, error);
        // Keep in pending for retry
      }
    }
  }
  
  /**
   * Execute deposit to DeFi protocol
   */
  private async executeDefiDeposit(params: {
    chain: string;
    tokenAddress: string;
    protocol: string; // "AAVE", "Curve", "Compound"
    amount: string;
    custodialWallet: string;
  }): Promise<string> {
    // TODO: Implement per protocol
    // For now, return mock transaction
    if (process.env.NODE_ENV !== 'production') {
      return `0xmock_stake_${Date.now()}`;
    }
    
    // Production implementation:
    // 1. Get protocol contract address
    // 2. Approve token spend
    // 3. Call deposit/stake function
    // 4. Sign with Privy wallet
    // 5. Return transaction hash
    throw new Error('DeFi staking not implemented');
  }
}
```

**Database Query** (ALREADY EXISTS):
```sql
-- database/queries/vault.sql line 125
-- name: MovePendingToStakedBalance :exec
UPDATE client_vaults
SET 
  pending_deposit_balance = 0,
  total_staked_balance = total_staked_balance + pending_deposit_balance,
  updated_at = NOW()
WHERE id = $1;
```

**Priority**: 🟡 **HIGH** - Needed for real yield generation

---

#### 3. **DeFi Protocol Integration** ⚠️ MEDIUM PRIORITY

**What's Needed**:

**A. Protocol Contract Addresses**:
```typescript
// packages/core/constants/defi-protocols.ts
export const PROTOCOL_ADDRESSES = {
  // AAVE V3
  AAVE: {
    '8453': '0xA238Dd80C259a72e81d7e4664a9801593F98d1c5', // Base
    '1': '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2',   // Ethereum
  },
  // Curve Finance
  CURVE: {
    '8453': '0x...',
    '1': '0x...',
  },
  // Compound V3
  COMPOUND: {
    '8453': '0x...',
    '1': '0x...',
  },
};
```

**B. Smart Contract ABIs**:
```typescript
// packages/core/abi/aave-pool.abi.ts
export const AAVE_POOL_ABI = [
  {
    name: 'supply',
    type: 'function',
    inputs: [
      { name: 'asset', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'onBehalfOf', type: 'address' },
      { name: 'referralCode', type: 'uint16' },
    ],
  },
  // ... more functions
];
```

**C. Wallet Signing with Privy**:
```typescript
// Sign transaction with custodial wallet
const signedTx = await privyWallet.signTransaction({
  to: protocolAddress,
  data: encodeFunctionData({
    abi: AAVE_POOL_ABI,
    functionName: 'supply',
    args: [tokenAddress, amount, custodialWallet, 0],
  }),
  chain: params.chain,
});
```

**Priority**: 🟢 **MEDIUM** - Can use mocks initially

---

#### 4. **Yield Accrual System** ⚠️ MEDIUM PRIORITY

**Current State**: Index never grows! (stuck at 1.0e18)

**What's Missing**:
- Fetch yield from DeFi protocols
- Calculate new index
- Update `client_vaults.current_index`

**Required Implementation**:

**File**: `packages/core/service/yield.service.ts` (NEW)
```typescript
export class YieldService {
  /**
   * Update vault index with accrued yield
   * Runs every 1 hour via CRON job
   */
  async updateVaultIndexes(): Promise<void> {
    const vaults = await this.vaultRepository.listActiveVaults();
    
    for (const vault of vaults) {
      try {
        // 1. Fetch current DeFi balances
        const defiBalance = await this.fetchDefiBalance(vault);
        
        // 2. Calculate yield earned
        const yieldEarned = defiBalance - parseFloat(vault.totalStakedBalance);
        
        if (yieldEarned <= 0) continue; // No yield yet
        
        // 3. Calculate new index
        const oldIndex = BigInt(vault.currentIndex);
        const totalStaked = BigInt(vault.totalStakedBalance);
        const yieldBigInt = BigInt(Math.floor(yieldEarned * 1e18));
        
        const indexGrowth = (yieldBigInt * 1e18n) / totalStaked;
        const newIndex = (oldIndex * (1e18n + indexGrowth)) / 1e18n;
        
        // 4. Update vault
        await this.vaultRepository.updateClientVaultIndex(
          vault.id,
          newIndex.toString(),
          yieldEarned.toString()
        );
        
        console.log(`✅ Vault ${vault.id}: index ${oldIndex} → ${newIndex} (+${yieldEarned})`);
        
      } catch (error) {
        console.error(`❌ Failed to update vault ${vault.id}:`, error);
      }
    }
  }
  
  /**
   * Fetch total balance from DeFi protocols
   */
  private async fetchDefiBalance(vault: ClientVault): Promise<number> {
    // TODO: Query each protocol
    // For now, return mock growth
    if (process.env.NODE_ENV !== 'production') {
      return parseFloat(vault.totalStakedBalance) * 1.05; // Mock 5% APY
    }
    
    // Production: Sum balances from AAVE + Curve + Compound
    throw new Error('DeFi balance fetching not implemented');
  }
}
```

**Database Query** (ALREADY EXISTS):
```sql
-- database/queries/vault.sql line 114
-- name: UpdateClientVaultIndex :exec
UPDATE client_vaults
SET 
  current_index = $2,
  cumulative_yield = cumulative_yield + $3,
  updated_at = NOW()
WHERE id = $1;
```

**Priority**: 🟢 **MEDIUM** - Can use mock yield initially

---

### 📋 Implementation Roadmap

#### Phase 1: Mock Testing (Current Sprint)
- [ ] Add custodial_wallet_address to client_vaults schema
- [ ] Implement mock token transfer verification
- [ ] Create StakingService with mock DeFi calls
- [ ] Create YieldService with mock APY (5%)
- [ ] Add CRON job placeholders
- [ ] **Goal**: End-to-end flow works with mocks

#### Phase 2: On-Chain Verification (Next Sprint)
- [ ] Implement TokenTransferService with viem
- [ ] Verify Transfer events on-chain
- [ ] Add transaction receipt validation
- [ ] Test on testnets (Base Sepolia, etc.)
- [ ] **Goal**: Real token verification works

#### Phase 3: DeFi Integration (Future)
- [ ] Add protocol contract addresses
- [ ] Implement AAVE deposit/withdraw
- [ ] Implement Curve LP deposit/withdraw
- [ ] Implement Compound deposit/withdraw
- [ ] Privy wallet signing integration
- [ ] Gas fee management
- [ ] **Goal**: Real staking to DeFi protocols

#### Phase 4: Production Hardening (Future)
- [ ] Add retry logic for failed stakes
- [ ] Implement circuit breakers
- [ ] Add monitoring/alerting
- [ ] Audit smart contract interactions
- [ ] Load testing
- [ ] **Goal**: Production-grade reliability

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
