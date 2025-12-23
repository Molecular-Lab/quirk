-- ============================================
-- VAULT QUERIES (Index-Based Accounting)
-- ============================================

-- ============================================
-- CLIENT VAULT OPERATIONS
-- ============================================

-- name: GetClientVault :one
SELECT * FROM client_vaults
WHERE id = $1 LIMIT 1;

-- name: GetClientVaultByToken :one
SELECT
  cv.*,
  COALESCE(cv.custodial_wallet_address, pa.privy_wallet_address) as custodial_wallet_address
FROM client_vaults cv
JOIN client_organizations co ON cv.client_id = co.id
JOIN privy_accounts pa ON co.privy_account_id = pa.id
WHERE cv.client_id = $1
  AND cv.chain = $2
  AND cv.token_address = $3
  AND cv.environment = $4
LIMIT 1;

-- name: GetClientVaultByTokenForUpdate :one
-- Use in transactions to lock the vault row
SELECT
  cv.*,
  COALESCE(cv.custodial_wallet_address, pa.privy_wallet_address) as custodial_wallet_address
FROM client_vaults cv
JOIN client_organizations co ON cv.client_id = co.id
JOIN privy_accounts pa ON co.privy_account_id = pa.id
WHERE cv.client_id = $1
  AND cv.chain = $2
  AND cv.token_address = $3
  AND cv.environment = $4
FOR UPDATE
LIMIT 1;

-- name: ListClientVaults :many
SELECT * FROM client_vaults
WHERE client_id = $1
ORDER BY created_at DESC;

-- name: ListClientVaultsPendingStake :many
-- Get vaults with pending deposits ready for staking
SELECT * FROM client_vaults
WHERE pending_deposit_balance >= $1  -- minimum threshold (e.g., 10000)
  AND is_active = true
ORDER BY pending_deposit_balance DESC;

-- name: CreateClientVault :one
WITH new_vault AS (
  INSERT INTO client_vaults (
    client_id,
    chain,
    token_address,
    token_symbol,
    current_index,
    total_shares,
    pending_deposit_balance,
    total_staked_balance,
    cumulative_yield,
    environment,
    custodial_wallet_address
  ) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
  )
  RETURNING *
)
SELECT
  nv.*,
  COALESCE(nv.custodial_wallet_address, pa.privy_wallet_address) as custodial_wallet_address
FROM new_vault nv
JOIN client_organizations co ON nv.client_id = co.id
JOIN privy_accounts pa ON co.privy_account_id = pa.id;

-- name: UpdateClientVaultIndex :exec
-- Update the growth index after yield accrual
UPDATE client_vaults
SET current_index = $2,
    cumulative_yield = cumulative_yield + $3,
    total_staked_balance = $4,
    last_index_update = now(),
    updated_at = now()
WHERE id = $1;

-- name: UpdateClientVaultAPY :exec
-- Update APY metrics
UPDATE client_vaults
SET apy_7d = $2,
    apy_30d = $3,
    updated_at = now()
WHERE id = $1;

-- name: ListActiveVaultsForIndexUpdate :many
-- Get all active vaults with staked balance for daily index updates
SELECT
  id,
  client_id,
  chain,
  token_symbol,
  current_index,
  total_staked_balance,
  strategies,
  last_index_update
FROM client_vaults
WHERE is_active = true
  AND total_staked_balance > 0
ORDER BY last_index_update ASC;

-- name: GetVaultHistoricalIndex :one
-- Get historical index for APY calculation
SELECT current_index, last_index_update
FROM client_vaults
WHERE id = $1
  AND last_index_update >= NOW() - INTERVAL '1 day' * sqlc.arg(days_back)
ORDER BY last_index_update ASC
LIMIT 1;

-- name: UpdateTotalStakedBalance :exec
-- Update total staked balance (after deposit/withdrawal)
UPDATE client_vaults
SET total_staked_balance = $2,
    updated_at = now()
WHERE id = $1;

-- name: AddPendingDepositToVault :exec
-- Add to pending balance and increment total shares
UPDATE client_vaults
SET pending_deposit_balance = pending_deposit_balance + $2,
    total_shares = total_shares + $3,
    updated_at = now()
WHERE id = $1;

-- name: MovePendingToStaked :exec
-- Move funds from pending to staked (after deploying to DeFi)
UPDATE client_vaults
SET pending_deposit_balance = pending_deposit_balance - $2,
    total_staked_balance = total_staked_balance + $2,
    updated_at = now()
WHERE id = $1;

-- name: ReduceStakedBalance :exec
-- Reduce staked balance and total shares (for withdrawals)
UPDATE client_vaults
SET total_staked_balance = total_staked_balance - $2,
    total_shares = total_shares - $3,
    updated_at = now()
WHERE id = $1;

-- ============================================
-- END-USER VAULT OPERATIONS (SIMPLIFIED)
-- ============================================
-- ✅ ONE vault per user per client (no chain/token tracking)
-- Backend calculates client_growth_index from all client_vaults
-- User sees: total_deposited, current_value, yield

-- name: GetEndUserVault :one
SELECT * FROM end_user_vaults
WHERE id = $1 LIMIT 1;

-- name: GetEndUserVaultByClient :one
-- Get user's vault for a specific client and environment
SELECT * FROM end_user_vaults
WHERE end_user_id = $1
  AND client_id = $2
  AND environment = $3
LIMIT 1;

-- name: GetEndUserVaultByClientForUpdate :one
-- Use in transactions to lock the user vault row
SELECT * FROM end_user_vaults
WHERE end_user_id = $1
  AND client_id = $2
  AND environment = $3
FOR UPDATE
LIMIT 1;

-- name: ListEndUserVaults :many
SELECT * FROM end_user_vaults
WHERE end_user_id = $1
ORDER BY created_at DESC;

-- name: CreateEndUserVault :one
-- Create vault on first deposit (lazy creation)
INSERT INTO end_user_vaults (
  end_user_id,
  client_id,
  total_deposited,
  weighted_entry_index,
  environment
) VALUES (
  $1, $2, $3, $4, $5
)
RETURNING *;

-- name: UpdateEndUserVaultDeposit :exec
-- Update vault on deposit (DCA support with weighted entry index)
UPDATE end_user_vaults
SET total_deposited = total_deposited + $2,  -- Add deposit amount
    weighted_entry_index = $3,  -- Recalculate weighted entry index
    last_deposit_at = now(),
    updated_at = now()
WHERE id = $1;

-- name: UpdateEndUserVaultWithdrawal :exec
-- Update vault on withdrawal
UPDATE end_user_vaults
SET total_withdrawn = total_withdrawn + $2,  -- Add withdrawal amount
    last_withdrawal_at = now(),
    updated_at = now()
WHERE id = $1;

-- ============================================
-- VAULT ANALYTICS (SIMPLIFIED)
-- ============================================

-- name: GetClientSummary :one
-- Complete client summary (aggregated across all vaults)
SELECT
  co.id,
  co.product_id,
  co.company_name,
  COUNT(DISTINCT euv.end_user_id) AS total_users,
  COALESCE(SUM(euv.total_deposited), 0) AS total_user_deposits,
  COALESCE(SUM(euv.total_withdrawn), 0) AS total_user_withdrawals
FROM client_organizations co
LEFT JOIN end_user_vaults euv
  ON co.id = euv.client_id
  AND euv.is_active = true
WHERE co.id = $1
GROUP BY co.id;

-- name: ListTopUsersByDeposit :many
-- Get top users by total deposited for a client
SELECT
  euv.end_user_id,
  eu.user_id,
  euv.total_deposited,
  euv.total_withdrawn,
  euv.weighted_entry_index,
  euv.last_deposit_at
FROM end_user_vaults euv
JOIN end_users eu ON euv.end_user_id = eu.id
WHERE euv.client_id = $1
  AND euv.is_active = true
  AND euv.total_deposited > 0
ORDER BY euv.total_deposited DESC
LIMIT $2;

-- ============================================
-- WALLET STAGES QUERIES (IDLE & EARNING BALANCES)
-- ============================================

-- name: GetVaultBalances :one
-- Get balances for a client vault
SELECT
  id,
  client_id,
  chain,
  token_symbol,
  pending_deposit_balance,
  total_staked_balance,
  cumulative_yield
FROM client_vaults
WHERE id = $1
LIMIT 1;

-- name: GetClientTotalBalances :one
-- Get aggregated balances across all vaults for a client (with optional environment filter)
SELECT
  COALESCE(SUM(pending_deposit_balance), 0) AS total_pending_balance,
  COALESCE(SUM(total_staked_balance), 0) AS total_earning_balance,
  COALESCE(SUM(cumulative_yield), 0) AS total_cumulative_yield
FROM client_vaults
WHERE client_id = $1
  AND is_active = true
  AND (sqlc.narg('environment')::varchar IS NULL OR environment = sqlc.narg('environment')::varchar);

-- name: AddToIdleBalance :exec
-- Add funds to pending balance (after on-ramp)
UPDATE client_vaults
SET pending_deposit_balance = pending_deposit_balance + $2,
    total_shares = total_shares + $3,
    updated_at = now()
WHERE id = $1;

-- name: MoveIdleToEarning :exec
-- Move funds from pending to staked balance (after staking to DeFi)
UPDATE client_vaults
SET pending_deposit_balance = pending_deposit_balance - $2,
    total_staked_balance = total_staked_balance + $2,
    updated_at = now()
WHERE id = $1
  AND pending_deposit_balance >= $2;

-- name: ReduceEarningBalance :exec
-- Reduce staked balance (after unstaking from DeFi)
UPDATE client_vaults
SET total_staked_balance = total_staked_balance - $2,
    total_shares = total_shares - $3,
    updated_at = now()
WHERE id = $1
  AND total_staked_balance >= $2;

-- name: MoveEarningToIdle :exec
-- Move funds from staked to pending balance (after unstaking, before withdrawal)
UPDATE client_vaults
SET total_staked_balance = total_staked_balance - $2,
    pending_deposit_balance = pending_deposit_balance + $2,
    updated_at = now()
WHERE id = $1
  AND total_staked_balance >= $2;

-- name: ReduceIdleBalance :exec
-- Reduce pending balance (after withdrawal)
UPDATE client_vaults
SET pending_deposit_balance = pending_deposit_balance - $2,
    updated_at = now()
WHERE id = $1
  AND pending_deposit_balance >= $2;

-- ============================================
-- REVENUE TRACKING QUERIES
-- ============================================

-- name: RecordYieldDistribution :exec
-- Record yield distribution (enduser revenue stays in staked balance)
UPDATE client_vaults
SET cumulative_yield = cumulative_yield + $2,
    total_staked_balance = total_staked_balance + $3,  -- enduser revenue stays earning
    updated_at = now()
WHERE id = $1;

-- name: GetClientRevenueSummary :one
-- Get revenue summary for a client (revenue split calculated by revenue service)
SELECT
  c.id,
  c.product_id,
  c.company_name,
  c.client_revenue_share_percent,
  c.platform_fee_percent,
  c.monthly_recurring_revenue,
  c.annual_run_rate,
  c.last_mrr_calculation_at,
  COALESCE(SUM(cv.cumulative_yield), 0) AS total_raw_yield,
  COALESCE(SUM(cv.total_staked_balance), 0) AS total_earning_balance
FROM client_organizations c
LEFT JOIN client_vaults cv ON c.id = cv.client_id AND cv.is_active = true
WHERE c.id = $1
GROUP BY c.id;

-- name: UpdateClientMRR :exec
-- Update client's Monthly Recurring Revenue and ARR
UPDATE client_organizations
SET monthly_recurring_revenue = $2,
    annual_run_rate = $2 * 12,  -- ARR = MRR × 12
    last_mrr_calculation_at = now(),
    updated_at = now()
WHERE id = $1;

-- name: ListClientsForMRRCalculation :many
-- Get clients with active earning balances for MRR calculation
SELECT
  c.id,
  c.product_id,
  c.client_revenue_share_percent,
  COALESCE(SUM(cv.total_staked_balance), 0) AS total_earning_balance,
  COALESCE(AVG(cv.apy_30d), 0) AS avg_apy_30d
FROM client_organizations c
LEFT JOIN client_vaults cv ON c.id = cv.client_id AND cv.is_active = true
WHERE c.is_active = true
GROUP BY c.id
HAVING SUM(cv.total_staked_balance) > 0;

-- ============================================
-- END-USER ACTIVITY QUERIES
-- ============================================

-- name: ListRecentEndUserTransactions :many
-- Get recent deposit/withdrawal transactions for end-users (with optional environment filter)
SELECT
  'deposit' AS transaction_type,
  dt.id,
  dt.user_id,
  dt.fiat_amount AS amount,
  dt.currency,
  dt.status,
  dt.created_at AS timestamp
FROM deposit_transactions dt
WHERE dt.client_id = $1
  AND (sqlc.narg('environment')::varchar IS NULL OR dt.environment = sqlc.narg('environment')::varchar)
UNION ALL
SELECT
  'withdrawal' AS transaction_type,
  wt.id,
  wt.user_id,
  wt.requested_amount AS amount,
  wt.currency,
  wt.status,
  wt.created_at AS timestamp
FROM withdrawal_transactions wt
WHERE wt.client_id = $1
  AND (sqlc.narg('environment')::varchar IS NULL OR wt.environment = sqlc.narg('environment')::varchar)
ORDER BY timestamp DESC
LIMIT $2 OFFSET $3;

-- name: GetEndUserGrowthMetrics :one
-- Get end-user growth metrics for a client (with optional environment filter)
SELECT
  COUNT(DISTINCT eu.id) AS total_end_users,
  COUNT(DISTINCT eu.id) FILTER (
    WHERE eu.created_at >= NOW() - INTERVAL '30 days'
  ) AS new_users_30d,
  COUNT(DISTINCT euv.end_user_id) FILTER (
    WHERE euv.last_deposit_at >= NOW() - INTERVAL '30 days'
  ) AS active_users_30d,
  COALESCE(SUM(euv.total_deposited), 0) AS total_deposited,
  COALESCE(SUM(euv.total_withdrawn), 0) AS total_withdrawn,
  COUNT(DISTINCT dt.id) FILTER (
    WHERE dt.status = 'completed'
  ) AS total_deposits,
  COUNT(DISTINCT wt.id) FILTER (
    WHERE wt.status = 'completed'
  ) AS total_withdrawals
FROM client_organizations c
LEFT JOIN end_users eu ON c.id = eu.client_id
  AND (sqlc.narg('environment')::varchar IS NULL OR eu.environment = sqlc.narg('environment')::varchar)
LEFT JOIN end_user_vaults euv ON eu.id = euv.end_user_id AND euv.is_active = true
  AND (sqlc.narg('environment')::varchar IS NULL OR euv.environment = sqlc.narg('environment')::varchar)
LEFT JOIN deposit_transactions dt ON c.id = dt.client_id
  AND (sqlc.narg('environment')::varchar IS NULL OR dt.environment = sqlc.narg('environment')::varchar)
LEFT JOIN withdrawal_transactions wt ON c.id = wt.client_id
  AND (sqlc.narg('environment')::varchar IS NULL OR wt.environment = sqlc.narg('environment')::varchar)
WHERE c.id = $1
GROUP BY c.id;
