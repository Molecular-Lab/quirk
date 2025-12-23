-- ============================================
-- PROXIFY B2B PLATFORM - COMPLETE DATABASE SCHEMA
-- ============================================
-- Migration: 000001_complete_schema
-- Description: Consolidated schema from migrations 000001-000007
-- Created: 2025-01-20
-- Consolidates:
--   - 000001: Initial schema with index-based vault accounting
--   - 000002: Wallet stages & dashboard metrics
--   - 000003: Environment support (sandbox/production API keys)
--   - 000004: Revenue tracking & vault index history
--   - 000006: Vault environment support
--   - 000007: Platform fee default update (7.5% → 10%)

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
  wallet_type VARCHAR(20) NOT NULL CHECK (wallet_type IN ('MANAGED', 'USER_OWNED')),

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

  -- API Credentials (Legacy - kept for backward compatibility)
  api_key_hash VARCHAR(255) UNIQUE,
  api_key_prefix VARCHAR(20),

  -- Environment-Specific API Credentials (000003)
  sandbox_api_key VARCHAR(255),
  sandbox_api_secret VARCHAR(255),
  production_api_key VARCHAR(255),
  production_api_secret VARCHAR(255),

  webhook_urls TEXT[] DEFAULT '{}',
  webhook_secret VARCHAR(255),

  -- Strategy & Yield Distribution
  custom_strategy JSONB,

  -- Fee Configuration (3-way revenue split: Platform + Client + End-User = 100%)
  -- ✅ 000007: Updated platform_fee_percent default from 7.50 to 10.00
  client_revenue_share_percent NUMERIC(5,2) NOT NULL DEFAULT 15.00
    CHECK (client_revenue_share_percent >= 10.00 AND client_revenue_share_percent <= 20.00),
  platform_fee_percent NUMERIC(5,2) NOT NULL DEFAULT 10.00
    CHECK (platform_fee_percent >= 5.00 AND platform_fee_percent <= 10.00),
  performance_fee NUMERIC(5,2) DEFAULT 10.00,

  -- Ensure platform + client fees don't exceed 100%
  CONSTRAINT check_total_fees_valid
    CHECK (platform_fee_percent + client_revenue_share_percent < 100.00),

  -- MRR/ARR Tracking
  monthly_recurring_revenue NUMERIC(20,6) DEFAULT 0 CHECK (monthly_recurring_revenue >= 0),
  annual_run_rate NUMERIC(20,6) DEFAULT 0 CHECK (annual_run_rate >= 0),
  last_mrr_calculation_at TIMESTAMPTZ,

  -- Currency Configuration
  supported_currencies JSONB DEFAULT '[]'::jsonb,
  bank_accounts JSONB DEFAULT '[]'::jsonb,

  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_sandbox BOOLEAN NOT NULL DEFAULT false,

  -- Customer Tier
  customer_tier VARCHAR(20),

  -- Product-Level Strategy Configuration
  strategies_preferences JSONB DEFAULT '{}'::jsonb,
  strategies_customization JSONB DEFAULT '{}'::jsonb,

  -- Wallet Stages (000002)
  idle_balance NUMERIC(20,6) DEFAULT 0 CHECK (idle_balance >= 0),
  earning_balance NUMERIC(20,6) DEFAULT 0 CHECK (earning_balance >= 0),

  -- Revenue Tracking (000002)
  client_revenue_earned NUMERIC(20,6) DEFAULT 0 CHECK (client_revenue_earned >= 0),
  platform_revenue_earned NUMERIC(20,6) DEFAULT 0 CHECK (platform_revenue_earned >= 0),
  enduser_revenue_earned NUMERIC(20,6) DEFAULT 0 CHECK (enduser_revenue_earned >= 0),

  -- End-User Metrics (000002)
  total_end_users INTEGER DEFAULT 0 CHECK (total_end_users >= 0),
  new_users_30d INTEGER DEFAULT 0 CHECK (new_users_30d >= 0),
  active_users_30d INTEGER DEFAULT 0 CHECK (active_users_30d >= 0),

  -- Transaction Totals (000002)
  total_deposited NUMERIC(20,6) DEFAULT 0 CHECK (total_deposited >= 0),
  total_withdrawn NUMERIC(20,6) DEFAULT 0 CHECK (total_withdrawn >= 0),

  -- APY Simulation Config (000004)
  sandbox_apy_simulation_rate NUMERIC(10,4) DEFAULT 5.00 CHECK (sandbox_apy_simulation_rate >= 0 AND sandbox_apy_simulation_rate <= 100),
  production_use_real_defi BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_client_orgs_privy_account ON client_organizations(privy_account_id);
CREATE INDEX idx_client_orgs_product_id ON client_organizations(product_id);
CREATE INDEX idx_client_orgs_active ON client_organizations(is_active) WHERE is_active = true;
CREATE INDEX idx_client_orgs_customer_tier ON client_organizations(customer_tier);
CREATE INDEX idx_client_orgs_strategies_customization ON client_organizations USING GIN (strategies_customization);
CREATE INDEX idx_client_orgs_strategies_preferences ON client_organizations USING GIN (strategies_preferences);
CREATE INDEX idx_client_orgs_sandbox_api_key ON client_organizations(sandbox_api_key);
CREATE INDEX idx_client_orgs_production_api_key ON client_organizations(production_api_key);
CREATE INDEX idx_client_orgs_idle_balance ON client_organizations(idle_balance) WHERE idle_balance > 0;
CREATE INDEX idx_client_orgs_earning_balance ON client_organizations(earning_balance) WHERE earning_balance > 0;

COMMENT ON TABLE client_organizations IS 'Product organizations - multiple per Privy user (e.g., GrabPay, GrabFood). References privy_accounts for identity.';
COMMENT ON COLUMN client_organizations.privy_account_id IS 'Foreign key to privy_accounts (one user can have many organizations)';
COMMENT ON COLUMN client_organizations.product_id IS 'Primary public identifier for API operations (e.g., prod_abc123)';
COMMENT ON COLUMN client_organizations.business_type IS 'ecommerce, streaming, gaming, freelance, saas, other';
COMMENT ON COLUMN client_organizations.customer_tier IS 'Customer AUM tier: 0-1K | 1K-10K | 10K-100K | 100K-1M | 1M+';
COMMENT ON COLUMN client_organizations.strategies_preferences IS 'Initial strategy preferences captured during product creation. Format: {"defi": {"aave": 50, "compound": 30, "morpho": 20}, "cefi": {"circle": 100}, "lp": {"uniswap": 50, "sushiswap": 50}}. Sum of allocations per category should equal 100. This represents the client''s initial strategic direction.';
COMMENT ON COLUMN client_organizations.strategies_customization IS 'Runtime strategy configuration from Market Analysis dashboard. Same format as strategies_preferences. When set, this OVERRIDES strategies_preferences. Use COALESCE(strategies_customization, strategies_preferences) to get effective strategies.';
COMMENT ON COLUMN client_organizations.sandbox_api_key IS 'Sandbox API key hash (pk_test_xxx) for testing';
COMMENT ON COLUMN client_organizations.sandbox_api_secret IS 'Sandbox API key prefix for fast lookup';
COMMENT ON COLUMN client_organizations.production_api_key IS 'Production API key hash (pk_live_xxx) for live transactions';
COMMENT ON COLUMN client_organizations.production_api_secret IS 'Production API key prefix for fast lookup';
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
COMMENT ON COLUMN client_organizations.sandbox_apy_simulation_rate IS 'Annual APY rate for time-based index simulation in sandbox environment (e.g., 5.00 = 5%)';
COMMENT ON COLUMN client_organizations.production_use_real_defi IS 'Whether to use real DeFi protocol data in production (true) or mock (false)';

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
  last_successful_index_update TIMESTAMPTZ, -- 000004

  -- Actual balances
  pending_deposit_balance NUMERIC(40,18) NOT NULL DEFAULT 0,
  total_staked_balance NUMERIC(40,18) NOT NULL DEFAULT 0,
  cumulative_yield NUMERIC(40,18) NOT NULL DEFAULT 0,

  -- Performance tracking
  apy_7d NUMERIC(10,4),
  apy_30d NUMERIC(10,4),

  -- DeFi Strategy Allocation (JSONB for atomic updates)
  strategies JSONB DEFAULT '[]'::jsonb,

  -- Environment Support (000006)
  environment VARCHAR(20) NOT NULL DEFAULT 'sandbox' CHECK (environment IN ('sandbox', 'production')),
  custodial_wallet_address VARCHAR(66),

  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  UNIQUE(client_id, chain, token_address, environment), -- ✅ Updated for environment support
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
CREATE INDEX idx_client_vaults_environment ON client_vaults(client_id, environment);

COMMENT ON TABLE client_vaults IS 'Aggregated custodial vault per client with index-based yield tracking';
COMMENT ON COLUMN client_vaults.total_shares IS 'Sum of all end_user_vaults.shares for this vault';
COMMENT ON COLUMN client_vaults.current_index IS 'Growth index (scaled by 1e18, starts at 1.0)';
COMMENT ON COLUMN client_vaults.pending_deposit_balance IS 'Deposits waiting to be batched and staked';
COMMENT ON COLUMN client_vaults.total_staked_balance IS 'Total amount deployed to DeFi protocols';
COMMENT ON COLUMN client_vaults.strategies IS 'DeFi strategy allocation as JSONB array: [{"category":"lending","target":70,"isActive":true},{"category":"lp","target":20,"isActive":true}]. Sum of targets should equal 100.';
COMMENT ON COLUMN client_vaults.last_successful_index_update IS 'Timestamp of last successful index update (different from last_index_update which tracks any attempt)';
COMMENT ON COLUMN client_vaults.environment IS 'Environment: sandbox (mock tokens) or production (real USDC)';
COMMENT ON COLUMN client_vaults.custodial_wallet_address IS 'Cached Privy custodial wallet address (same for both environments)';

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

  -- Environment Support (000006)
  environment VARCHAR(20) NOT NULL DEFAULT 'sandbox' CHECK (environment IN ('sandbox', 'production')),

  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  -- ✅ 000006: Updated to allow one vault per user per client PER ENVIRONMENT
  CONSTRAINT end_user_vaults_end_user_client_env_key UNIQUE (end_user_id, client_id, environment),
  CHECK (total_deposited >= 0),
  CHECK (total_withdrawn >= 0),
  CHECK (weighted_entry_index >= 1000000000000000000)
);

CREATE INDEX idx_end_user_vaults_user_id ON end_user_vaults(end_user_id);
CREATE INDEX idx_end_user_vaults_client_id ON end_user_vaults(client_id);
CREATE INDEX idx_end_user_vaults_active ON end_user_vaults(is_active) WHERE is_active = true;
CREATE INDEX idx_end_user_vaults_environment ON end_user_vaults(end_user_id, client_id, environment);

COMMENT ON TABLE end_user_vaults IS 'Simplified user vault positions - ONE vault per user per client per environment (backend manages multi-chain/token)';
COMMENT ON COLUMN end_user_vaults.total_deposited IS 'Cumulative fiat deposit amount across ALL chains/tokens';
COMMENT ON COLUMN end_user_vaults.total_withdrawn IS 'Cumulative fiat withdrawal amount across ALL chains/tokens';
COMMENT ON COLUMN end_user_vaults.weighted_entry_index IS 'Client growth index at deposit time (weighted avg of all client vaults). Formula: current_value = total_deposited × (client_growth_index / weighted_entry_index)';
COMMENT ON COLUMN end_user_vaults.environment IS 'Environment: sandbox (mock tokens) or production (real USDC). User can have 2 vaults: one for each environment.';

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

  -- Environment Support (000003)
  environment VARCHAR(20) DEFAULT 'sandbox' CHECK (environment IN ('sandbox', 'production')),
  network VARCHAR(50),
  oracle_address VARCHAR(255),

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
CREATE INDEX idx_deposit_txns_gateway_order_id ON deposit_transactions(gateway_order_id) WHERE gateway_order_id IS NOT NULL;
CREATE INDEX idx_deposit_transactions_environment ON deposit_transactions(environment);
CREATE INDEX idx_deposit_transactions_network ON deposit_transactions(network);

COMMENT ON TABLE deposit_transactions IS 'Unified table for all deposit transactions (fiat on-ramp, internal transfers, etc.)';
COMMENT ON COLUMN deposit_transactions.chain IS 'Blockchain network (base, ethereum, etc.)';
COMMENT ON COLUMN deposit_transactions.token_symbol IS 'Token symbol (USDC, USDT, etc.)';
COMMENT ON COLUMN deposit_transactions.token_address IS 'Token contract address';
COMMENT ON COLUMN deposit_transactions.on_ramp_provider IS 'Fiat on-ramp provider (proxify_gateway, moonpay, etc.)';
COMMENT ON COLUMN deposit_transactions.transaction_hash IS 'Blockchain transaction hash after mint/transfer';
COMMENT ON COLUMN deposit_transactions.qr_code IS 'QR code for payment (base64 encoded)';
COMMENT ON COLUMN deposit_transactions.deposit_type IS 'external | internal';
COMMENT ON COLUMN deposit_transactions.environment IS 'API environment: sandbox (testnet) or production (mainnet)';
COMMENT ON COLUMN deposit_transactions.network IS 'Blockchain network: sepolia, mainnet, etc.';
COMMENT ON COLUMN deposit_transactions.oracle_address IS 'Oracle custodial address that received the deposit';

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

  -- Environment Support (000003)
  environment VARCHAR(20) DEFAULT 'sandbox' CHECK (environment IN ('sandbox', 'production')),
  network VARCHAR(50),
  oracle_address VARCHAR(255),

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
CREATE INDEX idx_withdrawal_txns_gateway_order_id ON withdrawal_transactions(gateway_order_id) WHERE gateway_order_id IS NOT NULL;
CREATE INDEX idx_withdrawal_transactions_environment ON withdrawal_transactions(environment);
CREATE INDEX idx_withdrawal_transactions_network ON withdrawal_transactions(network);

COMMENT ON TABLE withdrawal_transactions IS 'Withdrawal transactions - user cashes out to bank/card or back to client balance';
COMMENT ON COLUMN withdrawal_transactions.destination_type IS 'client_balance | bank_account | debit_card | crypto_wallet';
COMMENT ON COLUMN withdrawal_transactions.environment IS 'API environment: sandbox (testnet) or production (mainnet)';
COMMENT ON COLUMN withdrawal_transactions.network IS 'Blockchain network: sepolia, mainnet, etc.';
COMMENT ON COLUMN withdrawal_transactions.oracle_address IS 'Oracle custodial address that sends the withdrawal';

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
CREATE INDEX idx_deposit_queue_pending ON deposit_batch_queue(created_at) WHERE status = 'pending';

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
CREATE INDEX idx_withdrawal_queue_priority ON withdrawal_queue(priority DESC, queued_at ASC) WHERE status = 'queued';
CREATE INDEX idx_withdrawal_queue_unstaking ON withdrawal_queue(unstaking_started_at) WHERE status = 'unstaking';

COMMENT ON TABLE withdrawal_queue IS 'Queue for withdrawals requiring DeFi unstaking';
COMMENT ON COLUMN withdrawal_queue.shares_to_burn IS 'Shares to burn from user vault (proportional to withdrawal)';
COMMENT ON COLUMN withdrawal_queue.protocols_to_unstake IS 'JSON array of protocols to unstake from';
COMMENT ON COLUMN withdrawal_queue.priority IS 'Higher = process first (0 = normal, 10 = high)';
COMMENT ON COLUMN withdrawal_queue.status IS 'queued → unstaking → ready → processing → completed';

-- ============================================
-- 12. REVENUE TRACKING (000004)
-- ============================================

CREATE TABLE revenue_distributions (
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

CREATE INDEX idx_revenue_distributions_withdrawal ON revenue_distributions(withdrawal_transaction_id);
CREATE INDEX idx_revenue_distributions_vault ON revenue_distributions(vault_id);
CREATE INDEX idx_revenue_distributions_distributed_at ON revenue_distributions(distributed_at DESC);
CREATE INDEX idx_revenue_distributions_is_deducted ON revenue_distributions(is_deducted) WHERE is_deducted = false;

COMMENT ON TABLE revenue_distributions IS 'Tracks yield distribution splits between end-users, clients, and platform';
COMMENT ON COLUMN revenue_distributions.raw_yield IS 'Total yield generated before fee split (in USD)';
COMMENT ON COLUMN revenue_distributions.enduser_revenue IS 'Yield allocated to end-user (typically 75%)';
COMMENT ON COLUMN revenue_distributions.client_revenue IS 'Revenue allocated to client (typically 15%)';
COMMENT ON COLUMN revenue_distributions.platform_revenue IS 'Revenue allocated to Proxify platform (typically 10%)';
COMMENT ON COLUMN revenue_distributions.is_deducted IS 'Whether fees were deducted from withdrawal or deferred for later settlement';

-- ============================================
-- 13. VAULT INDEX HISTORY (000004)
-- ============================================

CREATE TABLE vault_index_history (
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

CREATE INDEX idx_vault_index_history_vault_timestamp ON vault_index_history(vault_id, timestamp DESC);
CREATE INDEX idx_vault_index_history_timestamp ON vault_index_history(timestamp DESC);

COMMENT ON TABLE vault_index_history IS 'Historical snapshots of vault index values for calculating rolling APY metrics';
COMMENT ON COLUMN vault_index_history.index_value IS 'Vault index at this timestamp (scaled by 1e18)';
COMMENT ON COLUMN vault_index_history.daily_yield IS 'Yield generated in the last 24 hours (in USD)';
COMMENT ON COLUMN vault_index_history.daily_apy IS 'Annualized APY based on last 24h growth';

-- ============================================
-- 14. ENVIRONMENT AUDIT LOG (000003)
-- ============================================

CREATE TABLE environment_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES client_organizations(id) ON DELETE CASCADE,
    from_environment VARCHAR(20),
    to_environment VARCHAR(20) NOT NULL CHECK (to_environment IN ('sandbox', 'production')),
    changed_by_user_id UUID,
    changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ip_address VARCHAR(45),
    user_agent TEXT,
    reason TEXT
);

CREATE INDEX idx_environment_audit_log_client_id ON environment_audit_log(client_id);
CREATE INDEX idx_environment_audit_log_changed_at ON environment_audit_log(changed_at DESC);

COMMENT ON TABLE environment_audit_log IS 'Audit trail for environment switches (sandbox ↔ production)';

-- ============================================
-- 15. AUDIT LOGS
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
