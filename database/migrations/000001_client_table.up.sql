-- ============================================
-- B2B Client & Product Owner Tables
-- Migration: 000002_create_b2b_tables.up.sql
-- ============================================

-- ============================================
-- 1. CLIENT ORGANIZATIONS (Product Owners)
-- ============================================
CREATE TABLE IF NOT EXISTS client_organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Organization Info
    product_id VARCHAR(255) UNIQUE NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    business_type VARCHAR(100) NOT NULL, -- 'ecommerce', 'streaming', 'gaming', 'freelance', 'saas'
    description TEXT,
    website_url TEXT,
    
    -- KYB Information
    registration_number VARCHAR(255),
    tax_id VARCHAR(255),
    country_code VARCHAR(3) NOT NULL, -- ISO 3166-1 alpha-3
    kyb_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'verified', 'rejected'
    kyb_verified_at TIMESTAMP WITH TIME ZONE,
    
    -- Privy Integration
    privy_user_id VARCHAR(255) UNIQUE NOT NULL,
    privy_wallet_address VARCHAR(66) UNIQUE NOT NULL, -- Custodial wallet for all end-users
    
    -- API Credentials
    api_key_hash VARCHAR(255) UNIQUE NOT NULL, -- Hashed API key
    api_key_prefix VARCHAR(20) NOT NULL, -- First chars for display (e.g., "pk_live_abc...")
    webhook_url TEXT,
    webhook_secret VARCHAR(255), -- For HMAC signature
    
    -- Risk Configuration
    risk_tier VARCHAR(50) NOT NULL DEFAULT 'low', -- 'low', 'moderate', 'high', 'custom'
    custom_allocations JSONB, -- For custom risk tier
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_sandbox BOOLEAN DEFAULT false, -- Sandbox mode for testing
    
    -- Billing
    subscription_tier VARCHAR(50) DEFAULT 'starter', -- 'starter', 'growth', 'enterprise'
    monthly_fee DECIMAL(10, 2) DEFAULT 99.00,
    yield_share_percent DECIMAL(5, 2) DEFAULT 10.00, -- % of yield we take
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes
    CONSTRAINT valid_risk_tier CHECK (risk_tier IN ('low', 'moderate', 'high', 'custom')),
    CONSTRAINT valid_business_type CHECK (business_type IN ('ecommerce', 'streaming', 'gaming', 'freelance', 'saas', 'other')),
    CONSTRAINT valid_subscription CHECK (subscription_tier IN ('starter', 'growth', 'enterprise'))
);

CREATE INDEX idx_client_orgs_product_id ON client_organizations(product_id);
CREATE INDEX idx_client_orgs_privy_user ON client_organizations(privy_user_id);
CREATE INDEX idx_client_orgs_active ON client_organizations(is_active) WHERE is_active = true;

-- ============================================
-- 2. END-USER DEPOSITS (Index-Based Accounting)
-- ============================================
CREATE TABLE IF NOT EXISTS end_user_deposits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Relationships
    client_id UUID NOT NULL REFERENCES client_organizations(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL, -- Client's internal user ID
    
    -- Deposit Amounts
    balance DECIMAL(20, 6) NOT NULL DEFAULT 0, -- Fixed balance units
    entry_index DECIMAL(20, 18) NOT NULL, -- Index at deposit time
    
    -- Wallet Info
    wallet_address VARCHAR(66), -- User's share of custodial wallet (virtual)
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    -- Timestamps
    first_deposit_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_deposit_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_withdrawal_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Composite unique constraint
    CONSTRAINT unique_client_user UNIQUE(client_id, user_id)
);

CREATE INDEX idx_end_user_deposits_client ON end_user_deposits(client_id);
CREATE INDEX idx_end_user_deposits_user ON end_user_deposits(user_id);
CREATE INDEX idx_end_user_deposits_active ON end_user_deposits(is_active) WHERE is_active = true;

-- ============================================
-- 3. VAULT INDICES (Per-Client Yield Tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS vault_indices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Relationships
    client_id UUID NOT NULL REFERENCES client_organizations(id) ON DELETE CASCADE,
    
    -- Index Tracking
    current_index DECIMAL(20, 18) NOT NULL DEFAULT 1.0,
    risk_tier VARCHAR(50) NOT NULL,
    
    -- Performance Metrics
    total_deposits DECIMAL(20, 6) DEFAULT 0,
    total_value DECIMAL(20, 6) DEFAULT 0,
    total_yield_earned DECIMAL(20, 6) DEFAULT 0,
    apy_current DECIMAL(10, 4) DEFAULT 0, -- Current APY
    apy_7d DECIMAL(10, 4) DEFAULT 0,
    apy_30d DECIMAL(10, 4) DEFAULT 0,
    
    -- Timestamps
    last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Composite unique constraint
    CONSTRAINT unique_client_risk_tier UNIQUE(client_id, risk_tier)
);

CREATE INDEX idx_vault_indices_client ON vault_indices(client_id);
CREATE INDEX idx_vault_indices_updated ON vault_indices(last_updated_at DESC);

-- ============================================
-- 4. CLIENT PREPAID BALANCES (For Internal Transfers)
-- ============================================
CREATE TABLE IF NOT EXISTS client_balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Relationships
    client_id UUID NOT NULL UNIQUE REFERENCES client_organizations(id) ON DELETE CASCADE,
    
    -- Balance Tracking
    available DECIMAL(20, 6) DEFAULT 0, -- Available for transfers
    reserved DECIMAL(20, 6) DEFAULT 0, -- Reserved for pending operations
    total DECIMAL(20, 6) GENERATED ALWAYS AS (available + reserved) STORED,
    
    -- Currency
    currency VARCHAR(10) DEFAULT 'USD',
    
    -- Timestamps
    last_topup_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_client_balances_available ON client_balances(available) WHERE available > 0;

-- ============================================
-- 5. DEFI ALLOCATIONS (Protocol Deployment Tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS defi_allocations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Relationships
    client_id UUID NOT NULL REFERENCES client_organizations(id) ON DELETE CASCADE,
    
    -- Protocol Info
    protocol VARCHAR(50) NOT NULL, -- 'aave', 'curve', 'compound', 'uniswap'
    chain VARCHAR(50) NOT NULL DEFAULT 'base', -- 'base', 'ethereum', 'polygon'
    
    -- Allocation
    amount_deployed DECIMAL(20, 6) NOT NULL,
    percentage DECIMAL(5, 2) NOT NULL, -- % of total pool
    
    -- Performance
    apy DECIMAL(10, 4), -- Protocol's current APY
    yield_earned DECIMAL(20, 6) DEFAULT 0,
    
    -- Transaction Details
    tx_hash VARCHAR(66),
    wallet_address VARCHAR(66),
    
    -- Status
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'withdrawn', 'rebalancing'
    
    -- Timestamps
    deployed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_rebalance_at TIMESTAMP WITH TIME ZONE,
    withdrawn_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_protocol CHECK (protocol IN ('aave', 'curve', 'compound', 'uniswap')),
    CONSTRAINT valid_status CHECK (status IN ('active', 'withdrawn', 'rebalancing'))
);

CREATE INDEX idx_defi_allocations_client ON defi_allocations(client_id);
CREATE INDEX idx_defi_allocations_protocol ON defi_allocations(protocol);
CREATE INDEX idx_defi_allocations_status ON defi_allocations(status) WHERE status = 'active';

-- ============================================
-- 6. DEPOSIT TRANSACTIONS (Order Tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS deposit_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Order Info
    order_id VARCHAR(100) UNIQUE NOT NULL,
    
    -- Relationships
    client_id UUID NOT NULL REFERENCES client_organizations(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL, -- Client's internal user ID
    
    -- Type & Method
    deposit_type VARCHAR(50) NOT NULL, -- 'external', 'internal'
    payment_method VARCHAR(50), -- 'apple_pay', 'card', 'bank_transfer', 'internal_balance'
    
    -- Amounts
    fiat_amount DECIMAL(20, 6) NOT NULL,
    crypto_amount DECIMAL(20, 6),
    currency VARCHAR(10) DEFAULT 'USD',
    crypto_currency VARCHAR(10) DEFAULT 'USDC',
    
    -- Fees (for external only)
    gateway_fee DECIMAL(20, 6) DEFAULT 0,
    proxify_fee DECIMAL(20, 6) DEFAULT 0,
    network_fee DECIMAL(20, 6) DEFAULT 0,
    total_fees DECIMAL(20, 6) DEFAULT 0,
    
    -- Status
    status VARCHAR(50) DEFAULT 'pending',
    
    -- External Payment Details
    payment_url TEXT,
    gateway_order_id VARCHAR(255), -- Transak/MoonPay order ID
    
    -- Internal Transfer Details
    client_balance_id UUID REFERENCES client_balances(id),
    deducted_from_client DECIMAL(20, 6),
    
    -- Wallet
    wallet_address VARCHAR(66),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    failed_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Error Tracking
    error_message TEXT,
    error_code VARCHAR(100),
    
    CONSTRAINT valid_deposit_type CHECK (deposit_type IN ('external', 'internal')),
    CONSTRAINT valid_status CHECK (status IN (
        'pending', 'awaiting_payment', 'processing', 'completed', 
        'failed', 'expired', 'cancelled', 'instant_completed'
    ))
);

CREATE INDEX idx_deposit_txs_order_id ON deposit_transactions(order_id);
CREATE INDEX idx_deposit_txs_client ON deposit_transactions(client_id);
CREATE INDEX idx_deposit_txs_user ON deposit_transactions(user_id);
CREATE INDEX idx_deposit_txs_status ON deposit_transactions(status);
CREATE INDEX idx_deposit_txs_created ON deposit_transactions(created_at DESC);

-- ============================================
-- 7. WITHDRAWAL TRANSACTIONS
-- ============================================
CREATE TABLE IF NOT EXISTS withdrawal_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Order Info
    order_id VARCHAR(100) UNIQUE NOT NULL,
    
    -- Relationships
    client_id UUID NOT NULL REFERENCES client_organizations(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL,
    
    -- Amounts
    requested_amount DECIMAL(20, 6) NOT NULL,
    actual_amount DECIMAL(20, 6), -- After fees
    currency VARCHAR(10) DEFAULT 'USD',
    
    -- Fees
    withdrawal_fee DECIMAL(20, 6) DEFAULT 0,
    network_fee DECIMAL(20, 6) DEFAULT 0,
    
    -- Destination
    destination_type VARCHAR(50) NOT NULL, -- 'client_balance', 'bank_account', 'debit_card'
    destination_details JSONB,
    
    -- Status
    status VARCHAR(50) DEFAULT 'pending',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    failed_at TIMESTAMP WITH TIME ZONE,
    
    -- Error Tracking
    error_message TEXT,
    error_code VARCHAR(100),
    
    CONSTRAINT valid_destination CHECK (destination_type IN ('client_balance', 'bank_account', 'debit_card')),
    CONSTRAINT valid_withdrawal_status CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled'))
);

CREATE INDEX idx_withdrawal_txs_client ON withdrawal_transactions(client_id);
CREATE INDEX idx_withdrawal_txs_user ON withdrawal_transactions(user_id);
CREATE INDEX idx_withdrawal_txs_status ON withdrawal_transactions(status);
CREATE INDEX idx_withdrawal_txs_created ON withdrawal_transactions(created_at DESC);

-- ============================================
-- 8. AUDIT LOGS (Complete Activity Tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Actor
    client_id UUID REFERENCES client_organizations(id) ON DELETE SET NULL,
    user_id VARCHAR(255),
    actor_type VARCHAR(50) NOT NULL, -- 'client', 'end_user', 'system', 'admin'
    
    -- Action
    action VARCHAR(100) NOT NULL, -- 'client.registered', 'deposit.created', 'withdrawal.completed', etc.
    resource_type VARCHAR(50), -- 'client', 'deposit', 'withdrawal', 'allocation'
    resource_id VARCHAR(255),
    
    -- Details
    description TEXT,
    metadata JSONB,
    
    -- Request Info
    ip_address INET,
    user_agent TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_actor CHECK (actor_type IN ('client', 'end_user', 'system', 'admin'))
);

CREATE INDEX idx_audit_logs_client ON audit_logs(client_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);

-- ============================================
-- UPDATED_AT TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to tables
CREATE TRIGGER update_client_orgs_updated_at BEFORE UPDATE ON client_organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_end_user_deposits_updated_at BEFORE UPDATE ON end_user_deposits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_client_balances_updated_at BEFORE UPDATE ON client_balances
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- INITIAL DATA (Optional - For Testing)
-- ============================================

-- Example: Create a test client organization
-- INSERT INTO client_organizations (
--     product_id, 
--     company_name, 
--     business_type,
--     privy_user_id,
--     privy_wallet_address,
--     api_key_hash,
--     api_key_prefix,
--     country_code
-- ) VALUES (
--     'demo-ecommerce',
--     'Demo E-Commerce Platform',
--     'ecommerce',
--     'privy_user_demo_123',
--     '0x1234567890123456789012345678901234567890',
--     'hashed_api_key_here',
--     'pk_test_abc',
--     'USA'
-- );
