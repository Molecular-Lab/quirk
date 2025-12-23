-- ============================================
-- MIGRATION: 000003_add_offramp_transactions (DOWN)
-- Description: Remove off-ramp transactions table
-- ============================================

-- Drop indexes first
DROP INDEX IF EXISTS idx_off_ramp_txns_processing;
DROP INDEX IF EXISTS idx_off_ramp_txns_pending;
DROP INDEX IF EXISTS idx_off_ramp_txns_burn_hash;
DROP INDEX IF EXISTS idx_off_ramp_txns_provider_order;
DROP INDEX IF EXISTS idx_off_ramp_txns_provider;
DROP INDEX IF EXISTS idx_off_ramp_txns_environment;
DROP INDEX IF EXISTS idx_off_ramp_txns_created_at;
DROP INDEX IF EXISTS idx_off_ramp_txns_status;
DROP INDEX IF EXISTS idx_off_ramp_txns_end_user_id;
DROP INDEX IF EXISTS idx_off_ramp_txns_user_id;
DROP INDEX IF EXISTS idx_off_ramp_txns_client_id;
DROP INDEX IF EXISTS idx_off_ramp_txns_order_id;

-- Drop table
DROP TABLE IF EXISTS off_ramp_transactions;
