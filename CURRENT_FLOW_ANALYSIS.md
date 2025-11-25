# Current Implementation Flow Analysis

## Summary: ✅ FLOW IS CORRECT WITH JSONB APPROACH

The user migrated from `vault_strategies` table to JSONB column approach. This is a **better architecture**.

---

## Current Architecture

### Database Schema (000001_init_schema.up.sql)

```
client_organizations (Product Owners)
  ├─ privy_organization_id (one email/owner)
  ├─ privy_wallet_address (shared custodial wallet)
  └─ product_id (unique per organization)
       ↓
client_vaults (Per asset per client)
  ├─ client_id + chain + token_address (UNIQUE)
  ├─ strategies JSONB ❌ NOT IN SCHEMA YET
  └─ vault_strategies table ✅ EXISTS (separate table)
       ↓
defi_allocations (Actual deployed positions)
  └─ Tracks real funds in AAVE, Curve, etc.
```

### Key Change User Made

User changed from:
```typescript
// OLD: Separate table (vault_strategies)
await this.vaultRepository.deleteAllVaultStrategies(vault.id);
for (const strategy of data.strategies) {
  await this.vaultRepository.upsertVaultStrategy(
    vault.id,
    strategy.category,
    strategy.target
  );
}
```

To:
```typescript
// NEW: JSONB column (client_vaults.strategies)
await this.vaultRepository.updateVaultStrategies(
  vault.id,
  data.strategies.map((s) => ({
    category: s.category,
    target: s.target,
    isActive: true,
  }))
);
```

---

## Current Flow Analysis

### FLOW 1: Client Registration ✅ ENHANCED

**File**: `packages/core/usecase/b2b/client.usecase.ts` (lines 80-147)

```typescript
async createClient(request: CreateClientRequest) {
  // Step 1: Create client organization
  const client = await this.clientRepository.create({
    companyName: request.companyName,
    businessType: request.businessType,
    productId: request.productId,
    walletType: request.walletType === 'MANAGED' ? 'custodial' : 'non-custodial',
    walletManagedBy: 'proxify',
    privyOrganizationId: request.privyOrganizationId,
    privyWalletAddress: request.privyWalletAddress,
    // ...
  });

  // Step 2: Create client balance
  await this.clientRepository.createBalance(client.id);

  // Step 3: ✅ AUTO-CREATE DEFAULT USDC VAULT ON BASE (NEW!)
  const BASE_CHAIN_ID = '8453';
  const USDC_BASE_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
  const defaultVault = await this.getOrCreateVault({
    clientId: client.id,
    chain: BASE_CHAIN_ID,
    tokenAddress: USDC_BASE_ADDRESS,
    tokenSymbol: 'USDC',
  });

  // Step 4: Return client + defaultVaultId
  return {
    ...result,
    defaultVaultId: defaultVault.id,
  };
}
```

**Changes**:
- ✅ Now auto-creates default USDC vault on Base after registration
- ✅ Uses `getOrCreateVault()` helper (idempotent, safe to call multiple times)
- ✅ Returns `defaultVaultId` in response

**Database State After Registration**:
```sql
client_organizations: 1 row (new client)
client_balances: 1 row (available=0, reserved=0)
client_vaults: 1 row (USDC on Base, index=1e18, shares=0) ← NEW!
```

---

### FLOW 2: Configure Vault Strategies ✅ IMPROVED

**File**: `packages/core/usecase/b2b/client.usecase.ts` (lines 270-312)

```typescript
async configureStrategies(
  productId: string,
  data: {
    chain: string;
    tokenAddress: string;
    tokenSymbol?: string;
    strategies: Array<{ category: string; target: number }>;
  }
) {
  // 1. Get client by product ID
  const client = await this.getClientByProductId(productId);

  // 2. Get or create vault (idempotent)
  const vault = await this.getOrCreateVault({
    clientId: client.id,
    chain: data.chain,
    tokenAddress: data.tokenAddress,
    tokenSymbol: data.tokenSymbol || 'UNKNOWN',
  });

  // 3. ✅ UPDATE STRATEGIES AS JSONB (atomic, single query)
  await this.vaultRepository.updateVaultStrategies(
    vault.id,
    data.strategies.map((s) => ({
      category: s.category,
      target: s.target,
      isActive: true,
    }))
  );

  // 4. Audit log
  await this.auditRepository.create({...});
}
```

**Changes**:
- ✅ Uses `getOrCreateVault()` instead of separate get/create logic
- ✅ Atomic JSONB update instead of delete + loop + insert
- ✅ Safer, faster, cleaner code

---

## Vault Repository Changes

**File**: `packages/core/repository/postgres/vault.repository.ts` (lines 222-244)

### New Methods (JSONB approach):

```typescript
// PRIMARY METHOD: Update strategies as JSONB
async updateVaultStrategies(
  clientVaultId: string,
  strategies: Array<{ category: string; target: number; isActive?: boolean }>
) {
  const strategiesJson = JSON.stringify(strategies);

  await this.sql`
    UPDATE client_vaults
    SET strategies = ${strategiesJson}::jsonb,
        updated_at = now()
    WHERE id = ${clientVaultId}
  `;
}

// Read strategies
async getVaultWithStrategies(clientVaultId: string) {
  const [vault] = await this.sql<Array<GetClientVaultRow & { strategies: any }>>`
    SELECT * FROM client_vaults
    WHERE id = ${clientVaultId}
  `;
  return vault || null;
}

// Legacy methods (deprecated, kept for backwards compatibility)
async upsertVaultStrategy(...) { /* SQLC-based, still works */ }
async getVaultStrategies(...) { /* SQLC-based, still works */ }
async deleteAllVaultStrategies(...) { /* SQLC-based, still works */ }
```

---

## Issues Found

### ⚠️ Issue 1: Schema Mismatch

**Problem**: Code uses `client_vaults.strategies JSONB` but schema doesn't have this column yet.

**Current Schema** (000001_init_schema.up.sql):
```sql
CREATE TABLE client_vaults (
  id UUID PRIMARY KEY,
  client_id UUID NOT NULL,
  chain VARCHAR(50) NOT NULL,
  token_address VARCHAR(66) NOT NULL,
  token_symbol VARCHAR(20) NOT NULL,
  total_shares NUMERIC(78,0) NOT NULL DEFAULT 0,
  current_index NUMERIC(78,0) NOT NULL DEFAULT 1000000000000000000,
  -- ... other fields ...
  -- ❌ NO "strategies JSONB" column!
);

CREATE TABLE vault_strategies (
  -- ✅ This table exists
  id UUID PRIMARY KEY,
  client_vault_id UUID NOT NULL REFERENCES client_vaults(id),
  category VARCHAR(50) NOT NULL,
  target_percent NUMERIC(5,2) NOT NULL,
  UNIQUE(client_vault_id, category)
);
```

**Fix Options**:

#### Option A: Add JSONB column to 000001 (RECOMMENDED)
Since you're resetting the database anyway, add to `000001_init_schema.up.sql`:

```sql
CREATE TABLE client_vaults (
  -- ... existing columns ...

  -- Add this:
  strategies JSONB DEFAULT '[]'::jsonb,

  -- ... rest of columns ...
);

COMMENT ON COLUMN client_vaults.strategies IS 'DeFi strategy allocation config as JSONB array: [{"category":"lending","target":70,"isActive":true}]';
```

Then **remove** the `vault_strategies` table entirely (no longer needed).

#### Option B: Keep vault_strategies table, remove JSONB code
Revert vault.repository.ts to use SQLC methods only.

**Recommendation**: Option A (JSONB) - cleaner, atomic updates, better performance.

---

### ⚠️ Issue 2: Dual Implementation Confusion

**Problem**: Code has both implementations active:
- JSONB methods in vault.repository.ts (lines 222-244)
- SQLC methods in vault.repository.ts (lines 246-260)
- client.usecase.ts uses JSONB approach
- defi.repository.ts still imports vault_strategies SQLC functions

**Fix**: Choose one approach and remove the other.

---

## Recommendations for Next Agent

### Immediate Actions (before testing):

1. **Update Schema** (000001_init_schema.up.sql):
   ```sql
   -- Add to client_vaults table:
   strategies JSONB DEFAULT '[]'::jsonb,

   -- Remove entire vault_strategies table definition
   ```

2. **Reset Database**:
   ```bash
   # Drop and recreate
   psql -U postgres -d proxify_dev -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

   # Run migration
   psql -U postgres -d proxify_dev -f database/migrations/000001_init_schema.up.sql
   ```

3. **Clean Up Code**:
   ```typescript
   // vault.repository.ts - REMOVE legacy SQLC methods (lines 246-260)
   // Keep only JSONB methods (lines 222-244)

   // defi.repository.ts - REMOVE all vault_strategies imports
   // This repository should only handle defi_allocations
   ```

4. **Update SQLC Config**:
   ```bash
   # Remove or archive database/queries/vault_strategies.sql
   mv database/queries/vault_strategies.sql database/queries/_archive/

   # Regenerate
   sqlc generate
   ```

5. **Rebuild and Test**:
   ```bash
   pnpm build --filter @proxify/core
   pnpm build --filter @proxify/b2b-api-core
   cd apps/b2b-api && pnpm dev
   ```

---

## Testing Plan

### Test 1: Client Registration with Auto-Vault Creation

```bash
POST http://localhost:3001/api/v1/clients/register
{
  "companyName": "Test Grab",
  "businessType": "e-commerce",
  "walletType": "MANAGED",
  "privyOrganizationId": "clb123abc",
  "privyWalletAddress": "0x1234567890123456789012345678901234567890",
  "privyEmail": "grab@test.com"
}
```

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid-client",
    "productId": "prod_xxx",
    "companyName": "Test Grab",
    "privyOrganizationId": "clb123abc",
    "privyWalletAddress": "0x1234...",
    "defaultVaultId": "uuid-vault" // ✅ This is NEW
  }
}
```

**Verify Database**:
```sql
-- Should show vault with empty strategies
SELECT id, token_symbol, chain, strategies, total_shares, current_index
FROM client_vaults
WHERE client_id = 'uuid-client';

-- Expected:
-- id         | token_symbol | chain | strategies | total_shares | current_index
-- uuid-vault | USDC         | 8453  | []         | 0            | 1000000000000000000
```

---

### Test 2: Configure Strategies (JSONB Update)

```bash
POST http://localhost:3001/api/v1/products/prod_xxx/strategies
{
  "chain": "8453",
  "token_address": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  "token_symbol": "USDC",
  "strategies": [
    { "category": "lending", "target": 70 },
    { "category": "lp", "target": 20 },
    { "category": "staking", "target": 10 }
  ]
}
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Vault strategies configured successfully"
}
```

**Verify Database**:
```sql
SELECT id, token_symbol, strategies::text
FROM client_vaults
WHERE client_id = (SELECT id FROM client_organizations WHERE product_id = 'prod_xxx');

-- Expected strategies column:
-- [
--   {"category":"lending","target":70,"isActive":true},
--   {"category":"lp","target":20,"isActive":true},
--   {"category":"staking","target":10,"isActive":true}
-- ]
```

---

## Architecture Decision: JSONB vs Separate Table

### ✅ JSONB Approach (Current User Choice)

**Pros**:
- ✅ Atomic updates (single query)
- ✅ Simpler schema (one less table)
- ✅ Faster reads (no JOIN needed)
- ✅ Version history can use JSONB diff
- ✅ Flexible schema (can add fields without migration)

**Cons**:
- ❌ Can't use foreign keys on strategy categories
- ❌ Harder to query "all vaults using lending strategy"
- ❌ JSONB indexing needed for complex queries

### ❌ Separate Table Approach (Old)

**Pros**:
- ✅ Normalized (3NF)
- ✅ Easy to query by category
- ✅ Strong typing via foreign keys

**Cons**:
- ❌ Requires transaction for atomic updates
- ❌ More complex queries (always need JOIN)
- ❌ More tables to manage

**User's Choice**: JSONB ← **This is the right choice for this use case**

---

## Summary

### ✅ What's Working
1. Client registration auto-creates USDC vault on Base
2. Strategy configuration uses JSONB atomic updates
3. Idempotent vault creation (safe to call multiple times)
4. Audit logging for all operations

### ⚠️ What Needs Fixing
1. **Schema**: Add `strategies JSONB` column to client_vaults
2. **Schema**: Remove vault_strategies table (no longer needed)
3. **Code**: Remove legacy SQLC methods from vault.repository.ts
4. **Code**: Remove vault_strategies imports from defi.repository.ts
5. **SQLC**: Archive vault_strategies.sql queries

### 🎯 Next Steps
1. Update 000001_init_schema.up.sql (add JSONB column, remove table)
2. Drop and recreate database
3. Clean up code (remove SQLC legacy methods)
4. Regenerate SQLC
5. Rebuild packages
6. Test both flows

---

**Status**: Flow logic is ✅ CORRECT, just needs schema sync + cleanup
**Migration Strategy**: Since resetting DB anyway, just fix 000001 migration
**Estimated Time**: 15-20 minutes to fix and test
