-- ============================================
-- REVENUE DISTRIBUTION QUERIES
-- ============================================

-- name: CreateRevenueDistribution :one
INSERT INTO revenue_distributions (
  withdrawal_transaction_id,
  vault_id,
  raw_yield,
  enduser_revenue,
  client_revenue,
  platform_revenue,
  client_revenue_percent,
  platform_fee_percent,
  is_deducted
) VALUES (
  $1, $2, $3, $4, $5, $6, $7, $8, $9
)
RETURNING *;

-- name: GetRevenueDistributionById :one
SELECT * FROM revenue_distributions
WHERE id = $1
LIMIT 1;

-- name: GetRevenueDistributionByWithdrawal :one
SELECT * FROM revenue_distributions
WHERE withdrawal_transaction_id = $1
LIMIT 1;

-- name: ListRevenueDistributionsByVault :many
SELECT * FROM revenue_distributions
WHERE vault_id = $1
ORDER BY distributed_at DESC
LIMIT $2 OFFSET $3;

-- name: ListDeferredFees :many
-- Get distributions where fees were not deducted (deferred for settlement)
SELECT * FROM revenue_distributions
WHERE is_deducted = false
ORDER BY distributed_at ASC
LIMIT $1 OFFSET $2;

-- name: ListDeferredFeesByClient :many
-- Get deferred fees for a specific client
SELECT rd.*
FROM revenue_distributions rd
JOIN client_vaults cv ON rd.vault_id = cv.id
WHERE cv.client_id = $1
  AND rd.is_deducted = false
ORDER BY rd.distributed_at ASC;

-- name: MarkFeesAsDeducted :exec
-- Mark a revenue distribution as deducted (for batch settlement)
UPDATE revenue_distributions
SET is_deducted = true
WHERE id = $1;

-- name: GetClientRevenueStats :one
-- Get total revenue for a client in a date range
SELECT
  COUNT(*) as total_distributions,
  COALESCE(SUM(client_revenue), 0) as total_client_revenue,
  COALESCE(SUM(platform_revenue), 0) as total_platform_revenue,
  COALESCE(SUM(enduser_revenue), 0) as total_enduser_revenue,
  COALESCE(SUM(raw_yield), 0) as total_raw_yield
FROM revenue_distributions rd
JOIN client_vaults cv ON rd.vault_id = cv.id
WHERE cv.client_id = sqlc.arg('client_id')
  AND rd.distributed_at >= sqlc.arg('start_date')
  AND rd.distributed_at <= sqlc.arg('end_date');

-- name: GetPlatformRevenueStats :one
-- Get total platform revenue in a date range
SELECT
  COUNT(*) as total_distributions,
  COALESCE(SUM(platform_revenue), 0) as total_platform_revenue,
  COALESCE(SUM(client_revenue), 0) as total_client_revenue,
  COALESCE(SUM(enduser_revenue), 0) as total_enduser_revenue,
  COALESCE(SUM(raw_yield), 0) as total_raw_yield,
  COUNT(*) FILTER (WHERE is_deducted = true) as deducted_count,
  COUNT(*) FILTER (WHERE is_deducted = false) as deferred_count
FROM revenue_distributions
WHERE distributed_at >= sqlc.arg('start_date')
  AND distributed_at <= sqlc.arg('end_date');

-- ============================================
-- VAULT INDEX HISTORY QUERIES
-- ============================================

-- name: CreateVaultIndexSnapshot :one
INSERT INTO vault_index_history (
  vault_id,
  index_value,
  daily_yield,
  daily_apy
) VALUES (
  $1, $2, $3, $4
)
RETURNING *;

-- name: GetLatestVaultIndex :one
SELECT * FROM vault_index_history
WHERE vault_id = $1
ORDER BY timestamp DESC
LIMIT 1;

-- name: GetVaultIndexHistory :many
-- Get index history for a vault in a date range
SELECT * FROM vault_index_history
WHERE vault_id = sqlc.arg('vault_id')
  AND timestamp >= sqlc.arg('start_date')
  AND timestamp <= sqlc.arg('end_date')
ORDER BY timestamp ASC;

-- name: GetVaultIndexAtTimestamp :one
-- Get the closest index snapshot before or at a specific timestamp
SELECT * FROM vault_index_history
WHERE vault_id = sqlc.arg('vault_id')
  AND timestamp <= sqlc.arg('timestamp')
ORDER BY timestamp DESC
LIMIT 1;

-- name: CalculateRollingAPY :one
-- Calculate rolling APY for a vault over N days
SELECT
  v1.index_value as start_index,
  v2.index_value as end_index,
  v1.timestamp as start_time,
  v2.timestamp as end_time,
  EXTRACT(EPOCH FROM (v2.timestamp - v1.timestamp)) / 86400 as days_elapsed,
  ((v2.index_value::numeric / v1.index_value::numeric - 1) * 365 * 100 /
    (EXTRACT(EPOCH FROM (v2.timestamp - v1.timestamp)) / 86400)) as annualized_apy
FROM vault_index_history v1
CROSS JOIN LATERAL (
  SELECT index_value, timestamp
  FROM vault_index_history
  WHERE vault_id = v1.vault_id
  ORDER BY timestamp DESC
  LIMIT 1
) v2
WHERE v1.vault_id = $1
  AND v1.timestamp >= NOW() - INTERVAL '1 day' * sqlc.arg('days')
ORDER BY v1.timestamp ASC
LIMIT 1;

-- name: DeleteOldIndexHistory :exec
-- Clean up index history older than 90 days (retention policy)
DELETE FROM vault_index_history
WHERE timestamp < NOW() - INTERVAL '90 days';
