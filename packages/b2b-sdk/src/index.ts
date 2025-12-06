/**
 * Quirk B2B SDK
 * Official TypeScript SDK for Quirk B2B API - Earn-as-a-Service Platform
 *
 * @packageDocumentation
 */

// Main SDK client
export { QuirkSDK } from './client'
export { QuirkSDK as ProxifySDK } from './client' // Backward compatibility alias

// Resource classes
export { ClientResource } from './resources/clients'
export { VaultResource } from './resources/vaults'
export { UserResource } from './resources/users'
export { DepositResource } from './resources/deposits'
export { WithdrawalResource } from './resources/withdrawals'
export { DeFiResource } from './resources/defi'
export { DashboardResource } from './resources/dashboard'

// React components and hooks (optional - requires React)
export { QuirkProvider } from './react/QuirkProvider'
export type { QuirkProviderProps } from './react/QuirkProvider'
export { useQuirkContext } from './react/QuirkContext'
export { useEndUser } from './react/hooks/useEndUser'
export type { UseEndUserReturn } from './react/hooks/useEndUser'
export { useDeposit } from './react/hooks/useDeposit'
export type { UseDepositReturn } from './react/hooks/useDeposit'
export { useWithdraw } from './react/hooks/useWithdraw'
export type { UseWithdrawReturn } from './react/hooks/useWithdraw'

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
export { QuirkSDK as default } from './client'
