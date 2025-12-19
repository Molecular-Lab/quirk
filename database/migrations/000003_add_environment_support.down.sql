-- Migration Rollback: Remove environment support

-- ============================================================================
-- 1. Drop environment audit log table
-- ============================================================================

DROP TABLE IF EXISTS environment_audit_log CASCADE;

-- ============================================================================
-- 2. Remove environment columns from transactions table
-- ============================================================================

DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'transactions') THEN
        DROP INDEX IF EXISTS idx_transactions_environment;
        DROP INDEX IF EXISTS idx_transactions_network;

        ALTER TABLE transactions
        DROP COLUMN IF EXISTS environment,
        DROP COLUMN IF EXISTS network;
    END IF;
END $$;

-- ============================================================================
-- 3. Remove environment columns from withdrawal_transactions table
-- ============================================================================

DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'withdrawal_transactions') THEN
        DROP INDEX IF EXISTS idx_withdrawal_transactions_environment;
        DROP INDEX IF EXISTS idx_withdrawal_transactions_network;

        ALTER TABLE withdrawal_transactions
        DROP COLUMN IF EXISTS environment,
        DROP COLUMN IF EXISTS network,
        DROP COLUMN IF EXISTS oracle_address;
    END IF;
END $$;

-- ============================================================================
-- 4. Remove environment columns from deposit_transactions table
-- ============================================================================

DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'deposit_transactions') THEN
        DROP INDEX IF EXISTS idx_deposit_transactions_environment;
        DROP INDEX IF EXISTS idx_deposit_transactions_network;

        ALTER TABLE deposit_transactions
        DROP COLUMN IF EXISTS environment,
        DROP COLUMN IF EXISTS network,
        DROP COLUMN IF EXISTS oracle_address;
    END IF;
END $$;

-- ============================================================================
-- 5. Remove API key columns from client_organizations table
-- ============================================================================

DROP INDEX IF EXISTS idx_client_orgs_sandbox_api_key;
DROP INDEX IF EXISTS idx_client_orgs_production_api_key;

ALTER TABLE client_organizations
DROP COLUMN IF EXISTS sandbox_api_key,
DROP COLUMN IF EXISTS sandbox_api_secret,
DROP COLUMN IF EXISTS production_api_key,
DROP COLUMN IF EXISTS production_api_secret;
