-- ============================================
-- Add Currency Configuration Support
-- ============================================
-- Migration: 000002_add_currency_config
-- Description: Add currency and bank account support for multi-currency on/off-ramp
-- Created: 2025-11-26

-- ============================================
-- 1. ADD CURRENCY FIELDS TO CLIENT_ORGANIZATIONS
-- ============================================

-- Supported currencies for deposits (array of currency codes)
ALTER TABLE client_organizations
ADD COLUMN supported_currencies TEXT[] DEFAULT '{}';

-- Bank accounts for off-ramp withdrawals (JSONB array)
ALTER TABLE client_organizations
ADD COLUMN bank_accounts JSONB DEFAULT '[]';

-- Index for querying by supported currency
CREATE INDEX idx_client_orgs_supported_currencies
ON client_organizations USING GIN(supported_currencies);

-- Index for querying bank accounts
CREATE INDEX idx_client_orgs_bank_accounts
ON client_organizations USING GIN(bank_accounts);

COMMENT ON COLUMN client_organizations.supported_currencies IS 'Array of currency codes client accepts for deposits (e.g., [''SGD'', ''THB'', ''USD''])';
COMMENT ON COLUMN client_organizations.bank_accounts IS 'Array of bank account objects for off-ramp: [{currency, bankName, accountNumber, accountName, swiftCode, ...}]';

-- ============================================
-- 2. VALIDATE DEPOSIT CURRENCY CONSTRAINT
-- ============================================

-- Add check to ensure currency field in deposit_transactions uses valid ISO codes
ALTER TABLE deposit_transactions
ADD CONSTRAINT chk_deposit_currency
CHECK (currency IN ('SGD', 'USD', 'EUR', 'THB', 'TWD', 'KRW', 'JPY', 'CNY', 'HKD', 'MYR', 'IDR', 'PHP', 'VND'));

COMMENT ON CONSTRAINT chk_deposit_currency ON deposit_transactions IS 'Validates deposit currency is a supported fiat currency code';

-- ============================================
-- 3. ADD INDEXES FOR CURRENCY QUERIES
-- ============================================

-- Index for querying deposits by currency
CREATE INDEX idx_deposit_transactions_currency
ON deposit_transactions(currency)
WHERE status = 'completed';

-- Index for querying deposits by client and currency
CREATE INDEX idx_deposit_transactions_client_currency
ON deposit_transactions(client_id, currency, status);

COMMENT ON INDEX idx_deposit_transactions_currency IS 'Fast lookup of completed deposits by currency';
COMMENT ON INDEX idx_deposit_transactions_client_currency IS 'Fast lookup of client deposits by currency and status';
