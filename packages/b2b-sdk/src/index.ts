/**
 * Proxify B2B SDK
 * Official TypeScript SDK for Proxify B2B API
 *
 * @packageDocumentation
 */

// Main SDK client
export { ProxifySDK } from './client'

// Resource classes
export { ClientResource } from './resources/clients'
export { VaultResource } from './resources/vaults'
export { UserResource } from './resources/users'
export { DepositResource } from './resources/deposits'
export { WithdrawalResource } from './resources/withdrawals'
export { DeFiResource } from './resources/defi'
export { DashboardResource } from './resources/dashboard'

// Error classes
export {
  ProxifyError,
  AuthenticationError,
  ValidationError,
  NotFoundError,
  RateLimitError,
  ServerError,
  NetworkError,
} from './utils/errors'

// Type exports
export type {
  // Enums
  Currency,
  WalletType,
  DepositStatus,
  WithdrawalStatus,
  WithdrawalMethod,
  StrategyCategory,

  // Client types
  BankAccount,
  Client,
  CreateClientRequest,
  ClientBalance,
  UpdateOrganizationRequest,
  UpdateCurrenciesRequest,
  ConfigureBankAccountsRequest,
  BalanceOperationRequest,
  Strategy,
  ConfigureStrategiesRequest,

  // Vault types
  Vault,
  CreateVaultRequest,
  UpdateVaultIndexRequest,
  MarkStakedRequest,

  // User types
  User,
  CreateUserRequest,
  UserPortfolio,
  UserBalance,
  UserVault,

  // Deposit types
  PaymentInstructions,
  Deposit,
  CreateFiatDepositRequest,
  MockConfirmFiatDepositRequest,
  BatchCompleteDepositsRequest,
  CompleteFiatDepositRequest,
  InitiateCryptoDepositRequest,
  CompleteCryptoDepositRequest,
  DepositStats,
  PendingDepositsResponse,

  // Withdrawal types
  EndUserBankAccount,
  Withdrawal,
  CreateWithdrawalRequest,
  CompleteWithdrawalRequest,
  FailWithdrawalRequest,
  WithdrawalStats,

  // DeFi protocol types
  ProtocolData,
  ProtocolsResponse,

  // Dashboard types
  FundStages,
  Revenue,
  DashboardStats,
  StrategyAllocation,
  DashboardMetrics,

  // User-vault balance types
  UserVaultBalance,
  VaultUser,

  // Privy account types
  PrivyAccount,
  CreatePrivyAccountRequest,

  // Common types
  PaginationParams,
  ApiResponse,
  ErrorResponse,

  // SDK configuration
  SDKConfig,
} from './types'

// Default export
export { ProxifySDK as default } from './client'
