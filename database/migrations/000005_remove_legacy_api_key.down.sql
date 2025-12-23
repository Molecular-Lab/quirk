-- Add back legacy api_key columns for rollback
ALTER TABLE client_organizations ADD COLUMN api_key_hash VARCHAR(255);
ALTER TABLE client_organizations ADD COLUMN api_key_prefix VARCHAR(20);
