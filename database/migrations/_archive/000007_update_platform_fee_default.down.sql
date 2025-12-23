-- Rollback: Revert platform fee default from 10% back to 7.5%

BEGIN;

-- Step 1: Revert the default value to 7.5%
ALTER TABLE client_organizations
  ALTER COLUMN platform_fee_percent SET DEFAULT 7.50;

-- Step 2: Revert existing clients back to 7.5%
-- Only revert clients that were updated by the up migration (have 10%)
UPDATE client_organizations
SET platform_fee_percent = 7.50,
    updated_at = now()
WHERE platform_fee_percent = 10.00;

COMMIT;
