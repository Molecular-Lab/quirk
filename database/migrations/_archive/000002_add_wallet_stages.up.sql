-- ============================================
-- WALLET STAGES & DASHBOARD METRICS
-- ============================================
-- Migration: 000002_add_wallet_stages
-- Description: Add wallet stage columns and aggregated metrics to client_organizations
-- Created: 2025-12-10

-- Add wallet stage columns
ALTER TABLE client_organizations
  ADD COLUMN idle_balance NUMERIC(20,6) DEFAULT 0 CHECK (idle_balance >= 0),
  ADD COLUMN earning_balance NUMERIC(20,6) DEFAULT 0 CHECK (earning_balance >= 0);

-- Add revenue tracking columns
ALTER TABLE client_organizations
  ADD COLUMN client_revenue_earned NUMERIC(20,6) DEFAULT 0 CHECK (client_revenue_earned >= 0),
  ADD COLUMN platform_revenue_earned NUMERIC(20,6) DEFAULT 0 CHECK (platform_revenue_earned >= 0),
  ADD COLUMN enduser_revenue_earned NUMERIC(20,6) DEFAULT 0 CHECK (enduser_revenue_earned >= 0);

-- Add end-user metrics columns
ALTER TABLE client_organizations
  ADD COLUMN total_end_users INTEGER DEFAULT 0 CHECK (total_end_users >= 0),
  ADD COLUMN new_users_30d INTEGER DEFAULT 0 CHECK (new_users_30d >= 0),
  ADD COLUMN active_users_30d INTEGER DEFAULT 0 CHECK (active_users_30d >= 0);

-- Add transaction totals columns
ALTER TABLE client_organizations
  ADD COLUMN total_deposited NUMERIC(20,6) DEFAULT 0 CHECK (total_deposited >= 0),
  ADD COLUMN total_withdrawn NUMERIC(20,6) DEFAULT 0 CHECK (total_withdrawn >= 0);

-- Add indexes for dashboard queries
CREATE INDEX idx_client_orgs_idle_balance ON client_organizations(idle_balance) WHERE idle_balance > 0;
CREATE INDEX idx_client_orgs_earning_balance ON client_organizations(earning_balance) WHERE earning_balance > 0;

-- Add comments
COMMENT ON COLUMN client_organizations.idle_balance IS 'Funds ready to be staked (waiting in wallet)';
COMMENT ON COLUMN client_organizations.earning_balance IS 'Funds actively deployed in DeFi protocols generating yield';
COMMENT ON COLUMN client_organizations.client_revenue_earned IS 'Total revenue earned by client from platform fee share';
COMMENT ON COLUMN client_organizations.platform_revenue_earned IS 'Total revenue earned by platform';
COMMENT ON COLUMN client_organizations.enduser_revenue_earned IS 'Total yield earned by end-users';
COMMENT ON COLUMN client_organizations.total_end_users IS 'Total number of active end-users for this client';
COMMENT ON COLUMN client_organizations.new_users_30d IS 'New end-users in last 30 days';
COMMENT ON COLUMN client_organizations.active_users_30d IS 'Active end-users in last 30 days';
COMMENT ON COLUMN client_organizations.total_deposited IS 'Cumulative total deposits from all end-users';
COMMENT ON COLUMN client_organizations.total_withdrawn IS 'Cumulative total withdrawals from all end-users';
