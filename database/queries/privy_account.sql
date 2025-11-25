-- ============================================
-- PRIVY ACCOUNTS QUERIES
-- ============================================
-- Description: SQLC queries for privy_accounts table
-- Created: 2025-11-23

-- name: GetPrivyAccountByOrgId :one
SELECT * FROM privy_accounts
WHERE privy_organization_id = $1
LIMIT 1;

-- name: GetPrivyAccountById :one
SELECT * FROM privy_accounts
WHERE id = $1
LIMIT 1;

-- name: CreatePrivyAccount :one
INSERT INTO privy_accounts (
    privy_organization_id,
    privy_wallet_address,
    privy_email,
    wallet_type
) VALUES ($1, $2, $3, $4)
RETURNING *;

-- name: GetOrCreatePrivyAccount :one
INSERT INTO privy_accounts (
    privy_organization_id,
    privy_wallet_address,
    privy_email,
    wallet_type
) VALUES ($1, $2, $3, $4)
ON CONFLICT (privy_organization_id)
DO UPDATE SET
    updated_at = now(),
    privy_wallet_address = EXCLUDED.privy_wallet_address,
    privy_email = COALESCE(EXCLUDED.privy_email, privy_accounts.privy_email),
    wallet_type = EXCLUDED.wallet_type
RETURNING *;

-- name: UpdatePrivyAccountEmail :one
UPDATE privy_accounts
SET
    privy_email = $2,
    updated_at = now()
WHERE privy_organization_id = $1
RETURNING *;

-- name: ListAllPrivyAccounts :many
SELECT * FROM privy_accounts
ORDER BY created_at DESC;
