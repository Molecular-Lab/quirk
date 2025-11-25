-- ============================================
-- PROXIFY B2B PLATFORM - ROLLBACK MIGRATION
-- ============================================
-- Migration: 000001_init_schema (DOWN)
-- Description: Drops all tables in reverse dependency order

-- Drop triggers first
DROP TRIGGER IF EXISTS update_withdrawal_queue_updated_at ON withdrawal_queue;
DROP TRIGGER IF EXISTS update_defi_allocations_updated_at ON defi_allocations;
DROP TRIGGER IF EXISTS update_supported_defi_protocols_updated_at ON supported_defi_protocols;
DROP TRIGGER IF EXISTS update_end_user_vaults_updated_at ON end_user_vaults;
DROP TRIGGER IF EXISTS update_client_vaults_updated_at ON client_vaults;
DROP TRIGGER IF EXISTS update_end_users_updated_at ON end_users;
DROP TRIGGER IF EXISTS update_client_balances_updated_at ON client_balances;
DROP TRIGGER IF EXISTS update_privy_accounts_updated_at ON privy_accounts;
DROP TRIGGER IF EXISTS update_client_organizations_updated_at ON client_organizations;

-- Drop function
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS withdrawal_queue CASCADE;
DROP TABLE IF EXISTS deposit_batch_queue CASCADE;
DROP TABLE IF EXISTS withdrawal_transactions CASCADE;
DROP TABLE IF EXISTS deposit_transactions CASCADE;
DROP TABLE IF EXISTS defi_allocations CASCADE;
DROP TABLE IF EXISTS supported_defi_protocols CASCADE;
DROP TABLE IF EXISTS end_user_vaults CASCADE;
DROP TABLE IF EXISTS client_vaults CASCADE;
DROP TABLE IF EXISTS end_users CASCADE;
DROP TABLE IF EXISTS client_balances CASCADE;
DROP TABLE IF EXISTS client_organizations CASCADE;
DROP TABLE IF EXISTS privy_accounts CASCADE;
