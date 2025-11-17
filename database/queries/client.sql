-- ============================================
-- CLIENT ORGANIZATIONS QUERIES
-- ============================================

-- name: CreateClientOrganization :one
INSERT INTO client_organizations (
    product_id,
    company_name,
    business_type,
    description,
    website_url,
    registration_number,
    tax_id,
    country_code,
    privy_user_id,
    privy_wallet_address,
    api_key_hash,
    api_key_prefix,
    webhook_url,
    webhook_secret,
    risk_tier,
    custom_allocations,
    subscription_tier,
    monthly_fee,
    yield_share_percent
) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19
) RETURNING *;

-- name: GetClientByID :one
SELECT * FROM client_organizations
WHERE id = $1 AND is_active = true;

-- name: GetClientByProductID :one
SELECT * FROM client_organizations
WHERE product_id = $1 AND is_active = true;

-- name: GetClientByPrivyUserID :one
SELECT * FROM client_organizations
WHERE privy_user_id = $1 AND is_active = true;

-- name: GetClientByAPIKeyPrefix :one
SELECT * FROM client_organizations
WHERE api_key_prefix = $1 AND is_active = true;

-- name: ListClients :many
SELECT * FROM client_organizations
WHERE is_active = true
ORDER BY created_at DESC
LIMIT $1 OFFSET $2;

-- name: UpdateClientRiskTier :one
UPDATE client_organizations
SET risk_tier = $2, custom_allocations = $3, updated_at = NOW()
WHERE id = $1
RETURNING *;

-- name: UpdateClientKYBStatus :one
UPDATE client_organizations
SET kyb_status = $2, kyb_verified_at = CASE WHEN $2 = 'verified' THEN NOW() ELSE NULL END, updated_at = NOW()
WHERE id = $1
RETURNING *;

-- name: UpdateClientWebhook :one
UPDATE client_organizations
SET webhook_url = $2, webhook_secret = $3, updated_at = NOW()
WHERE id = $1
RETURNING *;

-- name: DeactivateClient :one
UPDATE client_organizations
SET is_active = false, updated_at = NOW()
WHERE id = $1
RETURNING *;

-- ============================================
-- END-USER DEPOSITS QUERIES
-- ============================================

-- name: CreateEndUserDeposit :one
INSERT INTO end_user_deposits (
    client_id,
    user_id,
    balance,
    entry_index,
    wallet_address
) VALUES (
    $1, $2, $3, $4, $5
) RETURNING *;

-- name: GetEndUserDeposit :one
SELECT * FROM end_user_deposits
WHERE client_id = $1 AND user_id = $2 AND is_active = true;

-- name: GetEndUserDepositByID :one
SELECT * FROM end_user_deposits
WHERE id = $1 AND is_active = true;

-- name: ListEndUserDepositsByClient :many
SELECT * FROM end_user_deposits
WHERE client_id = $1 AND is_active = true
ORDER BY created_at DESC
LIMIT $2 OFFSET $3;

-- name: UpdateEndUserBalance :one
UPDATE end_user_deposits
SET balance = $3, last_deposit_at = NOW(), updated_at = NOW()
WHERE client_id = $1 AND user_id = $2
RETURNING *;

-- name: UpdateEndUserBalanceWithdraw :one
UPDATE end_user_deposits
SET balance = $3, last_withdrawal_at = NOW(), updated_at = NOW()
WHERE client_id = $1 AND user_id = $2
RETURNING *;

-- name: GetClientTotalDeposits :one
SELECT 
    COUNT(*) as total_users,
    SUM(balance) as total_balance
FROM end_user_deposits
WHERE client_id = $1 AND is_active = true;

-- ============================================
-- VAULT INDICES QUERIES
-- ============================================

-- name: CreateVaultIndex :one
INSERT INTO vault_indices (
    client_id,
    risk_tier,
    current_index,
    total_deposits,
    total_value
) VALUES (
    $1, $2, $3, $4, $5
) RETURNING *;

-- name: GetVaultIndex :one
SELECT * FROM vault_indices
WHERE client_id = $1 AND risk_tier = $2;

-- name: UpdateVaultIndex :one
UPDATE vault_indices
SET 
    current_index = $3,
    total_value = $4,
    total_yield_earned = $5,
    apy_current = $6,
    apy_7d = $7,
    apy_30d = $8,
    last_updated_at = NOW()
WHERE client_id = $1 AND risk_tier = $2
RETURNING *;

-- name: ListVaultIndicesByClient :many
SELECT * FROM vault_indices
WHERE client_id = $1
ORDER BY risk_tier;

-- ============================================
-- CLIENT BALANCES QUERIES
-- ============================================

-- name: CreateClientBalance :one
INSERT INTO client_balances (
    client_id,
    available,
    reserved,
    currency
) VALUES (
    $1, $2, $3, $4
) RETURNING *;

-- name: GetClientBalance :one
SELECT * FROM client_balances
WHERE client_id = $1;

-- name: UpdateClientBalance :one
UPDATE client_balances
SET available = $2, reserved = $3, updated_at = NOW()
WHERE client_id = $1
RETURNING *;

-- name: DeductFromClientBalance :one
UPDATE client_balances
SET available = available - $2, updated_at = NOW()
WHERE client_id = $1 AND available >= $2
RETURNING *;

-- name: AddToClientBalance :one
UPDATE client_balances
SET available = available + $2, last_topup_at = NOW(), updated_at = NOW()
WHERE client_id = $1
RETURNING *;

-- ============================================
-- DEFI ALLOCATIONS QUERIES
-- ============================================

-- name: CreateDefiAllocation :one
INSERT INTO defi_allocations (
    client_id,
    protocol,
    chain,
    amount_deployed,
    percentage,
    apy,
    tx_hash,
    wallet_address
) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8
) RETURNING *;

-- name: GetDefiAllocationByID :one
SELECT * FROM defi_allocations
WHERE id = $1;

-- name: ListActiveAllocationsByClient :many
SELECT * FROM defi_allocations
WHERE client_id = $1 AND status = 'active'
ORDER BY deployed_at DESC;

-- name: ListAllocationsByProtocol :many
SELECT * FROM defi_allocations
WHERE client_id = $1 AND protocol = $2 AND status = 'active'
ORDER BY deployed_at DESC;

-- name: UpdateAllocationYield :one
UPDATE defi_allocations
SET yield_earned = $2, apy = $3
WHERE id = $1
RETURNING *;

-- name: WithdrawAllocation :one
UPDATE defi_allocations
SET status = 'withdrawn', withdrawn_at = NOW()
WHERE id = $1
RETURNING *;

-- name: GetClientTotalAllocations :one
SELECT 
    SUM(amount_deployed) as total_deployed,
    AVG(apy) as average_apy,
    SUM(yield_earned) as total_yield
FROM defi_allocations
WHERE client_id = $1 AND status = 'active';

-- ============================================
-- DEPOSIT TRANSACTIONS QUERIES
-- ============================================

-- name: CreateDepositTransaction :one
INSERT INTO deposit_transactions (
    order_id,
    client_id,
    user_id,
    deposit_type,
    payment_method,
    fiat_amount,
    crypto_amount,
    currency,
    crypto_currency,
    gateway_fee,
    proxify_fee,
    network_fee,
    total_fees,
    status,
    payment_url,
    gateway_order_id,
    client_balance_id,
    deducted_from_client,
    wallet_address,
    expires_at
) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20
) RETURNING *;

-- name: GetDepositByOrderID :one
SELECT * FROM deposit_transactions
WHERE order_id = $1;

-- name: GetDepositByID :one
SELECT * FROM deposit_transactions
WHERE id = $1;

-- name: ListDepositsByUser :many
SELECT * FROM deposit_transactions
WHERE client_id = $1 AND user_id = $2
ORDER BY created_at DESC
LIMIT $3 OFFSET $4;

-- name: ListDepositsByClient :many
SELECT * FROM deposit_transactions
WHERE client_id = $1
ORDER BY created_at DESC
LIMIT $2 OFFSET $3;

-- name: UpdateDepositStatus :one
UPDATE deposit_transactions
SET 
    status = $2,
    crypto_amount = COALESCE($3, crypto_amount),
    completed_at = CASE WHEN $2 IN ('completed', 'instant_completed') THEN NOW() ELSE completed_at END,
    failed_at = CASE WHEN $2 = 'failed' THEN NOW() ELSE failed_at END
WHERE order_id = $1
RETURNING *;

-- name: UpdateDepositError :one
UPDATE deposit_transactions
SET 
    status = 'failed',
    error_message = $2,
    error_code = $3,
    failed_at = NOW()
WHERE order_id = $1
RETURNING *;

-- name: GetPendingDeposits :many
SELECT * FROM deposit_transactions
WHERE status IN ('pending', 'awaiting_payment', 'processing')
AND created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;

-- ============================================
-- WITHDRAWAL TRANSACTIONS QUERIES
-- ============================================

-- name: CreateWithdrawalTransaction :one
INSERT INTO withdrawal_transactions (
    order_id,
    client_id,
    user_id,
    requested_amount,
    actual_amount,
    currency,
    withdrawal_fee,
    network_fee,
    destination_type,
    destination_details,
    status
) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
) RETURNING *;

-- name: GetWithdrawalByOrderID :one
SELECT * FROM withdrawal_transactions
WHERE order_id = $1;

-- name: ListWithdrawalsByUser :many
SELECT * FROM withdrawal_transactions
WHERE client_id = $1 AND user_id = $2
ORDER BY created_at DESC
LIMIT $3 OFFSET $4;

-- name: UpdateWithdrawalStatus :one
UPDATE withdrawal_transactions
SET 
    status = $2,
    completed_at = CASE WHEN $2 = 'completed' THEN NOW() ELSE completed_at END,
    failed_at = CASE WHEN $2 = 'failed' THEN NOW() ELSE failed_at END
WHERE order_id = $1
RETURNING *;

-- ============================================
-- AUDIT LOGS QUERIES
-- ============================================

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
) RETURNING *;

-- name: ListAuditLogsByClient :many
SELECT * FROM audit_logs
WHERE client_id = $1
ORDER BY created_at DESC
LIMIT $2 OFFSET $3;

-- name: ListAuditLogsByUser :many
SELECT * FROM audit_logs
WHERE client_id = $1 AND user_id = $2
ORDER BY created_at DESC
LIMIT $3 OFFSET $4;

-- name: ListAuditLogsByAction :many
SELECT * FROM audit_logs
WHERE action = $1
ORDER BY created_at DESC
LIMIT $2 OFFSET $3;
