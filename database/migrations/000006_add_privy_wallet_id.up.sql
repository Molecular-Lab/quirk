-- ============================================
-- ADD PRIVY WALLET ID FOR SERVER WALLETS
-- ============================================
-- Purpose: Store Privy wallet UUID for production DeFi execution
-- Sandbox continues to use ViemClientManager with private keys

-- Add privy_wallet_id to client_vaults for production wallet management
ALTER TABLE client_vaults 
  ADD COLUMN privy_wallet_id VARCHAR(50);

-- Index for looking up vaults by Privy wallet
CREATE INDEX idx_client_vaults_privy_wallet_id 
  ON client_vaults(privy_wallet_id) 
  WHERE privy_wallet_id IS NOT NULL;

COMMENT ON COLUMN client_vaults.privy_wallet_id IS 'Privy server wallet UUID for production DeFi execution (null for sandbox)';
