-- Migration: Fix double-encoded bank_accounts stored as JSON strings
-- Purpose: Convert rows where `bank_accounts` is stored as a JSON string
-- (e.g. "[{\"currency\":...}]") into a real JSONB value.
-- IMPORTANT: Run this on a staging copy first and verify backups.

BEGIN;

-- Backup problematic rows to a simple audit table (id + original value)
CREATE TABLE IF NOT EXISTS client_organizations_bank_accounts_backup AS
SELECT id, bank_accounts AS original_bank_accounts, now() AS backed_at
FROM client_organizations
WHERE jsonb_typeof(bank_accounts) = 'string';

-- Update rows where bank_accounts is stored as a string to a JSONB value.
-- We cast to text then to jsonb; this will fail if the string is not valid JSON.
-- If you have suspect rows that may not be valid JSON, inspect the backup table
-- and fix them manually before running this migration in production.
UPDATE client_organizations
SET bank_accounts = (bank_accounts::text)::jsonb,
    updated_at = now()
WHERE jsonb_typeof(bank_accounts) = 'string';

COMMIT;

-- Verification examples (run manually):
-- SELECT count(*) FROM client_organizations WHERE jsonb_typeof(bank_accounts) = 'string';
-- SELECT id, bank_accounts FROM client_organizations WHERE id = '<some-id>';
