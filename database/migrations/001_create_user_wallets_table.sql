-- Migration: Create user_wallets table
-- Purpose: Store lightweight mapping between productId:userId → Privy wallet info
-- Approach: Hybrid - DB stores mapping, Privy stores full wallet state

-- ============================================================
-- Table: user_wallets
-- ============================================================
CREATE TABLE IF NOT EXISTS user_wallets (
    -- Internal UUID (our primary key, also stored in Privy's custom_user_id)
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Product & User identification (from API caller)
    product_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL,

    -- Privy identification
    privy_user_id VARCHAR(255) NOT NULL UNIQUE,

    -- Wallet addresses (primary wallet info)
    embedded_wallet_address VARCHAR(255) NOT NULL,
    linked_wallet_address VARCHAR(255),  -- Optional: user's existing wallet used as seed

    -- Blockchain info
    chain_type VARCHAR(50) NOT NULL,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    UNIQUE(product_id, user_id),  -- One wallet per product:user pair
    UNIQUE(embedded_wallet_address)  -- Each embedded wallet is unique globally
);

-- ============================================================
-- Indexes for Fast Lookups
-- ============================================================

-- Primary lookup: GET /wallets/user/:productId/:userId
CREATE INDEX idx_user_wallets_product_user ON user_wallets(product_id, user_id);

-- Lookup by Privy user ID
CREATE INDEX idx_user_wallets_privy_user_id ON user_wallets(privy_user_id);

-- Lookup by embedded wallet address: GET /wallets/address/:productId/:walletAddress
CREATE INDEX idx_user_wallets_embedded_address ON user_wallets(embedded_wallet_address);

-- Lookup by linked wallet address (sparse index - only when linked_wallet_address exists)
CREATE INDEX idx_user_wallets_linked_address
    ON user_wallets(linked_wallet_address)
    WHERE linked_wallet_address IS NOT NULL;

-- ============================================================
-- Trigger: Auto-update updated_at on row changes
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_wallets_updated_at
    BEFORE UPDATE ON user_wallets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- Comments for Documentation
-- ============================================================
COMMENT ON TABLE user_wallets IS 'Stores mapping between external user IDs and Privy wallet information. Uses hybrid approach: DB for fast lookups, Privy for wallet state.';
COMMENT ON COLUMN user_wallets.id IS 'Internal UUID. Also embedded in Privy custom_user_id as productId:userId:uuid';
COMMENT ON COLUMN user_wallets.product_id IS 'External product/app identifier from API caller';
COMMENT ON COLUMN user_wallets.user_id IS 'External user identifier from API caller (app-specific)';
COMMENT ON COLUMN user_wallets.privy_user_id IS 'Privy DID (e.g., did:privy:...)';
COMMENT ON COLUMN user_wallets.embedded_wallet_address IS 'Privy-generated custodial wallet address';
COMMENT ON COLUMN user_wallets.linked_wallet_address IS 'Optional: User existing wallet used as seed/link';
