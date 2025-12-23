-- ============================================
-- OFF-RAMP TRANSACTION QUERIES
-- Crypto → Fiat conversion tracking
-- ============================================

-- name: GetOffRamp :one
SELECT * FROM off_ramp_transactions
WHERE id = $1 LIMIT 1;

-- name: GetOffRampByOrderID :one
SELECT * FROM off_ramp_transactions
WHERE order_id = $1 LIMIT 1;

-- name: GetOffRampByOrderIDForUpdate :one
-- Use in transactions to lock the off-ramp row
SELECT * FROM off_ramp_transactions
WHERE order_id = $1
FOR UPDATE
LIMIT 1;

-- name: GetOffRampByProviderOrderID :one
SELECT * FROM off_ramp_transactions
WHERE provider_order_id = $1 LIMIT 1;

-- name: ListOffRamps :many
SELECT * FROM off_ramp_transactions
WHERE client_id = $1
ORDER BY created_at DESC
LIMIT $2 OFFSET $3;

-- name: ListOffRampsByUser :many
SELECT * FROM off_ramp_transactions
WHERE client_id = $1
  AND user_id = $2
ORDER BY created_at DESC
LIMIT $3 OFFSET $4;

-- name: ListOffRampsByEndUser :many
SELECT * FROM off_ramp_transactions
WHERE end_user_id = $1
ORDER BY created_at DESC
LIMIT $2 OFFSET $3;

-- name: ListOffRampsByStatus :many
SELECT * FROM off_ramp_transactions
WHERE client_id = $1
  AND status = $2
ORDER BY created_at DESC
LIMIT $3 OFFSET $4;

-- name: ListPendingOffRamps :many
-- Get pending off-ramps for a specific client
SELECT * FROM off_ramp_transactions
WHERE status = 'pending'
  AND client_id = $1
ORDER BY created_at ASC;

-- name: ListProcessingOffRamps :many
-- Get off-ramps being processed
SELECT * FROM off_ramp_transactions
WHERE status = 'processing'
  AND client_id = $1
ORDER BY submitted_at ASC;

-- name: CreateOffRamp :one
INSERT INTO off_ramp_transactions (
  order_id,
  client_id,
  user_id,
  end_user_id,
  off_ramp_type,
  off_ramp_provider,
  crypto_amount,
  crypto_currency,
  chain,
  token_address,
  source_wallet_address,
  fiat_amount,
  fiat_currency,
  destination_type,
  destination_details,
  exchange_rate,
  rate_locked_at,
  rate_expires_at,
  provider_fee,
  network_fee,
  platform_fee,
  total_fees,
  net_fiat_amount,
  status,
  environment,
  network,
  metadata
) VALUES (
  $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
  $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
  $21, $22, $23, $24, $25, $26, $27
)
RETURNING *;

-- name: UpdateOffRampProvider :exec
-- Update after initiating with external provider
UPDATE off_ramp_transactions
SET provider_order_id = $2,
    provider_reference = $3,
    status = 'processing',
    submitted_at = now()
WHERE id = $1;

-- name: UpdateOffRampBurnHash :exec
-- Update with blockchain burn transaction hash
UPDATE off_ramp_transactions
SET burn_transaction_hash = $2,
    status = 'awaiting_confirmation'
WHERE id = $1;

-- name: CompleteOffRamp :one
-- Mark off-ramp as completed
UPDATE off_ramp_transactions
SET status = 'completed',
    fiat_amount = COALESCE(sqlc.narg('fiat_amount'), fiat_amount),
    net_fiat_amount = COALESCE(sqlc.narg('net_fiat_amount'), net_fiat_amount),
    settlement_reference = COALESCE(sqlc.narg('settlement_reference'), settlement_reference),
    settlement_date = COALESCE(sqlc.narg('settlement_date'), settlement_date),
    completed_at = now()
WHERE id = $1
RETURNING *;

-- name: CompleteOffRampByOrderID :one
-- Mark off-ramp as completed by order_id
UPDATE off_ramp_transactions
SET status = 'completed',
    settlement_reference = $2,
    completed_at = now()
WHERE order_id = $1
RETURNING *;

-- name: FailOffRamp :exec
-- Mark off-ramp as failed
UPDATE off_ramp_transactions
SET status = 'failed',
    error_message = $2,
    error_code = $3,
    failed_at = now()
WHERE id = $1;

-- name: CancelOffRamp :exec
-- Mark off-ramp as cancelled
UPDATE off_ramp_transactions
SET status = 'cancelled',
    cancelled_at = now()
WHERE id = $1;

-- name: RefundOffRamp :exec
-- Mark off-ramp as refunded (crypto returned to user)
UPDATE off_ramp_transactions
SET status = 'refunded',
    refunded_at = now(),
    error_message = $2
WHERE id = $1;

-- name: IncrementOffRampRetry :exec
-- Increment retry count for failed off-ramp
UPDATE off_ramp_transactions
SET retry_count = retry_count + 1,
    error_message = NULL,
    error_code = NULL,
    status = 'pending'
WHERE id = $1;

-- ============================================
-- OFF-RAMP ANALYTICS
-- ============================================

-- name: GetOffRampStats :one
-- Off-ramp statistics for a client
SELECT
  COUNT(*) AS total_offramps,
  COUNT(*) FILTER (WHERE status = 'completed') AS completed_offramps,
  COUNT(*) FILTER (WHERE status = 'pending') AS pending_offramps,
  COUNT(*) FILTER (WHERE status = 'processing') AS processing_offramps,
  COUNT(*) FILTER (WHERE status = 'failed') AS failed_offramps,
  COALESCE(SUM(crypto_amount) FILTER (WHERE status = 'completed'), 0) AS total_crypto_volume,
  COALESCE(SUM(fiat_amount) FILTER (WHERE status = 'completed'), 0) AS total_fiat_volume,
  COALESCE(SUM(total_fees) FILTER (WHERE status = 'completed'), 0) AS total_fees_collected,
  COALESCE(AVG(crypto_amount) FILTER (WHERE status = 'completed'), 0) AS avg_offramp_amount
FROM off_ramp_transactions
WHERE client_id = sqlc.arg('client_id')
  AND created_at >= sqlc.arg('start_date')
  AND created_at <= sqlc.arg('end_date');

-- name: GetOffRampStatsByEnvironment :one
-- Off-ramp statistics for a client by environment
SELECT
  COUNT(*) AS total_offramps,
  COUNT(*) FILTER (WHERE status = 'completed') AS completed_offramps,
  COALESCE(SUM(crypto_amount) FILTER (WHERE status = 'completed'), 0) AS total_crypto_volume,
  COALESCE(SUM(fiat_amount) FILTER (WHERE status = 'completed'), 0) AS total_fiat_volume
FROM off_ramp_transactions
WHERE client_id = $1
  AND environment = $2;

-- ============================================
-- OPERATIONS DASHBOARD QUERIES
-- ============================================

-- name: ListAllPendingOffRamps :many
-- Get all pending off-ramps across all clients (for Operations Dashboard)
SELECT * FROM off_ramp_transactions
WHERE status = 'pending'
ORDER BY created_at ASC;

-- name: ListAllProcessingOffRamps :many
-- Get all processing off-ramps across all clients (for Operations Dashboard)
SELECT * FROM off_ramp_transactions
WHERE status = 'processing'
ORDER BY submitted_at ASC;

-- name: ListPendingOffRampsByClient :many
-- Get pending off-ramps for a specific client (for Operations Dashboard)
SELECT * FROM off_ramp_transactions
WHERE client_id = $1
  AND status = 'pending'
ORDER BY created_at ASC;

-- ============================================
-- USER BALANCE QUERIES
-- ============================================

-- name: GetUserTotalOffRamped :one
-- Get total amount off-ramped by a user
SELECT
  COALESCE(SUM(crypto_amount), 0) AS total_crypto,
  COALESCE(SUM(fiat_amount), 0) AS total_fiat
FROM off_ramp_transactions
WHERE end_user_id = $1
  AND status = 'completed';

-- name: GetUserOffRampHistory :many
-- Get off-ramp history for a user with pagination
SELECT * FROM off_ramp_transactions
WHERE end_user_id = $1
ORDER BY created_at DESC
LIMIT $2 OFFSET $3;
