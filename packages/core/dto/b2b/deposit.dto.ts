/**
 * B2B Deposit DTO - Request/Response Types
 * Used for API ↔ UseCase communication
 */

export interface CreateDepositRequest {
  orderId?: string; // ✅ Optional: Allow external orderId generation
  clientId: string;
  userId: string;
  fiatCurrency: string;
  fiatAmount: string;
  cryptoCurrency: string;
  depositType: 'internal' | 'external';
  gatewayProvider?: string;
  gatewayOrderId?: string;
  paymentUrl?: string;
  paymentInstructions?: any; // ✅ JSONB payment instructions to store in DB
}

export interface CompleteDepositRequest {
  orderId: string;
  chain: string;
  tokenAddress: string;
  tokenSymbol: string;
  cryptoAmount: string;
  gatewayFee: string;
  proxifyFee: string;
  networkFee: string;
  totalFees: string;
  transactionHash?: string;  // Optional: On-chain transaction hash for verification
}

export interface FailDepositRequest {
  orderId: string;
  errorMessage: string;
  errorCode?: string;
}

export interface GetDepositStatsRequest {
  clientId: string;
  startDate?: Date;
  endDate?: Date;
}
