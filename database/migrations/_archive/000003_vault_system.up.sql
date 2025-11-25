-- ============================================
-- MIGRATION 000003: INDEX-BASED VAULT SYSTEM
-- ============================================
-- Creates tables for index-based vault accounting with DeFi protocol integration
-- Based on INDEX_VAULT_SYSTEM.md architecture
-- Migration applied: [timestamp will be auto-generated]

BEGIN;

-- ============================================
-- 1. UPDATE CLIENT_VAULTS (Add Index Fields)
-- ============================================

-- Add index-based accounting fields to existing client_vaults table
ALTER TABLE client_vaults
ADD COLUMN IF NOT EXISTS total_shares NUMERIC(78,0) DEFAULT 0,
ADD COLUMN IF NOT EXISTS current_index NUMERIC(78,0) DEFAULT 1000000000000000000,
ADD COLUMN IF NOT EXISTS last_index_update TIMESTAMPTZ DEFAULT now(),
ADD COLUMN IF NOT EXISTS pending_deposit_balance NUMERIC(40,18) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_staked_balance NUMERIC(40,18) DEFAULT 0,
ADD COLUMN IF NOT EXISTS cumulative_yield NUMERIC(40,18) DEFAULT 0,
ADD COLUMN IF NOT EXISTS apy_7d NUMERIC(10,4),
ADD COLUMN IF NOT EXISTS apy_30d NUMERIC(10,4);

-- Create index for vaults with pending deposits ready for staking
CREATE INDEX IF NOT EXISTS idx_client_vaults_pending
ON client_vaults(pending_deposit_balance)
WHERE pending_deposit_balance >= 10000;

COMMENT ON COLUMN client_vaults.total_shares IS 'Sum of all user shares (scaled by 1e18)';
COMMENT ON COLUMN client_vaults.current_index IS 'Growth index starting at 1.0 (1e18), increases with yield';
COMMENT ON COLUMN client_vaults.last_index_update IS 'Timestamp of last index update from yield harvest';
COMMENT ON COLUMN client_vaults.pending_deposit_balance IS 'Funds waiting to be staked (not yet deployed to DeFi)';
COMMENT ON COLUMN client_vaults.total_staked_balance IS 'Funds actively deployed in DeFi protocols';
COMMENT ON COLUMN client_vaults.cumulative_yield IS 'Total yield earned since vault creation';

-- ============================================
-- 2. VAULT_STRATEGIES (DeFi Allocation Config)
-- ============================================

CREATE TABLE IF NOT EXISTS vault_strategies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  client_vault_id UUID NOT NULL REFERENCES client_vaults(id) ON DELETE CASCADE,

  -- Strategy allocation
  category VARCHAR(20) NOT NULL,
  -- Categories: 'lending', 'lp', 'staking'

  target_percent NUMERIC(5,2) NOT NULL,
  -- Target allocation percentage (e.g., 50.00 for 50%)
  -- Sum of all strategies for a vault should be 100.00

  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- Ensure one strategy per category per vault
  UNIQUE(client_vault_id, category),

  -- Validate percentage
  CHECK (target_percent >= 0 AND target_percent <= 100)
);

CREATE INDEX idx_vault_strategies_vault ON vault_strategies(client_vault_id);
CREATE INDEX idx_vault_strategies_active ON vault_strategies(is_active) WHERE is_active = true;

COMMENT ON TABLE vault_strategies IS 'DeFi strategy allocation configuration for client vaults';
COMMENT ON COLUMN vault_strategies.category IS 'Strategy category: lending, lp, staking';
COMMENT ON COLUMN vault_strategies.target_percent IS 'Target allocation percentage (must sum to 100 per vault)';

-- ============================================
-- 3. END_USER_VAULTS (Share-Based Accounting)
-- ============================================

CREATE TABLE IF NOT EXISTS end_user_vaults (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relationships
  end_user_id UUID NOT NULL REFERENCES end_users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES client_organizations(id) ON DELETE CASCADE,

  -- Chain & Token
  chain VARCHAR(50) NOT NULL,
  token_address VARCHAR(66) NOT NULL,
  token_symbol VARCHAR(20) NOT NULL,

  -- Index-Based Accounting (scaled by 1e18)
  shares NUMERIC(78,0) NOT NULL DEFAULT 0,
  -- User's share balance (like ERC-4626 vault shares)
  -- effective_balance = shares * current_index / 1e18

  weighted_entry_index NUMERIC(78,0) NOT NULL DEFAULT 1000000000000000000,
  -- Weighted average index at which user deposited
  -- Handles DCA (dollar-cost averaging) deposits correctly
  -- Starts at 1.0 (1e18)

  -- Historical tracking
  total_deposited NUMERIC(40,18) DEFAULT 0,
  total_withdrawn NUMERIC(40,18) DEFAULT 0,
  last_deposit_at TIMESTAMPTZ,
  last_withdrawal_at TIMESTAMPTZ,

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- One vault per user per chain/token
  UNIQUE(end_user_id, chain, token_address)
);

CREATE INDEX idx_end_user_vaults_user ON end_user_vaults(end_user_id);
CREATE INDEX idx_end_user_vaults_client ON end_user_vaults(client_id);
CREATE INDEX idx_end_user_vaults_active ON end_user_vaults(is_active) WHERE is_active = true;

COMMENT ON TABLE end_user_vaults IS 'Individual user vault positions using share-based accounting';
COMMENT ON COLUMN end_user_vaults.shares IS 'User share balance (scaled 1e18). Effective balance = shares * current_index / 1e18';
COMMENT ON COLUMN end_user_vaults.weighted_entry_index IS 'Weighted average entry index for DCA deposits';

-- ============================================
-- 4. SUPPORTED_DEFI_PROTOCOLS
-- ============================================

CREATE TABLE IF NOT EXISTS supported_defi_protocols (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  name VARCHAR(100) NOT NULL,
  -- e.g., 'Aave', 'Compound', 'Curve', 'Uniswap'

  category VARCHAR(20) NOT NULL,
  -- 'lending', 'lp', 'staking'

  chain VARCHAR(50) NOT NULL,
  -- 'ethereum', 'polygon', 'arbitrum', etc.

  address_book JSONB NOT NULL,
  -- {
  --   "pool": "0x...",
  --   "token": "0x...",
  --   "router": "0x...",
  --   "abi": "..."
  -- }

  apy NUMERIC(10,4),
  -- Current APY (updated daily)

  risk_score INTEGER,
  -- 1-10 (1 = lowest risk, 10 = highest)

  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(name, chain)
);

CREATE INDEX idx_defi_protocols_category ON supported_defi_protocols(category);
CREATE INDEX idx_defi_protocols_chain ON supported_defi_protocols(chain);
CREATE INDEX idx_defi_protocols_active ON supported_defi_protocols(is_active, category, chain) WHERE is_active = true;

COMMENT ON TABLE supported_defi_protocols IS 'Available DeFi protocols for yield generation';
COMMENT ON COLUMN supported_defi_protocols.address_book IS 'Smart contract addresses and ABIs for protocol interaction';

-- ============================================
-- 5. DEFI_ALLOCATIONS (Protocol Deployments)
-- ============================================

CREATE TABLE IF NOT EXISTS defi_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  client_id UUID NOT NULL REFERENCES client_organizations(id) ON DELETE CASCADE,
  client_vault_id UUID NOT NULL REFERENCES client_vaults(id) ON DELETE CASCADE,
  protocol_id UUID NOT NULL REFERENCES supported_defi_protocols(id),

  category VARCHAR(20) NOT NULL,
  -- 'lending', 'lp', 'staking'

  chain VARCHAR(50) NOT NULL,
  token_address VARCHAR(66) NOT NULL,
  token_symbol VARCHAR(20) NOT NULL,

  -- Allocation details
  balance NUMERIC(78,0) NOT NULL DEFAULT 0,
  -- Current balance in protocol (scaled by 1e18)

  percentage_allocation NUMERIC(5,2),
  -- Actual allocation percentage

  apy NUMERIC(10,4),
  -- APY at time of deployment

  yield_earned NUMERIC(40,18) DEFAULT 0,
  -- Cumulative yield earned from this protocol

  -- Deployment tracking
  tx_hash VARCHAR(66),
  deployed_at TIMESTAMPTZ,
  last_rebalance_at TIMESTAMPTZ,

  status VARCHAR(20) DEFAULT 'active',
  -- 'active', 'unstaking', 'inactive'

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- One allocation per vault per protocol
  UNIQUE(client_vault_id, protocol_id)
);

CREATE INDEX idx_defi_allocations_vault ON defi_allocations(client_vault_id);
CREATE INDEX idx_defi_allocations_client ON defi_allocations(client_id);
CREATE INDEX idx_defi_allocations_protocol ON defi_allocations(protocol_id);
CREATE INDEX idx_defi_allocations_status ON defi_allocations(status);

COMMENT ON TABLE defi_allocations IS 'Tracks actual deployments to DeFi protocols';
COMMENT ON COLUMN defi_allocations.balance IS 'Current balance deployed to this protocol (scaled 1e18)';

-- ============================================
-- 6. DEPOSIT_BATCH_QUEUE (Staking Queue)
-- ============================================

CREATE TABLE IF NOT EXISTS deposit_batch_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  client_vault_id UUID NOT NULL REFERENCES client_vaults(id) ON DELETE CASCADE,
  deposit_transaction_id UUID NOT NULL REFERENCES deposit_transactions(id),

  amount NUMERIC(40,18) NOT NULL,

  status VARCHAR(20) DEFAULT 'pending',
  -- 'pending' | 'batched' | 'staked'

  batched_at TIMESTAMPTZ,
  staked_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_deposit_queue_vault ON deposit_batch_queue(client_vault_id);
CREATE INDEX idx_deposit_queue_status ON deposit_batch_queue(status);
CREATE INDEX idx_deposit_queue_pending ON deposit_batch_queue(created_at)
WHERE status = 'pending';

COMMENT ON TABLE deposit_batch_queue IS 'Queue of deposits waiting to be batched and staked to DeFi protocols';

-- ============================================
-- 7. WITHDRAWAL_QUEUE (Unstaking Management)
-- ============================================

CREATE TABLE IF NOT EXISTS withdrawal_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  client_id UUID NOT NULL REFERENCES client_organizations(id) ON DELETE CASCADE,
  withdrawal_transaction_id UUID NOT NULL REFERENCES withdrawal_transactions(id),
  end_user_vault_id UUID NOT NULL REFERENCES end_user_vaults(id),

  -- Withdrawal details
  shares_to_burn NUMERIC(78,0) NOT NULL,
  estimated_amount NUMERIC(40,18) NOT NULL,
  actual_amount NUMERIC(40,18),

  -- Unstaking details
  protocols_to_unstake JSONB,
  -- [{protocol_id, amount_to_unstake}]

  priority INTEGER DEFAULT 0,
  -- Higher priority = process first

  status VARCHAR(20) DEFAULT 'queued',
  -- 'queued' | 'unstaking' | 'ready' | 'processing' | 'completed' | 'failed'

  queued_at TIMESTAMPTZ DEFAULT now(),
  unstaking_started_at TIMESTAMPTZ,
  ready_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  error_message TEXT,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_withdrawal_queue_client ON withdrawal_queue(client_id);
CREATE INDEX idx_withdrawal_queue_status ON withdrawal_queue(status);
CREATE INDEX idx_withdrawal_queue_priority ON withdrawal_queue(priority DESC, queued_at ASC)
WHERE status = 'queued';

COMMENT ON TABLE withdrawal_queue IS 'Queue for withdrawal requests requiring DeFi unstaking';
COMMENT ON COLUMN withdrawal_queue.shares_to_burn IS 'User shares to burn for this withdrawal';
COMMENT ON COLUMN withdrawal_queue.protocols_to_unstake IS 'List of protocols to unstake from with amounts';

COMMIT;
