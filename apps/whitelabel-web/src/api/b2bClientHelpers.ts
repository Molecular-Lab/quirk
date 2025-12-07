/**
 * Type-safe B2B API Client Helpers
 *
 * Usage examples for the new ts-rest type-safe client
 * All responses are now properly typed!
 */

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
	const { status, body } = await b2bApiClient.client.listByPrivyOrgId({
		params: { privyOrganizationId },
	})

	if (status === 200) {
		// ✅ body is typed as array of clients
		return body
	}

	return []
}

/**
 * Get organization by product ID
 */
export async function getOrganizationByProductId(productId: string) {
	const { status, body } = await b2bApiClient.client.getByProductId({
		params: { productId },
	})

	if (status === 200) {
		return body
	}

	throw new Error("Organization not found")
}

/**
 * Get client profile by ID
 */
export async function getClientProfile(id: string) {
	const { status, body } = await b2bApiClient.client.getById({
		params: { id },
	})

	if (status === 200) {
		return body
	}

	throw new Error("Client not found")
}

/**
 * Regenerate API key
 */
export async function regenerateApiKey(productId: string) {
	const { status, body } = await b2bApiClient.client.regenerateApiKey({
		params: { productId },
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

	if (status === 200) {
		return body
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
		return body
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
 */
export async function listPendingDeposits() {
	const { status, body } = await b2bApiClient.deposit.listPending({})

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
export async function createUser(
	clientId: string,
	data: {
		clientUserId: string
		email?: string
		walletAddress?: string
	},
) {
	const { status, body } = await b2bApiClient.user.getOrCreate({
		body: {
			clientId,
			...data,
		},
	})

	if (status === 200) {
		return body
	}

	throw new Error("Failed to create user")
}

/**
 * Get user balance
 */
export async function getUserBalance(userId: string, params?: { chain?: string; token?: string }) {
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
