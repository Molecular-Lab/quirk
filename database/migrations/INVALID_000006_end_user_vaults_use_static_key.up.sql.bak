-- ============================================
-- MIGRATION: 000006_end_user_vaults_use_static_key
-- Description: Change end_user_vaults.end_user_id from UUID to Static Key (VARCHAR)
-- Created: 2025-12-26
-- ============================================

-- Step 1: Add new column (nullable for backfill)
ALTER TABLE end_user_vaults
ADD COLUMN end_user_id_static VARCHAR(255);

COMMENT ON COLUMN end_user_vaults.end_user_id_static IS 'Temporary column for migration - will replace end_user_id';

-- Step 2: Backfill Static Keys from end_users table
UPDATE end_user_vaults euv
SET end_user_id_static = eu.user_id
FROM end_users eu
WHERE euv.end_user_id = eu.id;

-- Step 3: Verify no nulls (safety check)
DO $$
DECLARE
    null_count INT;
BEGIN
    SELECT COUNT(*) INTO null_count
    FROM end_user_vaults
    WHERE end_user_id_static IS NULL;

    IF null_count > 0 THEN
        RAISE EXCEPTION 'Migration failed: % rows have NULL end_user_id_static. Cannot proceed.', null_count;
    END IF;
END $$;

-- Step 4: Drop old constraints and indexes referencing end_user_id
DROP INDEX IF EXISTS idx_end_user_vaults_environment;
DROP INDEX IF EXISTS idx_end_user_vaults_user_id;
ALTER TABLE end_user_vaults DROP CONSTRAINT end_user_vaults_end_user_client_env_key;
ALTER TABLE end_user_vaults DROP CONSTRAINT end_user_vaults_end_user_id_fkey;

-- Step 5: Rename columns (swap old UUID with new VARCHAR)
ALTER TABLE end_user_vaults RENAME COLUMN end_user_id TO end_user_id_old_uuid;
ALTER TABLE end_user_vaults RENAME COLUMN end_user_id_static TO end_user_id;

-- Step 6: Make new column NOT NULL
ALTER TABLE end_user_vaults ALTER COLUMN end_user_id SET NOT NULL;

-- Step 7: Recreate constraints and indexes
-- Unique constraint
ALTER TABLE end_user_vaults
ADD CONSTRAINT end_user_vaults_end_user_client_env_key
  UNIQUE (end_user_id, client_id, environment);

-- Composite foreign key (references end_users.user_id instead of id)
ALTER TABLE end_user_vaults
ADD CONSTRAINT fk_end_user_vaults_end_user
  FOREIGN KEY (client_id, end_user_id, environment)
  REFERENCES end_users(client_id, user_id, environment)
  ON DELETE CASCADE;

-- Indexes
CREATE INDEX idx_end_user_vaults_user_id ON end_user_vaults(end_user_id);
CREATE INDEX idx_end_user_vaults_environment ON end_user_vaults(end_user_id, client_id, environment);

-- Step 8: Update documentation
COMMENT ON COLUMN end_user_vaults.end_user_id IS 'Static Key from end_users.user_id (e.g., did:privy:xxx or client_user_123) - enables direct lookups without JOIN';
COMMENT ON COLUMN end_user_vaults.end_user_id_old_uuid IS 'OLD UUID column - kept temporarily for rollback safety. Will be dropped in next migration.';

-- Step 9: Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Migration 000006 completed successfully';
    RAISE NOTICE '   - Backfilled % rows', (SELECT COUNT(*) FROM end_user_vaults);
    RAISE NOTICE '   - Old UUID column preserved as end_user_id_old_uuid';
    RAISE NOTICE '   - New VARCHAR column is now end_user_id';
END $$;
