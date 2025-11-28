-- ============================================
-- MOCK USDC MINTS QUERIES (For Oracle Service Demo)
-- ============================================

-- name: GetMockUsdcMint :one
SELECT * FROM mock_usdc_mints
WHERE id = $1 LIMIT 1;

-- name: GetMockUsdcMintByDepositTransaction :one
SELECT * FROM mock_usdc_mints
WHERE deposit_transaction_id = $1 LIMIT 1;

-- name: GetMockUsdcMintByTxHash :one
SELECT * FROM mock_usdc_mints
WHERE mock_transaction_hash = $1 LIMIT 1;

-- name: ListMockUsdcMintsByClient :many
SELECT * FROM mock_usdc_mints
WHERE client_id = $1
ORDER BY created_at DESC
LIMIT $2 OFFSET $3;

-- name: ListMockUsdcMintsByUser :many
SELECT * FROM mock_usdc_mints
WHERE user_id = $1
ORDER BY created_at DESC
LIMIT $2 OFFSET $3;

-- name: CreateMockUsdcMint :one
INSERT INTO mock_usdc_mints (
  deposit_transaction_id,
  client_id,
  user_id,
  amount,
  chain,
  token_address,
  destination_wallet,
  mock_transaction_hash,
  block_number
) VALUES (
  $1, $2, $3, $4, $5, $6, $7, $8, $9
)
RETURNING *;

-- name: ListRecentMockMints :many
-- Get recent mock mints for operations monitoring
SELECT * FROM mock_usdc_mints
ORDER BY created_at DESC
LIMIT $1;

-- name: GetMockMintStats :one
-- Get mock mint statistics
SELECT
  COUNT(*) AS total_mints,
  COALESCE(SUM(amount), 0) AS total_amount_minted,
  COALESCE(AVG(amount), 0) AS avg_mint_amount
FROM mock_usdc_mints
WHERE created_at >= sqlc.arg('start_date')
  AND created_at <= sqlc.arg('end_date');
