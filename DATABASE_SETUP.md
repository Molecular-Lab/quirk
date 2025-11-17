# Database Setup Guide

## ✅ Alignment Confirmation

**YES**, the current implementation **perfectly aligns** with `INDEX_VAULT_SYSTEM.md`:

- ✅ **Schema**: All tables match the documented structure
- ✅ **Index-based accounting**: Shares, weighted_entry_index (1e18 scaled)
- ✅ **Growth index**: Current_index in client_vaults (1e18 scaled)
- ✅ **Batch queues**: Deposit & withdrawal queues implemented
- ✅ **All 9 flows**: Fully supported by queries
- ✅ **Database invariants**: Enforced via constraints

---

## 🚀 Quick Start

### Prerequisites

1. **Docker** - For PostgreSQL container
2. **golang-migrate** - For database migrations
3. **sqlc** - For code generation

### Install golang-migrate (macOS)

```bash
make migrate-install
# or manually:
brew install golang-migrate
```

### One-Command Setup

```bash
make setup
```

This will:
1. Install pnpm dependencies
2. Start PostgreSQL with Docker
3. Run all migrations
4. Generate Go & TypeScript code with SQLC
5. Seed DeFi protocols

### Fresh Start (Clean + Setup)

```bash
make setup-fresh
```

---

## 📚 Common Commands

### Database Management

```bash
# Start database
make db-start

# Stop database
make db-stop

# Restart database
make db-restart

# Connect to database (psql)
make db-connect

# View logs
make db-logs

# Reset database (WARNING: Deletes all data)
make db-reset

# Open pgAdmin (http://localhost:5050)
make db-pgadmin
```

### Migrations

```bash
# Run all pending migrations
make migrate-up

# Rollback last migration
make migrate-down

# Check current version
make migrate-version

# Create new migration
make migrate-create NAME=add_new_table

# Force migration version (if stuck)
make migrate-force VERSION=1
```

### Code Generation

```bash
# Generate both Go and TypeScript
make sqlc-generate

# Generate only Go
make sqlc-go

# Verify SQLC config
make sqlc-verify
```

### Database Seeding

```bash
# Seed DeFi protocols (Aave, Compound, Curve, Uniswap)
make seed-protocols

# Create test client
make seed-test-client

# Seed all test data
make seed-all
```

### Validation & Testing

```bash
# Check database invariants
make db-check-invariants

# Show system info
make info

# Test deposit API (requires server running)
make test-deposit

# Test balance query
make test-balance USER_ID=test_user_001
```

---

## 🗂️ Database Structure

### Connection Details

```
Host:     localhost
Port:     5432
Database: proxify_dev
User:     proxify_user
Password: proxify_password

URL: postgresql://proxify_user:proxify_password@localhost:5432/proxify_dev
```

### Tables Overview

**Core Entities:**
- `client_organizations` - Product owners (B2B clients)
- `client_balances` - Prepaid balances for internal transfers
- `end_users` - End-users using client platforms

**Vault System (Index-Based):**
- `client_vaults` - Aggregated vault with **growth index** (1e18 scaled)
- `end_user_vaults` - User positions with **shares** and **weighted_entry_index**

**DeFi Integration:**
- `supported_defi_protocols` - Protocol registry
- `vault_strategies` - Target allocation percentages per category
- `defi_allocations` - Actual protocol deployments

**Transaction Processing:**
- `deposit_transactions` - Deposit history
- `withdrawal_transactions` - Withdrawal history
- `deposit_batch_queue` - Pending deposits for staking
- `withdrawal_queue` - Withdrawals needing DeFi unstaking

**Audit:**
- `audit_logs` - Complete activity trail

---

## 🔧 Development Workflow

### 1. Initial Setup

```bash
# Install tools (macOS)
brew install golang-migrate
brew install sqlc

# Run setup
make setup
```

### 2. Create a New Migration

```bash
# Create migration files
make migrate-create NAME=add_user_settings

# Edit the generated files:
# - database/migrations/000002_add_user_settings.up.sql
# - database/migrations/000002_add_user_settings.down.sql

# Run migration
make migrate-up

# Verify
make migrate-version
```

### 3. Add New Queries

```bash
# Edit query files in database/queries/
# Example: database/queries/vault.sql

# Regenerate code
make sqlc-generate

# Generated code will be in:
# - Go: packages/core/datagateway/gen/
# - TypeScript: packages/database/src/gen/
```

### 4. Test Changes

```bash
# Connect to database
make db-connect

# Run test queries
SELECT * FROM client_vaults;
SELECT * FROM end_user_vaults;

# Check invariants
make db-check-invariants

# Exit
\q
```

---

## 🎯 Integration Examples

### Example 1: Client Registration Flow

```sql
-- Insert new client
INSERT INTO client_organizations (
  product_id,
  company_name,
  business_type,
  wallet_type,
  wallet_managed_by,
  privy_organization_id,
  privy_wallet_address,
  api_key_hash,
  api_key_prefix,
  end_user_yield_portion,
  platform_fee,
  is_active
) VALUES (
  'ecommerce_abc',
  'ABC E-commerce',
  'ecommerce',
  'custodial',
  'proxify',
  'privy_org_abc123',
  '0x1234...5678',
  'hashed_api_key_here',
  'pk_live_',
  90.00,
  1.00,
  true
) RETURNING id, product_id;
```

### Example 2: User Deposit with Share Minting

```sql
-- 1. Get current vault index
SELECT id, current_index, total_shares
FROM client_vaults
WHERE client_id = $1
  AND chain = 'ethereum'
  AND token_address = '0xA0b8...'; -- USDC

-- 2. Calculate shares to mint
-- shares = deposit_amount * 1e18 / current_index

-- 3. Insert/Update user vault
INSERT INTO end_user_vaults (
  end_user_id,
  client_id,
  chain,
  token_address,
  token_symbol,
  shares,
  weighted_entry_index,
  total_deposited
) VALUES (
  $1, $2, 'ethereum', '0xA0b8...', 'USDC',
  285710000000000000000, -- shares (scaled by 1e18)
  1000000000000000000,   -- entry index (1.0 * 1e18)
  285.71                 -- deposit amount
)
ON CONFLICT (end_user_id, chain, token_address)
DO UPDATE SET
  shares = end_user_vaults.shares + EXCLUDED.shares,
  weighted_entry_index = ... -- Calculate weighted average
  total_deposited = end_user_vaults.total_deposited + EXCLUDED.total_deposited;

-- 4. Update client vault
UPDATE client_vaults
SET total_shares = total_shares + 285710000000000000000,
    pending_deposit_balance = pending_deposit_balance + 285.71
WHERE id = $1;
```

### Example 3: Query User Balance with Yield

```sql
-- Get effective balance with yield calculation
SELECT
  euv.shares,
  euv.weighted_entry_index,
  euv.total_deposited,
  cv.current_index,
  -- Effective balance = shares * current_index / 1e18
  (euv.shares * cv.current_index / 1000000000000000000) AS effective_balance,
  -- Yield earned = effective_balance - total_deposited
  ((euv.shares * cv.current_index / 1000000000000000000) - euv.total_deposited) AS yield_earned
FROM end_user_vaults euv
JOIN client_vaults cv
  ON euv.client_id = cv.client_id
  AND euv.chain = cv.chain
  AND euv.token_address = cv.token_address
WHERE euv.end_user_id = $1
  AND euv.chain = 'ethereum'
  AND euv.token_symbol = 'USDC';
```

---

## 🐛 Troubleshooting

### Migration Errors

```bash
# Check current migration version
make migrate-version

# If migration is stuck, force version
make migrate-force VERSION=1

# Then retry
make migrate-up
```

### Database Connection Issues

```bash
# Check if database is running
make info

# Restart database
make db-restart

# Check logs
make db-logs
```

### SQLC Generation Errors

```bash
# Verify configuration
make sqlc-verify

# If syntax errors in queries, check:
# - database/queries/*.sql files
# - Make sure all queries have proper -- name: comments
```

---

## 📊 Useful SQL Queries

### Check Vault Invariants

```sql
-- Verify: Sum of user shares == vault total_shares
SELECT
  cv.id AS vault_id,
  cv.total_shares AS vault_total_shares,
  COALESCE(SUM(euv.shares), 0) AS sum_user_shares,
  cv.total_shares - COALESCE(SUM(euv.shares), 0) AS difference
FROM client_vaults cv
LEFT JOIN end_user_vaults euv
  ON cv.client_id = euv.client_id
  AND cv.chain = euv.chain
  AND cv.token_address = euv.token_address
GROUP BY cv.id;

-- Difference should be 0 for all vaults
```

### View All Users with Balances

```sql
SELECT
  eu.user_id,
  euv.token_symbol,
  euv.shares,
  euv.total_deposited,
  (euv.shares * cv.current_index / 1000000000000000000) AS effective_balance,
  ((euv.shares * cv.current_index / 1000000000000000000) - euv.total_deposited) AS yield_earned
FROM end_users eu
JOIN end_user_vaults euv ON eu.id = euv.end_user_id
JOIN client_vaults cv
  ON euv.client_id = cv.client_id
  AND euv.chain = cv.chain
  AND euv.token_address = cv.token_address
WHERE eu.client_id = $1
ORDER BY effective_balance DESC;
```

### Check DeFi Allocations

```sql
SELECT
  sdp.name AS protocol,
  da.category,
  da.balance / 1000000000000000000 AS balance_scaled,
  da.apy,
  da.yield_earned / 1000000000000000000 AS yield_scaled,
  da.status
FROM defi_allocations da
JOIN supported_defi_protocols sdp ON da.protocol_id = sdp.id
WHERE da.client_id = $1
  AND da.status = 'active'
ORDER BY da.balance DESC;
```

---

## 📚 Next Steps

1. **Review Documentation**:
   - `INDEX_VAULT_SYSTEM.md` - Complete technical documentation
   - `PRODUCT_OWNER_FLOW.md` - Business flows

2. **Start Development**:
   ```bash
   # Generate Go/TS types
   make sqlc-generate

   # Implement business logic in packages/core/
   # Use generated types from packages/core/datagateway/gen/
   ```

3. **Run Integration Tests**:
   ```bash
   # Seed test data
   make seed-all

   # Check invariants
   make db-check-invariants
   ```

4. **Build API Endpoints**:
   - Use generated SQLC queries
   - Implement index-based calculations
   - Handle share minting/burning

---

## 🔗 Resources

- **golang-migrate**: https://github.com/golang-migrate/migrate
- **SQLC**: https://docs.sqlc.dev/
- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **Index-Based Vaults**: See `INDEX_VAULT_SYSTEM.md`

---

**Last Updated**: 2025-11-17
**Database Version**: 000001_init_schema
**Status**: Ready for B2B Service Integration
