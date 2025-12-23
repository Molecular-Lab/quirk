-- Migration: Add environment support for sandbox/production modes
-- This migration adds environment tracking to support separate API keys and oracle addresses

-- ============================================================================
-- 1. Add API key columns to client_organizations table
-- ============================================================================

-- Add separate API keys for sandbox and production
ALTER TABLE client_organizations
ADD COLUMN IF NOT EXISTS sandbox_api_key VARCHAR(255),
ADD COLUMN IF NOT EXISTS sandbox_api_secret VARCHAR(255),
ADD COLUMN IF NOT EXISTS production_api_key VARCHAR(255),
ADD COLUMN IF NOT EXISTS production_api_secret VARCHAR(255);

-- Create indexes for API key lookups
CREATE INDEX IF NOT EXISTS idx_client_orgs_sandbox_api_key ON client_organizations(sandbox_api_key);
CREATE INDEX IF NOT EXISTS idx_client_orgs_production_api_key ON client_organizations(production_api_key);

-- Add comments
COMMENT ON COLUMN client_organizations.sandbox_api_key IS 'Sandbox API key hash (pk_test_xxx) for testing';
COMMENT ON COLUMN client_organizations.sandbox_api_secret IS 'Sandbox API key prefix for fast lookup';
COMMENT ON COLUMN client_organizations.production_api_key IS 'Production API key hash (pk_live_xxx) for live transactions';
COMMENT ON COLUMN client_organizations.production_api_secret IS 'Production API key prefix for fast lookup';

-- ============================================================================
-- 2. Add environment columns to deposit_transactions table
-- ============================================================================

-- Add environment columns
ALTER TABLE deposit_transactions
ADD COLUMN IF NOT EXISTS environment VARCHAR(20) DEFAULT 'sandbox' CHECK (environment IN ('sandbox', 'production')),
ADD COLUMN IF NOT EXISTS network VARCHAR(50),
ADD COLUMN IF NOT EXISTS oracle_address VARCHAR(255);

-- Create index for environment queries
CREATE INDEX IF NOT EXISTS idx_deposit_transactions_environment ON deposit_transactions(environment);
CREATE INDEX IF NOT EXISTS idx_deposit_transactions_network ON deposit_transactions(network);

-- Add comments
COMMENT ON COLUMN deposit_transactions.environment IS 'API environment: sandbox (testnet) or production (mainnet)';
COMMENT ON COLUMN deposit_transactions.network IS 'Blockchain network: sepolia, mainnet, etc.';
COMMENT ON COLUMN deposit_transactions.oracle_address IS 'Oracle custodial address that received the deposit';

-- ============================================================================
-- 3. Add environment columns to withdrawal_transactions table
-- ============================================================================

-- Add environment columns
ALTER TABLE withdrawal_transactions
ADD COLUMN IF NOT EXISTS environment VARCHAR(20) DEFAULT 'sandbox' CHECK (environment IN ('sandbox', 'production')),
ADD COLUMN IF NOT EXISTS network VARCHAR(50),
ADD COLUMN IF NOT EXISTS oracle_address VARCHAR(255);

-- Create index for environment queries
CREATE INDEX IF NOT EXISTS idx_withdrawal_transactions_environment ON withdrawal_transactions(environment);
CREATE INDEX IF NOT EXISTS idx_withdrawal_transactions_network ON withdrawal_transactions(network);

-- Add comments
COMMENT ON COLUMN withdrawal_transactions.environment IS 'API environment: sandbox (testnet) or production (mainnet)';
COMMENT ON COLUMN withdrawal_transactions.network IS 'Blockchain network: sepolia, mainnet, etc.';
COMMENT ON COLUMN withdrawal_transactions.oracle_address IS 'Oracle custodial address that sends the withdrawal';

-- ============================================================================
-- 4. Add environment columns to transactions table (if exists)
-- ============================================================================

DO $$
BEGIN
    -- Check if transactions table exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'transactions') THEN
        -- Add environment columns
        ALTER TABLE transactions
        ADD COLUMN IF NOT EXISTS environment VARCHAR(20) DEFAULT 'sandbox' CHECK (environment IN ('sandbox', 'production')),
        ADD COLUMN IF NOT EXISTS network VARCHAR(50);

        -- Create index for environment queries
        CREATE INDEX IF NOT EXISTS idx_transactions_environment ON transactions(environment);
        CREATE INDEX IF NOT EXISTS idx_transactions_network ON transactions(network);

        -- Add comments
        COMMENT ON COLUMN transactions.environment IS 'API environment: sandbox (testnet) or production (mainnet)';
        COMMENT ON COLUMN transactions.network IS 'Blockchain network: sepolia, mainnet, etc.';
    END IF;
END $$;

-- ============================================================================
-- 5. Create environment audit log (optional - for tracking environment switches)
-- ============================================================================

CREATE TABLE IF NOT EXISTS environment_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES client_organizations(id) ON DELETE CASCADE,
    from_environment VARCHAR(20),
    to_environment VARCHAR(20) NOT NULL CHECK (to_environment IN ('sandbox', 'production')),
    changed_by_user_id UUID, -- Could reference users table if you have one
    changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ip_address VARCHAR(45), -- IPv4 or IPv6
    user_agent TEXT,
    reason TEXT
);

-- Create index for audit queries
CREATE INDEX IF NOT EXISTS idx_environment_audit_log_client_id ON environment_audit_log(client_id);
CREATE INDEX IF NOT EXISTS idx_environment_audit_log_changed_at ON environment_audit_log(changed_at DESC);

-- Add comment
COMMENT ON TABLE environment_audit_log IS 'Audit trail for environment switches (sandbox ↔ production)';
