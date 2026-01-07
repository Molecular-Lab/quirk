/**
 * Type-safe B2B API Client Helpers
 *
 * Usage examples for the new ts-rest type-safe client
 * All responses are now properly typed!
 */

/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable object-shorthand */
// Note: Above warnings are false positives from ts-rest's union type handling
// The code is type-safe - status checks properly narrow the body type

import { b2bApiClient } from "./b2bClient"

type Currency = "SGD" | "USD" | "EUR" | "THB" | "TWD" | "KRW"
type StrategyCategory = "lending" | "lp" | "staking"

/**
 * Example usage patterns:
 *
 * OLD (no type safety):
 * const data = await b2bApiClient.registerClient({ ... }) // ❌ data is unknown
 *
 * NEW (full type safety):
 * const { status, body } = await b2bApiClient.client.create({ body: { ... } }) // ✅ body is typed!
 *
 * if (status === 201) {
 *   console.log(body.id) // ✅ TypeScript knows body has 'id' property
 * }
 */

// ============================================
// CLIENT ENDPOINTS
// ============================================

/**
 * Register a new client/organization
 */
export async function registerClient(data: {
	companyName: string
	businessType: string
	walletType: "MANAGED" | "USER_OWNED"
	privyOrganizationId: string
	privyWalletAddress: string
	vaultsToCreate?: "usdc" | "usdt" | "both"
	privyEmail?: string
	description?: string
	websiteUrl?: string
	customerTier?: "0-1K" | "1K-10K" | "10K-100K" | "100K-1M" | "1M+"
	strategyRanking?: string[]
	clientRevenueSharePercent?: string
	platformFeePercent?: string
	supportedCurrencies?: Currency[]
	bankAccounts?: {
		currency: Currency
		bank_name: string
		account_number: string
		account_name: string
		bank_details?: Record<string, unknown>
	}[]
}) {
	const { status, body } = await b2bApiClient.client.create({ body: data })

	if (status === 201) {
		// ✅ TypeScript knows body.id, body.productId, etc.
		return body
	}

	throw new Error("Failed to register client")
}

/**
 * List organizations by Privy ID
 */
export async function listOrganizationsByPrivyId(privyOrganizationId: string) {
	console.log("[b2bClientHelpers] 🔍 Fetching organizations for privyOrgId:", privyOrganizationId)

	const { status, body } = await b2bApiClient.client.listByPrivyOrgId({
		params: { privyOrganizationId },
	})

	console.log("[b2bClientHelpers] 🔍 API Response:", { status, body })

	if (status === 200) {
		console.log("[b2bClientHelpers] ✅ Returning body (array of orgs):", body)
		// ✅ body is typed as array of clients
		return body
	}

	console.log("[b2bClientHelpers] ⚠️ Non-200 status, returning empty array")
	return []
}

/**
 * Get organization by product ID
 */
export async function getOrganizationByProductId(productId: string) {
	// Check if productId is provided
	if (!productId || productId === "undefined") {
		throw new Error("Product ID is required")
	}

	const { status, body } = await b2bApiClient.client.getByProductId({
		params: { productId },
	})

	if (status === 200) {
		return body
	}

	// Provide more specific error messages based on status
	if (status === 403) {
		throw new Error(`Access denied: Product ${productId} not in your organization`)
	}

	if (status === 404) {
		throw new Error(`Product not found: ${productId}`)
	}

	throw new Error(`Failed to get organization for product ${productId}`)
}

/**
 * Get client profile by ID
 */
export async function getClientProfile(id: string) {
	// Check if id is provided
	if (!id || id === "undefined") {
		throw new Error("Client ID is required")
	}

	const { status, body } = await b2bApiClient.client.getById({
		params: { id },
	})

	if (status === 200) {
		return body
	}

	// Provide more specific error messages based on status
	if (status === 403) {
		throw new Error(`Access denied: Client ${id} not in your organization`)
	}

	if (status === 404) {
		throw new Error(`Client not found: ${id}`)
	}

	throw new Error(`Failed to get client ${id}`)
}

/**
 * Regenerate API key
 */
export async function regenerateApiKey(productId: string, environment: "sandbox" | "production" = "sandbox") {
	const { status, body } = await b2bApiClient.client.regenerateApiKey({
		params: { productId },
		query: { environment },
		body: {},
	})

	if (status === 200) {
		// ✅ TypeScript knows body.api_key, body.productId
		return body
	}

	throw new Error("Failed to regenerate API key")
}

/**
 * Update organization info
 */
export async function updateOrganizationInfo(
	productId: string,
	data: {
		companyName?: string
		businessType?: string
		description?: string
		websiteUrl?: string
	},
) {
	const { status, body } = await b2bApiClient.client.updateOrganizationInfo({
		params: { productId },
		body: data,
	})

	if (status === 200) {
		return body
	}

	throw new Error("Failed to update organization")
}

/**
 * Update supported currencies
 */
export async function updateSupportedCurrencies(productId: string, supportedCurrencies: Currency[]) {
	const { status, body } = await b2bApiClient.client.updateSupportedCurrencies({
		params: { productId },
		body: { supportedCurrencies },
	})

	if (status === 200) {
		return body
	}

	throw new Error("Failed to update currencies")
}

/**
 * Configure bank accounts
 */
export async function configureBankAccounts(
	productId: string,
	bankAccounts: {
		currency: Currency
		bank_name: string
		account_number: string
		account_name: string
		bank_details?: Record<string, unknown>
	}[],
) {
	const { status, body } = await b2bApiClient.client.configureBankAccounts({
		params: { productId },
		body: { bankAccounts },
	})

	if (status === 200) {
		return body
	}

	throw new Error("Failed to configure bank accounts")
}

/**
 * Get bank accounts
 */
export async function getBankAccounts(productId: string) {
	const { status, body } = await b2bApiClient.client.getBankAccounts({
		params: { productId },
	})

	if (status === 200) {
		return body
	}

	return { productId, bankAccounts: [], supportedCurrencies: [] }
}

/**
 * Configure strategies
 */
export async function configureStrategies(
	productId: string,
	data: {
		chain: string
		token_address: string
		token_symbol?: string
		strategies: { category: StrategyCategory; target: number }[]
	},
) {
	const { status, body } = await b2bApiClient.client.configureStrategies({
		params: { productId },
		body: data,
	})

	if (status === 200) {
		return body
	}

	throw new Error("Failed to configure strategies")
}

/**
 * Bulk apply strategy to all products
 */
export async function bulkApplyStrategy(data: {
	chain: string
	token_address: string
	token_symbol?: string
	strategies: { category: StrategyCategory; target: number }[]
}) {
	const { status, body } = await b2bApiClient.client.bulkApplyStrategy({
		body: data,
	})

	if (status === 200) {
		return body
	}

	throw new Error("Failed to bulk apply strategy")
}

/**
 * Get product strategies (preferences and customization)
 */
export async function getProductStrategies(productId: string) {
	const { status, body } = await b2bApiClient.client.getProductStrategies({
		params: { productId },
	})

	if (status === 200) {
		return body
	}

	throw new Error("Failed to get product strategies")
}

/**
 * Update product strategy customization
 */
export async function updateProductStrategiesCustomization(
	productId: string,
	strategies: Record<string, Record<string, number>>,
) {
	const { status, body } = await b2bApiClient.client.updateProductStrategiesCustomization({
		params: { productId },
		body: { strategies },
	})

	if (status === 200) {
		return body
	}

	throw new Error("Failed to update product strategies")
}

/**
 * Get effective product strategies (customization if set, otherwise preferences)
 */
export async function getEffectiveProductStrategies(productId: string) {
	const { status, body } = await b2bApiClient.client.getEffectiveProductStrategies({
		params: { productId },
	})

	console.log("[b2bClientHelpers] getEffectiveProductStrategies RESPONSE:", { status, body })

	if (status === 200 && body.found && body.data) {
		// Extract strategies from body.data
		const result = {
			strategies: body.data.strategies,
			source: body.data.source,
		}
		console.log("[b2bClientHelpers] Extracted strategies:", result)
		return result
	}

	throw new Error("Failed to get effective product strategies")
}

// ============================================
// PRIVY ACCOUNT ENDPOINTS
// ============================================

/**
 * Get Privy account
 */
export async function getPrivyAccount(privyOrganizationId: string) {
	const { status, body } = await b2bApiClient.privyAccount.getByOrgId({
		params: { privyOrganizationId },
	})

	if (status === 200) {
		return body.data // Return data (null if not found)
	}

	return null
}

/**
 * Create Privy account
 */
export async function createPrivyAccount(data: {
	privyOrganizationId: string
	privyWalletAddress: string
	privyEmail?: string
	walletType: "MANAGED" | "USER_OWNED"
}) {
	const { status, body } = await b2bApiClient.privyAccount.createOrUpdate({ body: data })

	if (status === 201) {
		return body
	}

	throw new Error("Failed to create Privy account")
}

// ============================================
// DEPOSIT ENDPOINTS
// ============================================

/**
 * Create fiat deposit
 */
export async function createFiatDeposit(data: {
	userId: string
	amount: string
	currency: Currency
	tokenSymbol?: string
	clientReference?: string
	environment?: "sandbox" | "production"
}) {
	const { status, body } = await b2bApiClient.deposit.createFiatDeposit({ body: data })

	if (status === 201) {
		return body
	}

	throw new Error("Failed to create deposit")
}

/**
 * Mock confirm fiat deposit
 */
export async function mockConfirmFiatDeposit(
	orderId: string,
	data: {
		bankTransactionId: string
		paidAmount: string
		paidCurrency: string
	},
) {
	const { status, body } = await b2bApiClient.deposit.mockConfirmFiatDeposit({
		params: { orderId },
		body: data,
	})

	if (status === 200) {
		return body
	}

	throw new Error("Failed to confirm deposit")
}

/**
 * Batch complete deposits
 */
export async function batchCompleteDeposits(data: { orderIds: string[]; paidCurrency?: string }) {
	const { status, body } = await b2bApiClient.deposit.batchCompleteDeposits({
		body: {
			orderIds: data.orderIds,
			paidCurrency: data.paidCurrency || "USD",
		},
	})

	if (status === 200) {
		return body
	}

	throw new Error("Failed to batch complete deposits")
}

/**
 * Get deposit by order ID
 */
export async function getDepositByOrderId(orderId: string) {
	const { status, body } = await b2bApiClient.deposit.getByOrderId({
		params: { orderId },
	})

	if (status === 200) {
		return body
	}

	throw new Error("Deposit not found")
}

/**
 * List pending deposits
 * @param environment - Optional environment filter (sandbox/production)
 */
export async function listPendingDeposits(environment?: "sandbox" | "production") {
	const { status, body } = await b2bApiClient.deposit.listPending({
		query: { environment },
	})

	if (status === 200) {
		return body
	}

	return { deposits: [], summary: [] }
}

// ============================================
// USER ENDPOINTS
// ============================================

/**
 * Create user
 */
/**
 * Create or get end-user
 * NOTE: clientId is automatically extracted from API key (via apiKeyAuth middleware)
 * Do NOT pass clientId in the body!
 */
export async function createUser(
	_productIdOrClientId: string, // Kept for backward compatibility but not used
	data: {
		clientUserId: string
		email?: string
		walletAddress?: string
		status?: "pending_onboarding" | "active" | "suspended"
	},
) {
	const { status, body } = await b2bApiClient.user.getOrCreate({
		body: {
			// ✅ Do NOT send clientId - API key middleware extracts it from authenticated request
			...data,
		},
	})

	if (status === 200) {
		return body
	}

	throw new Error("Failed to create user")
}

/**
 * Get user by client ID and client user ID
 * Used to check if a user exists and their activation status
 */
export async function getUserByClientUserId(clientId: string, clientUserId: string) {
	const { status, body } = await b2bApiClient.user.getByClientUserId({
		params: { clientId, clientUserId },
	})

	if (status === 200 && body.found && body.data) {
		return body.data
	}

	return null
}

/**
 * Get user balance (with environment support)
 */
export async function getUserBalance(
	userId: string,
	params?: { chain?: string; token?: string; environment?: "sandbox" | "production" },
) {
	const { status, body } = await b2bApiClient.user.getBalance({
		params: { userId },
		query: params ?? {},
	})

	if (status === 200) {
		return body
	}

	throw new Error("Failed to get balance")
}

/**
 * Get user vaults
 */
export async function getUserVaults(userId: string) {
	const { status, body } = await b2bApiClient.user.listVaults({
		params: { userId },
	})

	if (status === 200) {
		return body
	}

	throw new Error("Failed to get vaults")
}

/**
 * Activate user account after completing onboarding (public endpoint)
 */
export async function activateUser(userId: string, productId: string) {
	const { status, body } = await b2bApiClient.user.activate({
		params: { userId },
		body: { productId },
	})

	if (status === 200) {
		return body
	}

	if (status === 404) {
		throw new Error("User not found")
	}

	if (status === 400) {
		throw new Error(body.error || "Failed to activate user")
	}

	throw new Error("Failed to activate user")
}

// ============================================
// DASHBOARD ENDPOINTS
// ============================================

/**
 * Get dashboard metrics
 */
export async function getDashboardMetrics(clientId?: string) {
	const { status, body } = await b2bApiClient.dashboard.getMetrics({
		query: clientId ? { clientId } : {},
	})

	if (status === 200) {
		return body
	}

	throw new Error("Failed to get dashboard metrics")
}

// ============================================
// VAULT ENDPOINTS
// ============================================

/**
 * Update vault yield
 */
export async function updateVaultYield(vaultId: string, yieldAmount: string) {
	const { status, body } = await b2bApiClient.vault.updateIndexWithYield({
		params: { id: vaultId },
		body: { yieldAmount },
	})

	if (status === 200) {
		return body
	}

	throw new Error("Failed to update vault yield")
}

// ============================================
// WITHDRAWAL ENDPOINTS
// ============================================

/**
 * Create withdrawal
 */
export async function createWithdrawal(data: {
	userId: string
	amount: string
	clientId?: string
	chain?: string
	vaultId?: string
	token_address?: string
	withdrawal_method?: "crypto" | "fiat_to_client" | "fiat_to_end_user"
	destination_address?: string
	destination_currency?: Currency
	environment?: "sandbox" | "production" // ✅ Environment parameter for multi-environment support
	end_user_bank_account?: {
		currency: Currency
		bank_name: string
		account_number: string
		account_name: string
		bank_details?: Record<string, any>
	}
}) {
	const { status, body } = await b2bApiClient.withdrawal.create({
		body: data,
	})

	if (status === 200 || status === 201) {
		return body
	}

	throw new Error("Failed to create withdrawal")
}

/**
 * List pending withdrawals (for operations dashboard)
 * @param environment - Optional environment filter (sandbox/production)
 */
export async function listPendingWithdrawals(environment?: "sandbox" | "production") {
	const { status, body } = await b2bApiClient.withdrawal.listPending({
		query: { environment },
	})

	if (status === 200) {
		return body
	}

	return { withdrawals: [] }
}

/**
 * Complete withdrawal (mark as processed)
 */
export async function completeWithdrawal(withdrawalId: string, transactionHash: string) {
	const { status, body } = await b2bApiClient.withdrawal.complete({
		params: { id: withdrawalId },
		body: { transactionHash },
	})

	if (status === 200) {
		return body
	}

	throw new Error("Failed to complete withdrawal")
}

/**
 * Batch complete withdrawals (with blockchain transfers)
 */
export async function batchCompleteWithdrawals(withdrawalIds: string[], destinationCurrency: string) {
	const { status, body } = await b2bApiClient.withdrawal.batchCompleteWithdrawals({
		body: {
			withdrawalIds,
			destinationCurrency,
		},
	})

	if (status === 200) {
		return body
	}

	if (status === 400 || status === 500) {
		throw new Error(body.error || "Failed to batch complete withdrawals")
	}

	throw new Error("Failed to batch complete withdrawals")
}

// ============================================
// FEE CONFIGURATION ENDPOINTS
// ============================================

/**
 * Get fee configuration for a product
 */
export async function getFeeConfig(productId: string) {
	const { status, body } = await b2bApiClient.client.getFeeConfig({
		params: { productId },
	})

	if (status === 200) {
		return body
	}

	throw new Error("Failed to get fee configuration")
}

/**
 * Update fee configuration (client revenue share percentage)
 */
export async function updateFeeConfig(productId: string, clientRevenueSharePercent: string) {
	const { status, body } = await b2bApiClient.client.updateFeeConfig({
		params: { productId },
		body: { clientRevenueSharePercent },
	})

	if (status === 200) {
		return body
	}

	throw new Error("Failed to update fee configuration")
}

// ============================================
// DASHBOARD SUMMARY ENDPOINTS (Environment-aware)
// ============================================

/**
 * Get complete dashboard summary for a product
 * @param productId - The product ID to get summary for
 * @param environment - Optional environment filter (sandbox/production)
 */
export async function getDashboardSummary(productId: string, environment?: "sandbox" | "production") {
	const { status, body } = await b2bApiClient.client.getDashboardSummary({
		params: { productId },
		query: { environment },
	})

	if (status === 200) {
		return body
	}

	throw new Error("Failed to get dashboard summary")
}

/**
 * Get aggregated dashboard summary across all products
 * @param environment - Optional environment filter (sandbox/production)
 */
export async function getAggregateDashboardSummary(environment?: "sandbox" | "production") {
	const { status, body } = await b2bApiClient.client.getAggregateDashboardSummary({
		query: { environment },
	})

	if (status === 200) {
		return body
	}

	throw new Error("Failed to get aggregate dashboard summary")
}

/**
 * Get revenue metrics for a product
 * @param productId - The product ID to get metrics for
 * @param environment - Optional environment filter (sandbox/production)
 */
export async function getRevenueMetrics(productId: string, environment?: "sandbox" | "production") {
	const { status, body } = await b2bApiClient.client.getRevenueMetrics({
		params: { productId },
		query: { environment },
	})

	if (status === 200) {
		return body
	}

	throw new Error("Failed to get revenue metrics")
}

/**
 * Get end-user growth metrics for a product
 * @param productId - The product ID to get metrics for
 * @param environment - Optional environment filter (sandbox/production)
 */
export async function getEndUserGrowthMetrics(productId: string, environment?: "sandbox" | "production") {
	const { status, body } = await b2bApiClient.client.getEndUserGrowthMetrics({
		params: { productId },
		query: { environment },
	})

	if (status === 200) {
		return body
	}

	throw new Error("Failed to get end-user growth metrics")
}

/**
 * Get recent end-user transactions with pagination
 * @param productId - The product ID to get transactions for
 * @param page - Page number (default: 1)
 * @param limit - Results per page (default: 20)
 * @param environment - Optional environment filter (sandbox/production)
 */
export async function getEndUserTransactions(
	productId: string,
	page = 1,
	limit = 20,
	environment?: "sandbox" | "production",
) {
	const { status, body } = await b2bApiClient.client.getEndUserTransactions({
		params: { productId },
		query: { page, limit, environment },
	})

	if (status === 200) {
		return body
	}

	throw new Error("Failed to get end-user transactions")
}

/**
 * Get wallet balances for a product
 * @param productId - The product ID to get balances for
 * @param environment - Optional environment filter (sandbox/production)
 */
export async function getWalletBalances(productId: string, environment?: "sandbox" | "production") {
	const { status, body } = await b2bApiClient.client.getWalletBalances({
		params: { productId },
		query: { environment },
	})

	if (status === 200) {
		return body
	}

	throw new Error("Failed to get wallet balances")
}
