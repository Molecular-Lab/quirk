-- Add balance sync tracking to client_vaults
-- This timestamp tracks when balances were last synced from on-chain DeFi protocols

ALTER TABLE client_vaults
ADD COLUMN last_balance_sync_at TIMESTAMPTZ;

-- Add comment for documentation
COMMENT ON COLUMN client_vaults.last_balance_sync_at IS 'Timestamp of last on-chain balance sync from DeFi protocols';
