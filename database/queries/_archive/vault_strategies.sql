-- ============================================
-- VAULT STRATEGIES QUERIES
-- ============================================

-- name: CreateVaultStrategy :one
INSERT INTO vault_strategies (
  client_vault_id,
  category,
  target_percent
) VALUES (
  $1, $2, $3
)
RETURNING *;

-- name: GetVaultStrategies :many
SELECT * FROM vault_strategies
WHERE client_vault_id = $1
ORDER BY category;

-- name: UpsertVaultStrategy :one
INSERT INTO vault_strategies (
  client_vault_id,
  category,
  target_percent
) VALUES (
  $1, $2, $3
)
ON CONFLICT (client_vault_id, category)
DO UPDATE SET
  target_percent = EXCLUDED.target_percent,
  updated_at = now()
RETURNING *;

-- name: DeleteAllVaultStrategies :exec
DELETE FROM vault_strategies
WHERE client_vault_id = $1;
