-- ============================================
-- ROLLBACK: 000006_end_user_vaults_use_static_key
-- ============================================

-- Step 1: Drop new constraints and indexes
DROP INDEX IF EXISTS idx_end_user_vaults_environment;
DROP INDEX IF EXISTS idx_end_user_vaults_user_id;
ALTER TABLE end_user_vaults DROP CONSTRAINT IF EXISTS end_user_vaults_end_user_client_env_key;
ALTER TABLE end_user_vaults DROP CONSTRAINT IF EXISTS fk_end_user_vaults_end_user;

-- Step 2: Swap columns back
ALTER TABLE end_user_vaults RENAME COLUMN end_user_id TO end_user_id_static_backup;
ALTER TABLE end_user_vaults RENAME COLUMN end_user_id_old_uuid TO end_user_id;

-- Step 3: Restore original constraints
ALTER TABLE end_user_vaults
ADD CONSTRAINT end_user_vaults_end_user_client_env_key
  UNIQUE (end_user_id, client_id, environment);

ALTER TABLE end_user_vaults
ADD CONSTRAINT end_user_vaults_end_user_id_fkey
  FOREIGN KEY (end_user_id)
  REFERENCES end_users(id)
  ON DELETE CASCADE;

-- Step 4: Restore original indexes
CREATE INDEX idx_end_user_vaults_user_id ON end_user_vaults(end_user_id);
CREATE INDEX idx_end_user_vaults_environment ON end_user_vaults(end_user_id, client_id, environment);

-- Step 5: Drop backup column
ALTER TABLE end_user_vaults DROP COLUMN end_user_id_static_backup;

-- Step 6: Restore documentation
COMMENT ON COLUMN end_user_vaults.end_user_id IS NULL;

RAISE NOTICE '✅ Rollback 000006 completed - reverted to UUID foreign key';
