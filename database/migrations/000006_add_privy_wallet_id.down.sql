-- Rollback privy_wallet_id column
DROP INDEX IF EXISTS idx_client_vaults_privy_wallet_id;
ALTER TABLE client_vaults DROP COLUMN IF EXISTS privy_wallet_id;
