-- ============================================
-- WITHDRAWAL TRANSACTION QUERIES
-- ============================================

-- name: GetWithdrawal :one
SELECT * FROM withdrawal_transactions
WHERE id = $1 LIMIT 1;

-- name: GetWithdrawalByOrderID :one
SELECT * FROM withdrawal_transactions
WHERE order_id = $1 LIMIT 1;

-- name: GetWithdrawalByGatewayOrderID :one
SELECT * FROM withdrawal_transactions
WHERE gateway_order_id = $1 LIMIT 1;

-- name: GetWithdrawalByOrderIDForUpdate :one
-- Use in transactions to lock the withdrawal row
SELECT * FROM withdrawal_transactions
WHERE order_id = $1
FOR UPDATE
LIMIT 1;

-- name: ListWithdrawals :many
SELECT * FROM withdrawal_transactions
WHERE client_id = $1
ORDER BY created_at DESC
LIMIT $2 OFFSET $3;

-- name: ListWithdrawalsByUser :many
SELECT * FROM withdrawal_transactions
WHERE client_id = $1
  AND user_id = $2
ORDER BY created_at DESC
LIMIT $3 OFFSET $4;

-- name: ListWithdrawalsByStatus :many
SELECT * FROM withdrawal_transactions
WHERE client_id = $1
  AND status = $2
ORDER BY created_at DESC
LIMIT $3 OFFSET $4;

-- name: CreateWithdrawal :one
INSERT INTO withdrawal_transactions (
  order_id,
  client_id,
  user_id,
  requested_amount,
  currency,
  destination_type,
  destination_details,
  status,
  environment,
  network,
  oracle_address
) VALUES (
  $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
)
RETURNING *;

-- name: UpdateWithdrawalGatewayInfo :exec
-- Update after initiating off-ramp
UPDATE withdrawal_transactions
SET gateway_order_id = $2,
    withdrawal_fee = COALESCE(sqlc.narg('withdrawal_fee'), withdrawal_fee),
    network_fee = COALESCE(sqlc.narg('network_fee'), network_fee),
    updated_at = now()
WHERE id = $1;

-- name: UpdateWithdrawalStatus :exec
UPDATE withdrawal_transactions
SET status = $2,
    updated_at = now()
WHERE id = $1;

-- name: CompleteWithdrawal :one
-- Mark withdrawal as completed
UPDATE withdrawal_transactions
SET status = 'completed',
    actual_amount = COALESCE(sqlc.narg('actual_amount'), actual_amount),
    completed_at = now()
WHERE id = $1
RETURNING *;

-- name: FailWithdrawal :exec
-- Mark withdrawal as failed
UPDATE withdrawal_transactions
SET status = 'failed',
    error_message = $2,
    error_code = $3,
    failed_at = now()
WHERE id = $1;

-- ============================================
-- WITHDRAWAL QUEUE QUERIES
-- ============================================

-- name: GetWithdrawalQueueItem :one
SELECT * FROM withdrawal_queue
WHERE id = $1 LIMIT 1;

-- name: GetWithdrawalQueueByTransaction :one
SELECT * FROM withdrawal_queue
WHERE withdrawal_transaction_id = $1 LIMIT 1;

-- name: ListQueuedWithdrawals :many
-- Get withdrawals queued for processing (by priority)
SELECT * FROM withdrawal_queue
WHERE status = 'queued'
ORDER BY priority DESC, queued_at ASC
LIMIT $1;

-- name: ListWithdrawalQueueByVault :many
-- Get withdrawal queue for a specific user vault
SELECT * FROM withdrawal_queue
WHERE end_user_vault_id = $1
ORDER BY queued_at DESC;

-- name: CreateWithdrawalQueueItem :one
INSERT INTO withdrawal_queue (
  client_id,
  withdrawal_transaction_id,
  end_user_vault_id,
  shares_to_burn,
  estimated_amount,
  protocols_to_unstake,
  priority,
  status
) VALUES (
  $1, $2, $3, $4, $5, $6, $7, $8
)
RETURNING *;

-- name: UpdateWithdrawalQueueStatus :exec
UPDATE withdrawal_queue
SET status = $2,
    updated_at = now()
WHERE id = $1;

-- name: StartUnstaking :exec
UPDATE withdrawal_queue
SET status = 'unstaking',
    unstaking_started_at = now(),
    updated_at = now()
WHERE id = $1;

-- name: MarkWithdrawalReady :exec
-- Mark as ready after unstaking completes
UPDATE withdrawal_queue
SET status = 'ready',
    actual_amount = $2,
    ready_at = now(),
    updated_at = now()
WHERE id = $1;

-- name: MarkWithdrawalProcessing :exec
UPDATE withdrawal_queue
SET status = 'processing',
    updated_at = now()
WHERE id = $1;

-- name: CompleteWithdrawalQueue :exec
UPDATE withdrawal_queue
SET status = 'completed',
    completed_at = now(),
    updated_at = now()
WHERE id = $1;

-- name: FailWithdrawalQueue :exec
UPDATE withdrawal_queue
SET status = 'failed',
    error_message = $2,
    updated_at = now()
WHERE id = $1;

-- name: GetAggregatedUnstakingPlan :many
-- Aggregate withdrawal amounts by protocol for batch unstaking
SELECT
  wq.client_id,
  da.protocol_id,
  sdp.name AS protocol_name,
  da.chain,
  da.token_address,
  da.token_symbol,
  jsonb_agg(
    jsonb_build_object(
      'withdrawal_queue_id', wq.id,
      'withdrawal_transaction_id', wq.withdrawal_transaction_id,
      'amount', (wq.protocols_to_unstake->0->>'amount')::numeric
    )
  ) AS withdrawals,
  SUM((wq.protocols_to_unstake->0->>'amount')::numeric) AS total_to_unstake
FROM withdrawal_queue wq
JOIN end_user_vaults euv ON wq.end_user_vault_id = euv.id
JOIN client_vaults cv
  ON euv.client_id = cv.client_id
  AND euv.chain = cv.chain
  AND euv.token_address = cv.token_address
JOIN defi_allocations da
  ON da.client_vault_id = cv.id
  AND da.status = 'active'
JOIN supported_defi_protocols sdp ON da.protocol_id = sdp.id
WHERE wq.status = 'queued'
  AND wq.client_id = $1
GROUP BY wq.client_id, da.protocol_id, sdp.name, da.chain, da.token_address, da.token_symbol
ORDER BY total_to_unstake DESC;

-- ============================================
-- WITHDRAWAL ANALYTICS
-- ============================================

-- name: GetWithdrawalStats :one
-- Withdrawal statistics for a client
SELECT
  COUNT(*) AS total_withdrawals,
  COUNT(*) FILTER (WHERE status = 'completed') AS completed_withdrawals,
  COUNT(*) FILTER (WHERE status = 'pending') AS pending_withdrawals,
  COUNT(*) FILTER (WHERE status = 'failed') AS failed_withdrawals,
  COALESCE(SUM(actual_amount) FILTER (WHERE status = 'completed'), 0) AS total_volume,
  COALESCE(SUM(withdrawal_fee) FILTER (WHERE status = 'completed'), 0) AS total_fees_collected,
  COALESCE(AVG(actual_amount) FILTER (WHERE status = 'completed'), 0) AS avg_withdrawal_amount
FROM withdrawal_transactions
WHERE client_id = sqlc.arg('client_id')
  AND created_at >= sqlc.arg('start_date')  -- start date
  AND created_at <= sqlc.arg('end_date'); -- end date

-- ============================================
-- ENVIRONMENT-FILTERED QUERIES
-- ============================================

-- name: ListWithdrawalsByClientAndEnvironment :many
-- Get withdrawals for a client filtered by status and environment
SELECT * FROM withdrawal_transactions
WHERE client_id = $1
  AND status = COALESCE(sqlc.narg('status'), status)
  AND environment = COALESCE(sqlc.narg('environment'), environment)
ORDER BY created_at DESC
LIMIT $2 OFFSET $3;

-- name: ListPendingWithdrawalsByEnvironment :many
-- Get pending withdrawals filtered by environment (for Operations Dashboard)
SELECT * FROM withdrawal_transactions
WHERE status = 'pending'
  AND environment = $1
ORDER BY created_at ASC;

-- name: ListPendingWithdrawalsByClientAndEnvironment :many
-- Get pending withdrawals for a specific client filtered by environment
SELECT * FROM withdrawal_transactions
WHERE client_id = $1
  AND status = 'pending'
  AND environment = $2
ORDER BY created_at ASC;
