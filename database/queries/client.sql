-- ============================================
-- CLIENT ORGANIZATION MANAGEMENT
-- ============================================

-- name: CreateClient :one
-- Creates a new client organization (called after Privy registration)
INSERT INTO client_organizations (
  privy_account_id,
  product_id,
  company_name,
  business_type,
  description,
  website_url
)
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING *;

-- name: GetClient :one
-- Retrieve client by internal UUID
SELECT
  co.*,
  pa.privy_wallet_address,
  pa.privy_organization_id,
  pa.wallet_type
FROM client_organizations co
JOIN privy_accounts pa ON co.privy_account_id = pa.id
WHERE co.id = $1;

-- name: GetClientByProductId :one
-- Retrieve client by product_id (used in API calls)
SELECT
  co.id,
  co.privy_account_id,
  co.product_id,
  co.company_name,
  co.business_type,
  co.description,
  co.website_url,
  SUBSTRING(co.sandbox_api_key, 1, 20) AS sandbox_api_key_prefix,
  SUBSTRING(co.production_api_key, 1, 20) AS production_api_key_prefix,
  co.webhook_urls,
  co.webhook_secret,
  co.custom_strategy,
  co.client_revenue_share_percent,
  co.platform_fee_percent,
  co.performance_fee,
  co.supported_currencies,
  co.bank_accounts,
  co.strategies_preferences,
  co.strategies_customization,
  co.is_active,
  co.is_sandbox,
  co.created_at,
  co.updated_at,
  pa.privy_wallet_address,
  pa.privy_organization_id,
  pa.wallet_type
FROM client_organizations co
JOIN privy_accounts pa ON co.privy_account_id = pa.id
WHERE co.product_id = $1;

-- name: GetClientByPrivyOrgId :one
-- Retrieve client by Privy organization ID
SELECT co.* FROM client_organizations co
JOIN privy_accounts pa ON co.privy_account_id = pa.id
WHERE pa.privy_organization_id = $1
LIMIT 1;

-- name: GetAllClientsByPrivyOrgId :many
-- Retrieve ALL organizations for a Privy user (for aggregation)
SELECT
  co.*,
  SUBSTRING(co.sandbox_api_key, 1, 20) AS sandbox_api_key_prefix,
  SUBSTRING(co.production_api_key, 1, 20) AS production_api_key_prefix,
  pa.privy_organization_id,
  pa.wallet_type
FROM client_organizations co
JOIN privy_accounts pa ON co.privy_account_id = pa.id
WHERE pa.privy_organization_id = $1
  AND co.is_active = true
ORDER BY co.created_at DESC;

-- name: ListClients :many
-- List all clients with pagination
SELECT * FROM client_organizations
WHERE is_active = true
ORDER BY created_at DESC
LIMIT $1 OFFSET $2;

-- name: UpdateClient :one
-- Update client details
UPDATE client_organizations
SET
  company_name = COALESCE(sqlc.narg('company_name'), company_name),
  description = COALESCE(sqlc.narg('description'), description),
  website_url = COALESCE(sqlc.narg('website_url'), website_url),
  updated_at = now()
WHERE id = $1
RETURNING *;

-- name: UpdateClientByProductId :one
-- Update client details by product_id
UPDATE client_organizations
SET
  company_name = COALESCE(sqlc.narg('company_name'), company_name),
  description = COALESCE(sqlc.narg('description'), description),
  website_url = COALESCE(sqlc.narg('website_url'), website_url),
  updated_at = now()
WHERE product_id = $1
RETURNING *;

-- name: IncrementEndUserCount :exec
-- Increment total end-user count when new user is created
UPDATE client_organizations
SET
  total_end_users = total_end_users + 1,
  updated_at = now()
WHERE id = $1;

-- name: DecrementEndUserCount :exec
-- Decrement total end-user count when user is deactivated
UPDATE client_organizations
SET
  total_end_users = GREATEST(0, total_end_users - 1),
  updated_at = now()
WHERE id = $1;

-- name: DeactivateClient :exec
-- Soft delete a client
UPDATE client_organizations
SET is_active = false, updated_at = now()
WHERE id = $1;

-- name: ActivateClient :exec
-- Reactivate a client
UPDATE client_organizations
SET is_active = true, updated_at = now()
WHERE id = $1;

-- name: DeleteClient :exec
-- Hard delete a client (use with caution - prefer DeactivateClient)
DELETE FROM client_organizations
WHERE id = $1;

-- ============================================
-- API KEY MANAGEMENT (Sandbox + Production)
-- ============================================

-- name: StoreEnvironmentAPIKeys :one
-- Store both sandbox and production API keys during client creation
UPDATE client_organizations
SET
  sandbox_api_key = $2,
  sandbox_api_secret = $3,
  production_api_key = $4,
  production_api_secret = $5,
  updated_at = now()
WHERE id = $1
RETURNING *;

-- name: GetClientBySandboxAPIKey :one
-- Get client by sandbox API key hash (for sandbox mode authentication)
-- NOTE: Used for direct hash lookup (not for bcrypt validation flow)
SELECT
  co.*,
  pa.privy_wallet_address,
  pa.privy_organization_id,
  pa.wallet_type
FROM client_organizations co
LEFT JOIN privy_accounts pa ON co.privy_account_id = pa.id
WHERE co.sandbox_api_key = $1 AND co.is_active = true;

-- name: GetClientByProductionAPIKey :one
-- Get client by production API key hash (for production mode authentication)
-- NOTE: Used for direct hash lookup (not for bcrypt validation flow)
SELECT
  co.*,
  pa.privy_wallet_address,
  pa.privy_organization_id,
  pa.wallet_type
FROM client_organizations co
LEFT JOIN privy_accounts pa ON co.privy_account_id = pa.id
WHERE co.production_api_key = $1 AND co.is_active = true;

-- name: GetClientBySandboxAPIKeyPrefix :one
-- Get client by sandbox API key prefix (for bcrypt validation flow)
-- Step 1: Look up by prefix, Step 2: Verify raw key against stored hash
SELECT
  co.*,
  pa.privy_wallet_address,
  pa.privy_organization_id,
  pa.wallet_type
FROM client_organizations co
LEFT JOIN privy_accounts pa ON co.privy_account_id = pa.id
WHERE co.sandbox_api_secret = $1 AND co.is_active = true;

-- name: GetClientByProductionAPIKeyPrefix :one
-- Get client by production API key prefix (for bcrypt validation flow)
-- Step 1: Look up by prefix, Step 2: Verify raw key against stored hash
SELECT
  co.*,
  pa.privy_wallet_address,
  pa.privy_organization_id,
  pa.wallet_type
FROM client_organizations co
LEFT JOIN privy_accounts pa ON co.privy_account_id = pa.id
WHERE co.production_api_secret = $1 AND co.is_active = true;

-- name: RegenerateSandboxAPIKey :one
-- Regenerate sandbox API key
UPDATE client_organizations
SET
  sandbox_api_key = $2,
  sandbox_api_secret = $3,
  updated_at = now()
WHERE id = $1
RETURNING *;

-- name: RegenerateProductionAPIKey :one
-- Regenerate production API key
UPDATE client_organizations
SET
  production_api_key = $2,
  production_api_secret = $3,
  updated_at = now()
WHERE id = $1
RETURNING *;

-- ============================================
-- WEBHOOK CONFIGURATION
-- ============================================

-- name: UpdateWebhookConfig :one
-- Update webhook URLs and secret
UPDATE client_organizations
SET
  webhook_urls = $2,
  webhook_secret = $3,
  updated_at = now()
WHERE id = $1
RETURNING webhook_urls, webhook_secret;

-- ============================================
-- STRATEGY CONFIGURATION
-- ============================================

-- name: UpdateCustomStrategy :one
-- Update client's custom yield strategy
UPDATE client_organizations
SET
  custom_strategy = $2,
  updated_at = now()
WHERE id = $1
RETURNING custom_strategy;

-- name: GetProductStrategiesPreferences :one
-- Get product-level strategy preferences (AI Agent: Conservative, Moderate, Morpho, Custom)
SELECT
  strategies_preferences,
  strategies_customization
FROM client_organizations
WHERE product_id = $1;

-- name: UpdateProductStrategiesPreferencesByProductID :one
-- Update product-level strategy preferences
UPDATE client_organizations
SET
  strategies_preferences = $2,
  updated_at = now()
WHERE product_id = $1
RETURNING strategies_preferences;

-- name: GetProductStrategiesCustomization :one
-- Get product-level custom strategy allocations
SELECT strategies_customization
FROM client_organizations
WHERE product_id = $1;

-- name: UpdateProductCustomizationByProductID :one
-- Update product-level custom strategy allocations
UPDATE client_organizations
SET
  strategies_customization = $2,
  updated_at = now()
WHERE product_id = $1
RETURNING strategies_customization;

-- ============================================
-- CLIENT BALANCES (Platform-side ledger)
-- ============================================

-- name: GetClientBalance :one
-- Retrieve client balance
SELECT * FROM client_balances
WHERE client_id = $1;

-- name: CreateClientBalance :one
-- Initialize balance record for a new client
INSERT INTO client_balances (
  client_id,
  available,
  reserved,
  currency
)
VALUES ($1, $2, $3, $4)
RETURNING *;

-- name: AddToAvailableBalance :exec
-- Add to available balance (e.g., after off-ramp)
UPDATE client_balances
SET available = available + $2,
    updated_at = now()
WHERE client_id = $1;

-- name: ReserveBalance :exec
-- Move from available to reserved (e.g., withdrawal request)
UPDATE client_balances
SET available = available - $2,
    reserved = reserved + $2,
    updated_at = now()
WHERE client_id = $1
  AND available >= $2;

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
-- WALLET STAGE BALANCES (idle_balance, earning_balance)
-- ============================================

-- name: AddToClientIdleBalance :exec
-- Add amount to product's idle balance after on-ramp
UPDATE client_organizations
SET
  idle_balance = idle_balance + $2,
  updated_at = now()
WHERE id = $1;

-- name: MoveClientIdleToEarning :exec
-- Move funds from idle to earning balance (when staking)
UPDATE client_organizations
SET
  idle_balance = idle_balance - $2,
  earning_balance = earning_balance + $2,
  updated_at = now()
WHERE id = $1
  AND idle_balance >= $2;

-- name: MoveClientEarningToIdle :exec
-- Move funds from earning to idle balance (when unstaking)
UPDATE client_organizations
SET
  earning_balance = earning_balance - $2,
  idle_balance = idle_balance + $2,
  updated_at = now()
WHERE id = $1
  AND earning_balance >= $2;

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

-- ============================================
-- REVENUE & FEE CONFIGURATION
-- ============================================

-- name: UpdateFeeConfiguration :one
-- Update client fee percentages
UPDATE client_organizations
SET
  client_revenue_share_percent = $2,
  platform_fee_percent = $3,
  performance_fee = $4,
  updated_at = now()
WHERE id = $1
RETURNING client_revenue_share_percent, platform_fee_percent, performance_fee;

-- name: GetRevenueConfig :one
-- Get client revenue configuration
SELECT
  client_revenue_share_percent,
  platform_fee_percent,
  performance_fee
FROM client_organizations
WHERE id = $1;

-- name: GetRevenueConfigByProductID :one
-- Get client revenue configuration by product_id
SELECT
  client_revenue_share_percent,
  platform_fee_percent
FROM client_organizations
WHERE product_id = $1;

-- name: UpdateMRR :exec
-- Update Monthly Recurring Revenue tracking
UPDATE client_organizations
SET
  monthly_recurring_revenue = $2,
  annual_run_rate = $3,
  last_mrr_calculation_at = now(),
  updated_at = now()
WHERE id = $1;

-- name: GetMRRStats :one
-- Get MRR/ARR statistics
SELECT
  monthly_recurring_revenue,
  annual_run_rate,
  last_mrr_calculation_at
FROM client_organizations
WHERE id = $1;

-- name: UpdateRevenueConfigByProductID :one
-- Update client revenue share by product_id
UPDATE client_organizations
SET
  client_revenue_share_percent = $2,
  updated_at = now()
WHERE product_id = $1
RETURNING
  client_revenue_share_percent,
  platform_fee_percent;

-- ============================================
-- AGGREGATED DASHBOARD (Across All Products)
-- ============================================

-- name: GetAggregatedDashboardSummary :one
-- Aggregate dashboard metrics across ALL client organizations for a Privy user (with optional environment filter)
-- Note: This query aggregates from client_organizations which stores pre-computed metrics
-- For real-time environment filtering, the metrics should be computed from underlying tables
SELECT
  -- Company Info (use first org as representative)
  (SELECT company_name FROM client_organizations WHERE privy_account_id = pa.id LIMIT 1) AS company_name,

  -- Aggregated Balances from client_vaults (with environment filter)
  COALESCE((
    SELECT SUM(cv.pending_deposit_balance)
    FROM client_vaults cv
    JOIN client_organizations co2 ON cv.client_id = co2.id
    WHERE co2.privy_account_id = pa.id
      AND cv.is_active = true
      AND (sqlc.narg('environment')::varchar IS NULL OR cv.environment = sqlc.narg('environment')::varchar)
  ), 0) AS total_idle_balance,
  COALESCE((
    SELECT SUM(cv.total_staked_balance)
    FROM client_vaults cv
    JOIN client_organizations co2 ON cv.client_id = co2.id
    WHERE co2.privy_account_id = pa.id
      AND cv.is_active = true
      AND (sqlc.narg('environment')::varchar IS NULL OR cv.environment = sqlc.narg('environment')::varchar)
  ), 0) AS total_earning_balance,
  COALESCE(SUM(co.client_revenue_earned), 0) AS total_client_revenue,
  COALESCE(SUM(co.platform_revenue_earned), 0) AS total_platform_revenue,
  COALESCE(SUM(co.enduser_revenue_earned), 0) AS total_enduser_revenue,

  -- Aggregated Revenue Metrics
  COALESCE(SUM(co.monthly_recurring_revenue), 0) AS monthly_recurring_revenue,
  COALESCE(SUM(co.annual_run_rate), 0) AS annual_run_rate,

  -- Weighted Average Revenue Percentages
  -- Calculate weighted avg based on earning_balance as weight
  CASE
    WHEN SUM(co.earning_balance) > 0 THEN
      SUM(co.client_revenue_share_percent * co.earning_balance) / SUM(co.earning_balance)
    ELSE
      AVG(co.client_revenue_share_percent)
  END AS client_revenue_percent,

  CASE
    WHEN SUM(co.earning_balance) > 0 THEN
      SUM(co.platform_fee_percent * co.earning_balance) / SUM(co.earning_balance)
    ELSE
      AVG(co.platform_fee_percent)
  END AS platform_fee_percent,

  -- End-user fee percent = 100 - client - platform
  CASE
    WHEN SUM(co.earning_balance) > 0 THEN
      100 -
      SUM(co.client_revenue_share_percent * co.earning_balance) / SUM(co.earning_balance) -
      SUM(co.platform_fee_percent * co.earning_balance) / SUM(co.earning_balance)
    ELSE
      100 - AVG(co.client_revenue_share_percent) - AVG(co.platform_fee_percent)
  END AS enduser_fee_percent,

  -- Last calculation timestamp (most recent across all orgs)
  MAX(co.last_mrr_calculation_at) AS last_calculated_at,

  -- Aggregated End-User Metrics (with environment filter)
  COALESCE((
    SELECT COUNT(DISTINCT eu.id)
    FROM end_users eu
    JOIN client_organizations co2 ON eu.client_id = co2.id
    WHERE co2.privy_account_id = pa.id
      AND (sqlc.narg('environment')::varchar IS NULL OR eu.environment = sqlc.narg('environment')::varchar)
  ), 0) AS total_end_users,
  COALESCE((
    SELECT COUNT(DISTINCT eu.id)
    FROM end_users eu
    JOIN client_organizations co2 ON eu.client_id = co2.id
    WHERE co2.privy_account_id = pa.id
      AND eu.created_at >= NOW() - INTERVAL '30 days'
      AND (sqlc.narg('environment')::varchar IS NULL OR eu.environment = sqlc.narg('environment')::varchar)
  ), 0) AS new_users_30d,
  COALESCE((
    SELECT COUNT(DISTINCT euv.end_user_id)
    FROM end_user_vaults euv
    JOIN end_users eu ON euv.end_user_id = eu.id
    JOIN client_organizations co2 ON eu.client_id = co2.id
    WHERE co2.privy_account_id = pa.id
      AND euv.last_deposit_at >= NOW() - INTERVAL '30 days'
      AND (sqlc.narg('environment')::varchar IS NULL OR euv.environment = sqlc.narg('environment')::varchar)
  ), 0) AS active_users_30d,
  COALESCE((
    SELECT SUM(dt.fiat_amount::numeric)
    FROM deposit_transactions dt
    JOIN client_organizations co2 ON dt.client_id = co2.id
    WHERE co2.privy_account_id = pa.id
      AND dt.status = 'completed'
      AND (sqlc.narg('environment')::varchar IS NULL OR dt.environment = sqlc.narg('environment')::varchar)
  ), 0) AS total_deposited,
  COALESCE((
    SELECT SUM(wt.requested_amount::numeric)
    FROM withdrawal_transactions wt
    JOIN client_organizations co2 ON wt.client_id = co2.id
    WHERE co2.privy_account_id = pa.id
      AND wt.status = 'completed'
      AND (sqlc.narg('environment')::varchar IS NULL OR wt.environment = sqlc.narg('environment')::varchar)
  ), 0) AS total_withdrawn

FROM privy_accounts pa
LEFT JOIN client_organizations co ON pa.id = co.privy_account_id AND co.is_active = true
WHERE pa.privy_organization_id = $1
GROUP BY pa.id;
