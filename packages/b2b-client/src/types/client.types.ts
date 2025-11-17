/**
 * B2B Client Types
 * Types for client (product owner) registration and management
 */

// ============================================
// CLIENT ORGANIZATION TYPES
// ============================================

export interface ClientOrganization {
	id: string
	productId: string
	companyName: string
	businessType: BusinessType
	description?: string
	websiteUrl?: string

	// KYB
	registrationNumber?: string
	taxId?: string
	countryCode: string
	kybStatus: 'pending' | 'verified' | 'rejected'
	kybVerifiedAt?: string

	// Privy
	privyUserId: string
	privyWalletAddress: string

	// API
	apiKeyPrefix: string
	webhookUrl?: string

	// Risk
	riskTier: RiskTier
	customAllocations?: RiskAllocation[]

	// Status
	isActive: boolean
	isSandbox: boolean

	// Billing
	subscriptionTier: SubscriptionTier
	monthlyFee: number
	yieldSharePercent: number

	// Timestamps
	createdAt: string
	updatedAt: string
}

export type BusinessType =
	| 'ecommerce'
	| 'streaming'
	| 'gaming'
	| 'freelance'
	| 'saas'
	| 'other'

export type RiskTier = 'low' | 'moderate' | 'high' | 'custom'

export type SubscriptionTier = 'starter' | 'growth' | 'enterprise'

export interface RiskAllocation {
	protocol: 'aave' | 'curve' | 'compound' | 'uniswap'
	percentage: number
}

// ============================================
// CLIENT REGISTRATION TYPES
// ============================================

export interface CreateClientRequest {
	// Organization Info
	productId: string
	companyName: string
	businessType: BusinessType
	description?: string
	websiteUrl?: string

	// KYB Information
	registrationNumber?: string
	taxId?: string
	countryCode: string

	// Contact
	contactEmail: string
	contactName: string
	contactPhone?: string

	// Preferences
	riskTier?: RiskTier
	subscriptionTier?: SubscriptionTier
	webhookUrl?: string

	// Metadata
	metadata?: Record<string, unknown>
}

export interface CreateClientResponse {
	success: boolean
	data: {
		// Step 1: Temporary registration
		tempRegistrationId: string
		productId: string

		// Step 2: Redirect to Privy for wallet creation
		privyRedirectUrl: string

		// Step 3: Complete registration endpoint
		completeRegistrationUrl: string

		// Status
		status: 'pending_privy_account'
	}
	message: string
}

export interface UpdateRiskTierRequest {
	riskTier: RiskTier
	customAllocations?: RiskAllocation[]
}

// ============================================
// CLIENT DASHBOARD TYPES
// ============================================

export interface ClientDashboardStats {
	// Overview
	totalDeposits: number
	totalValue: number
	totalYieldEarned: number
	totalUsers: number

	// Performance
	apyCurrent: number
	apy7d: number
	apy30d: number

	// Allocations
	allocations: AllocationBreakdown[]

	// Recent Activity
	recentDeposits: DepositSummary[]
	recentWithdrawals: WithdrawalSummary[]

	// Timestamps
	lastUpdated: string
}

export interface AllocationBreakdown {
	protocol: 'aave' | 'curve' | 'compound' | 'uniswap'
	amountDeployed: number
	percentage: number
	apy: number
	yieldEarned: number
	status: 'active' | 'withdrawn' | 'rebalancing'
}

export interface DepositSummary {
	orderId: string
	userId: string
	amount: number
	type: 'external' | 'internal'
	status: string
	createdAt: string
}

export interface WithdrawalSummary {
	orderId: string
	userId: string
	amount: number
	destinationType: string
	status: string
	createdAt: string
}

// ============================================
// END-USER DEPOSIT TYPES
// ============================================

export interface EndUserDeposit {
	id: string
	clientId: string
	userId: string
	balance: number
	entryIndex: number
	walletAddress?: string
	isActive: boolean
	firstDepositAt: string
	lastDepositAt: string
	lastWithdrawalAt?: string
	createdAt: string
	updatedAt: string
}

export interface EndUserBalance {
	userId: string
	balance: number
	currentValue: number
	yieldEarned: number
	entryIndex: number
	currentIndex: number
	apy: number
}

// ============================================
// VAULT INDEX TYPES
// ============================================

export interface VaultIndex {
	id: string
	clientId: string
	riskTier: RiskTier
	currentIndex: number
	totalDeposits: number
	totalValue: number
	totalYieldEarned: number
	apyCurrent: number
	apy7d: number
	apy30d: number
	lastUpdatedAt: string
	createdAt: string
}

// ============================================
// CLIENT BALANCE TYPES
// ============================================

export interface ClientBalance {
	id: string
	clientId: string
	available: number
	reserved: number
	total: number
	currency: string
	lastTopupAt?: string
	createdAt: string
	updatedAt: string
}

export interface TopupBalanceRequest {
	amount: number
	currency?: string
	paymentMethod: 'wire_transfer' | 'card' | 'crypto'
	transactionRef?: string
}

// ============================================
// GENERIC API RESPONSE
// ============================================

export interface APIResponse<T> {
	success: boolean
	data: T
	message?: string
	error?: {
		code: string
		message: string
		details?: unknown
	}
}

export interface PaginatedResponse<T> {
	success: boolean
	data: T[]
	pagination: {
		page: number
		limit: number
		total: number
		totalPages: number
	}
}

// ============================================
// AUDIT LOG TYPES
// ============================================

export interface AuditLog {
	id: string
	clientId?: string
	userId?: string
	actorType: 'client' | 'end_user' | 'system' | 'admin'
	action: string
	resourceType?: string
	resourceId?: string
	description?: string
	metadata?: Record<string, unknown>
	ipAddress?: string
	userAgent?: string
	createdAt: string
}
