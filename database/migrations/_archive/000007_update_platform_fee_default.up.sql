-- Migration: Update platform fee default from 7.5% to 10%
-- Reason: Platform fee should default to 10% as per business requirements

BEGIN;

-- Step 1: Update the default value for new clients
ALTER TABLE client_organizations
  ALTER COLUMN platform_fee_percent SET DEFAULT 10.00;

-- Step 2: Update existing clients that have the old default (7.5%)
-- Only update clients still using the old default value
UPDATE client_organizations
SET platform_fee_percent = 10.00,
    updated_at = now()
WHERE platform_fee_percent = 7.50;

COMMIT;

-- Note: The CHECK constraint allows values between 5.00 and 10.00, so 10.00 is valid
-- Revenue split will now be: Platform 10% + Client 15% + End-User 75% = 100%
