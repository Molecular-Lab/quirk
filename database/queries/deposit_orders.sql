-- ============================================
-- DEPOSIT ORDERS QUERIES (For Operations Dashboard Demo)
-- ============================================

-- name: GetDepositOrder :one
SELECT * FROM deposit_orders
WHERE id = $1 LIMIT 1;

-- name: GetDepositOrderByOrderId :one
SELECT * FROM deposit_orders
WHERE order_id = $1 LIMIT 1;

-- name: ListDepositOrdersByClient :many
SELECT * FROM deposit_orders
WHERE client_id = $1
ORDER BY created_at DESC
LIMIT $2 OFFSET $3;

-- name: ListDepositOrdersByUser :many
SELECT * FROM deposit_orders
WHERE user_id = $1
ORDER BY created_at DESC
LIMIT $2 OFFSET $3;

-- name: ListPendingDepositOrders :many
-- Get all pending deposit orders across all clients (for operations dashboard)
SELECT * FROM deposit_orders
WHERE status = 'pending'
ORDER BY created_at ASC;

-- name: ListPendingDepositOrdersByClient :many
-- Get pending deposit orders for a specific client
SELECT * FROM deposit_orders
WHERE client_id = $1
  AND status = 'pending'
ORDER BY created_at ASC;

-- name: CreateDepositOrder :one
INSERT INTO deposit_orders (
  order_id,
  client_id,
  user_id,
  fiat_amount,
  fiat_currency,
  crypto_amount,
  chain,
  token_symbol,
  token_address,
  on_ramp_provider,
  payment_url,
  qr_code,
  status,
  transaction_hash,
  gateway_fee,
  proxify_fee,
  network_fee,
  total_fees,
  expires_at
) VALUES (
  $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
  $11, $12, $13, $14, $15, $16, $17, $18, $19
)
RETURNING *;

-- name: UpdateDepositOrderStatus :one
UPDATE deposit_orders
SET status = $2,
    updated_at = NOW()
WHERE id = $1
RETURNING *;

-- name: CompleteDepositOrder :one
-- Mark deposit order as completed with crypto amount and tx hash
UPDATE deposit_orders
SET status = 'completed',
    crypto_amount = $2,
    transaction_hash = $3,
    completed_at = NOW(),
    updated_at = NOW()
WHERE id = $1
RETURNING *;

-- name: FailDepositOrder :exec
-- Mark deposit order as failed
UPDATE deposit_orders
SET status = 'failed',
    updated_at = NOW()
WHERE id = $1;

-- name: GetDepositOrderStats :one
-- Get deposit order statistics for operations dashboard
SELECT
  COUNT(*) AS total_orders,
  COUNT(*) FILTER (WHERE status = 'pending') AS pending_orders,
  COUNT(*) FILTER (WHERE status = 'completed') AS completed_orders,
  COUNT(*) FILTER (WHERE status = 'failed') AS failed_orders,
  COALESCE(SUM(fiat_amount) FILTER (WHERE status = 'pending'), 0) AS total_pending_amount,
  COALESCE(SUM(crypto_amount) FILTER (WHERE status = 'completed'), 0) AS total_completed_amount
FROM deposit_orders
WHERE created_at >= sqlc.arg('start_date')
  AND created_at <= sqlc.arg('end_date');
