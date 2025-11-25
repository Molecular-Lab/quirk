-- ============================================
-- PROXIFY B2B PLATFORM - ROLLBACK PRIVY NORMALIZATION
-- ============================================
-- Migration: 000002_normalize_privy_accounts (DOWN)
-- Description: Reverse the privy_accounts normalization
-- Created: 2025-11-23

-- ============================================
-- Step 1: Add old columns back to client_organizations
-- ============================================
ALTER TABLE client_organizations
ADD COLUMN privy_organization_id VARCHAR(255),
ADD COLUMN privy_wallet_address VARCHAR(66),
ADD COLUMN wallet_managed_by VARCHAR(50);

-- ============================================
-- Step 2: Restore data from privy_accounts
-- ============================================
UPDATE client_organizations co
SET
    privy_organization_id = pa.privy_organization_id,
    privy_wallet_address = pa.privy_wallet_address,
    wallet_managed_by = CASE
        WHEN pa.wallet_type = 'custodial' THEN 'proxify'
        ELSE 'client'
    END
FROM privy_accounts pa
WHERE co.privy_account_id = pa.id;

-- ============================================
-- Step 3: Recreate constraints
-- ============================================
ALTER TABLE client_organizations
ALTER COLUMN privy_organization_id SET NOT NULL;

CREATE INDEX idx_client_orgs_privy_org_id ON client_organizations(privy_organization_id);

-- ============================================
-- Step 4: Drop privy_account_id column
-- ============================================
ALTER TABLE client_organizations
DROP COLUMN privy_account_id;

-- ============================================
-- Step 5: Drop indexes
-- ============================================
DROP INDEX IF EXISTS idx_client_orgs_privy_account;

-- ============================================
-- Step 6: Drop privy_accounts table
-- ============================================
DROP TABLE IF EXISTS privy_accounts CASCADE;
