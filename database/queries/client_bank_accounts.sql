-- ============================================
-- CLIENT BANK ACCOUNT QUERIES
-- ============================================
-- Manages client's bank accounts for withdrawal/off-ramp (one account per currency)
--
-- Bank Account Structure (JSONB):
-- {
--   "currency": "THB",
--   "bank_name": "Kasikorn Bank",
--   "account_number": "123-4-56789-0",
--   "account_name": "Company (Thailand) Co., Ltd.",
--   "bank_details": {
--     "swift_code": "KASITHBK",
--     "bank_code": "004",
--     "branch_code": "0001",
--     "promptpay_id": "0891234567"
--   }
-- }

-- name: UpdateClientBankAccounts :exec
-- Replace entire bank_accounts array (simpler for SQLC)
UPDATE client_organizations
SET bank_accounts = @bank_accounts::jsonb,
    updated_at = now()
WHERE id = @id;

-- name: GetClientBankAccounts :one
-- Get all bank accounts for a client
SELECT
  id,
  bank_accounts
FROM client_organizations
WHERE id = $1;

-- name: UpdateClientSupportedCurrencies :exec
-- Update supported currencies array
UPDATE client_organizations
SET supported_currencies = $2,
    updated_at = now()
WHERE id = $1;

-- name: AddSupportedCurrency :exec
-- Add a single currency to supported list
UPDATE client_organizations
SET supported_currencies = array_append(supported_currencies, $2),
    updated_at = now()
WHERE id = $1
  AND NOT ($2 = ANY(supported_currencies));

-- name: RemoveSupportedCurrency :exec
-- Remove a currency from supported list
UPDATE client_organizations
SET supported_currencies = array_remove(supported_currencies, $2),
    updated_at = now()
WHERE id = $1;
