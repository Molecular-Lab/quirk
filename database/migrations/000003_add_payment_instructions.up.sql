-- ============================================
-- Add Payment Instructions to Deposits
-- ============================================
-- Migration: 000003_add_payment_instructions
-- Description: Store payment instructions as JSONB in deposit_transactions
-- Created: 2025-11-26

-- Add payment_instructions JSONB column
ALTER TABLE deposit_transactions
ADD COLUMN payment_instructions JSONB DEFAULT NULL;

-- Index for querying payment instructions
CREATE INDEX idx_deposit_txns_payment_instructions
ON deposit_transactions USING GIN(payment_instructions);

COMMENT ON COLUMN deposit_transactions.payment_instructions IS 'Frozen payment instructions at deposit creation time: {paymentMethod, currency, amount, reference, bankName, accountNumber, accountName, swiftCode, bankCode, instructions, paymentSessionUrl}';
