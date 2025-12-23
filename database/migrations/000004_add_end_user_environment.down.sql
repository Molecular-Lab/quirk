-- Rollback: Remove environment column from end_users table

-- 1. Restore original unique constraint
ALTER TABLE end_users DROP CONSTRAINT IF EXISTS end_users_client_user_env_key;
ALTER TABLE end_users ADD CONSTRAINT end_users_client_id_user_id_key UNIQUE (client_id, user_id);

-- 2. Drop index
DROP INDEX IF EXISTS idx_end_users_environment;

-- 3. Remove environment column
ALTER TABLE end_users DROP COLUMN IF EXISTS environment;
