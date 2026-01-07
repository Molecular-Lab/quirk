-- name: CreateDemoRequest :one
INSERT INTO demo_requests (
  first_name,
  last_name,
  email,
  company_name,
  country,
  company_size,
  capital_volume,
  industry
)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
RETURNING *;

-- name: GetDemoRequestByEmail :one
SELECT * FROM demo_requests
WHERE email = $1
ORDER BY created_at DESC
LIMIT 1;

-- name: ListDemoRequests :many
SELECT * FROM demo_requests
ORDER BY created_at DESC
LIMIT $1 OFFSET $2;

-- name: CountDemoRequests :one
SELECT COUNT(*) FROM demo_requests;

-- name: GetDemoRequestById :one
SELECT * FROM demo_requests
WHERE id = $1
LIMIT 1;
