-- name: CreateUser :one
INSERT INTO users (wallet_address, name, email)
VALUES ($1, $2, $3)
RETURNING *;

-- name: GetUserByWallet :one
SELECT * FROM users
WHERE wallet_address = $1;

-- name: GetUsers :many
SELECT * FROM users;

-- name: UpdateUserByAddress :one
UPDATE users
SET name = $2
WHERE wallet_address = $1
RETURNING *;

-- name: DeleteUserByAddress :execrows
DELETE FROM users
WHERE wallet_address = $1;

-- name: DeleteUserById :execrows
DELETE FROM users
WHERE id = $1;