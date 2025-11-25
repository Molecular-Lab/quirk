-- name: UpdateVaultStrategies :one
UPDATE client_vaults
SET 
  strategies = $2::jsonb,
  updated_at = now()
WHERE id = $1
RETURNING *;

-- name: GetVaultWithStrategies :one
SELECT * FROM client_vaults
WHERE id = $1;

-- name: GetVaultStrategiesByClientAndChain :one
SELECT strategies FROM client_vaults
WHERE client_id = $1 
  AND chain = $2 
  AND token_address = $3
LIMIT 1;
