-- Migration Rollback: Remove revenue tracking and vault index history

-- ============================================================================
-- 4. Remove vault index update tracking columns
-- ============================================================================

ALTER TABLE client_vaults
DROP COLUMN IF EXISTS last_successful_index_update;

-- ============================================================================
-- 3. Remove environment-aware APY simulation config
-- ============================================================================

ALTER TABLE client_organizations
DROP COLUMN IF EXISTS sandbox_apy_simulation_rate,
DROP COLUMN IF EXISTS production_use_real_defi;

-- ============================================================================
-- 2. Drop vault_index_history table
-- ============================================================================

DROP INDEX IF EXISTS idx_vault_index_history_vault_timestamp;
DROP INDEX IF EXISTS idx_vault_index_history_timestamp;
DROP TABLE IF EXISTS vault_index_history CASCADE;

-- ============================================================================
-- 1. Drop revenue_distributions table
-- ============================================================================

DROP INDEX IF EXISTS idx_revenue_distributions_withdrawal;
DROP INDEX IF EXISTS idx_revenue_distributions_vault;
DROP INDEX IF EXISTS idx_revenue_distributions_distributed_at;
DROP INDEX IF EXISTS idx_revenue_distributions_is_deducted;
DROP TABLE IF EXISTS revenue_distributions CASCADE;
