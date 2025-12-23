-- Rollback: Remove environment support from vault tables

-- ============================================
-- 1. Remove end_user_vaults environment support
-- ============================================

-- Drop new unique constraint
ALTER TABLE end_user_vaults
DROP CONSTRAINT IF EXISTS end_user_vaults_end_user_client_env_key;

-- Re-add old unique constraint (will fail if user has both sandbox and production vaults)
-- NOTE: This rollback may fail if data has been created with separate environments
ALTER TABLE end_user_vaults
ADD CONSTRAINT end_user_vaults_end_user_id_client_id_key
UNIQUE (end_user_id, client_id);

-- Drop index
DROP INDEX IF EXISTS idx_end_user_vaults_environment;

-- Remove environment column
ALTER TABLE end_user_vaults
DROP COLUMN IF EXISTS environment;

-- ============================================
-- 2. Remove client_vaults environment support
-- ============================================

-- Drop index
DROP INDEX IF EXISTS idx_client_vaults_environment;

-- Remove environment column
ALTER TABLE client_vaults
DROP COLUMN IF EXISTS environment,
DROP COLUMN IF EXISTS custodial_wallet_address;
