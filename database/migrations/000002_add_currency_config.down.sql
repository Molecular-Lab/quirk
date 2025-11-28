-- ============================================
-- Rollback Currency Configuration
-- ============================================
-- Migration: 000002_add_currency_config (DOWN)
-- Description: Remove currency and bank account fields
-- Created: 2025-11-26

-- Drop indexes
DROP INDEX IF EXISTS idx_deposit_transactions_client_currency;
DROP INDEX IF EXISTS idx_deposit_transactions_currency;
DROP INDEX IF EXISTS idx_client_orgs_bank_accounts;
DROP INDEX IF EXISTS idx_client_orgs_supported_currencies;

-- Remove constraint
ALTER TABLE deposit_transactions
DROP CONSTRAINT IF EXISTS chk_deposit_currency;

-- Remove columns from client_organizations
ALTER TABLE client_organizations
DROP COLUMN IF EXISTS bank_accounts;

ALTER TABLE client_organizations
DROP COLUMN IF EXISTS supported_currencies;
