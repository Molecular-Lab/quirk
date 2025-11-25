# Migration Consolidation Plan (000001-004 → 000001)

## Current Status

### What's in 000001_init_schema.up.sql NOW:
✅ client_organizations (WITHOUT privy columns - old schema)
✅ client_balances
✅ end_users
✅ client_vaults (WITH index fields from 000003)
✅ end_user_vaults (from 000003)
✅ vault_strategies table (from 000003) ← STILL USING SEPARATE TABLE
✅ supported_defi_protocols (from 000003)
✅ defi_allocations (from 000003)
✅ deposit_batch_queue (from 000003)
✅ withdrawal_queue (from 000003)
❌ NO privy_accounts table (from 000002)
❌ NO strategies JSONB column (from 000004)

### What's in _archive:
- 000002: Creates privy_accounts table, normalizes client_organizations
- 000003: Adds vault system (already in 000001!)
- 000004: Migrates vault_strategies → JSONB (NOT in 000001!)

## Required Changes to 000001

### Change 1: Add privy_accounts table (from 000002)

**Add BEFORE client_organizations:**
```sql
-- ============================================
-- 0. PRIVY ACCOUNTS (Identity Layer)
-- ============================================

CREATE TABLE privy_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Privy Identity (UNIQUE per user)
  privy_organization_id VARCHAR(255) UNIQUE NOT NULL,
  privy_wallet_address VARCHAR(66) UNIQUE NOT NULL,
  privy_email VARCHAR(255),
  wallet_type VARCHAR(20) NOT NULL CHECK (wallet_type IN ('MANAGED', 'USER_OWNED', 'custodial', 'non-custodial')),

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_privy_accounts_org_id ON privy_accounts(privy_organization_id);
CREATE INDEX idx_privy_accounts_wallet ON privy_accounts(privy_wallet_address);

COMMENT ON TABLE privy_accounts IS 'One row per Privy user (identity layer). One user can create multiple organizations.';
COMMENT ON COLUMN privy_accounts.privy_organization_id IS 'Privy user ID (unique per user, e.g., clb_abc123)';
COMMENT ON COLUMN privy_accounts.wallet_type IS 'MANAGED (Privy custodial) | USER_OWNED (user wallet)';
```

### Change 2: Update client_organizations table

**REMOVE these columns:**
```sql
-- OLD (DELETE THESE):
privy_organization_id VARCHAR(255) UNIQUE NOT NULL,
privy_wallet_address VARCHAR(66) UNIQUE NOT NULL,
wallet_type VARCHAR(20) NOT NULL CHECK (wallet_type IN ('custodial', 'non-custodial')),
wallet_managed_by VARCHAR(20) NOT NULL CHECK (wallet_managed_by IN ('proxify', 'client')),
```

**ADD this column:**
```sql
-- NEW (ADD THIS):
privy_account_id UUID NOT NULL REFERENCES privy_accounts(id) ON DELETE RESTRICT,
```

**REMOVE this index:**
```sql
-- OLD (DELETE):
CREATE INDEX idx_client_orgs_privy_org_id ON client_organizations(privy_organization_id);
```

**ADD this index:**
```sql
-- NEW (ADD):
CREATE INDEX idx_client_orgs_privy_account ON client_organizations(privy_account_id);
```

### Change 3: Add strategies JSONB column to client_vaults

**Find the client_vaults table definition and ADD:**
```sql
-- Add after line ~188 (after apy_30d column):
strategies JSONB DEFAULT '[]'::jsonb,
```

**Add comment:**
```sql
COMMENT ON COLUMN client_vaults.strategies IS 'DeFi strategy allocation as JSONB: [{"category":"lending","target":70,"isActive":true}]';
```

### Change 4: Remove vault_strategies table

**DELETE entire section (around lines 288-310):**
```sql
-- DELETE THIS ENTIRE BLOCK:
CREATE TABLE vault_strategies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_vault_id UUID NOT NULL REFERENCES client_vaults(id) ON DELETE CASCADE,
  category VARCHAR(50) NOT NULL,
  target_percent NUMERIC(5,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(client_vault_id, category),
  CHECK (target_percent >= 0 AND target_percent <= 100)
);

CREATE INDEX idx_vault_strategies_vault_id ON vault_strategies(client_vault_id);

COMMENT ON TABLE vault_strategies IS 'DeFi strategy allocation configuration per client vault';
-- ... rest of vault_strategies section
```

### Change 5: Add trigger for privy_accounts

**Add at the end of file (before final COMMIT if exists):**
```sql
-- ============================================
-- TRIGGERS
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_privy_accounts_updated_at
  BEFORE UPDATE ON privy_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

## Summary of Changes

| Change | From | To |
|--------|------|-----|
| Identity Layer | Embedded in client_organizations | Separate privy_accounts table |
| One user → Many orgs | ❌ Not possible | ✅ Supported via FK |
| Vault strategies | vault_strategies table | client_vaults.strategies JSONB |
| Strategy updates | DELETE + Loop INSERT | Single atomic UPDATE |
| wallet_type | In client_organizations | In privy_accounts |

## Files to Update

1. **Database Schema**: `database/migrations/000001_init_schema.up.sql`
   - Add privy_accounts table
   - Update client_organizations (remove Privy columns, add FK)
   - Add strategies JSONB to client_vaults
   - Remove vault_strategies table
   - Add triggers

2. **SQLC Queries**: `database/queries/vault_strategies.sql`
   - Move to `_archive/` folder (no longer needed)

3. **Repository Code**: `packages/core/repository/postgres/vault.repository.ts`
   - ✅ Already updated (uses JSONB methods)
   - Remove SQLC legacy methods (lines 246-260)

4. **Repository Code**: `packages/core/repository/postgres/defi.repository.ts`
   - Remove vault_strategies imports (no longer exist)

5. **UseCase Code**: `packages/core/usecase/b2b/client.usecase.ts`
   - ✅ Already updated (uses JSONB approach)

## Database Reset Steps

```bash
# 1. Backup existing data (if needed)
pg_dump -U postgres proxify_dev > backup_before_consolidation.sql

# 2. Drop database
psql -U postgres -c "DROP DATABASE IF EXISTS proxify_dev;"

# 3. Create fresh database
psql -U postgres -c "CREATE DATABASE proxify_dev;"

# 4. Run consolidated migration
psql -U postgres -d proxify_dev -f database/migrations/000001_init_schema.up.sql

# 5. Verify tables
psql -U postgres -d proxify_dev -c "\dt"

# Should show:
# - privy_accounts ✅
# - client_organizations (with privy_account_id FK) ✅
# - client_vaults (with strategies JSONB) ✅
# - end_user_vaults ✅
# - supported_defi_protocols ✅
# - defi_allocations ✅
# - NO vault_strategies table ✅
```

## Code Cleanup Steps

```bash
# 1. Archive old SQLC queries
mkdir -p database/queries/_archive
mv database/queries/vault_strategies.sql database/queries/_archive/

# 2. Regenerate SQLC (will remove vault_strategies types)
sqlc generate

# 3. Remove legacy methods from vault.repository.ts
# Edit packages/core/repository/postgres/vault.repository.ts
# Delete lines 246-260 (upsertVaultStrategy, getVaultStrategies, deleteAllVaultStrategies)

# 4. Remove vault_strategies imports from defi.repository.ts
# Edit packages/core/repository/postgres/defi.repository.ts
# Remove lines 22-29 and 65-73 (all vault strategy imports)

# 5. Rebuild packages
pnpm build --filter @proxify/core
pnpm build --filter @proxify/b2b-api-core
pnpm build --filter b2b-api

# 6. Start server
cd apps/b2b-api && pnpm dev
```

## Testing After Consolidation

### Test 1: Privy Account + Client Registration
```bash
# User logs in via Privy → LoginPage creates privy_account
# Then user registers organization
POST http://localhost:3001/api/v1/clients/register
{
  "companyName": "GrabPay",
  "businessType": "e-commerce",
  "walletType": "MANAGED",
  "privyOrganizationId": "clb_user123",
  "privyWalletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "privyEmail": "user@grab.com"
}
```

**Expected Database State:**
```sql
-- privy_accounts: 1 row
SELECT * FROM privy_accounts;
-- | id | privy_organization_id | privy_wallet_address | wallet_type |

-- client_organizations: 1 row (references privy_account)
SELECT co.*, pa.privy_email
FROM client_organizations co
JOIN privy_accounts pa ON co.privy_account_id = pa.id;
-- Should show GrabPay with user@grab.com

-- client_vaults: 1 row (USDC on Base, strategies=[])
SELECT id, token_symbol, strategies::text FROM client_vaults;
-- | uuid | USDC | [] |
```

### Test 2: Register Second Organization (Same User)
```bash
POST http://localhost:3001/api/v1/clients/register
{
  "companyName": "GrabFood",
  "businessType": "food-delivery",
  "walletType": "MANAGED",
  "privyOrganizationId": "clb_user123",  // ← SAME USER
  "privyWalletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",  // ← SAME WALLET
  "privyEmail": "user@grab.com"
}
```

**Expected:**
```sql
-- privy_accounts: STILL 1 row (same user)
SELECT COUNT(*) FROM privy_accounts;  -- 1

-- client_organizations: NOW 2 rows (both reference same privy_account)
SELECT company_name FROM client_organizations co
JOIN privy_accounts pa ON co.privy_account_id = pa.id
WHERE pa.privy_organization_id = 'clb_user123';
-- GrabPay
-- GrabFood

-- client_vaults: 2 rows (one per organization)
SELECT co.company_name, cv.token_symbol, cv.strategies::text
FROM client_vaults cv
JOIN client_organizations co ON cv.client_id = co.id;
-- | GrabPay  | USDC | [] |
-- | GrabFood | USDC | [] |
```

### Test 3: Configure Strategies (JSONB)
```bash
POST http://localhost:3001/api/v1/products/prod_grabpay_xxx/strategies
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

**Expected:**
```sql
-- client_vaults.strategies updated (atomic)
SELECT strategies::text FROM client_vaults cv
JOIN client_organizations co ON cv.client_id = co.id
WHERE co.product_id = 'prod_grabpay_xxx';

-- Result:
-- [{"category":"lending","target":70,"isActive":true},
--  {"category":"lp","target":20,"isActive":true},
--  {"category":"staking","target":10,"isActive":true}]
```

## Benefits After Consolidation

### ✅ Cleaner Architecture
- One migration file instead of four
- Normalized identity layer (one user → many orgs)
- JSONB for flexible strategy config

### ✅ Better Performance
- No JOIN needed to read strategies
- Atomic strategy updates (one query vs many)
- Fewer tables to manage

### ✅ Code Simplicity
- Less repository methods
- No SQLC boilerplate for vault_strategies
- Easier to understand flow

### ✅ Multi-Org Support
- One Privy user can create multiple organizations
- Each org has own vault + strategies
- Shared custodial wallet (via privy_account)

## Final File Structure

```
database/
├── migrations/
│   ├── 000001_init_schema.up.sql    ← CONSOLIDATED (all changes here)
│   ├── 000001_init_schema.down.sql  ← UPDATE to drop all tables
│   └── _archive/
│       ├── 000002_normalize_privy_accounts.up.sql
│       ├── 000003_vault_system.up.sql
│       └── 000004_vault_strategies_to_jsonb.up.sql
└── queries/
    ├── client.sql
    ├── deposit.sql
    ├── defi.sql  ← Remove vault_strategies queries
    ├── vault.sql
    └── _archive/
        └── vault_strategies.sql  ← Move here (deprecated)
```

---

**Status**: Ready to consolidate
**Estimated Time**: 20-30 minutes (schema changes + testing)
**Risk**: Low (resetting DB anyway, no data loss)
