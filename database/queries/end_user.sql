-- ============================================
-- END-USER QUERIES
-- ============================================

-- name: GetEndUser :one
SELECT * FROM end_users
WHERE id = $1 LIMIT 1;

-- name: GetEndUserByClientAndUserID :one
SELECT * FROM end_users
WHERE client_id = $1
  AND user_id = $2
LIMIT 1;

-- name: ListEndUsers :many
SELECT * FROM end_users
WHERE client_id = $1
ORDER BY created_at DESC
LIMIT $2 OFFSET $3;

-- name: ListActiveEndUsers :many
SELECT * FROM end_users
WHERE client_id = $1
  AND is_active = true
ORDER BY created_at DESC;

-- name: CreateEndUser :one
INSERT INTO end_users (
  client_id,
  user_id,
  user_type,
  user_wallet_address,
  is_active,
  status,
  environment
) VALUES (
  $1, $2, $3, $4, $5, $6, $7
)
RETURNING *;

-- name: UpdateEndUser :one
UPDATE end_users
SET user_wallet_address = COALESCE(sqlc.narg('user_wallet_address'), user_wallet_address),
    is_active = COALESCE(sqlc.narg('is_active'), is_active),
    updated_at = now()
WHERE id = $1
RETURNING *;

-- name: UpdateEndUserDepositTimestamp :exec
UPDATE end_users
SET last_deposit_at = now(),
    updated_at = now()
WHERE id = $1;

-- name: UpdateEndUserWithdrawalTimestamp :exec
UPDATE end_users
SET last_withdrawal_at = now(),
    updated_at = now()
WHERE id = $1;

-- name: SetFirstDeposit :exec
UPDATE end_users
SET first_deposit_at = COALESCE(first_deposit_at, now()),
    last_deposit_at = now(),
    updated_at = now()
WHERE id = $1;

-- name: ActivateEndUser :exec
UPDATE end_users
SET is_active = true,
    updated_at = now()
WHERE id = $1;

-- name: DeactivateEndUser :exec
UPDATE end_users
SET is_active = false,
    updated_at = now()
WHERE id = $1;

-- name: UpdateEndUserStatus :one
UPDATE end_users
SET status = $2,
    updated_at = now()
WHERE id = $1
RETURNING *;

-- name: DeleteEndUser :exec
DELETE FROM end_users
WHERE id = $1;

-- ============================================
-- END-USER ANALYTICS
-- ============================================

-- name: GetEndUserPortfolio :one
-- Complete portfolio summary for an end-user
SELECT
  eu.id,
  eu.user_id,
  eu.client_id,
  eu.user_type,
  eu.first_deposit_at,
  eu.last_deposit_at,
  eu.last_withdrawal_at,
  COUNT(DISTINCT euv.id) AS total_vaults,
  COALESCE(SUM(euv.total_deposited), 0) AS total_deposited,
  COALESCE(SUM(euv.total_withdrawn), 0) AS total_withdrawn,
  COALESCE(SUM(euv.shares * cv.current_index / 1000000000000000000), 0) AS total_effective_balance,
  COALESCE(SUM((euv.shares * cv.current_index / 1000000000000000000) - euv.total_deposited), 0) AS total_yield_earned
FROM end_users eu
LEFT JOIN end_user_vaults euv ON eu.id = euv.end_user_id AND euv.is_active = true
LEFT JOIN client_vaults cv
  ON euv.client_id = cv.client_id
  AND euv.chain = cv.chain
  AND euv.token_address = cv.token_address
WHERE eu.id = $1
GROUP BY eu.id;

-- name: ListEndUsersWithBalances :many
-- Get all end-users for a client with their total balances
SELECT
  eu.id,
  eu.user_id,
  eu.user_type,
  eu.is_active,
  eu.first_deposit_at,
  eu.last_deposit_at,
  COALESCE(SUM(euv.shares * cv.current_index / 1000000000000000000), 0) AS total_balance,
  COALESCE(SUM(euv.total_deposited), 0) AS total_deposited,
  COALESCE(SUM((euv.shares * cv.current_index / 1000000000000000000) - euv.total_deposited), 0) AS total_yield
FROM end_users eu
LEFT JOIN end_user_vaults euv ON eu.id = euv.end_user_id AND euv.is_active = true
LEFT JOIN client_vaults cv
  ON euv.client_id = cv.client_id
  AND euv.chain = cv.chain
  AND euv.token_address = cv.token_address
WHERE eu.client_id = $1
GROUP BY eu.id
ORDER BY total_balance DESC
LIMIT $2 OFFSET $3;
