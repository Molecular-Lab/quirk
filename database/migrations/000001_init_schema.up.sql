-- ============================================
-- PROXIFY B2B PLATFORM - COMPLETE DATABASE SCHEMA
-- ============================================
-- Migration: 000001_init_schema
-- Description: Initial schema with index-based vault accounting
-- Created: 2025-11-17
-- Updated: 2025-11-24 (Consolidated migrations 002-004)

-- ============================================
-- 0. PRIVY ACCOUNTS (Identity Layer)
-- ============================================
-- One Privy user can create multiple organizations (e.g., GrabPay, GrabFood)
-- This table stores the identity layer, organizations reference it via FK

CREATE TABLE privy_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Privy Identity (UNIQUE per user)
  privy_organization_id VARCHAR(255) UNIQUE NOT NULL,
  privy_wallet_address VARCHAR(66) UNIQUE NOT NULL,
  privy_email VARCHAR(255),
  wallet_type VARCHAR(20) NOT NULL CHECK (wallet_type IN ('MANAGED', 'USER_OWNED', 'custodial', 'non-custodial')),

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_privy_accounts_org_id ON privy_accounts(privy_organization_id);
CREATE INDEX idx_privy_accounts_wallet ON privy_accounts(privy_wallet_address);
CREATE INDEX idx_privy_accounts_email ON privy_accounts(privy_email) WHERE privy_email IS NOT NULL;

COMMENT ON TABLE privy_accounts IS 'One row per Privy user (identity layer). One user can create multiple organizations.';
COMMENT ON COLUMN privy_accounts.privy_organization_id IS 'Privy user ID (unique per user, e.g., clb_abc123)';
COMMENT ON COLUMN privy_accounts.privy_wallet_address IS 'Privy custodial wallet address (shared across all organizations for this user)';
COMMENT ON COLUMN privy_accounts.wallet_type IS 'MANAGED (Privy custodial) | USER_OWNED (user-managed wallet)';

-- ============================================
-- 1. CLIENT ORGANIZATIONS (Product Owners)
-- ============================================

CREATE TABLE client_organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Privy Account Reference (one user can have multiple organizations)
  privy_account_id UUID NOT NULL REFERENCES privy_accounts(id) ON DELETE RESTRICT,

  -- Organization Info
  product_id VARCHAR(255) UNIQUE NOT NULL,
  company_name VARCHAR(255) NOT NULL,
  business_type VARCHAR(100) NOT NULL,
  description TEXT,
  website_url TEXT,

  -- API Credentials
  api_key_hash VARCHAR(255) UNIQUE,
  api_key_prefix VARCHAR(20),
  webhook_urls TEXT[] DEFAULT '{}',
  webhook_secret VARCHAR(255),

  -- Strategy & Yield Distribution
  custom_strategy JSONB,
  end_user_yield_portion NUMERIC(5,2),

  -- Currency Configuration
  supported_currencies JSONB DEFAULT '[]'::jsonb,
  bank_accounts JSONB DEFAULT '[]'::jsonb,

  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_sandbox BOOLEAN NOT NULL DEFAULT false,

  -- Billing
  platform_fee NUMERIC(5,2),
  performance_fee NUMERIC(5,2) DEFAULT 10.00,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_client_orgs_privy_account ON client_organizations(privy_account_id);
CREATE INDEX idx_client_orgs_product_id ON client_organizations(product_id);
CREATE INDEX idx_client_orgs_active ON client_organizations(is_active) WHERE is_active = true;

COMMENT ON TABLE client_organizations IS 'Product organizations - multiple per Privy user (e.g., GrabPay, GrabFood). References privy_accounts for identity.';
COMMENT ON COLUMN client_organizations.privy_account_id IS 'Foreign key to privy_accounts (one user can have many organizations)';
COMMENT ON COLUMN client_organizations.product_id IS 'Primary public identifier for API operations (e.g., prod_abc123)';
COMMENT ON COLUMN client_organizations.business_type IS 'ecommerce, streaming, gaming, freelance, saas, other';
COMMENT ON COLUMN client_organizations.end_user_yield_portion IS 'Percent of yield given to end users (e.g., 90.00)';

-- ============================================
-- 2. CLIENT BALANCES (Prepaid Credits)
-- ============================================

CREATE TABLE client_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relationships
  client_id UUID UNIQUE NOT NULL REFERENCES client_organizations(id) ON DELETE CASCADE,

  -- Balance Tracking
  available NUMERIC(20,6) NOT NULL DEFAULT 0,
  reserved NUMERIC(20,6) NOT NULL DEFAULT 0,

  -- Currency
  currency VARCHAR(10) NOT NULL DEFAULT 'USD',

  -- Timestamps
  last_topup_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  CHECK (available >= 0),
  CHECK (reserved >= 0)
);

CREATE INDEX idx_client_balances_available ON client_balances(available);

COMMENT ON TABLE client_balances IS 'Prepaid balances for instant internal transfers (client pays upfront)';
COMMENT ON COLUMN client_balances.available IS 'Available for internal transfers';
COMMENT ON COLUMN client_balances.reserved IS 'Reserved for pending operations';

-- ============================================
-- 3. END-USERS
-- ============================================

CREATE TABLE end_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relationships
  client_id UUID NOT NULL REFERENCES client_organizations(id) ON DELETE CASCADE,
  user_id VARCHAR(255) NOT NULL,

  -- User Type & Wallet
  user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('custodial', 'non-custodial')),
  user_wallet_address VARCHAR(66),

  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,

  -- Timestamps
  first_deposit_at TIMESTAMPTZ,
  last_deposit_at TIMESTAMPTZ,
  last_withdrawal_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  UNIQUE(client_id, user_id)
);

CREATE INDEX idx_end_users_client_id ON end_users(client_id);
CREATE INDEX idx_end_users_user_id ON end_users(user_id);
CREATE INDEX idx_end_users_active ON end_users(is_active) WHERE is_active = true;

COMMENT ON TABLE end_users IS 'End-users who deposit funds through client platforms';
COMMENT ON COLUMN end_users.user_id IS 'Client internal user ID';
COMMENT ON COLUMN end_users.user_type IS 'custodial | non-custodial';

-- ============================================
-- 4. CLIENT VAULTS (Index-Based Growth Tracking)
-- ============================================

CREATE TABLE client_vaults (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relationships
  client_id UUID NOT NULL REFERENCES client_organizations(id) ON DELETE CASCADE,

  -- Chain & Token
  chain VARCHAR(50) NOT NULL,
  token_address VARCHAR(66) NOT NULL,
  token_symbol VARCHAR(20) NOT NULL,

  -- Total shares issued to all users
  total_shares NUMERIC(78,0) NOT NULL DEFAULT 0,

  -- Growth Index (scaled by 1e18)
  current_index NUMERIC(78,0) NOT NULL DEFAULT 1000000000000000000,
  last_index_update TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Actual balances
  pending_deposit_balance NUMERIC(40,18) NOT NULL DEFAULT 0,
  total_staked_balance NUMERIC(40,18) NOT NULL DEFAULT 0,
  cumulative_yield NUMERIC(40,18) NOT NULL DEFAULT 0,

  -- Performance tracking
  apy_7d NUMERIC(10,4),
  apy_30d NUMERIC(10,4),

  -- DeFi Strategy Allocation (JSONB for atomic updates)
  strategies JSONB DEFAULT '[]'::jsonb,

  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  UNIQUE(client_id, chain, token_address),
  CHECK (total_shares >= 0),
  CHECK (current_index >= 1000000000000000000),
  CHECK (pending_deposit_balance >= 0),
  CHECK (total_staked_balance >= 0),
  CHECK (cumulative_yield >= 0)
);

CREATE INDEX idx_client_vaults_client_id ON client_vaults(client_id);
CREATE INDEX idx_client_vaults_chain_token ON client_vaults(chain, token_address);
CREATE INDEX idx_client_vaults_pending ON client_vaults(pending_deposit_balance)
  WHERE pending_deposit_balance >= 10000;
CREATE INDEX idx_client_vaults_active ON client_vaults(is_active) WHERE is_active = true;

COMMENT ON TABLE client_vaults IS 'Aggregated custodial vault per client with index-based yield tracking';
COMMENT ON COLUMN client_vaults.total_shares IS 'Sum of all end_user_vaults.shares for this vault';
COMMENT ON COLUMN client_vaults.current_index IS 'Growth index (scaled by 1e18, starts at 1.0)';
COMMENT ON COLUMN client_vaults.pending_deposit_balance IS 'Deposits waiting to be batched and staked';
COMMENT ON COLUMN client_vaults.total_staked_balance IS 'Total amount deployed to DeFi protocols';
COMMENT ON COLUMN client_vaults.strategies IS 'DeFi strategy allocation as JSONB array: [{"category":"lending","target":70,"isActive":true},{"category":"lp","target":20,"isActive":true}]. Sum of targets should equal 100.';

-- ============================================
-- 5. END-USER VAULTS (Share-Based Accounting)
-- ============================================

CREATE TABLE end_user_vaults (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relationships
  end_user_id UUID NOT NULL REFERENCES end_users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES client_organizations(id) ON DELETE CASCADE,

  -- ✅ SIMPLIFIED: No chain, no token, no shares!
  -- User sees ONLY: total deposited + yield (backend manages multi-chain)

  -- User's Position (fiat-denominated, aggregated across all chains/tokens)
  total_deposited NUMERIC(40,18) NOT NULL DEFAULT 0,     -- $1,000 (sum of all deposits)
  total_withdrawn NUMERIC(40,18) NOT NULL DEFAULT 0,     -- $500 (sum of all withdrawals)
  weighted_entry_index NUMERIC(78,0) NOT NULL DEFAULT 1000000000000000000,  -- Client's growth index at deposit time

  -- Activity tracking
  last_deposit_at TIMESTAMPTZ,
  last_withdrawal_at TIMESTAMPTZ,

  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  UNIQUE(end_user_id, client_id),  -- ✅ ONE vault per user per client!
  CHECK (total_deposited >= 0),
  CHECK (total_withdrawn >= 0),
  CHECK (weighted_entry_index >= 1000000000000000000)
);

CREATE INDEX idx_end_user_vaults_user_id ON end_user_vaults(end_user_id);
CREATE INDEX idx_end_user_vaults_client_id ON end_user_vaults(client_id);
CREATE INDEX idx_end_user_vaults_active ON end_user_vaults(is_active) WHERE is_active = true;

COMMENT ON TABLE end_user_vaults IS 'Simplified user vault positions - ONE vault per user per client (backend manages multi-chain/token)';
COMMENT ON COLUMN end_user_vaults.total_deposited IS 'Cumulative fiat deposit amount across ALL chains/tokens';
COMMENT ON COLUMN end_user_vaults.total_withdrawn IS 'Cumulative fiat withdrawal amount across ALL chains/tokens';
COMMENT ON COLUMN end_user_vaults.weighted_entry_index IS 'Client growth index at deposit time (weighted avg of all client vaults)';
COMMENT ON COLUMN end_user_vaults.weighted_entry_index IS 'Formula: current_value = total_deposited × (client_growth_index / weighted_entry_index)';

-- ============================================
-- 6. SUPPORTED DEFI PROTOCOLS
-- ============================================

CREATE TABLE supported_defi_protocols (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Protocol Info
  name VARCHAR(50) NOT NULL,
  chain VARCHAR(50) NOT NULL,

  -- Contract Addresses
  address_book JSONB NOT NULL,

  -- Classification
  category VARCHAR(50) NOT NULL,
  risk_level VARCHAR(20) NOT NULL CHECK (risk_level IN ('low', 'medium', 'high')),

  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  UNIQUE(name, chain)
);

CREATE INDEX idx_protocols_name ON supported_defi_protocols(name);
CREATE INDEX idx_protocols_chain ON supported_defi_protocols(chain);
CREATE INDEX idx_protocols_category ON supported_defi_protocols(category);
CREATE INDEX idx_protocols_active ON supported_defi_protocols(is_active) WHERE is_active = true;

COMMENT ON TABLE supported_defi_protocols IS 'Reference table for supported DeFi protocol integrations across chains';
COMMENT ON COLUMN supported_defi_protocols.address_book IS 'Protocol addresses: {pool, router, wrapped_usdt, wrapped_usdc, reward_distributor}';
COMMENT ON COLUMN supported_defi_protocols.category IS 'Lending | LP | RealYield | Arbitrage';

-- ============================================
-- 7. DEFI ALLOCATIONS
-- ============================================

CREATE TABLE defi_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relationships
  client_id UUID NOT NULL REFERENCES client_organizations(id) ON DELETE CASCADE,
  client_vault_id UUID NOT NULL REFERENCES client_vaults(id) ON DELETE CASCADE,
  protocol_id UUID NOT NULL REFERENCES supported_defi_protocols(id) ON DELETE RESTRICT,

  -- Strategy Info
  category VARCHAR(50) NOT NULL,

  -- Chain & Token
  chain VARCHAR(50) NOT NULL,
  token_address VARCHAR(66) NOT NULL,
  token_symbol VARCHAR(20) NOT NULL,

  -- Allocation Details (scaled by 1e18)
  balance NUMERIC(78,0) NOT NULL DEFAULT 0,
  percentage_allocation NUMERIC(5,2) NOT NULL,

  -- Performance
  apy NUMERIC(10,4),
  yield_earned NUMERIC(78,0) NOT NULL DEFAULT 0,

  -- Transaction Details
  tx_hash VARCHAR(66),

  -- Status
  status VARCHAR(50) NOT NULL DEFAULT 'active',

  -- Timestamps
  deployed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_rebalance_at TIMESTAMPTZ,
  withdrawn_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  UNIQUE(client_vault_id, protocol_id),
  CHECK (balance >= 0),
  CHECK (percentage_allocation >= 0 AND percentage_allocation <= 100),
  CHECK (yield_earned >= 0),
  CHECK (status IN ('active', 'withdrawn', 'rebalancing'))
);

CREATE INDEX idx_defi_allocations_client_id ON defi_allocations(client_id);
CREATE INDEX idx_defi_allocations_vault_id ON defi_allocations(client_vault_id);
CREATE INDEX idx_defi_allocations_protocol_id ON defi_allocations(protocol_id);
CREATE INDEX idx_defi_allocations_status ON defi_allocations(status);
CREATE INDEX idx_defi_allocations_chain_token ON defi_allocations(chain, token_address);

COMMENT ON TABLE defi_allocations IS 'Tracks fund allocations to DeFi protocols';
COMMENT ON COLUMN defi_allocations.balance IS 'Current balance deployed (scaled by 1e18)';
COMMENT ON COLUMN defi_allocations.yield_earned IS 'Cumulative yield earned (scaled by 1e18)';
COMMENT ON COLUMN defi_allocations.status IS 'active | withdrawn | rebalancing';

-- ============================================
-- 8. DEPOSIT TRANSACTIONS
-- ============================================

CREATE TABLE deposit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Order Info
  order_id VARCHAR(100) UNIQUE NOT NULL,

  -- Relationships
  client_id UUID NOT NULL REFERENCES client_organizations(id) ON DELETE CASCADE,
  user_id VARCHAR(255) NOT NULL,

  -- Type & Method
  deposit_type VARCHAR(50) NOT NULL CHECK (deposit_type IN ('external', 'internal')),
  payment_method VARCHAR(50),

  -- Amounts
  fiat_amount NUMERIC(20,6) NOT NULL,
  crypto_amount NUMERIC(20,6),
  currency VARCHAR(10) NOT NULL DEFAULT 'USD',
  crypto_currency VARCHAR(10) DEFAULT 'USDC',

  -- Fees (external deposits only)
  gateway_fee NUMERIC(20,6) DEFAULT 0,
  proxify_fee NUMERIC(20,6) DEFAULT 0,
  network_fee NUMERIC(20,6) DEFAULT 0,
  total_fees NUMERIC(20,6) DEFAULT 0,

  -- Status
  status VARCHAR(50) NOT NULL DEFAULT 'pending',

  -- External Payment Details
  payment_url TEXT,
  gateway_order_id VARCHAR(255),

  -- Internal Transfer Details
  client_balance_id UUID REFERENCES client_balances(id),
  deducted_from_client NUMERIC(20,6),

  -- Wallet
  wallet_address VARCHAR(66),

  -- Blockchain details (for fiat on-ramp)
  chain VARCHAR(50),
  token_symbol VARCHAR(20),
  token_address VARCHAR(255),
  on_ramp_provider VARCHAR(50) DEFAULT 'proxify_gateway',
  qr_code TEXT,
  transaction_hash VARCHAR(255),

  -- Payment Instructions (for bank transfer)
  payment_instructions JSONB,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,

  -- Error Tracking
  error_message TEXT,
  error_code VARCHAR(100),

  -- Constraints
  CHECK (fiat_amount > 0),
  CHECK (crypto_amount IS NULL OR crypto_amount > 0),
  CHECK (gateway_fee >= 0),
  CHECK (proxify_fee >= 0),
  CHECK (network_fee >= 0),
  CHECK (total_fees >= 0),
  CHECK (deducted_from_client IS NULL OR deducted_from_client > 0)
);

CREATE INDEX idx_deposit_txns_order_id ON deposit_transactions(order_id);
CREATE INDEX idx_deposit_txns_client_id ON deposit_transactions(client_id);
CREATE INDEX idx_deposit_txns_user_id ON deposit_transactions(user_id);
CREATE INDEX idx_deposit_txns_status ON deposit_transactions(status);
CREATE INDEX idx_deposit_txns_created_at ON deposit_transactions(created_at);
CREATE INDEX idx_deposit_txns_chain ON deposit_transactions(chain);
CREATE INDEX idx_deposit_txns_token_symbol ON deposit_transactions(token_symbol);
CREATE INDEX idx_deposit_txns_on_ramp_provider ON deposit_transactions(on_ramp_provider);
CREATE INDEX idx_deposit_txns_transaction_hash ON deposit_transactions(transaction_hash);

COMMENT ON TABLE deposit_transactions IS 'Unified table for all deposit transactions (fiat on-ramp, internal transfers, etc.)';
COMMENT ON COLUMN deposit_transactions.chain IS 'Blockchain network (base, ethereum, etc.)';
COMMENT ON COLUMN deposit_transactions.token_symbol IS 'Token symbol (USDC, USDT, etc.)';
COMMENT ON COLUMN deposit_transactions.token_address IS 'Token contract address';
COMMENT ON COLUMN deposit_transactions.on_ramp_provider IS 'Fiat on-ramp provider (proxify_gateway, moonpay, etc.)';
COMMENT ON COLUMN deposit_transactions.transaction_hash IS 'Blockchain transaction hash after mint/transfer';
COMMENT ON COLUMN deposit_transactions.qr_code IS 'QR code for payment (base64 encoded)';
CREATE INDEX idx_deposit_txns_gateway_order_id ON deposit_transactions(gateway_order_id)
  WHERE gateway_order_id IS NOT NULL;

COMMENT ON COLUMN deposit_transactions.deposit_type IS 'external | internal';

-- Mock USDC Mints (for testnet on-ramp tracking)
CREATE TABLE IF NOT EXISTS mock_usdc_mints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deposit_transaction_id UUID NOT NULL REFERENCES deposit_transactions(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES client_organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES end_users(id) ON DELETE CASCADE,

    -- Mint details
    amount DECIMAL(20, 8) NOT NULL,
    chain VARCHAR(50) NOT NULL,
    token_address VARCHAR(255) NOT NULL,

    -- Destination
    destination_wallet VARCHAR(255) NOT NULL,

    -- Mock transaction
    mock_transaction_hash VARCHAR(255) NOT NULL,
    block_number BIGINT,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_mock_usdc_mints_deposit_transaction_id ON mock_usdc_mints(deposit_transaction_id);
CREATE INDEX idx_mock_usdc_mints_client_id ON mock_usdc_mints(client_id);
CREATE INDEX idx_mock_usdc_mints_user_id ON mock_usdc_mints(user_id);
CREATE INDEX idx_mock_usdc_mints_created_at ON mock_usdc_mints(created_at DESC);

COMMENT ON TABLE mock_usdc_mints IS 'Tracks mock USDC mints for testnet on-ramp completions';

-- ============================================
-- 9. WITHDRAWAL TRANSACTIONS
-- ============================================

CREATE TABLE withdrawal_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Order Info
  order_id VARCHAR(100) UNIQUE NOT NULL,

  -- Relationships
  client_id UUID NOT NULL REFERENCES client_organizations(id) ON DELETE CASCADE,
  user_id VARCHAR(255) NOT NULL,

  -- Amounts
  requested_amount NUMERIC(20,6) NOT NULL,
  actual_amount NUMERIC(20,6),
  currency VARCHAR(10) NOT NULL DEFAULT 'USD',

  -- Fees
  withdrawal_fee NUMERIC(20,6) DEFAULT 0,
  network_fee NUMERIC(20,6) DEFAULT 0,

  -- Gateway Details
  gateway_order_id VARCHAR(255),

  -- Destination
  destination_type VARCHAR(50) NOT NULL,
  destination_details JSONB,

  -- Status
  status VARCHAR(50) NOT NULL DEFAULT 'pending',

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,

  -- Error Tracking
  error_message TEXT,
  error_code VARCHAR(100),

  -- Constraints
  CHECK (requested_amount > 0),
  CHECK (actual_amount IS NULL OR actual_amount > 0),
  CHECK (withdrawal_fee >= 0),
  CHECK (network_fee >= 0),
  CHECK (destination_type IN ('client_balance', 'bank_account', 'debit_card', 'crypto_wallet'))
);

CREATE INDEX idx_withdrawal_txns_order_id ON withdrawal_transactions(order_id);
CREATE INDEX idx_withdrawal_txns_client_id ON withdrawal_transactions(client_id);
CREATE INDEX idx_withdrawal_txns_user_id ON withdrawal_transactions(user_id);
CREATE INDEX idx_withdrawal_txns_status ON withdrawal_transactions(status);
CREATE INDEX idx_withdrawal_txns_created_at ON withdrawal_transactions(created_at);
CREATE INDEX idx_withdrawal_txns_gateway_order_id ON withdrawal_transactions(gateway_order_id)
  WHERE gateway_order_id IS NOT NULL;

COMMENT ON TABLE withdrawal_transactions IS 'Withdrawal transactions - user cashes out to bank/card or back to client balance';
COMMENT ON COLUMN withdrawal_transactions.destination_type IS 'client_balance | bank_account | debit_card | crypto_wallet';

-- ============================================
-- 10. DEPOSIT BATCH QUEUE
-- ============================================

CREATE TABLE deposit_batch_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relationships
  client_vault_id UUID NOT NULL REFERENCES client_vaults(id) ON DELETE CASCADE,
  deposit_transaction_id UUID NOT NULL REFERENCES deposit_transactions(id) ON DELETE CASCADE,

  -- Amount
  amount NUMERIC(40,18) NOT NULL,

  -- Status tracking
  status VARCHAR(20) NOT NULL DEFAULT 'pending',

  batched_at TIMESTAMPTZ,
  staked_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  CHECK (amount > 0),
  CHECK (status IN ('pending', 'batched', 'staked'))
);

CREATE INDEX idx_deposit_queue_vault_id ON deposit_batch_queue(client_vault_id);
CREATE INDEX idx_deposit_queue_txn_id ON deposit_batch_queue(deposit_transaction_id);
CREATE INDEX idx_deposit_queue_status ON deposit_batch_queue(status);
CREATE INDEX idx_deposit_queue_pending ON deposit_batch_queue(created_at)
  WHERE status = 'pending';

COMMENT ON TABLE deposit_batch_queue IS 'Queue for deposits waiting to be batched and staked';
COMMENT ON COLUMN deposit_batch_queue.status IS 'pending → batched → staked';

-- ============================================
-- 11. WITHDRAWAL QUEUE
-- ============================================

CREATE TABLE withdrawal_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relationships
  client_id UUID NOT NULL REFERENCES client_organizations(id) ON DELETE CASCADE,
  withdrawal_transaction_id UUID NOT NULL REFERENCES withdrawal_transactions(id) ON DELETE CASCADE,
  end_user_vault_id UUID NOT NULL REFERENCES end_user_vaults(id) ON DELETE CASCADE,

  -- Withdrawal details
  shares_to_burn NUMERIC(78,0) NOT NULL,
  estimated_amount NUMERIC(40,18) NOT NULL,
  actual_amount NUMERIC(40,18),

  -- Unstaking details
  protocols_to_unstake JSONB,

  -- Priority
  priority INTEGER NOT NULL DEFAULT 0,

  -- Status tracking
  status VARCHAR(20) NOT NULL DEFAULT 'queued',

  queued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  unstaking_started_at TIMESTAMPTZ,
  ready_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  -- Error tracking
  error_message TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  CHECK (shares_to_burn > 0),
  CHECK (estimated_amount > 0),
  CHECK (actual_amount IS NULL OR actual_amount > 0),
  CHECK (priority >= 0),
  CHECK (status IN ('queued', 'unstaking', 'ready', 'processing', 'completed', 'failed'))
);

CREATE INDEX idx_withdrawal_queue_client_id ON withdrawal_queue(client_id);
CREATE INDEX idx_withdrawal_queue_txn_id ON withdrawal_queue(withdrawal_transaction_id);
CREATE INDEX idx_withdrawal_queue_vault_id ON withdrawal_queue(end_user_vault_id);
CREATE INDEX idx_withdrawal_queue_status ON withdrawal_queue(status);
CREATE INDEX idx_withdrawal_queue_priority ON withdrawal_queue(priority DESC, queued_at ASC)
  WHERE status = 'queued';
CREATE INDEX idx_withdrawal_queue_unstaking ON withdrawal_queue(unstaking_started_at)
  WHERE status = 'unstaking';

COMMENT ON TABLE withdrawal_queue IS 'Queue for withdrawals requiring DeFi unstaking';
COMMENT ON COLUMN withdrawal_queue.shares_to_burn IS 'Shares to burn from user vault (proportional to withdrawal)';
COMMENT ON COLUMN withdrawal_queue.protocols_to_unstake IS 'JSON array of protocols to unstake from';
COMMENT ON COLUMN withdrawal_queue.priority IS 'Higher = process first (0 = normal, 10 = high)';
COMMENT ON COLUMN withdrawal_queue.status IS 'queued → unstaking → ready → processing → completed';

-- ============================================
-- 12. AUDIT LOGS
-- ============================================

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Actor
  client_id UUID REFERENCES client_organizations(id) ON DELETE SET NULL,
  user_id VARCHAR(255),
  actor_type VARCHAR(50) NOT NULL CHECK (actor_type IN ('client', 'end_user', 'system', 'admin')),

  -- Action
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id VARCHAR(255),

  -- Details
  description TEXT,
  metadata JSONB,

  -- Request Info
  ip_address INET,
  user_agent TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_logs_client_id ON audit_logs(client_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);

COMMENT ON TABLE audit_logs IS 'Complete audit trail for all system activities';
COMMENT ON COLUMN audit_logs.actor_type IS 'client | end_user | system | admin';
COMMENT ON COLUMN audit_logs.action IS 'client.registered | deposit.created | withdrawal.completed | vault.rebalanced | etc.';

-- ============================================
-- TRIGGERS: Auto-update timestamps
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_client_organizations_updated_at
  BEFORE UPDATE ON client_organizations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_client_balances_updated_at
  BEFORE UPDATE ON client_balances
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_end_users_updated_at
  BEFORE UPDATE ON end_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_client_vaults_updated_at
  BEFORE UPDATE ON client_vaults
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_end_user_vaults_updated_at
  BEFORE UPDATE ON end_user_vaults
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_supported_defi_protocols_updated_at
  BEFORE UPDATE ON supported_defi_protocols
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_defi_allocations_updated_at
  BEFORE UPDATE ON defi_allocations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_privy_accounts_updated_at
  BEFORE UPDATE ON privy_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_withdrawal_queue_updated_at
  BEFORE UPDATE ON withdrawal_queue
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
