-- ============================================
-- Rollback B2B Tables
-- Migration: 000002_create_b2b_tables.down.sql
-- ============================================

DROP TRIGGER IF EXISTS update_client_balances_updated_at ON client_balances;
DROP TRIGGER IF EXISTS update_end_user_deposits_updated_at ON end_user_deposits;
DROP TRIGGER IF EXISTS update_client_orgs_updated_at ON client_organizations;

DROP FUNCTION IF EXISTS update_updated_at_column();

DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS withdrawal_transactions;
DROP TABLE IF EXISTS deposit_transactions;
DROP TABLE IF EXISTS defi_allocations;
DROP TABLE IF EXISTS client_balances;
DROP TABLE IF EXISTS vault_indices;
DROP TABLE IF EXISTS end_user_deposits;
DROP TABLE IF EXISTS client_organizations;
