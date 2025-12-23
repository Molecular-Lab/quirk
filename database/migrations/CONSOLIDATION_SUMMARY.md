# Migration Consolidation Summary

## Overview
All migrations from `000001` through `000007` have been consolidated into a single comprehensive migration: `000001_complete_schema.up.sql`.

## What Was Consolidated

### Original Migrations

1. **000001_init_schema** (2025-11-17, Updated 2025-11-24)
   - Complete initial database schema
   - 15 core tables with index-based vault accounting
   - Privy accounts, client organizations, end-users, vaults
   - Transaction tables (deposits, withdrawals)
   - DeFi protocol integrations
   - Audit logging

2. **000002_add_wallet_stages** (2025-12-10)
   - Added wallet stage columns: `idle_balance`, `earning_balance`
   - Revenue tracking: `client_revenue_earned`, `platform_revenue_earned`, `enduser_revenue_earned`
   - End-user metrics: `total_end_users`, `new_users_30d`, `active_users_30d`
   - Transaction totals: `total_deposited`, `total_withdrawn`

3. **000003_add_environment_support**
   - Sandbox vs Production API key separation
   - Added to `client_organizations`: `sandbox_api_key`, `sandbox_api_secret`, `production_api_key`, `production_api_secret`
   - Added `environment`, `network`, `oracle_address` to transactions
   - Created `environment_audit_log` table

4. **000004_add_revenue_tracking**
   - Created `revenue_distributions` table (tracks 3-way fee splits)
   - Created `vault_index_history` table (for 7d/30d APY calculations)
   - Added APY simulation config: `sandbox_apy_simulation_rate`, `production_use_real_defi`
   - Added `last_successful_index_update` to `client_vaults`

5. **000006_add_vault_environment_support**
   - Added `environment` column to `client_vaults` and `end_user_vaults`
   - Updated unique constraint on `end_user_vaults` to include environment
   - Now allows: one vault per user per client **PER ENVIRONMENT**
   - Added `custodial_wallet_address` to `client_vaults`

6. **000007_update_platform_fee_default**
   - **CRITICAL**: Updated `platform_fee_percent` default from `7.50` to `10.00`
   - Updated existing clients with 7.5% to 10%
   - New revenue split: Platform 10% + Client 15% + End-User 75% = 100%

## New Consolidated Migration

**File**: `database/migrations/000001_complete_schema.up.sql`

### Key Features:
- ✅ All 15 core tables in correct dependency order
- ✅ All indexes and constraints from all migrations
- ✅ Environment support (sandbox/production)
- ✅ Revenue tracking and vault index history
- ✅ **Platform fee defaults to 10%** (not 7.5%)
- ✅ Comprehensive comments and documentation
- ✅ All triggers for auto-updating timestamps

### Tables Created (15 total):
1. `privy_accounts` - Identity layer
2. `client_organizations` - Product owners (with all dashboard metrics)
3. `client_balances` - Prepaid credits
4. `end_users` - End-user identities
5. `client_vaults` - Index-based growth tracking (with environment support)
6. `end_user_vaults` - User positions (with environment support)
7. `supported_defi_protocols` - Protocol integrations
8. `defi_allocations` - Fund allocations to protocols
9. `deposit_transactions` - All deposit types (with environment)
10. `mock_usdc_mints` - Testnet on-ramp tracking
11. `withdrawal_transactions` - Withdrawal tracking (with environment)
12. `deposit_batch_queue` - Batch deposit processing
13. `withdrawal_queue` - Withdrawal processing queue
14. `revenue_distributions` - Fee split tracking
15. `vault_index_history` - APY calculation snapshots
16. `environment_audit_log` - Environment switch tracking
17. `audit_logs` - Complete audit trail

## How to Use

### For Fresh Databases
```bash
# Run the consolidated migration
migrate -path database/migrations -database "$DATABASE_URL" up 1

# Or use make command
make db-migrate
```

### For Existing Databases
**WARNING**: If you already have migrations 000001-000007 applied, **DO NOT** run this consolidated migration on top of them. It will cause conflicts.

To use the consolidated migration on an existing database:
1. Backup your database first
2. Rollback existing migrations: `migrate down 7`
3. Run the consolidated migration: `migrate up 1`

### Rollback
```bash
# Rollback the complete schema
migrate -path database/migrations -database "$DATABASE_URL" down 1
```

This will drop all tables, indexes, triggers, and functions.

## Benefits of Consolidation

1. **Simpler Setup**: One migration file instead of 7
2. **Faster Deployment**: Single transaction vs multiple
3. **Easier Maintenance**: All schema changes in one place
4. **Better Documentation**: Comprehensive comments
5. **Atomic Updates**: All-or-nothing schema deployment
6. **Version Control**: Single source of truth

## Migration History (Archived)

The original migrations (000001-000007) have been preserved in:
- `database/migrations/_archive/` (if moved)
- Git history (always available)

## Next Steps

1. Archive old migrations: `mkdir -p database/migrations/_archive && mv database/migrations/00000[1-7]_*.sql database/migrations/_archive/`
2. Update documentation to reference the consolidated migration
3. Update CI/CD pipelines if they reference specific migration numbers
4. Regenerate SQLC types: `make sqlc-generate`

## Breaking Changes

**None** - The consolidated migration produces identical schema to running migrations 000001-000007 sequentially.

## Important Notes

- ✅ Platform fee now defaults to **10%** (was 7.5%)
- ✅ Environment support is built-in (sandbox/production)
- ✅ Vault environment isolation is enabled
- ✅ Revenue tracking is included by default
- ✅ All dashboard metrics are ready to use

---

**Generated**: 2025-01-20
**Consolidates**: Migrations 000001-000007
**Schema Version**: 1.0 (Complete)
