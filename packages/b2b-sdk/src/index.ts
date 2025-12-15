/**
 * Quirk B2B SDK
 * Official TypeScript SDK for Quirk B2B API - Earn-as-a-Service Platform
 *
 * @packageDocumentation
 */

// Main SDK client
export { QuirkSDK } from "./client"
export { QuirkSDK as ProxifySDK } from "./client" // Backward compatibility alias

// Resource classes
export { ClientResource } from "./resources/clients"
export { DashboardResource } from "./resources/dashboard"
export { DeFiResource } from "./resources/defi"
export { DepositResource } from "./resources/deposits"
export { UserResource } from "./resources/users"
export { VaultResource } from "./resources/vaults"
export { WithdrawalResource } from "./resources/withdrawals"

// React components and hooks (optional - requires React)
export type { UseQuirkReturn } from "./react/hooks/useQuirk"
export { useQuirk } from "./react/hooks/useQuirk"
export type { UseQuirkTransactionReturn } from "./react/hooks/useQuirkTransaction"
export { useQuirkTransaction } from "./react/hooks/useQuirkTransaction"
export { useQuirkContext } from "./react/QuirkContext"
export type { QuirkProviderProps } from "./react/QuirkProvider"
export { QuirkProvider } from "./react/QuirkProvider"

// Error classes
export {
	AuthenticationError,
	NetworkError,
	NotFoundError,
	ProxifyError,
	RateLimitError,
	ServerError,
	ValidationError,
} from "./utils/errors"

// Type exports
export type {
	ApiResponse,
	BalanceOperationRequest,
	// Client types
	BankAccount,
	BatchCompleteDepositsRequest,
	Client,
	ClientBalance,
	CompleteCryptoDepositRequest,
	CompleteFiatDepositRequest,
	CompleteWithdrawalRequest,
	ConfigureBankAccountsRequest,
	ConfigureStrategiesRequest,
	CreateClientRequest,
	CreateFiatDepositRequest,
	CreatePrivyAccountRequest,
	CreateUserRequest,
	CreateVaultRequest,
	CreateWithdrawalRequest,
	// Enums
	Currency,
	DashboardMetrics,
	DashboardStats,
	Deposit,
	DepositStats,
	DepositStatus,
	// Withdrawal types
	EndUserBankAccount,
	ErrorResponse,
	FailWithdrawalRequest,
	// Dashboard types
	FundStages,
	InitiateCryptoDepositRequest,
	MarkStakedRequest,
	MockConfirmFiatDepositRequest,
	// Common types
	PaginationParams,
	// Deposit types
	PaymentInstructions,
	PendingDepositsResponse,
	// Privy account types
	PrivyAccount,
	// DeFi protocol types
	ProtocolData,
	ProtocolsResponse,
	Revenue,
	// SDK configuration
	SDKConfig,
	Strategy,
	StrategyAllocation,
	StrategyCategory,
	UpdateCurrenciesRequest,
	UpdateOrganizationRequest,
	UpdateVaultIndexRequest,
	// User types
	User,
	UserBalance,
	UserPortfolio,
	UserVault,
	// User-vault balance types
	UserVaultBalance,
	// Vault types
	Vault,
	VaultUser,
	WalletType,
	Withdrawal,
	WithdrawalMethod,
	WithdrawalStats,
	WithdrawalStatus,
} from "./types"

// Default export
export { QuirkSDK as default } from "./client"
