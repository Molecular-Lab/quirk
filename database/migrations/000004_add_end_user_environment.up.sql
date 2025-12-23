-- Migration: Add environment column to end_users table
-- Purpose: Enable environment-based filtering for dashboard metrics

-- 1. Add environment column with default
ALTER TABLE end_users
ADD COLUMN environment VARCHAR(20) DEFAULT 'sandbox'
  CHECK (environment IN ('sandbox', 'production'));

-- 2. Create index for environment queries
CREATE INDEX idx_end_users_environment ON end_users(client_id, environment);

-- 3. Backfill existing users to sandbox
UPDATE end_users SET environment = 'sandbox' WHERE environment IS NULL;

-- 4. Make NOT NULL after backfill
ALTER TABLE end_users ALTER COLUMN environment SET NOT NULL;

-- 5. Update unique constraint to include environment
-- This allows the same user_id to exist in both sandbox and production
ALTER TABLE end_users DROP CONSTRAINT end_users_client_id_user_id_key;
ALTER TABLE end_users ADD CONSTRAINT end_users_client_user_env_key
  UNIQUE (client_id, user_id, environment);

-- 6. Add documentation
COMMENT ON COLUMN end_users.environment IS 'sandbox or production - same user can exist in both environments';
