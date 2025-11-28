-- ============================================
-- Rollback Payment Instructions Column
-- ============================================

DROP INDEX IF EXISTS idx_deposit_txns_payment_instructions;

ALTER TABLE deposit_transactions
DROP COLUMN IF EXISTS payment_instructions;
