-- ============================================
-- ADD CUSTOMER TIER TO CLIENT ORGANIZATIONS
-- ============================================
-- Migration: 000002_add_customer_tier
-- Description: Add customer_tier field for AUM tracking
-- Created: 2025-12-05

ALTER TABLE client_organizations
ADD COLUMN customer_tier VARCHAR(20);

COMMENT ON COLUMN client_organizations.customer_tier IS 'Customer AUM tier: 0-1K | 1K-10K | 10K-100K | 100K-1M | 1M+';

-- Create index for tier-based queries
CREATE INDEX idx_client_orgs_customer_tier ON client_organizations(customer_tier);
