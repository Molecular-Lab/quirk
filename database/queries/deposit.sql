-- ============================================
-- DEPOSIT TRANSACTION QUERIES
-- ============================================

-- name: GetDeposit :one
SELECT * FROM deposit_transactions
WHERE id = $1 LIMIT 1;

-- name: GetDepositByOrderID :one
SELECT * FROM deposit_transactions
WHERE order_id = $1 LIMIT 1;

-- name: GetDepositByGatewayOrderID :one
SELECT * FROM deposit_transactions
WHERE gateway_order_id = $1 LIMIT 1;

-- name: GetDepositByOrderIDForUpdate :one
-- Use in transactions to lock the deposit row
SELECT * FROM deposit_transactions
WHERE order_id = $1
FOR UPDATE
LIMIT 1;

-- name: ListDeposits :many
SELECT * FROM deposit_transactions
WHERE client_id = $1
ORDER BY created_at DESC
LIMIT $2 OFFSET $3;

-- name: ListDepositsByUser :many
SELECT * FROM deposit_transactions
WHERE client_id = $1
  AND user_id = $2
ORDER BY created_at DESC
LIMIT $3 OFFSET $4;

-- name: ListDepositsByStatus :many
SELECT * FROM deposit_transactions
WHERE client_id = $1
  AND status = $2
ORDER BY created_at DESC
LIMIT $3 OFFSET $4;

-- name: ListPendingDeposits :many
-- Get pending deposits that haven't expired for a specific client
SELECT * FROM deposit_transactions
WHERE status = 'pending'
  AND client_id = $1
  AND (expires_at IS NULL OR expires_at > now())
ORDER BY created_at ASC;

-- name: ListExpiredDeposits :many
-- Get pending deposits that have expired
SELECT * FROM deposit_transactions
WHERE status = 'pending'
  AND expires_at <= now()
ORDER BY created_at ASC
LIMIT $1;

-- name: CreateDeposit :one
INSERT INTO deposit_transactions (
  order_id,
  client_id,
  user_id,
  deposit_type,
  payment_method,
  fiat_amount,
  crypto_amount,
  currency,
  crypto_currency,
  gateway_fee,
  proxify_fee,
  network_fee,
  total_fees,
  status,
  payment_url,
  gateway_order_id,
  client_balance_id,
  deducted_from_client,
  wallet_address,
  expires_at,
  payment_instructions,
  chain,
  token_symbol,
  token_address,
  on_ramp_provider,
  qr_code,
  environment,
  network,
  oracle_address
) VALUES (
  $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
  $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
  $21, $22, $23, $24, $25, $26, $27, $28, $29
)
RETURNING *;

-- name: UpdateDepositGatewayInfo :exec
-- Update after initiating external payment
UPDATE deposit_transactions
SET payment_url = $2,
    gateway_order_id = $3,
    updated_at = now()
WHERE id = $1;

-- name: CompleteDeposit :one
-- Mark deposit as completed
UPDATE deposit_transactions
SET status = 'completed',
    crypto_amount = COALESCE(sqlc.narg('crypto_amount'), crypto_amount),
    gateway_fee = COALESCE(sqlc.narg('gateway_fee'), gateway_fee),
    proxify_fee = COALESCE(sqlc.narg('proxify_fee'), proxify_fee),
    network_fee = COALESCE(sqlc.narg('network_fee'), network_fee),
    total_fees = COALESCE(sqlc.narg('total_fees'), total_fees),
    transaction_hash = COALESCE(sqlc.narg('transaction_hash'), transaction_hash),
    completed_at = now()
WHERE id = $1
RETURNING *;

-- name: CompleteDepositByOrderID :one
-- Mark deposit as completed by order_id (for Operations Dashboard)
UPDATE deposit_transactions
SET status = 'completed',
    crypto_amount = $2,
    transaction_hash = $3,
    completed_at = now()
WHERE order_id = $1
RETURNING *;

-- name: FailDeposit :exec
-- Mark deposit as failed
UPDATE deposit_transactions
SET status = 'failed',
    error_message = $2,
    error_code = $3,
    failed_at = now()
WHERE id = $1;

-- name: ExpireDeposit :exec
-- Mark deposit as expired
UPDATE deposit_transactions
SET status = 'expired'
WHERE id = $1;

-- name: UpdateTransactionHash :exec
-- Update transaction hash for a deposit (after blockchain mint)
UPDATE deposit_transactions
SET transaction_hash = $2,
    updated_at = now()
WHERE order_id = $1;

-- ============================================
-- DEPOSIT BATCH QUEUE QUERIES
-- ============================================

-- name: GetDepositQueueItem :one
SELECT * FROM deposit_batch_queue
WHERE id = $1 LIMIT 1;

-- name: ListPendingDepositQueue :many
-- Get deposits waiting to be batched
SELECT * FROM deposit_batch_queue
WHERE status = 'pending'
ORDER BY created_at ASC
LIMIT $1;

-- name: ListPendingDepositQueueByVault :many
-- Get pending deposits for a specific vault
SELECT * FROM deposit_batch_queue
WHERE client_vault_id = $1
  AND status = 'pending'
ORDER BY created_at ASC;

-- name: CreateDepositQueueItem :one
INSERT INTO deposit_batch_queue (
  client_vault_id,
  deposit_transaction_id,
  amount,
  status
) VALUES (
  $1, $2, $3, $4
)
RETURNING *;

-- name: MarkDepositAsBatched :exec
UPDATE deposit_batch_queue
SET status = 'batched',
    batched_at = now()
WHERE id = $1;

-- name: MarkDepositAsStaked :exec
UPDATE deposit_batch_queue
SET status = 'staked',
    staked_at = now()
WHERE id = $1;

-- name: MarkDepositBatchAsStaked :exec
-- Batch update multiple deposits as staked
UPDATE deposit_batch_queue
SET status = 'staked',
    staked_at = now()
WHERE client_vault_id = $1
  AND status = 'batched';

-- ============================================
-- DEPOSIT ANALYTICS
-- ============================================

-- name: GetDepositStats :one
-- Deposit statistics for a client
SELECT
  COUNT(*) AS total_deposits,
  COUNT(*) FILTER (WHERE status = 'completed') AS completed_deposits,
  COUNT(*) FILTER (WHERE status = 'pending') AS pending_deposits,
  COUNT(*) FILTER (WHERE status = 'failed') AS failed_deposits,
  COALESCE(SUM(crypto_amount) FILTER (WHERE status = 'completed'), 0) AS total_volume,
  COALESCE(SUM(total_fees) FILTER (WHERE status = 'completed'), 0) AS total_fees_collected,
  COALESCE(AVG(crypto_amount) FILTER (WHERE status = 'completed'), 0) AS avg_deposit_amount
FROM deposit_transactions
WHERE client_id = sqlc.arg('client_id')
  AND created_at >= sqlc.arg('start_date')  -- start date
  AND created_at <= sqlc.arg('end_date'); -- end date

-- ============================================
-- OPERATIONS DASHBOARD QUERIES
-- ============================================

-- name: ListAllPendingDeposits :many
-- Get all pending deposits across all clients (for Operations Dashboard)
SELECT * FROM deposit_transactions
WHERE status = 'pending'
  AND deposit_type = 'external'
ORDER BY created_at ASC;

-- name: ListPendingDepositsByClient :many
-- Get pending deposits for a specific client (for Operations Dashboard)
SELECT * FROM deposit_transactions
WHERE client_id = $1
  AND status = 'pending'
  AND deposit_type = 'external'
ORDER BY created_at ASC;

-- name: ListAllPendingDepositsByEnvironment :many
-- Get all pending deposits filtered by environment (for Operations Dashboard)
SELECT * FROM deposit_transactions
WHERE status = 'pending'
  AND deposit_type = 'external'
  AND environment = $1
ORDER BY created_at ASC;

-- name: ListPendingDepositsByClientAndEnvironment :many
-- Get pending deposits for a specific client filtered by environment
SELECT * FROM deposit_transactions
WHERE client_id = $1
  AND status = 'pending'
  AND deposit_type = 'external'
  AND environment = $2
ORDER BY created_at ASC;
