-- Rollback: Performance Optimization Indexes
-- Removes all composite indexes added in 000007_performance_indexes.up.sql

-- Deposit Transactions
DROP INDEX CONCURRENTLY IF EXISTS idx_deposit_txns_client_status_created;
DROP INDEX CONCURRENTLY IF EXISTS idx_deposit_txns_env_status_created;
DROP INDEX CONCURRENTLY IF EXISTS idx_deposit_txns_client_completed_stats;

-- Withdrawal Transactions
DROP INDEX CONCURRENTLY IF EXISTS idx_withdrawal_txns_client_status_created;
DROP INDEX CONCURRENTLY IF EXISTS idx_withdrawal_txns_env_status_created;
DROP INDEX CONCURRENTLY IF EXISTS idx_withdrawal_txns_client_completed_stats;

-- Client Vaults
DROP INDEX CONCURRENTLY IF EXISTS idx_client_vaults_client_env_active;
DROP INDEX CONCURRENTLY IF EXISTS idx_client_vaults_client_active_balances;
DROP INDEX CONCURRENTLY IF EXISTS idx_client_vaults_active_pending;

-- End User Vaults
DROP INDEX CONCURRENTLY IF EXISTS idx_end_user_vaults_client_chain_token;
DROP INDEX CONCURRENTLY IF EXISTS idx_end_user_vaults_user_active_shares;

-- End Users
DROP INDEX CONCURRENTLY IF EXISTS idx_end_users_client_active_created;
DROP INDEX CONCURRENTLY IF EXISTS idx_end_users_last_deposit;

-- Audit Logs
DROP INDEX CONCURRENTLY IF EXISTS idx_audit_logs_client_created;
DROP INDEX CONCURRENTLY IF EXISTS idx_audit_logs_client_action_created;

-- Withdrawal Queue
DROP INDEX CONCURRENTLY IF EXISTS idx_withdrawal_queue_client_status_json;
