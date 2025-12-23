-- ============================================
-- Add status column to end_users table
-- Migration: 000002_add_end_user_status
-- ============================================

-- Create enum type for end user status
CREATE TYPE end_user_status AS ENUM ('pending_onboarding', 'active', 'suspended');

-- Add status column to end_users table
ALTER TABLE end_users
ADD COLUMN status end_user_status NOT NULL DEFAULT 'active';

-- Add index for status column (for querying pending/active users)
CREATE INDEX idx_end_users_status ON end_users(status);

-- Add comment
COMMENT ON COLUMN end_users.status IS 'User onboarding and account status: pending_onboarding | active | suspended';

-- Update existing users to 'active' status (they bypassed onboarding)
UPDATE end_users SET status = 'active' WHERE is_active = true;

-- Keep is_active for backwards compatibility
-- Future: We might deprecate is_active in favor of status
