-- ============================================
-- ROLLBACK CUSTOMER TIER MIGRATION
-- ============================================

DROP INDEX IF EXISTS idx_client_orgs_customer_tier;

ALTER TABLE client_organizations
DROP COLUMN IF EXISTS customer_tier;
