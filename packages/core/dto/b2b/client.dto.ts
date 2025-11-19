/**
 * B2B Client DTO - Request/Response Types
 * Used for API ↔ UseCase communication
 */

export interface CreateClientRequest {
  productId: string;
  companyName: string;
  businessType: string;
  description?: string;
  websiteUrl?: string;
  walletType: string;
  walletManagedBy: string;
  privyOrganizationId: string;
  privyWalletAddress: string;
  apiKeyHash: string | null; // Can be null until API key is generated
  apiKeyPrefix: string;
  webhookUrls?: string[];
  webhookSecret?: string;
  customStrategy?: any;
  endUserYieldPortion?: string;
  platformFee?: string;
  performanceFee?: string;
  isActive?: boolean;
  isSandbox?: boolean;
}

export interface AddFundsRequest {
  clientId: string;
  amount: string;
  source: string;
  reference?: string;
}

export interface ReserveFundsRequest {
  clientId: string;
  amount: string;
  purpose: string;
  reference?: string;
}

export interface ReleaseFundsRequest {
  clientId: string;
  amount: string;
  purpose: string;
  reference?: string;
}

export interface DeductReservedRequest {
  clientId: string;
  amount: string;
  purpose: string;
  reference?: string;
}
