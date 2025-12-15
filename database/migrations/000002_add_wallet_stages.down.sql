-- ============================================
-- ROLLBACK: WALLET STAGES & DASHBOARD METRICS
-- ============================================
-- Migration: 000002_add_wallet_stages (DOWN)
-- Description: Revert wallet stage columns and aggregated metrics from client_organizations
-- Created: 2025-12-10

-- Drop indexes
DROP INDEX IF EXISTS idx_client_orgs_earning_balance;
DROP INDEX IF EXISTS idx_client_orgs_idle_balance;

-- Remove columns (in reverse order of creation)
ALTER TABLE client_organizations
  DROP COLUMN IF EXISTS total_withdrawn,
  DROP COLUMN IF EXISTS total_deposited,
  DROP COLUMN IF EXISTS active_users_30d,
  DROP COLUMN IF EXISTS new_users_30d,
  DROP COLUMN IF EXISTS total_end_users,
  DROP COLUMN IF EXISTS enduser_revenue_earned,
  DROP COLUMN IF EXISTS platform_revenue_earned,
  DROP COLUMN IF EXISTS client_revenue_earned,
  DROP COLUMN IF EXISTS earning_balance,
  DROP COLUMN IF EXISTS idle_balance;
