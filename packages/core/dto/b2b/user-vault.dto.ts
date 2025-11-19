/**
 * B2B User Vault DTO - Request/Response Types
 * Used for API ↔ UseCase communication
 */

export interface UserBalanceRequest {
  userId: string;
  clientId: string;
  chain: string;
  tokenAddress: string;
}

export interface UserBalanceResponse {
  userId: string;
  clientId: string;
  chain: string;
  tokenAddress: string;
  tokenSymbol: string;
  
  // Balance information
  totalDeposited: string;
  totalWithdrawn: string;
  effectiveBalance: string; // shares × current_index / 1e18
  yieldEarned: string;      // effective_balance - total_deposited
  
  // Vault shares
  shares: string;
  weightedEntryIndex: string;
  currentIndex: string;
  
  // Performance metrics
  apy7d: string | null;
  apy30d: string | null;
  
  // Status
  isActive: boolean;
  lastDepositAt: Date | null;
  lastWithdrawalAt: Date | null;
}

export interface UserPortfolioResponse {
  userId: string;
  clientId: string;
  totalVaults: number;
  totalDeposited: string;
  totalEffectiveBalance: string;
  totalYieldEarned: string;
  vaults: UserBalanceResponse[];
}

export interface ListVaultUsersRequest {
  clientId: string;
  chain: string;
  tokenAddress: string;
  limit?: number;
}
