-- name: CreateDefiTransaction :one
INSERT INTO defi_transactions (
    client_id,
    vault_id,
    end_user_id,
    tx_hash,
    block_number,
    chain,
    operation_type,
    protocol,
    token_symbol,
    token_address,
    amount,
    gas_used,
    gas_price,
    gas_cost_eth,
    gas_cost_usd,
    status,
    error_message,
    environment,
    executed_at,
    confirmed_at
) VALUES (
    @client_id,
    @vault_id,
    @end_user_id,
    @tx_hash,
    @block_number,
    @chain,
    @operation_type,
    @protocol,
    @token_symbol,
    @token_address,
    @amount,
    @gas_used,
    @gas_price,
    @gas_cost_eth,
    @gas_cost_usd,
    @status,
    @error_message,
    @environment,
    @executed_at,
    @confirmed_at
) RETURNING *;

-- name: GetDefiTransactionById :one
SELECT * FROM defi_transactions WHERE id = @id;

-- name: GetDefiTransactionByHash :one
SELECT * FROM defi_transactions WHERE tx_hash = @tx_hash;

-- name: ConfirmDefiTransaction :exec
UPDATE defi_transactions
SET 
    status = 'confirmed',
    confirmed_at = now(),
    block_number = @block_number,
    gas_used = @gas_used,
    gas_price = @gas_price,
    gas_cost_eth = @gas_cost_eth,
    gas_cost_usd = @gas_cost_usd
WHERE id = @id;

-- name: FailDefiTransaction :exec
UPDATE defi_transactions
SET 
    status = 'failed',
    error_message = @error_message
WHERE id = @id;

-- name: ListDefiTransactionsByClient :many
SELECT * FROM defi_transactions
WHERE client_id = @client_id
  AND environment = @environment
ORDER BY executed_at DESC
LIMIT @limit_val OFFSET @offset_val;

-- name: ListDefiTransactionsByVault :many
SELECT * FROM defi_transactions
WHERE vault_id = @vault_id
ORDER BY executed_at DESC
LIMIT @limit_val OFFSET @offset_val;

-- name: ListDefiTransactionsByUser :many
SELECT * FROM defi_transactions
WHERE end_user_id = @end_user_id
ORDER BY executed_at DESC
LIMIT @limit_val OFFSET @offset_val;

-- name: ListDefiTransactionsByProtocol :many
SELECT * FROM defi_transactions
WHERE client_id = @client_id
  AND protocol = @protocol
  AND environment = @environment
ORDER BY executed_at DESC
LIMIT @limit_val OFFSET @offset_val;

-- name: ListPendingDefiTransactions :many
SELECT * FROM defi_transactions
WHERE status = 'pending'
ORDER BY executed_at ASC
LIMIT @limit_val;

-- name: GetDefiTransactionStats :one
SELECT 
    COUNT(*) as total_transactions,
    COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed_count,
    COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
    COUNT(*) FILTER (WHERE status = 'failed') as failed_count,
    COALESCE(SUM(gas_cost_usd) FILTER (WHERE status = 'confirmed'), 0) as total_gas_cost_usd,
    COALESCE(SUM(amount) FILTER (WHERE operation_type = 'deposit' AND status = 'confirmed'), 0) as total_deposited,
    COALESCE(SUM(amount) FILTER (WHERE operation_type = 'withdrawal' AND status = 'confirmed'), 0) as total_withdrawn
FROM defi_transactions
WHERE client_id = @client_id
  AND environment = @environment;

-- name: CountDefiTransactionsByClient :one
SELECT COUNT(*) FROM defi_transactions
WHERE client_id = @client_id
  AND environment = @environment;
