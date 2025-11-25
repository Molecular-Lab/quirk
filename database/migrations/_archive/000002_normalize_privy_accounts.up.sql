-- ============================================
-- PROXIFY B2B PLATFORM - NORMALIZE PRIVY ACCOUNTS
-- ============================================
-- Migration: 000002_normalize_privy_accounts
-- Description: Separate Privy identity from organization data
--              Enables one Privy user to have multiple organizations
-- Created: 2025-11-23

-- ============================================
-- Step 1: Create privy_accounts table
-- ============================================
CREATE TABLE privy_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Privy Identity (UNIQUE per user)
    privy_organization_id VARCHAR(255) UNIQUE NOT NULL,
    privy_wallet_address VARCHAR(66) UNIQUE NOT NULL,
    privy_email VARCHAR(255),
    wallet_type VARCHAR(20) NOT NULL CHECK (wallet_type IN ('custodial', 'non-custodial')),

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_privy_accounts_org_id ON privy_accounts(privy_organization_id);
CREATE INDEX idx_privy_accounts_wallet ON privy_accounts(privy_wallet_address);

COMMENT ON TABLE privy_accounts IS 'One row per Privy user account (identity layer)';
COMMENT ON COLUMN privy_accounts.privy_organization_id IS 'Privy user ID (unique per user)';
COMMENT ON COLUMN privy_accounts.wallet_type IS 'custodial (Privy managed) | non-custodial (user managed)';

-- ============================================
-- Step 2: Add privy_account_id to client_organizations
-- ============================================
ALTER TABLE client_organizations
ADD COLUMN privy_account_id UUID REFERENCES privy_accounts(id);

-- ============================================
-- Step 3: Migrate existing data
-- ============================================
-- For each unique privy_org_id in client_organizations, create privy_account
INSERT INTO privy_accounts (
    privy_organization_id,
    privy_wallet_address,
    privy_email,
    wallet_type,
    created_at
)
SELECT DISTINCT
    privy_organization_id,
    privy_wallet_address,
    NULL as privy_email, -- Not stored in old schema
    wallet_type,
    MIN(created_at) as created_at
FROM client_organizations
WHERE privy_organization_id IS NOT NULL
GROUP BY privy_organization_id, privy_wallet_address, wallet_type;

-- ============================================
-- Step 4: Update client_organizations with FK
-- ============================================
UPDATE client_organizations co
SET privy_account_id = pa.id
FROM privy_accounts pa
WHERE co.privy_organization_id = pa.privy_organization_id;

-- ============================================
-- Step 5: Remove old columns from client_organizations
-- ============================================
ALTER TABLE client_organizations
DROP COLUMN privy_organization_id,
DROP COLUMN privy_wallet_address,
DROP COLUMN wallet_type,  -- IMPORTANT: Remove to avoid duplicate in JOIN
DROP COLUMN wallet_managed_by;

-- ============================================
-- Step 6: Make privy_account_id NOT NULL
-- ============================================
ALTER TABLE client_organizations
ALTER COLUMN privy_account_id SET NOT NULL;

-- ============================================
-- Step 7: Update indexes
-- ============================================
CREATE INDEX idx_client_orgs_privy_account ON client_organizations(privy_account_id);

-- Drop old index if it exists
DROP INDEX IF EXISTS idx_client_orgs_privy_org_id;

-- ============================================
-- Step 8: Update comments
-- ============================================
COMMENT ON TABLE client_organizations IS 'Product organizations - multiple per Privy user (e.g., GrabPay, GrabFood)';
COMMENT ON COLUMN client_organizations.product_id IS 'Primary public identifier for API operations (e.g., prod_abc123)';
COMMENT ON COLUMN client_organizations.privy_account_id IS 'Foreign key to privy_accounts (one user can have many organizations)';

-- ============================================
-- Step 9: Create trigger for privy_accounts updated_at
-- ============================================
CREATE TRIGGER update_privy_accounts_updated_at
  BEFORE UPDATE ON privy_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
