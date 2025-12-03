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
  pa.privy_wallet_address as custodial_wallet_address
FROM client_vaults cv
JOIN client_organizations co ON cv.client_id = co.id
JOIN privy_accounts pa ON co.privy_account_id = pa.id
WHERE cv.client_id = $1
  AND cv.chain = $2
  AND cv.token_address = $3
LIMIT 1;

-- name: GetClientVaultByTokenForUpdate :one
-- Use in transactions to lock the vault row
SELECT 
  cv.*,
  pa.privy_wallet_address as custodial_wallet_address
FROM client_vaults cv
JOIN client_organizations co ON cv.client_id = co.id
JOIN privy_accounts pa ON co.privy_account_id = pa.id
WHERE cv.client_id = $1
  AND cv.chain = $2
  AND cv.token_address = $3
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
    cumulative_yield
  ) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9
  )
  RETURNING *
)
SELECT 
  nv.*,
  pa.privy_wallet_address as custodial_wallet_address
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
-- Get user's vault for a specific client
SELECT * FROM end_user_vaults
WHERE end_user_id = $1
  AND client_id = $2
LIMIT 1;

-- name: GetEndUserVaultByClientForUpdate :one
-- Use in transactions to lock the user vault row
SELECT * FROM end_user_vaults
WHERE end_user_id = $1
  AND client_id = $2
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
  weighted_entry_index
) VALUES (
  $1, $2, $3, $4
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
