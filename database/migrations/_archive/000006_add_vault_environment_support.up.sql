-- Migration: Add environment support to vault tables
-- Purpose: Separate sandbox and production vaults for proper environment isolation
-- Date: 2025-01-XX

-- ============================================
-- 1. Add environment column to client_vaults
-- ============================================

ALTER TABLE client_vaults
ADD COLUMN environment VARCHAR(20) DEFAULT 'sandbox' CHECK (environment IN ('sandbox', 'production')),
ADD COLUMN custodial_wallet_address VARCHAR(66); -- Cache from Privy, same for both environments

-- Create index for efficient environment-based queries
CREATE INDEX idx_client_vaults_environment ON client_vaults(client_id, environment);

-- Update existing client vaults to be 'sandbox' (current default behavior)
UPDATE client_vaults SET environment = 'sandbox' WHERE environment IS NULL;

-- Make environment NOT NULL after backfill
ALTER TABLE client_vaults ALTER COLUMN environment SET NOT NULL;

-- ============================================
-- 2. Add environment column to end_user_vaults
-- ============================================

ALTER TABLE end_user_vaults
ADD COLUMN environment VARCHAR(20) DEFAULT 'sandbox' CHECK (environment IN ('sandbox', 'production'));

-- Update existing user vaults to be 'sandbox' (current default behavior)
UPDATE end_user_vaults SET environment = 'sandbox' WHERE environment IS NULL;

-- Make environment NOT NULL after backfill
ALTER TABLE end_user_vaults ALTER COLUMN environment SET NOT NULL;

-- ============================================
-- 3. Update unique constraints to allow separate vaults per environment
-- ============================================

-- Drop old unique constraint (one vault per user per client)
ALTER TABLE end_user_vaults
DROP CONSTRAINT IF EXISTS end_user_vaults_end_user_id_client_id_key;

-- Add new unique constraint (one vault per user per client PER ENVIRONMENT)
ALTER TABLE end_user_vaults
ADD CONSTRAINT end_user_vaults_end_user_client_env_key
UNIQUE (end_user_id, client_id, environment);

-- Create index for efficient environment-based queries
CREATE INDEX idx_end_user_vaults_environment ON end_user_vaults(end_user_id, client_id, environment);

-- ============================================
-- 4. Comments for documentation
-- ============================================

COMMENT ON COLUMN client_vaults.environment IS 'Environment: sandbox (mock tokens) or production (real USDC)';
COMMENT ON COLUMN client_vaults.custodial_wallet_address IS 'Cached Privy custodial wallet address (same for both environments)';
COMMENT ON COLUMN end_user_vaults.environment IS 'Environment: sandbox (mock tokens) or production (real USDC). User can have 2 vaults: one for each environment.';
