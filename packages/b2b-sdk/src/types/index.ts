/**
 * Proxify B2B SDK Type Definitions
 * Version 1.1.0 - Network Configuration Update
 */

// ==================== NETWORK TYPES ====================

/**
 * Supported network identifiers
 * - eth_mainnet: Ethereum Mainnet (chainId: 1)
 * - eth_sepolia: Ethereum Sepolia Testnet (chainId: 11155111)
 */
export type NetworkKey = "eth_mainnet" | "eth_sepolia"

/**
 * Supported token symbols across all networks
 */
export type TokenKey = "eth" | "usdc" | "usdt" | "weth" | "mock_usdc"

// ==================== ENUMS ====================

export enum Currency {
	SGD = "SGD",
	USD = "USD",
	EUR = "EUR",
	THB = "THB",
	TWD = "TWD",
	KRW = "KRW",
}

export enum WalletType {
	MANAGED = "MANAGED",
	USER_OWNED = "USER_OWNED",
}

export enum DepositStatus {
	PENDING = "pending",
	COMPLETED = "completed",
	FAILED = "failed",
}

export enum WithdrawalStatus {
	PENDING = "PENDING",
	QUEUED = "QUEUED",
	COMPLETED = "COMPLETED",
	FAILED = "FAILED",
}

export enum WithdrawalMethod {
	CRYPTO = "crypto",
	FIAT_TO_CLIENT = "fiat_to_client",
	FIAT_TO_END_USER = "fiat_to_end_user",
}

export enum StrategyCategory {
	LENDING = "lending",
	LP = "lp",
	STAKING = "staking",
}

// ==================== CLIENT TYPES ====================

export interface BankAccount {
	accountNumber: string
	accountName: string
	bankName: string
	swiftCode?: string
	currency: Currency
}

export interface Client {
	id: string
	productId: string
	privyOrganizationId?: string
	privyWalletAddress: string
	privyEmail?: string
	walletType: WalletType
	companyName: string
	businessType: string
	description?: string
	websiteUrl?: string
	supportedCurrencies: Currency[]
	bankAccounts?: BankAccount[]
	isActive: boolean
	isSandbox: boolean
	apiKey?: string
	createdAt: string
	updatedAt: string
}

export interface CreateClientRequest {
	privyOrganizationId?: string
	privyWalletAddress: string
	privyEmail?: string
	walletType: WalletType
	companyName: string
	businessType: string
	description?: string
	websiteUrl?: string
	supportedCurrencies: Currency[]
	bankAccounts?: BankAccount[]
	isActive?: boolean
	isSandbox?: boolean
}

export interface ClientBalance {
	available: string
	reserved: string
	currency: string
}

export interface UpdateOrganizationRequest {
	companyName?: string
	businessType?: string
	description?: string
	websiteUrl?: string
}

export interface UpdateCurrenciesRequest {
	supportedCurrencies: Currency[]
}

export interface ConfigureBankAccountsRequest {
	bankAccounts: BankAccount[]
}

export interface BalanceOperationRequest {
	amount: number
	source?: string
	purpose?: string
	reference: string
}

export interface Strategy {
	category: StrategyCategory
	target: number // 0-100 percentage
}

export interface ConfigureStrategiesRequest {
	/** @deprecated Use chainId or network instead */
	chain?: string
	chainId?: number // 1 for mainnet, 11155111 for sepolia
	network?: NetworkKey // 'eth_mainnet' | 'eth_sepolia'
	/** @deprecated Use targetToken instead */
	token_address?: string
	/** @deprecated Use targetToken instead */
	token_symbol?: string
	targetToken?: TokenKey // 'usdc' | 'usdt' | 'weth' | 'mock_usdc'
	strategies: Strategy[]
}

// ==================== VAULT TYPES ====================

export interface Vault {
	id: string
	clientId: string
	chainId: number
	tokenAddress: string
	tokenSymbol: string
	currentIndex: string
	totalShares: string
	pendingBalance: string
	stakedBalance: string
	createdAt: string
	updatedAt: string
}

export interface CreateVaultRequest {
	clientId: string
	chainId?: number
	tokenAddress: string
	tokenSymbol: string
}

export interface UpdateVaultIndexRequest {
	yieldAmount: string
}

export interface MarkStakedRequest {
	amount: string
}

// ==================== USER TYPES ====================

export interface User {
	id: string
	clientId: string
	clientUserId: string
	email?: string
	walletAddress?: string
	createdAt: string
	updatedAt: string
	vaults?: any[]
}

export interface CreateUserRequest {
	clientId: string
	clientUserId: string
	email?: string
	walletAddress?: string
}

export interface UserPortfolio {
	userId: string
	totalValue: string
	vaults: {
		vaultId: string
		tokenSymbol: string
		shares: string
		balance: string
		yieldEarned: string
	}[]
}

export interface UserBalance {
	balance: string
	currency: string
	yield_earned: string
	apy: string
	status: string
	shares: string
	entry_index: string
	current_index: string
}

export interface UserVault {
	vaultId: string
	tokenSymbol: string
	chainId: number
	shares: string
	balance: string
	yieldEarned: string
	entryIndex: string
	currentIndex: string
}

// ==================== DEPOSIT TYPES ====================

export interface PaymentInstructions {
	paymentMethod: string
	currency: Currency
	amount: string
	reference: string
	bankName?: string
	accountNumber?: string
	accountName?: string
	swiftCode?: string
	bankCode?: string
	branchCode?: string
	routingNumber?: string
	iban?: string
	promptPayId?: string
	instructions?: string
	paymentSessionUrl?: string
}

export interface Deposit {
	orderId: string
	userId: string
	clientId: string
	amount: string
	currency: Currency
	tokenSymbol: string
	status: DepositStatus
	depositType: "fiat" | "crypto"
	custodialWalletAddress?: string
	chain?: string
	tokenAddress?: string
	expectedCryptoAmount?: string
	cryptoAmount?: string
	transactionHash?: string
	sharesMinted?: string
	clientReference?: string
	paymentInstructions?: PaymentInstructions
	expiresAt?: string
	createdAt: string
	completedAt?: string
}

export interface CreateFiatDepositRequest {
	userId: string
	amount: string
	currency: Currency
	tokenSymbol?: string
	clientReference?: string
	// Network configuration (optional - defaults to active network based on environment)
	chainId?: number // 1 for mainnet, 11155111 for sepolia
	network?: NetworkKey // 'eth_mainnet' | 'eth_sepolia'
	targetToken?: TokenKey // 'usdc' | 'usdt' | 'weth' | 'mock_usdc'
}

export interface MockConfirmFiatDepositRequest {
	bankTransactionId: string
	paidAmount: string
	paidCurrency: string
}

export interface BatchCompleteDepositsRequest {
	orderIds: string[]
	paidCurrency?: string
}

export interface CompleteFiatDepositRequest {
	chain: string
	tokenAddress: string
	cryptoAmount: string
	transactionHash: string
	gatewayFee?: string
	proxifyFee?: string
	networkFee?: string
	totalFees?: string
}

export interface InitiateCryptoDepositRequest {
	userId: string
	/** @deprecated Use chainId or network instead */
	chain?: string
	chainId?: number // 1 for mainnet, 11155111 for sepolia
	network?: NetworkKey // 'eth_mainnet' | 'eth_sepolia'
	tokenAddress?: string // Auto-resolved from targetToken if not provided
	tokenSymbol?: string // Auto-resolved from targetToken if not provided
	targetToken?: TokenKey // 'usdc' | 'usdt' | 'weth' | 'mock_usdc'
	amount: string
}

export interface CompleteCryptoDepositRequest {
	transactionHash: string
}

export interface DepositStats {
	totalDeposits: number
	completedDeposits: number
	totalAmount: string
	averageAmount: string
}

export interface PendingDepositsResponse {
	deposits: Deposit[]
	summary: {
		currency: Currency
		count: number
		totalAmount: string
	}[]
}

// ==================== WITHDRAWAL TYPES ====================

export interface EndUserBankAccount {
	accountNumber: string
	accountName: string
	bankName: string
	swiftCode?: string
	currency: Currency
}

export interface Withdrawal {
	id: string
	userId: string
	vaultId: string
	amount: string
	shares: string
	status: WithdrawalStatus
	withdrawal_method: WithdrawalMethod
	destination_address?: string
	chain?: string
	token_address?: string
	destination_currency?: Currency
	end_user_bank_account?: EndUserBankAccount
	transactionHash?: string
	blockNumber?: number
	failureReason?: string
	createdAt: string
	completedAt?: string
}

export interface CreateWithdrawalRequest {
	userId: string
	vaultId: string
	amount: string
	withdrawal_method?: WithdrawalMethod
	destination_address?: string
	/** @deprecated Use chainId or network instead */
	chain?: string
	chainId?: number // 1 for mainnet, 11155111 for sepolia
	network?: NetworkKey // 'eth_mainnet' | 'eth_sepolia'
	/** @deprecated Use targetToken instead */
	token_address?: string
	targetToken?: TokenKey // 'usdc' | 'usdt' | 'weth' | 'mock_usdc'
	destination_currency?: Currency
	end_user_bank_account?: EndUserBankAccount
}

export interface CompleteWithdrawalRequest {
	transactionHash: string
	blockNumber?: number
}

export interface FailWithdrawalRequest {
	reason: string
}

export interface WithdrawalStats {
	totalWithdrawals: number
	completedWithdrawals: number
	totalAmount: string
	averageAmount: string
}

// ==================== DEFI PROTOCOL TYPES ====================

export interface ProtocolData {
	protocol: "aave" | "compound" | "morpho" | "curve"
	token: string
	chainId: number
	supplyAPY: string
	borrowAPY?: string
	tvl: string
	liquidity: string
	utilization: string
	risk: "Low" | "Medium" | "High"
	status: "healthy" | "warning" | "critical"
	lastUpdate: string
	rawMetrics?: Record<string, any>
}

export interface ProtocolsResponse {
	protocols: ProtocolData[]
	timestamp: string
}

// ==================== DASHBOARD TYPES ====================

export interface FundStages {
	available: string
	staked: string
	total: string
}

export interface Revenue {
	total: string
	clientShare: string
	endUserShare: string
	clientSharePercent: number
}

export interface DashboardStats {
	totalUsers: number
	activeUsers: number
	apy: string
	vaults: number
}

export interface StrategyAllocation {
	category: StrategyCategory
	allocation: number
	apy: string
}

export interface DashboardMetrics {
	fundStages: FundStages
	revenue: Revenue
	stats: DashboardStats
	strategies: StrategyAllocation[]
}

// ==================== USER-VAULT BALANCE TYPES ====================

export interface UserVaultBalance {
	userId: string
	vaultId: string
	shares: string
	entryIndex: string
	effectiveBalance: string
	yieldEarned: string
}

export interface VaultUser {
	userId: string
	clientUserId: string
	shares: string
	balance: string
	yieldEarned: string
}

// ==================== PRIVY ACCOUNT TYPES ====================

export interface PrivyAccount {
	id: string
	privyOrganizationId: string
	privyWalletAddress: string
	privyEmail?: string
	walletType: WalletType
	createdAt: string
	updatedAt: string
}

export interface CreatePrivyAccountRequest {
	privyOrganizationId: string
	privyWalletAddress: string
	privyEmail?: string
	walletType: WalletType
}

// ==================== COMMON TYPES ====================

export interface PaginationParams {
	limit?: number
	offset?: number
}

export interface ApiResponse<T> {
	success: boolean
	data?: T
	error?: string
	message?: string
}

export interface ErrorResponse {
	error: string
	statusCode: number
	details?: any
}

// ==================== SDK CONFIGURATION ====================

export interface SDKConfig {
	apiKey: string
	baseURL?: string
	environment?: "production" | "sandbox"
	timeout?: number
	maxRetries?: number
}
