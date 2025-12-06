-- ============================================
-- CLIENT ORGANIZATION QUERIES
-- ============================================

-- name: GetClient :one
SELECT
  co.*,
  pa.privy_organization_id,
  pa.privy_wallet_address,
  pa.privy_email,
  pa.wallet_type AS privy_wallet_type
FROM client_organizations co
JOIN privy_accounts pa ON co.privy_account_id = pa.id
WHERE co.id = $1
LIMIT 1;

-- name: GetClientByProductID :one
SELECT
  co.*,
  pa.privy_organization_id,
  pa.privy_wallet_address,
  pa.privy_email,
  pa.wallet_type AS privy_wallet_type
FROM client_organizations co
JOIN privy_accounts pa ON co.privy_account_id = pa.id
WHERE co.product_id = $1
LIMIT 1;

-- name: GetClientsByPrivyOrgID :many
SELECT
  co.*,
  pa.privy_organization_id,
  pa.privy_wallet_address,
  pa.privy_email,
  pa.wallet_type AS privy_wallet_type
FROM client_organizations co
JOIN privy_accounts pa ON co.privy_account_id = pa.id
WHERE pa.privy_organization_id = $1;

-- name: GetClientByAPIKeyPrefix :one
-- For API key validation (then verify hash)
SELECT
  co.*,
  pa.privy_organization_id,
  pa.privy_wallet_address,
  pa.privy_email,
  pa.wallet_type AS privy_wallet_type
FROM client_organizations co
JOIN privy_accounts pa ON co.privy_account_id = pa.id
WHERE co.api_key_prefix = $1
LIMIT 1;

-- name: GetClientByAPIKeyHash :one
-- Direct lookup by API key hash
SELECT
  co.*,
  pa.privy_organization_id,
  pa.privy_wallet_address,
  pa.privy_email,
  pa.wallet_type AS privy_wallet_type
FROM client_organizations co
JOIN privy_accounts pa ON co.privy_account_id = pa.id
WHERE co.api_key_hash = $1
LIMIT 1;

-- name: ListClients :many
SELECT
  co.*,
  pa.privy_organization_id,
  pa.privy_wallet_address,
  pa.privy_email,
  pa.wallet_type AS privy_wallet_type
FROM client_organizations co
JOIN privy_accounts pa ON co.privy_account_id = pa.id
ORDER BY co.created_at DESC
LIMIT $1 OFFSET $2;

-- name: ListActiveClients :many
SELECT
  co.*,
  pa.privy_organization_id,
  pa.privy_wallet_address,
  pa.privy_email,
  pa.wallet_type AS privy_wallet_type
FROM client_organizations co
JOIN privy_accounts pa ON co.privy_account_id = pa.id
WHERE co.is_active = true
ORDER BY co.created_at DESC;

-- name: CreateClient :one
INSERT INTO client_organizations (
  privy_account_id,
  product_id,
  company_name,
  business_type,
  description,
  website_url,
  customer_tier,
  api_key_hash,
  api_key_prefix,
  webhook_urls,
  webhook_secret,
  custom_strategy,
  end_user_yield_portion,
  platform_fee,
  performance_fee,
  is_active,
  is_sandbox,
  supported_currencies,
  bank_accounts
) VALUES (
  $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
  $11, $12, $13, $14, $15, $16, $17, $18, $19
)
RETURNING *;

-- name: UpdateClient :one
UPDATE client_organizations
SET company_name = COALESCE(sqlc.narg('company_name'), company_name),
    business_type = COALESCE(sqlc.narg('business_type'), business_type),
    description = COALESCE(sqlc.narg('description'), description),
    website_url = COALESCE(sqlc.narg('website_url'), website_url),
    customer_tier = COALESCE(sqlc.narg('customer_tier'), customer_tier),
    webhook_urls = COALESCE(sqlc.narg('webhook_urls'), webhook_urls),
    webhook_secret = COALESCE(sqlc.narg('webhook_secret'), webhook_secret),
    custom_strategy = COALESCE(sqlc.narg('custom_strategy'), custom_strategy),
    end_user_yield_portion = COALESCE(sqlc.narg('end_user_yield_portion'), end_user_yield_portion),
    platform_fee = COALESCE(sqlc.narg('platform_fee'), platform_fee),
    performance_fee = COALESCE(sqlc.narg('performance_fee'), performance_fee),
    updated_at = now()
WHERE id = $1
RETURNING *;

-- name: UpdateClientAPIKey :exec
UPDATE client_organizations
SET api_key_hash = $2,
    api_key_prefix = $3,
    updated_at = now()
WHERE id = $1;

-- name: ActivateClient :exec
UPDATE client_organizations
SET is_active = true,
    updated_at = now()
WHERE id = $1;

-- name: DeactivateClient :exec
UPDATE client_organizations
SET is_active = false,
    updated_at = now()
WHERE id = $1;

-- name: DeleteClient :exec
DELETE FROM client_organizations
WHERE id = $1;

-- ============================================
-- CLIENT BALANCE QUERIES
-- ============================================

-- name: GetClientBalance :one
SELECT * FROM client_balances
WHERE client_id = $1 LIMIT 1;

-- name: GetClientBalanceForUpdate :one
-- Use in transactions to lock the balance row
SELECT * FROM client_balances
WHERE client_id = $1
FOR UPDATE
LIMIT 1;

-- name: CreateClientBalance :one
INSERT INTO client_balances (
  client_id,
  available,
  reserved,
  currency
) VALUES (
  $1, $2, $3, $4
)
RETURNING *;

-- name: AddToAvailableBalance :exec
UPDATE client_balances
SET available = available + $2,
    last_topup_at = now(),
    updated_at = now()
WHERE client_id = $1;

-- name: ReserveBalance :exec
-- Move from available to reserved
UPDATE client_balances
SET available = available - $2,
    reserved = reserved + $2,
    updated_at = now()
WHERE client_id = $1
  AND available >= $2;  -- Ensure sufficient balance

-- name: ReleaseReservedBalance :exec
-- Move from reserved back to available (e.g., transaction cancelled)
UPDATE client_balances
SET reserved = reserved - $2,
    available = available + $2,
    updated_at = now()
WHERE client_id = $1
  AND reserved >= $2;

-- name: DeductFromAvailable :exec
-- Direct deduction from available balance
UPDATE client_balances
SET available = available - $2,
    updated_at = now()
WHERE client_id = $1
  AND available >= $2;

-- name: DeductReservedBalance :exec
-- Remove from reserved (transaction completed)
UPDATE client_balances
SET reserved = reserved - $2,
    updated_at = now()
WHERE client_id = $1
  AND reserved >= $2;

-- ============================================
-- CLIENT ANALYTICS
-- ============================================

-- name: GetClientStats :one
-- Complete client statistics
SELECT
  c.id,
  c.product_id,
  c.company_name,
  c.is_active,
  c.created_at,
  cb.available AS balance_available,
  cb.reserved AS balance_reserved,
  COUNT(DISTINCT eu.id) AS total_end_users,
  COUNT(DISTINCT cv.id) AS total_vaults,
  COALESCE(SUM(cv.total_staked_balance), 0) AS total_aum,
  COALESCE(SUM(cv.cumulative_yield), 0) AS total_yield_earned,
  COUNT(DISTINCT dt.id) FILTER (WHERE dt.status = 'completed') AS total_deposits,
  COUNT(DISTINCT wt.id) FILTER (WHERE wt.status = 'completed') AS total_withdrawals
FROM client_organizations c
LEFT JOIN client_balances cb ON c.id = cb.client_id
LEFT JOIN end_users eu ON c.id = eu.client_id AND eu.is_active = true
LEFT JOIN client_vaults cv ON c.id = cv.client_id AND cv.is_active = true
LEFT JOIN deposit_transactions dt ON c.id = dt.client_id
LEFT JOIN withdrawal_transactions wt ON c.id = wt.client_id
WHERE c.id = $1
GROUP BY c.id, cb.available, cb.reserved;
