-- Create deposit_orders table for tracking fiat on-ramp deposits
CREATE TABLE IF NOT EXISTS deposit_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id VARCHAR(255) UNIQUE NOT NULL, -- Unique order identifier (e.g., "dep_1234567890_abc")
    client_id UUID NOT NULL REFERENCES client_organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES end_users(id) ON DELETE CASCADE,

    -- Amounts
    fiat_amount DECIMAL(20, 2) NOT NULL, -- Amount in fiat currency
    fiat_currency VARCHAR(10) NOT NULL, -- Currency code (USD, EUR, etc.)
    crypto_amount DECIMAL(20, 8), -- Amount in crypto after conversion (null until completed)

    -- Blockchain details
    chain VARCHAR(50) NOT NULL, -- Chain name (ethereum, base, etc.)
    token_symbol VARCHAR(20) NOT NULL, -- Token symbol (USDC, USDT, etc.)
    token_address VARCHAR(255), -- Token contract address

    -- On-ramp provider
    on_ramp_provider VARCHAR(50) NOT NULL DEFAULT 'proxify_gateway', -- Provider name
    payment_url TEXT, -- Payment URL for user to complete on-ramp
    qr_code TEXT, -- QR code for payment (base64 encoded)

    -- Status tracking
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, processing, completed, failed
    transaction_hash VARCHAR(255), -- Blockchain transaction hash (after completion)

    -- Fees
    gateway_fee DECIMAL(20, 8) DEFAULT 0,
    proxify_fee DECIMAL(20, 8) DEFAULT 0,
    network_fee DECIMAL(20, 8) DEFAULT 0,
    total_fees DECIMAL(20, 8) DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Create index for faster queries
CREATE INDEX idx_deposit_orders_client_id ON deposit_orders(client_id);
CREATE INDEX idx_deposit_orders_user_id ON deposit_orders(user_id);
CREATE INDEX idx_deposit_orders_status ON deposit_orders(status);
CREATE INDEX idx_deposit_orders_order_id ON deposit_orders(order_id);
CREATE INDEX idx_deposit_orders_created_at ON deposit_orders(created_at DESC);

-- Create mock_usdc_mints table for tracking mock on-ramp completions
CREATE TABLE IF NOT EXISTS mock_usdc_mints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deposit_order_id UUID NOT NULL REFERENCES deposit_orders(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES client_organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES end_users(id) ON DELETE CASCADE,

    -- Mint details
    amount DECIMAL(20, 8) NOT NULL, -- Amount of USDC minted
    chain VARCHAR(50) NOT NULL, -- Chain where USDC was minted
    token_address VARCHAR(255) NOT NULL, -- USDC token contract address

    -- Destination
    destination_wallet VARCHAR(255) NOT NULL, -- Privy custodial wallet address

    -- Mock transaction
    mock_transaction_hash VARCHAR(255) NOT NULL, -- Generated mock transaction hash
    block_number BIGINT, -- Mock block number

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_mock_usdc_mints_deposit_order_id ON mock_usdc_mints(deposit_order_id);
CREATE INDEX idx_mock_usdc_mints_client_id ON mock_usdc_mints(client_id);
CREATE INDEX idx_mock_usdc_mints_user_id ON mock_usdc_mints(user_id);
CREATE INDEX idx_mock_usdc_mints_created_at ON mock_usdc_mints(created_at DESC);

-- Add comments
COMMENT ON TABLE deposit_orders IS 'Tracks fiat on-ramp deposit orders from end-users';
COMMENT ON TABLE mock_usdc_mints IS 'Tracks mock USDC mints for testnet on-ramp completions';
