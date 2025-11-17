/**
 * B2B Client Organization Entity
 * Represents a product owner (client) registered on Proxify platform
 */

export interface ClientOrganization {
	id: string
	productId: string
	companyName: string
	businessType: BusinessType
	description?: string
	websiteUrl?: string

	// KYB Information
	registrationNumber?: string
	taxId?: string
	countryCode: string
	kybStatus: KYBStatus
	kybVerifiedAt?: Date

	// Privy Integration
	privyUserId: string
	privyWalletAddress: string

	// API Credentials
	apiKeyHash: string
	apiKeyPrefix: string
	webhookUrl?: string
	webhookSecret?: string

	// Risk Configuration
	riskTier: ClientRiskTier
	customAllocations?: RiskAllocation[]

	// Status
	isActive: boolean
	isSandbox: boolean

	// Billing
	subscriptionTier: SubscriptionTier
	monthlyFee: number
	yieldSharePercent: number

	// Timestamps
	createdAt: Date
	updatedAt: Date
}

export type BusinessType = 'ecommerce' | 'streaming' | 'gaming' | 'freelance' | 'saas' | 'other'

export type KYBStatus = 'pending' | 'verified' | 'rejected'

/**
 * B2B Client Risk Tier (different from smart contract risk tier in client-registry.entity.ts)
 * Determines allocation strategy for client's vault
 */
export type ClientRiskTier = 'low' | 'moderate' | 'high' | 'custom'

export type SubscriptionTier = 'starter' | 'growth' | 'enterprise'

export interface RiskAllocation {
	protocol: 'aave' | 'curve' | 'compound' | 'uniswap'
	percentage: number
}

/**
 * End-User Deposit Entity
 * Tracks individual end-user deposits using index-based accounting
 */
export interface EndUserDeposit {
	id: string
	clientId: string
	userId: string // Client's internal user ID
	balance: number // Fixed balance units
	entryIndex: number // Index at deposit time
	walletAddress?: string
	isActive: boolean
	firstDepositAt: Date
	lastDepositAt: Date
	lastWithdrawalAt?: Date
	createdAt: Date
	updatedAt: Date
}

/**
 * Vault Index Entity
 * Tracks yield index per client and risk tier
 */
export interface VaultIndex {
	id: string
	clientId: string
	riskTier: ClientRiskTier
	currentIndex: number
	totalDeposits: number
	totalValue: number
	totalYieldEarned: number
	apyCurrent: number
	apy7d: number
	apy30d: number
	lastUpdatedAt: Date
	createdAt: Date
}

/**
 * Client Balance Entity
 * Tracks prepaid balance for internal transfers
 */
export interface ClientBalance {
	id: string
	clientId: string
	available: number
	reserved: number
	total: number // Computed field
	currency: string
	lastTopupAt?: Date
	createdAt: Date
	updatedAt: Date
}

/**
 * DeFi Allocation Entity
 * Tracks deployment to DeFi protocols
 */
export interface DefiAllocation {
	id: string
	clientId: string
	protocol: 'aave' | 'curve' | 'compound' | 'uniswap'
	chain: string
	amountDeployed: number
	percentage: number
	apy?: number
	yieldEarned: number
	txHash?: string
	walletAddress?: string
	status: AllocationStatus
	deployedAt: Date
	lastRebalanceAt?: Date
	withdrawnAt?: Date
	createdAt: Date
}

export type AllocationStatus = 'active' | 'withdrawn' | 'rebalancing'

/**
 * Deposit Transaction Entity
 * Tracks deposit orders (external and internal)
 */
export interface DepositTransaction {
	id: string
	orderId: string
	clientId: string
	userId: string
	depositType: 'external' | 'internal'
	paymentMethod?: string
	fiatAmount: number
	cryptoAmount?: number
	currency: string
	cryptoCurrency: string
	gatewayFee: number
	proxifyFee: number
	networkFee: number
	totalFees: number
	status: DepositStatus
	paymentUrl?: string
	gatewayOrderId?: string
	clientBalanceId?: string
	deductedFromClient?: number
	walletAddress?: string
	createdAt: Date
	completedAt?: Date
	failedAt?: Date
	expiresAt?: Date
	errorMessage?: string
	errorCode?: string
}

export type DepositStatus =
	| 'pending'
	| 'awaiting_payment'
	| 'processing'
	| 'completed'
	| 'failed'
	| 'expired'
	| 'cancelled'
	| 'instant_completed'

/**
 * Withdrawal Transaction Entity
 */
export interface WithdrawalTransaction {
	id: string
	orderId: string
	clientId: string
	userId: string
	requestedAmount: number
	actualAmount?: number
	currency: string
	withdrawalFee: number
	networkFee: number
	destinationType: 'client_balance' | 'bank_account' | 'debit_card'
	destinationDetails?: Record<string, any>
	status: WithdrawalStatus
	createdAt: Date
	completedAt?: Date
	failedAt?: Date
	errorMessage?: string
	errorCode?: string
}

export type WithdrawalStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'

/**
 * Audit Log Entity
 */
export interface AuditLog {
	id: string
	clientId?: string
	userId?: string
	actorType: 'client' | 'end_user' | 'system' | 'admin'
	action: string
	resourceType?: string
	resourceId?: string
	description?: string
	metadata?: Record<string, any>
	ipAddress?: string
	userAgent?: string
	createdAt: Date
}

/**
 * Parameter Types for Creating/Updating Entities
 */

export interface CreateClientParams {
	productId: string
	companyName: string
	businessType: BusinessType
	description?: string
	websiteUrl?: string
	registrationNumber?: string
	taxId?: string
	countryCode: string
	privyUserId: string
	privyWalletAddress: string
	apiKeyHash: string
	apiKeyPrefix: string
	webhookUrl?: string
	webhookSecret?: string
	riskTier?: ClientRiskTier
	customAllocations?: RiskAllocation[]
	subscriptionTier?: SubscriptionTier
	monthlyFee?: number
	yieldSharePercent?: number
}

export interface UpdateClientRiskTierParams {
	clientId: string
	riskTier: ClientRiskTier
	customAllocations?: RiskAllocation[]
}

export interface CreateEndUserDepositParams {
	clientId: string
	userId: string
	balance: number
	entryIndex: number
	walletAddress?: string
}

export interface UpdateEndUserBalanceParams {
	clientId: string
	userId: string
	balance: number
}

export interface CreateVaultIndexParams {
	clientId: string
	riskTier: ClientRiskTier
	currentIndex?: number
	totalDeposits?: number
	totalValue?: number
}

export interface UpdateVaultIndexParams {
	clientId: string
	riskTier: ClientRiskTier
	currentIndex: number
	totalValue: number
	totalYieldEarned: number
	apyCurrent: number
	apy7d: number
	apy30d: number
}
