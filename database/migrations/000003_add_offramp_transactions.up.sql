-- ============================================
-- MIGRATION: 000003_add_offramp_transactions
-- Description: Add off-ramp transactions table for crypto → fiat conversions
-- Created: 2025-12-21
-- ============================================

-- ============================================
-- OFF-RAMP TRANSACTIONS (Crypto → Fiat)
-- ============================================
-- Tracks conversions from crypto (USDC) back to fiat (USD)
-- Opposite of deposit_transactions (on-ramp)

CREATE TABLE off_ramp_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Order Info
  order_id VARCHAR(100) UNIQUE NOT NULL,

  -- Relationships
  client_id UUID NOT NULL REFERENCES client_organizations(id) ON DELETE CASCADE,
  user_id VARCHAR(255) NOT NULL,
  end_user_id UUID REFERENCES end_users(id) ON DELETE SET NULL,

  -- Type & Method
  off_ramp_type VARCHAR(50) NOT NULL CHECK (off_ramp_type IN ('bank_transfer', 'debit_card', 'wire_transfer', 'ach')),
  off_ramp_provider VARCHAR(50) DEFAULT 'proxify_gateway',

  -- Source (crypto side)
  crypto_amount NUMERIC(20,8) NOT NULL,
  crypto_currency VARCHAR(10) NOT NULL DEFAULT 'USDC',
  chain VARCHAR(50) NOT NULL DEFAULT 'base',
  token_address VARCHAR(255),
  source_wallet_address VARCHAR(66),

  -- Destination (fiat side)
  fiat_amount NUMERIC(20,6),
  fiat_currency VARCHAR(10) NOT NULL DEFAULT 'USD',

  -- Bank/Card Details (encrypted reference or tokenized)
  destination_type VARCHAR(50) NOT NULL CHECK (destination_type IN ('bank_account', 'debit_card')),
  destination_details JSONB, -- Tokenized bank account or card reference

  -- Exchange Rate
  exchange_rate NUMERIC(20,8),
  rate_locked_at TIMESTAMPTZ,
  rate_expires_at TIMESTAMPTZ,

  -- Fees
  provider_fee NUMERIC(20,6) DEFAULT 0,
  network_fee NUMERIC(20,6) DEFAULT 0,
  platform_fee NUMERIC(20,6) DEFAULT 0,
  total_fees NUMERIC(20,6) DEFAULT 0,
  net_fiat_amount NUMERIC(20,6), -- fiat_amount - total_fees

  -- Status
  status VARCHAR(50) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'awaiting_confirmation', 'completed', 'failed', 'cancelled', 'refunded')),

  -- Provider Details
  provider_order_id VARCHAR(255),
  provider_reference VARCHAR(255),

  -- Blockchain Transaction
  burn_transaction_hash VARCHAR(255), -- Hash for burning/transferring crypto out

  -- Fiat Settlement
  settlement_reference VARCHAR(255),
  settlement_date TIMESTAMPTZ,

  -- Environment Support
  environment VARCHAR(20) DEFAULT 'sandbox' CHECK (environment IN ('sandbox', 'production')),
  network VARCHAR(50), -- sepolia, mainnet, base-sepolia, base

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  submitted_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,

  -- Error Tracking
  error_message TEXT,
  error_code VARCHAR(100),
  retry_count INTEGER DEFAULT 0,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Constraints
  CHECK (crypto_amount > 0),
  CHECK (fiat_amount IS NULL OR fiat_amount > 0),
  CHECK (provider_fee >= 0),
  CHECK (network_fee >= 0),
  CHECK (platform_fee >= 0),
  CHECK (total_fees >= 0),
  CHECK (retry_count >= 0)
);

-- Indexes
CREATE INDEX idx_off_ramp_txns_order_id ON off_ramp_transactions(order_id);
CREATE INDEX idx_off_ramp_txns_client_id ON off_ramp_transactions(client_id);
CREATE INDEX idx_off_ramp_txns_user_id ON off_ramp_transactions(user_id);
CREATE INDEX idx_off_ramp_txns_end_user_id ON off_ramp_transactions(end_user_id) WHERE end_user_id IS NOT NULL;
CREATE INDEX idx_off_ramp_txns_status ON off_ramp_transactions(status);
CREATE INDEX idx_off_ramp_txns_created_at ON off_ramp_transactions(created_at DESC);
CREATE INDEX idx_off_ramp_txns_environment ON off_ramp_transactions(environment);
CREATE INDEX idx_off_ramp_txns_provider ON off_ramp_transactions(off_ramp_provider);
CREATE INDEX idx_off_ramp_txns_provider_order ON off_ramp_transactions(provider_order_id) WHERE provider_order_id IS NOT NULL;
CREATE INDEX idx_off_ramp_txns_burn_hash ON off_ramp_transactions(burn_transaction_hash) WHERE burn_transaction_hash IS NOT NULL;
CREATE INDEX idx_off_ramp_txns_pending ON off_ramp_transactions(created_at) WHERE status = 'pending';
CREATE INDEX idx_off_ramp_txns_processing ON off_ramp_transactions(submitted_at) WHERE status = 'processing';

-- Comments
COMMENT ON TABLE off_ramp_transactions IS 'Off-ramp transactions - crypto (USDC) to fiat (USD) conversions via bank transfer or debit card';
COMMENT ON COLUMN off_ramp_transactions.order_id IS 'Unique order ID for tracking (e.g., offramp_xxx)';
COMMENT ON COLUMN off_ramp_transactions.off_ramp_type IS 'bank_transfer | debit_card | wire_transfer | ach';
COMMENT ON COLUMN off_ramp_transactions.off_ramp_provider IS 'Provider: proxify_gateway, moonpay, ramp, etc.';
COMMENT ON COLUMN off_ramp_transactions.crypto_amount IS 'Amount of crypto to convert (e.g., 100.00 USDC)';
COMMENT ON COLUMN off_ramp_transactions.fiat_amount IS 'Target fiat amount before fees';
COMMENT ON COLUMN off_ramp_transactions.destination_details IS 'Tokenized/encrypted bank account or card details (never store raw)';
COMMENT ON COLUMN off_ramp_transactions.exchange_rate IS 'Locked exchange rate (crypto to fiat)';
COMMENT ON COLUMN off_ramp_transactions.burn_transaction_hash IS 'Blockchain tx hash for burning/transferring crypto';
COMMENT ON COLUMN off_ramp_transactions.settlement_reference IS 'Bank settlement reference number';
COMMENT ON COLUMN off_ramp_transactions.environment IS 'sandbox (testnet) or production (mainnet)';
COMMENT ON COLUMN off_ramp_transactions.status IS 'pending → processing → awaiting_confirmation → completed';
