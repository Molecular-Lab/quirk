-- Migration: Add DeFi Transactions Table
-- Purpose: Track on-chain DeFi operations (deposits/withdrawals to AAVE, Compound, Morpho)

-- Create defi_transactions table
CREATE TABLE IF NOT EXISTS defi_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Foreign keys
    client_id UUID NOT NULL REFERENCES client_organizations(id) ON DELETE CASCADE,
    vault_id UUID REFERENCES client_vaults(id) ON DELETE SET NULL,
    end_user_id UUID REFERENCES end_users(id) ON DELETE SET NULL,
    
    -- Transaction details
    tx_hash VARCHAR(66) NOT NULL,
    block_number BIGINT,
    chain VARCHAR(20) NOT NULL DEFAULT 'base-sepolia',
    
    -- Operation info
    operation_type VARCHAR(20) NOT NULL CHECK (operation_type IN ('deposit', 'withdrawal', 'approval')),
    protocol VARCHAR(20) NOT NULL CHECK (protocol IN ('aave', 'compound', 'morpho')),
    
    -- Token info
    token_symbol VARCHAR(20) NOT NULL,
    token_address VARCHAR(66) NOT NULL,
    amount NUMERIC(78,0) NOT NULL,
    
    -- Gas tracking
    gas_used BIGINT,
    gas_price BIGINT,
    gas_cost_eth NUMERIC(30,18),
    gas_cost_usd NUMERIC(20,6),
    
    -- Status tracking
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed')),
    error_message TEXT,
    
    -- Environment (sandbox vs production)
    environment VARCHAR(20) NOT NULL DEFAULT 'sandbox' CHECK (environment IN ('sandbox', 'production')),
    
    -- Timestamps
    executed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    confirmed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for common queries
CREATE INDEX idx_defi_transactions_client_id ON defi_transactions(client_id);
CREATE INDEX idx_defi_transactions_vault_id ON defi_transactions(vault_id);
CREATE INDEX idx_defi_transactions_end_user_id ON defi_transactions(end_user_id);
CREATE INDEX idx_defi_transactions_tx_hash ON defi_transactions(tx_hash);
CREATE INDEX idx_defi_transactions_protocol ON defi_transactions(protocol);
CREATE INDEX idx_defi_transactions_operation_type ON defi_transactions(operation_type);
CREATE INDEX idx_defi_transactions_status ON defi_transactions(status);
CREATE INDEX idx_defi_transactions_executed_at ON defi_transactions(executed_at DESC);
CREATE INDEX idx_defi_transactions_environment ON defi_transactions(environment);

-- Composite index for dashboard queries
CREATE INDEX idx_defi_transactions_client_executed ON defi_transactions(client_id, executed_at DESC);
CREATE INDEX idx_defi_transactions_user_executed ON defi_transactions(end_user_id, executed_at DESC);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_defi_transactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_defi_transactions_updated_at
    BEFORE UPDATE ON defi_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_defi_transactions_updated_at();

-- Comment on table
COMMENT ON TABLE defi_transactions IS 'Tracks on-chain DeFi operations (deposits/withdrawals) to yield protocols';
COMMENT ON COLUMN defi_transactions.protocol IS 'DeFi protocol: aave, compound, or morpho';
COMMENT ON COLUMN defi_transactions.operation_type IS 'Operation type: deposit, withdrawal, or approval';
COMMENT ON COLUMN defi_transactions.environment IS 'sandbox uses MockUSDC, production uses real USDC';
