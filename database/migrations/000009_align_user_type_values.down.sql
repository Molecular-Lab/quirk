-- ============================================
-- REVERT USER_TYPE VALUES ALIGNMENT
-- ============================================
-- Rollback: Revert end_users.user_type back to old enum values

-- Step 1: Drop the new CHECK constraint
ALTER TABLE end_users DROP CONSTRAINT IF EXISTS end_users_user_type_check;

-- Step 2: Revert data to old values
UPDATE end_users SET user_type = 'custodial' WHERE user_type = 'MANAGED';
UPDATE end_users SET user_type = 'non-custodial' WHERE user_type = 'USER_OWNED';

-- Step 3: Re-add old CHECK constraint
ALTER TABLE end_users
  ADD CONSTRAINT end_users_user_type_check
  CHECK (user_type IN ('custodial', 'non-custodial'));

-- Step 4: Revert column comment
COMMENT ON COLUMN end_users.user_type IS 'custodial | non-custodial';
