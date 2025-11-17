-- ============================================
-- DEFI PROTOCOL QUERIES
-- ============================================

-- name: GetProtocol :one
SELECT * FROM supported_defi_protocols
WHERE id = $1 LIMIT 1;

-- name: GetProtocolByName :one
SELECT * FROM supported_defi_protocols
WHERE name = $1
  AND chain = $2
LIMIT 1;

-- name: ListProtocols :many
SELECT * FROM supported_defi_protocols
ORDER BY name ASC;

-- name: ListActiveProtocols :many
SELECT * FROM supported_defi_protocols
WHERE is_active = true
ORDER BY name ASC;

-- name: ListProtocolsByChain :many
SELECT * FROM supported_defi_protocols
WHERE chain = $1
  AND is_active = true
ORDER BY name ASC;

-- name: ListProtocolsByCategory :many
SELECT * FROM supported_defi_protocols
WHERE category = $1
  AND is_active = true
ORDER BY name ASC;

-- name: ListProtocolsByChainAndCategory :many
SELECT * FROM supported_defi_protocols
WHERE chain = $1
  AND category = $2
  AND is_active = true
ORDER BY name ASC;

-- name: CreateProtocol :one
INSERT INTO supported_defi_protocols (
  name,
  chain,
  address_book,
  category,
  risk_level,
  is_active
) VALUES (
  $1, $2, $3, $4, $5, $6
)
RETURNING *;

-- name: UpdateProtocol :one
UPDATE supported_defi_protocols
SET address_book = COALESCE(sqlc.narg('address_book'), address_book),
    category = COALESCE(sqlc.narg('category'), category),
    risk_level = COALESCE(sqlc.narg('risk_level'), risk_level),
    is_active = COALESCE(sqlc.narg('is_active'), is_active),
    updated_at = now()
WHERE id = $1
RETURNING *;

-- name: ActivateProtocol :exec
UPDATE supported_defi_protocols
SET is_active = true,
    updated_at = now()
WHERE id = $1;

-- name: DeactivateProtocol :exec
UPDATE supported_defi_protocols
SET is_active = false,
    updated_at = now()
WHERE id = $1;

-- name: DeleteProtocol :exec
DELETE FROM supported_defi_protocols
WHERE id = $1;

-- ============================================
-- VAULT STRATEGY QUERIES
-- ============================================

-- name: GetVaultStrategy :one
SELECT * FROM vault_strategies
WHERE id = $1 LIMIT 1;

-- name: GetVaultStrategyByCategory :one
SELECT * FROM vault_strategies
WHERE client_vault_id = $1
  AND category = $2
LIMIT 1;

-- name: ListVaultStrategies :many
SELECT * FROM vault_strategies
WHERE client_vault_id = $1
ORDER BY target_percent DESC;

-- name: CreateVaultStrategy :one
INSERT INTO vault_strategies (
  client_vault_id,
  category,
  target_percent
) VALUES (
  $1, $2, $3
)
RETURNING *;

-- name: UpsertVaultStrategy :one
-- Create or update strategy
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

-- name: UpdateVaultStrategy :one
UPDATE vault_strategies
SET target_percent = $2,
    updated_at = now()
WHERE id = $1
RETURNING *;

-- name: DeleteVaultStrategy :exec
DELETE FROM vault_strategies
WHERE id = $1;

-- name: DeleteVaultStrategiesByVault :exec
DELETE FROM vault_strategies
WHERE client_vault_id = $1;

-- ============================================
-- DEFI ALLOCATION QUERIES
-- ============================================

-- name: GetAllocation :one
SELECT * FROM defi_allocations
WHERE id = $1 LIMIT 1;

-- name: GetAllocationForUpdate :one
-- Use in transactions to lock the allocation row
SELECT * FROM defi_allocations
WHERE id = $1
FOR UPDATE
LIMIT 1;

-- name: GetAllocationByVaultAndProtocol :one
SELECT * FROM defi_allocations
WHERE client_vault_id = $1
  AND protocol_id = $2
LIMIT 1;

-- name: ListAllocations :many
SELECT * FROM defi_allocations
WHERE client_id = $1
ORDER BY deployed_at DESC;

-- name: ListAllocationsByVault :many
SELECT
  da.*,
  sdp.name AS protocol_name,
  sdp.category AS protocol_category,
  sdp.risk_level AS protocol_risk_level
FROM defi_allocations da
JOIN supported_defi_protocols sdp ON da.protocol_id = sdp.id
WHERE da.client_vault_id = $1
ORDER BY da.balance DESC;

-- name: ListActiveAllocations :many
SELECT
  da.*,
  sdp.name AS protocol_name,
  sdp.category AS protocol_category,
  sdp.risk_level AS protocol_risk_level
FROM defi_allocations da
JOIN supported_defi_protocols sdp ON da.protocol_id = sdp.id
WHERE da.client_id = $1
  AND da.status = 'active'
ORDER BY da.balance DESC;

-- name: ListAllocationsByCategory :many
SELECT
  da.*,
  sdp.name AS protocol_name
FROM defi_allocations da
JOIN supported_defi_protocols sdp ON da.protocol_id = sdp.id
WHERE da.client_vault_id = $1
  AND da.category = $2
  AND da.status = 'active'
ORDER BY da.balance DESC;

-- name: CreateAllocation :one
INSERT INTO defi_allocations (
  client_id,
  client_vault_id,
  protocol_id,
  category,
  chain,
  token_address,
  token_symbol,
  balance,
  percentage_allocation,
  apy,
  tx_hash,
  status
) VALUES (
  $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
)
RETURNING *;

-- name: UpsertAllocation :one
-- Create or update allocation (for rebalancing)
INSERT INTO defi_allocations (
  client_id,
  client_vault_id,
  protocol_id,
  category,
  chain,
  token_address,
  token_symbol,
  balance,
  percentage_allocation,
  apy,
  tx_hash,
  status
) VALUES (
  $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
)
ON CONFLICT (client_vault_id, protocol_id)
DO UPDATE SET
  balance = defi_allocations.balance + EXCLUDED.balance,
  percentage_allocation = EXCLUDED.percentage_allocation,
  apy = EXCLUDED.apy,
  last_rebalance_at = now(),
  updated_at = now()
RETURNING *;

-- name: UpdateAllocationBalance :exec
UPDATE defi_allocations
SET balance = $2,
    updated_at = now()
WHERE id = $1;

-- name: IncreaseAllocationBalance :exec
UPDATE defi_allocations
SET balance = balance + $2,
    last_rebalance_at = now(),
    updated_at = now()
WHERE id = $1;

-- name: DecreaseAllocationBalance :exec
UPDATE defi_allocations
SET balance = balance - $2,
    last_rebalance_at = now(),
    updated_at = now()
WHERE id = $1;

-- name: UpdateAllocationYield :exec
UPDATE defi_allocations
SET balance = $2,
    yield_earned = yield_earned + $3,
    apy = COALESCE(sqlc.narg('apy'), apy),
    updated_at = now()
WHERE id = $1;

-- name: UpdateAllocationAPY :exec
UPDATE defi_allocations
SET apy = $2,
    updated_at = now()
WHERE id = $1;

-- name: MarkAllocationRebalancing :exec
UPDATE defi_allocations
SET status = 'rebalancing',
    updated_at = now()
WHERE id = $1;

-- name: MarkAllocationActive :exec
UPDATE defi_allocations
SET status = 'active',
    last_rebalance_at = now(),
    updated_at = now()
WHERE id = $1;

-- name: WithdrawAllocation :exec
UPDATE defi_allocations
SET status = 'withdrawn',
    withdrawn_at = now(),
    updated_at = now()
WHERE id = $1;

-- name: DeleteAllocation :exec
DELETE FROM defi_allocations
WHERE id = $1;

-- ============================================
-- DEFI ANALYTICS
-- ============================================

-- name: GetAllocationSummary :one
-- Summary of all allocations for a vault
SELECT
  COUNT(DISTINCT da.protocol_id) AS total_protocols,
  COUNT(DISTINCT da.category) AS total_categories,
  COALESCE(SUM(da.balance), 0) AS total_allocated,
  COALESCE(SUM(da.yield_earned), 0) AS total_yield_earned,
  COALESCE(AVG(da.apy), 0) AS avg_apy
FROM defi_allocations da
WHERE da.client_vault_id = $1
  AND da.status = 'active';

-- name: GetCategoryAllocationBreakdown :many
-- Allocation breakdown by category
SELECT
  da.category,
  COUNT(DISTINCT da.protocol_id) AS num_protocols,
  COALESCE(SUM(da.balance), 0) AS total_balance,
  COALESCE(AVG(da.apy), 0) AS avg_apy,
  COALESCE(SUM(da.yield_earned), 0) AS total_yield
FROM defi_allocations da
WHERE da.client_vault_id = $1
  AND da.status = 'active'
GROUP BY da.category
ORDER BY total_balance DESC;

-- name: GetProtocolPerformance :many
-- Performance metrics per protocol
SELECT
  sdp.name AS protocol_name,
  sdp.category,
  da.chain,
  da.token_symbol,
  da.balance,
  da.yield_earned,
  da.apy,
  da.deployed_at,
  da.last_rebalance_at,
  -- Calculate total return percentage
  CASE
    WHEN da.balance > 0 THEN (da.yield_earned::numeric / da.balance::numeric * 100)
    ELSE 0
  END AS total_return_percent
FROM defi_allocations da
JOIN supported_defi_protocols sdp ON da.protocol_id = sdp.id
WHERE da.client_id = $1
  AND da.status = 'active'
ORDER BY da.yield_earned DESC;

-- name: GetTotalAllocatedByClient :one
-- Total allocated across all vaults for a client
SELECT
  COALESCE(SUM(balance), 0) AS total_deployed,
  COALESCE(SUM(yield_earned), 0) AS total_yield,
  COALESCE(AVG(apy), 0) AS weighted_avg_apy
FROM defi_allocations
WHERE client_id = $1
  AND status = 'active';
