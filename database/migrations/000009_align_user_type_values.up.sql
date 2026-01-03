-- ============================================
-- ALIGN USER_TYPE VALUES WITH WALLET_TYPE
-- ============================================
-- Purpose: Change end_users.user_type to match privy_accounts.wallet_type enum values
-- From: 'custodial', 'non-custodial'
-- To: 'MANAGED', 'USER_OWNED'

-- Step 1: Drop the old CHECK constraint
ALTER TABLE end_users DROP CONSTRAINT IF EXISTS end_users_user_type_check;

-- Step 2: Update existing data
UPDATE end_users SET user_type = 'MANAGED' WHERE user_type = 'custodial';
UPDATE end_users SET user_type = 'USER_OWNED' WHERE user_type = 'non-custodial';

-- Step 3: Add new CHECK constraint with aligned values
ALTER TABLE end_users
  ADD CONSTRAINT end_users_user_type_check
  CHECK (user_type IN ('MANAGED', 'USER_OWNED'));

-- Step 4: Update column comment
COMMENT ON COLUMN end_users.user_type IS 'MANAGED (custodial) | USER_OWNED (non-custodial)';
