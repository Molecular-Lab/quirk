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
SELECT * FROM client_vaults
WHERE client_id = $1
  AND chain = $2
  AND token_address = $3
LIMIT 1;

-- name: GetClientVaultByTokenForUpdate :one
-- Use in transactions to lock the vault row
SELECT * FROM client_vaults
WHERE client_id = $1
  AND chain = $2
  AND token_address = $3
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
RETURNING *;

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
-- END-USER VAULT OPERATIONS
-- ============================================

-- name: GetEndUserVault :one
SELECT * FROM end_user_vaults
WHERE id = $1 LIMIT 1;

-- name: GetEndUserVaultByToken :one
SELECT * FROM end_user_vaults
WHERE end_user_id = $1
  AND chain = $2
  AND token_address = $3
LIMIT 1;

-- name: GetEndUserVaultByTokenForUpdate :one
-- Use in transactions to lock the user vault row
SELECT * FROM end_user_vaults
WHERE end_user_id = $1
  AND chain = $2
  AND token_address = $3
FOR UPDATE
LIMIT 1;

-- name: ListEndUserVaults :many
SELECT * FROM end_user_vaults
WHERE end_user_id = $1
ORDER BY created_at DESC;

-- name: ListEndUserVaultsWithBalance :many
-- Get user vaults with effective balance calculation
SELECT
  euv.*,
  cv.current_index,
  cv.token_symbol,
  -- Effective balance = shares * current_index / 1e18
  (euv.shares * cv.current_index / 1000000000000000000) AS effective_balance,
  -- Yield earned = effective_balance - total_deposited
  ((euv.shares * cv.current_index / 1000000000000000000) - euv.total_deposited) AS yield_earned
FROM end_user_vaults euv
JOIN client_vaults cv
  ON euv.client_id = cv.client_id
  AND euv.chain = cv.chain
  AND euv.token_address = cv.token_address
WHERE euv.end_user_id = $1
  AND euv.is_active = true
ORDER BY effective_balance DESC;

-- name: GetEndUserVaultWithBalance :one
-- Get single vault with balance calculation
SELECT
  euv.*,
  cv.current_index,
  cv.token_symbol,
  cv.apy_7d,
  cv.apy_30d,
  cv.total_staked_balance,
  cv.pending_deposit_balance,
  -- Effective balance = shares * current_index / 1e18
  (euv.shares * cv.current_index / 1000000000000000000) AS effective_balance,
  -- Yield earned = effective_balance - total_deposited
  ((euv.shares * cv.current_index / 1000000000000000000) - euv.total_deposited) AS yield_earned
FROM end_user_vaults euv
JOIN client_vaults cv
  ON euv.client_id = cv.client_id
  AND euv.chain = cv.chain
  AND euv.token_address = cv.token_address
WHERE euv.end_user_id = $1
  AND euv.chain = $2
  AND euv.token_address = $3
LIMIT 1;

-- name: CreateEndUserVault :one
INSERT INTO end_user_vaults (
  end_user_id,
  client_id,
  chain,
  token_address,
  token_symbol,
  shares,
  weighted_entry_index,
  total_deposited
) VALUES (
  $1, $2, $3, $4, $5, $6, $7, $8
)
RETURNING *;

-- name: AddSharesToUserVault :exec
-- Add shares from a new deposit with weighted entry index update
UPDATE end_user_vaults
SET shares = $2,  -- new total shares
    weighted_entry_index = $3,  -- recalculated weighted entry index
    total_deposited = total_deposited + $4,  -- increment deposited amount
    last_deposit_at = now(),
    updated_at = now()
WHERE id = $1;

-- name: BurnSharesFromUserVault :exec
-- Burn shares for withdrawal
UPDATE end_user_vaults
SET shares = shares - $2,  -- shares to burn
    total_withdrawn = total_withdrawn + $3,  -- withdrawal amount
    last_withdrawal_at = now(),
    updated_at = now()
WHERE id = $1;

-- name: GetTotalSharesForVault :one
-- Verify invariant: sum of user shares == client vault total_shares
SELECT COALESCE(SUM(shares), 0) AS total_user_shares
FROM end_user_vaults
WHERE client_id = $1
  AND chain = $2
  AND token_address = $3
  AND is_active = true;

-- ============================================
-- VAULT ANALYTICS
-- ============================================

-- name: GetVaultSummary :one
-- Complete vault summary for a client
SELECT
  cv.id,
  cv.chain,
  cv.token_symbol,
  cv.current_index,
  cv.pending_deposit_balance,
  cv.total_staked_balance,
  cv.cumulative_yield,
  cv.apy_7d,
  cv.apy_30d,
  cv.total_shares,
  cv.last_index_update,
  COUNT(DISTINCT euv.end_user_id) AS total_users,
  COALESCE(SUM(euv.total_deposited), 0) AS total_user_deposits,
  COALESCE(SUM(euv.total_withdrawn), 0) AS total_user_withdrawals
FROM client_vaults cv
LEFT JOIN end_user_vaults euv
  ON cv.client_id = euv.client_id
  AND cv.chain = euv.chain
  AND cv.token_address = euv.token_address
  AND euv.is_active = true
WHERE cv.id = $1
GROUP BY cv.id;

-- name: ListTopUsersByBalance :many
-- Get top users by effective balance for a vault
SELECT
  euv.end_user_id,
  eu.user_id,
  euv.shares,
  euv.weighted_entry_index,
  euv.total_deposited,
  euv.total_withdrawn,
  (euv.shares * cv.current_index / 1000000000000000000) AS effective_balance,
  ((euv.shares * cv.current_index / 1000000000000000000) - euv.total_deposited) AS yield_earned
FROM end_user_vaults euv
JOIN end_users eu ON euv.end_user_id = eu.id
JOIN client_vaults cv
  ON euv.client_id = cv.client_id
  AND euv.chain = cv.chain
  AND euv.token_address = cv.token_address
WHERE cv.id = $1
  AND euv.is_active = true
  AND euv.shares > 0
ORDER BY effective_balance DESC
LIMIT $2;
