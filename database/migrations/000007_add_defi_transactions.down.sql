-- Rollback: Remove DeFi Transactions Table

-- Drop trigger first
DROP TRIGGER IF EXISTS trigger_defi_transactions_updated_at ON defi_transactions;
DROP FUNCTION IF EXISTS update_defi_transactions_updated_at();

-- Drop indexes
DROP INDEX IF EXISTS idx_defi_transactions_client_id;
DROP INDEX IF EXISTS idx_defi_transactions_vault_id;
DROP INDEX IF EXISTS idx_defi_transactions_end_user_id;
DROP INDEX IF EXISTS idx_defi_transactions_tx_hash;
DROP INDEX IF EXISTS idx_defi_transactions_protocol;
DROP INDEX IF EXISTS idx_defi_transactions_operation_type;
DROP INDEX IF EXISTS idx_defi_transactions_status;
DROP INDEX IF EXISTS idx_defi_transactions_executed_at;
DROP INDEX IF EXISTS idx_defi_transactions_environment;
DROP INDEX IF EXISTS idx_defi_transactions_client_executed;
DROP INDEX IF EXISTS idx_defi_transactions_user_executed;

-- Drop table
DROP TABLE IF EXISTS defi_transactions;
