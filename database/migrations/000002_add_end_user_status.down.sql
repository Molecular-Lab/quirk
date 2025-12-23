-- ============================================
-- Rollback: Remove status column from end_users table
-- Migration: 000002_add_end_user_status
-- ============================================

-- Drop index
DROP INDEX IF EXISTS idx_end_users_status;

-- Drop column
ALTER TABLE end_users DROP COLUMN IF EXISTS status;

-- Drop enum type
DROP TYPE IF EXISTS end_user_status;
