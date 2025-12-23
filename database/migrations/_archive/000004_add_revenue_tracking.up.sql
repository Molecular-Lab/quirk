-- Migration: Add revenue tracking and vault index history
-- This migration adds tables to track fee distributions and vault performance metrics

-- ============================================================================
-- 1. Create revenue_distributions table
-- ============================================================================

CREATE TABLE IF NOT EXISTS revenue_distributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Reference to withdrawal transaction (nullable for future batch distributions)
    withdrawal_transaction_id UUID REFERENCES withdrawal_transactions(id) ON DELETE SET NULL,

    -- Reference to vault where yield was generated
    vault_id UUID NOT NULL REFERENCES client_vaults(id) ON DELETE CASCADE,

    -- Yield amounts (all in USD, 18 decimals)
    raw_yield NUMERIC(40,18) NOT NULL CHECK (raw_yield >= 0),
    enduser_revenue NUMERIC(40,18) NOT NULL CHECK (enduser_revenue >= 0),
    client_revenue NUMERIC(40,18) NOT NULL CHECK (client_revenue >= 0),
    platform_revenue NUMERIC(40,18) NOT NULL CHECK (platform_revenue >= 0),

    -- Fee percentages at time of distribution
    client_revenue_percent NUMERIC(5,2) NOT NULL CHECK (client_revenue_percent >= 0 AND client_revenue_percent <= 100),
    platform_fee_percent NUMERIC(5,2) NOT NULL CHECK (platform_fee_percent >= 0 AND platform_fee_percent <= 100),

    -- Whether fees were deducted from withdrawal or deferred
    is_deducted BOOLEAN NOT NULL DEFAULT false,

    -- Timestamps
    distributed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Validation: sum of splits should equal raw yield
    CONSTRAINT revenue_split_sum_check CHECK (
        ABS((enduser_revenue + client_revenue + platform_revenue) - raw_yield) < 0.000001
    )
);

-- Create indexes for revenue queries
CREATE INDEX idx_revenue_distributions_withdrawal ON revenue_distributions(withdrawal_transaction_id);
CREATE INDEX idx_revenue_distributions_vault ON revenue_distributions(vault_id);
CREATE INDEX idx_revenue_distributions_distributed_at ON revenue_distributions(distributed_at DESC);
CREATE INDEX idx_revenue_distributions_is_deducted ON revenue_distributions(is_deducted) WHERE is_deducted = false;

-- Add comments
COMMENT ON TABLE revenue_distributions IS 'Tracks yield distribution splits between end-users, clients, and platform';
COMMENT ON COLUMN revenue_distributions.raw_yield IS 'Total yield generated before fee split (in USD)';
COMMENT ON COLUMN revenue_distributions.enduser_revenue IS 'Yield allocated to end-user (typically 77.5%)';
COMMENT ON COLUMN revenue_distributions.client_revenue IS 'Revenue allocated to client (typically 15%)';
COMMENT ON COLUMN revenue_distributions.platform_revenue IS 'Revenue allocated to Proxify platform (typically 7.5%)';
COMMENT ON COLUMN revenue_distributions.is_deducted IS 'Whether fees were deducted from withdrawal or deferred for later settlement';

-- ============================================================================
-- 2. Create vault_index_history table (for 7d/30d APY calculation)
-- ============================================================================

CREATE TABLE IF NOT EXISTS vault_index_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Reference to vault
    vault_id UUID NOT NULL REFERENCES client_vaults(id) ON DELETE CASCADE,

    -- Index snapshot
    index_value NUMERIC(78,0) NOT NULL CHECK (index_value > 0),

    -- Performance metrics at this point
    daily_yield NUMERIC(40,18),
    daily_apy NUMERIC(10,4),

    -- Timestamp of snapshot
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for history queries
CREATE INDEX idx_vault_index_history_vault_timestamp ON vault_index_history(vault_id, timestamp DESC);
CREATE INDEX idx_vault_index_history_timestamp ON vault_index_history(timestamp DESC);

-- Add comments
COMMENT ON TABLE vault_index_history IS 'Historical snapshots of vault index values for calculating rolling APY metrics';
COMMENT ON COLUMN vault_index_history.index_value IS 'Vault index at this timestamp (scaled by 1e18)';
COMMENT ON COLUMN vault_index_history.daily_yield IS 'Yield generated in the last 24 hours (in USD)';
COMMENT ON COLUMN vault_index_history.daily_apy IS 'Annualized APY based on last 24h growth';

-- ============================================================================
-- 3. Add environment-aware APY simulation config to client_organizations
-- ============================================================================

-- Add columns for sandbox APY simulation
ALTER TABLE client_organizations
ADD COLUMN IF NOT EXISTS sandbox_apy_simulation_rate NUMERIC(10,4) DEFAULT 5.00 CHECK (sandbox_apy_simulation_rate >= 0 AND sandbox_apy_simulation_rate <= 100),
ADD COLUMN IF NOT EXISTS production_use_real_defi BOOLEAN DEFAULT true;

-- Add comments
COMMENT ON COLUMN client_organizations.sandbox_apy_simulation_rate IS 'Annual APY rate for time-based index simulation in sandbox environment (e.g., 5.00 = 5%)';
COMMENT ON COLUMN client_organizations.production_use_real_defi IS 'Whether to use real DeFi protocol data in production (true) or mock (false)';

-- ============================================================================
-- 4. Add vault index update tracking columns
-- ============================================================================

-- Add last successful index update timestamp
ALTER TABLE client_vaults
ADD COLUMN IF NOT EXISTS last_successful_index_update TIMESTAMPTZ;

COMMENT ON COLUMN client_vaults.last_successful_index_update IS 'Timestamp of last successful index update (different from last_index_update which tracks any attempt)';
