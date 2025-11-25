# Vault Strategies Refactoring - JSONB Migration

**Date:** November 24, 2025  
**Migration:** 000004_vault_strategies_to_jsonb

## Summary

Consolidated the `vault_strategies` table into `client_vaults.strategies` JSONB column for simpler schema and atomic strategy updates.

## Changes Made

### 1. Frontend: Token Dropdown (USDC/USDT)

**File:** `apps/whitelabel-web/src/feature/dashboard/APITestingPage.tsx`

- Added `TOKEN_ADDRESSES` constant mapping chain IDs to token addresses
- Added token dropdown parameter (USDC/USDT)
- Auto-fills `token_address` when user selects chain + token
- Prevents `token_symbol="UNKNOWN"` errors

**Chain dropdown options:**
- Base (8453) - Low fees, USDC native
- Ethereum (1) - High security  
- Polygon (137) - Very low fees
- Optimism (10) - L2 scaling
- Arbitrum (42161) - L2 scaling

**Token dropdown options:**
- USDC - USD Coin
- USDT - Tether USD

### 2. Database: JSONB Migration

**Migration:** `database/migrations/000004_vault_strategies_to_jsonb.up.sql`

**Changes:**
```sql
-- Added to client_vaults
ALTER TABLE client_vaults
ADD COLUMN strategies JSONB DEFAULT '[]'::jsonb;

-- Migrated existing data
UPDATE client_vaults cv
SET strategies = (
  SELECT jsonb_agg(jsonb_build_object(
    'category', vs.category,
    'target', vs.target_percent,
    'isActive', true
  ))
  FROM vault_strategies vs
  WHERE vs.client_vault_id = cv.id
);

-- Dropped old table
DROP TABLE vault_strategies CASCADE;
```

**New data format:**
```json
[
  {"category": "lending", "target": 50, "isActive": true},
  {"category": "lp", "target": 30, "isActive": true},
  {"category": "staking", "target": 20, "isActive": true}
]
```

### 3. Backend: Repository Updates

**File:** `packages/core/repository/postgres/vault.repository.ts`

Added new methods:
```typescript
// New JSONB method
async updateVaultStrategies(
  clientVaultId: string,
  strategies: Array<{ category: string; target: number; isActive?: boolean }>
)

async getVaultWithStrategies(clientVaultId: string)

// Legacy methods marked deprecated
async upsertVaultStrategy() // deprecated
async getVaultStrategies() // deprecated  
async deleteAllVaultStrategies() // deprecated
```

**File:** `packages/core/usecase/b2b/client.usecase.ts`

Updated `configureStrategies()`:
```typescript
// Before: Multiple operations
await this.vaultRepository.deleteAllVaultStrategies(vault.id);
for (const strategy of data.strategies) {
  await this.vaultRepository.upsertVaultStrategy(...);
}

// After: Single atomic update
await this.vaultRepository.updateVaultStrategies(
  vault.id,
  data.strategies.map(s => ({
    category: s.category,
    target: s.target,
    isActive: true
  }))
);
```

### 4. API: Token Field Support

**File:** `apps/b2b-api/src/router/client.router.ts`

- Added support for `token` field (USDC, USDT)
- Auto-derives `token_symbol` from `token` field
- Backward compatible with `token_symbol` field

**File:** `apps/whitelabel-web/src/api/b2bClient.ts`

- Updated `configureStrategies()` to send `token` field
- Frontend now sends: `{ chain, token, token_address, strategies }`

## Benefits

### ✅ Simpler Schema
- **Before:** 2 tables (client_vaults + vault_strategies)
- **After:** 1 table with JSONB column

### ✅ Atomic Updates  
- **Before:** DELETE all + INSERT each strategy (race conditions possible)
- **After:** Single UPDATE with JSONB (atomic)

### ✅ Better Data Integrity
- **Before:** No guarantee strategies sum to 100%
- **After:** Application validates before single atomic write

### ✅ Better UX
- **Before:** Users had to manually enter token addresses
- **After:** Dropdown auto-fills correct addresses per chain

### ✅ Fewer Rows
- **Before:** 3 rows per vault (for 3 strategies)
- **After:** 1 row per vault with JSONB array

## Migration Status

```bash
✅ Migration 000004 applied successfully
✅ vault_strategies table dropped
✅ client_vaults.strategies JSONB column added
✅ Existing data migrated
```

## Rollback

If needed, rollback with:
```bash
make migrate-down
```

This will:
1. Recreate `vault_strategies` table
2. Extract data from JSONB back to rows
3. Drop `client_vaults.strategies` column

## Testing

Test the new flow:

1. **Select chain:** Choose "Base (8453)" from dropdown
2. **Select token:** Choose "USDC" from dropdown  
3. **Auto-filled:** `token_address` = `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`
4. **Configure strategies:** Enter allocation percentages
5. **Submit:** Single atomic JSONB update

## Example API Call

```javascript
POST /api/v1/products/{productId}/strategies
{
  "chain": "8453",
  "token": "USDC",
  "token_address": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  "strategies": [
    {"category": "lending", "target": 50},
    {"category": "lp", "target": 30},
    {"category": "staking", "target": 20}
  ]
}
```

## Database Query Examples

```sql
-- View all vault strategies
SELECT 
  id,
  chain,
  token_symbol,
  strategies
FROM client_vaults;

-- Extract specific strategy category
SELECT 
  id,
  strategies -> 0 ->> 'category' as first_category,
  strategies -> 0 ->> 'target' as first_target
FROM client_vaults;

-- Filter vaults with lending strategy
SELECT *
FROM client_vaults
WHERE strategies @> '[{"category": "lending"}]'::jsonb;
```

## Files Modified

### Frontend
- ✅ `apps/whitelabel-web/src/feature/dashboard/APITestingPage.tsx`
- ✅ `apps/whitelabel-web/src/api/b2bClient.ts`

### Backend  
- ✅ `apps/b2b-api/src/router/client.router.ts`
- ✅ `packages/core/usecase/b2b/client.usecase.ts`
- ✅ `packages/core/repository/postgres/vault.repository.ts`

### Database
- ✅ `database/migrations/000004_vault_strategies_to_jsonb.up.sql`
- ✅ `database/migrations/000004_vault_strategies_to_jsonb.down.sql`
- ✅ `database/queries/client_vault_strategies.sql` (new, optional for SQLC)

## Next Steps

1. ✅ Migration applied
2. ✅ Code refactored  
3. ✅ Frontend dropdown added
4. 🔲 Test end-to-end flow
5. 🔲 Update documentation
6. 🔲 Remove deprecated methods after verification

---

**Migration successful!** The system now uses JSONB for vault strategies with token dropdown UX.
