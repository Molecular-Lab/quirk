-- ============================================
-- MIGRATION 000003 ROLLBACK: INDEX-BASED VAULT SYSTEM
-- ============================================
-- Removes all vault system tables and columns
-- WARNING: This will delete all vault data!

BEGIN;

-- Drop tables in reverse order (respecting foreign keys)
DROP TABLE IF EXISTS withdrawal_queue CASCADE;
DROP TABLE IF EXISTS deposit_batch_queue CASCADE;
DROP TABLE IF EXISTS defi_allocations CASCADE;
DROP TABLE IF EXISTS supported_defi_protocols CASCADE;
DROP TABLE IF EXISTS end_user_vaults CASCADE;
DROP TABLE IF EXISTS vault_strategies CASCADE;

-- Remove added columns from client_vaults
ALTER TABLE client_vaults
DROP COLUMN IF EXISTS apy_30d,
DROP COLUMN IF EXISTS apy_7d,
DROP COLUMN IF EXISTS cumulative_yield,
DROP COLUMN IF EXISTS total_staked_balance,
DROP COLUMN IF EXISTS pending_deposit_balance,
DROP COLUMN IF EXISTS last_index_update,
DROP COLUMN IF EXISTS current_index,
DROP COLUMN IF EXISTS total_shares;

-- Drop indexes (they should be auto-dropped with columns, but explicit is safer)
DROP INDEX IF EXISTS idx_client_vaults_pending;

COMMIT;
