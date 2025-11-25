# SQLC Generation Fix Plan

## Problem Summary
Strategy configuration endpoint returns 404 because SQLC generation failed, blocking package builds.

## Root Cause
The `vault_strategies.sql` queries were referencing `is_active` column that doesn't exist in the database schema.

## Current Status
✅ SQLC generation now succeeds (no errors)
✅ vault_strategies.sql fixed (removed is_active references)
❌ TypeScript packages still have compilation errors

## Architecture Clarification

**DO NOT remove vault strategy code from defi.repository.ts!**

The three tables work together:

```
client_vaults (vault.repository.ts)
  └─ Tracks total balance, shares, index per token
     ├─ vault_strategies (defi.repository.ts)
     │    └─ Configuration: 70% AAVE, 20% Curve, 10% Uniswap
     └─ defi_allocations (defi.repository.ts)
          └─ Actual deployed positions tracking
```

## Tasks for Next Agent

### Phase 1: Fix TypeScript Compilation Errors

**File**: `/Users/wtshai/Work/Protocolcamp/proxify/packages/core/repository/postgres/defi.repository.ts`

**Issue**: Imports vault strategy functions from `@proxify/sqlcgen` but SQLC generated them in `vault_strategies_sql.ts`

**Fix Options**:

#### Option A: Keep vault strategies in defi.repository.ts (RECOMMENDED)
Import from the correct SQLC-generated file:

```typescript
// Add to imports at top of defi.repository.ts
import {
  getVaultStrategies,
  upsertVaultStrategy,
  deleteAllVaultStrategies,
  type GetVaultStrategiesRow,
  type UpsertVaultStrategyArgs,
  type UpsertVaultStrategyRow,
} from '@proxify/sqlcgen/vault_strategies_sql';
```

**Rationale**: DeFi operations need both strategy config AND allocation tracking together.

#### Option B: Move vault strategies entirely to vault.repository.ts
- Remove all vault strategy methods from defi.repository.ts (lines 143-174)
- Keep only in vault.repository.ts
- Update client.usecase.ts to use vaultRepository for all strategy operations

**Rationale**: Cleaner separation - vaults own their strategies.

### Phase 2: Update Method Signatures

**Files to Fix**:
1. `packages/core/repository/postgres/vault.repository.ts` - ✅ ALREADY FIXED
2. `packages/core/usecase/b2b/client.usecase.ts` - ✅ ALREADY FIXED

Both files already updated to remove `isActive` parameter from `upsertVaultStrategy` calls.

### Phase 3: Rebuild Packages

```bash
# 1. Rebuild core package
pnpm build --filter @proxify/core

# 2. Rebuild b2b-api-core package
pnpm build --filter @proxify/b2b-api-core

# 3. Rebuild b2b-api
pnpm build --filter b2b-api
```

### Phase 4: Restart Server

```bash
# Kill existing server process
pkill -f "b2b-api"

# Start B2B API server
cd apps/b2b-api
pnpm dev
```

### Phase 5: Testing

#### Test FLOW 1: Client Registration
```bash
POST http://localhost:3001/api/v1/clients/register
Body: {
  "companyName": "Test Org",
  "businessType": "e-commerce",
  "walletType": "MANAGED",
  "privyOrganizationId": "...",
  "privyWalletAddress": "0x...",
  "privyEmail": "test@example.com"
}
```

**Expected**:
- ✅ Client created in `client_organizations` table
- ✅ Client balance created in `client_balances` table
- ❌ NO client_vault created yet (this is by design, vaults created during strategy config)

#### Test FLOW 2: Configure Vault Strategies
```bash
POST http://localhost:3001/api/v1/products/{productId}/strategies
Body: {
  "chain": "base",
  "token_address": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  "token_symbol": "USDC",
  "strategies": [
    { "category": "lending", "target": 70 },
    { "category": "lp", "target": 20 },
    { "category": "staking", "target": 10 }
  ]
}
```

**Expected**:
- ✅ client_vault created (if not exists) with initial index 1e18
- ✅ vault_strategies records created with target percentages
- ✅ Returns success response

#### Verify Database State

```sql
-- Check client_vault was created
SELECT * FROM client_vaults
WHERE client_id = '...'
  AND chain = 'base'
  AND token_address = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';

-- Check vault_strategies were saved
SELECT vs.*, cv.token_symbol
FROM vault_strategies vs
JOIN client_vaults cv ON vs.client_vault_id = cv.id
WHERE cv.client_id = '...';

-- Expected output:
-- id | client_vault_id | category | target_percent
-- ...| ...            | lending  | 70.00
-- ...| ...            | lp       | 20.00
-- ...| ...            | staking  | 10.00
```

## Decision Needed

**Agent should decide**: Option A (keep strategies in defi.repository) or Option B (move to vault.repository)?

**Recommendation**: Option A - keeps DeFi operations cohesive since strategies and allocations work together.

## Reference Files

### Database Layer
- `database/queries/defi.sql` - DeFi protocol and allocation queries
- `database/queries/vault_strategies.sql` - ✅ FIXED (no is_active column)
- `database/migrations/000003_vault_system.up.sql` - Schema definition

### Generated Code
- `packages/sqlcgen/src/gen/defi_sql.ts` - Generated from defi.sql
- `packages/sqlcgen/src/gen/vault_strategies_sql.ts` - Generated from vault_strategies.sql

### Repository Layer
- `packages/core/repository/postgres/defi.repository.ts` - ⚠️ NEEDS FIX (import error)
- `packages/core/repository/postgres/vault.repository.ts` - ✅ FIXED

### UseCase Layer
- `packages/core/usecase/b2b/client.usecase.ts` - ✅ FIXED (configureStrategies method)

### Service Layer
- `apps/b2b-api/src/service/client.service.ts` - ✅ OK (passthrough)

### Router Layer
- `apps/b2b-api/src/router/client.router.ts` - ✅ OK (handler exists)

### Contract Layer
- `packages/b2b-api-core/contracts/client.ts` - ✅ OK (endpoint defined)

## Next Steps Summary

1. **Decide** on Option A or B for vault strategy placement
2. **Fix** defi.repository.ts imports accordingly
3. **Rebuild** all packages
4. **Restart** B2B API server
5. **Test** both flows and verify database state

---

**Status**: Ready for implementation by next agent
**Estimated Time**: 10-15 minutes
**Blockers**: None (decision needed on Option A vs B)
