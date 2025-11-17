-- ============================================
-- AUDIT LOG QUERIES
-- ============================================

-- name: GetAuditLog :one
SELECT * FROM audit_logs
WHERE id = $1 LIMIT 1;

-- name: ListAuditLogs :many
SELECT * FROM audit_logs
ORDER BY created_at DESC
LIMIT $1 OFFSET $2;

-- name: ListAuditLogsByClient :many
SELECT * FROM audit_logs
WHERE client_id = $1
ORDER BY created_at DESC
LIMIT $2 OFFSET $3;

-- name: ListAuditLogsByUser :many
SELECT * FROM audit_logs
WHERE user_id = $1
ORDER BY created_at DESC
LIMIT $2 OFFSET $3;

-- name: ListAuditLogsByAction :many
SELECT * FROM audit_logs
WHERE action = $1
ORDER BY created_at DESC
LIMIT $2 OFFSET $3;

-- name: ListAuditLogsByResource :many
SELECT * FROM audit_logs
WHERE resource_type = $1
  AND resource_id = $2
ORDER BY created_at DESC
LIMIT $3 OFFSET $4;

-- name: ListAuditLogsByClientAndAction :many
SELECT * FROM audit_logs
WHERE client_id = $1
  AND action = $2
ORDER BY created_at DESC
LIMIT $3 OFFSET $4;

-- name: ListAuditLogsByDateRange :many
SELECT * FROM audit_logs
WHERE created_at >= sqlc.arg('start_date')
  AND created_at <= sqlc.arg('end_date')
ORDER BY created_at DESC
LIMIT sqlc.arg('limit') OFFSET sqlc.arg('offset');

-- name: ListAuditLogsByClientAndDateRange :many
SELECT * FROM audit_logs
WHERE client_id = sqlc.arg('client_id')
  AND created_at >= sqlc.arg('start_date')
  AND created_at <= sqlc.arg('end_date')
ORDER BY created_at DESC
LIMIT sqlc.arg('limit') OFFSET sqlc.arg('offset');

-- name: CreateAuditLog :one
INSERT INTO audit_logs (
  client_id,
  user_id,
  actor_type,
  action,
  resource_type,
  resource_id,
  description,
  metadata,
  ip_address,
  user_agent
) VALUES (
  $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
)
RETURNING *;

-- name: DeleteOldAuditLogs :exec
-- Delete audit logs older than specified date (for cleanup)
DELETE FROM audit_logs
WHERE created_at < $1;

-- ============================================
-- AUDIT ANALYTICS
-- ============================================

-- name: GetActionFrequency :many
-- Get frequency of actions
SELECT
  action,
  COUNT(*) AS count,
  MIN(created_at) AS first_occurrence,
  MAX(created_at) AS last_occurrence
FROM audit_logs
WHERE client_id = sqlc.arg('client_id')
  AND created_at >= sqlc.arg('start_date')
  AND created_at <= sqlc.arg('end_date')
GROUP BY action
ORDER BY count DESC;

-- name: GetUserActivity :many
-- Get user activity summary
SELECT
  user_id,
  actor_type,
  COUNT(*) AS total_actions,
  COUNT(DISTINCT action) AS distinct_actions,
  MIN(created_at) AS first_activity,
  MAX(created_at) AS last_activity
FROM audit_logs
WHERE client_id = sqlc.arg('client_id')
  AND created_at >= sqlc.arg('start_date')
  AND created_at <= sqlc.arg('end_date')
  AND user_id IS NOT NULL
GROUP BY user_id, actor_type
ORDER BY total_actions DESC
LIMIT sqlc.arg('limit');

-- name: GetResourceActivity :many
-- Get activity for a specific resource
SELECT
  action,
  actor_type,
  user_id,
  description,
  metadata,
  created_at
FROM audit_logs
WHERE resource_type = $1
  AND resource_id = $2
ORDER BY created_at DESC
LIMIT $3;
