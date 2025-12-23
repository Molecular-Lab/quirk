-- Remove legacy api_key columns (replaced by environment-specific keys: sandbox_api_key, production_api_key)
-- These columns are no longer used as we have separate sandbox/production keys

ALTER TABLE client_organizations DROP COLUMN IF EXISTS api_key_hash;
ALTER TABLE client_organizations DROP COLUMN IF EXISTS api_key_prefix;
