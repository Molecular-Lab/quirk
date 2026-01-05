-- Rollback: Remove balance sync timestamp column

ALTER TABLE client_vaults
DROP COLUMN IF EXISTS last_balance_sync_at;
