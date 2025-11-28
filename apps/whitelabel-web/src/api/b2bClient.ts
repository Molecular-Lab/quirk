import b2bAxiosClient from "@/config/axios"

import type { AxiosInstance } from "axios"

/**
 * Helper function to get saved API key from localStorage
 */
const getApiKey = (): string | null => {
	return localStorage.getItem("b2b:api_key")
}

/**
 * B2B API Client
 * Following prod-ref-web pattern
 *
 * Auto-injects x-api-key header for authenticated requests (FLOW 3-9)
 */
export class B2BAPIClient {
	private readonly axios: AxiosInstance
	private readonly baseURL: string

	constructor(axiosInstance: AxiosInstance, baseURL: string) {
		this.axios = axiosInstance
		this.baseURL = baseURL

		// Auto-inject x-api-key header for all requests (if available)
		this.axios.interceptors.request.use((config) => {
			const apiKey = getApiKey()
			if (apiKey) {
				config.headers["x-api-key"] = apiKey
				// eslint-disable-next-line no-console
				console.log("[b2bApiClient] Auto-injected x-api-key header:", apiKey.substring(0, 12) + "...")
			}
			return config
		})
	}

	// Client endpoints
	async registerClient(data: {
		companyName: string
		businessType: string
		walletType: "MANAGED" | "USER_OWNED"
		vaultsToCreate?: "usdc" | "usdt" | "both" // Which token vaults to create (each supports ALL chains)
		privyOrganizationId: string
		privyWalletAddress?: string
		privyEmail?: string
		description?: string
		websiteUrl?: string
		// Multi-currency support (for off-ramp withdrawals)
		supportedCurrencies?: string[]
		bankAccounts?: {
			currency: string
			bank_name: string
			account_number: string
			account_name: string
			bank_details?: Record<string, unknown>
		}[]
	}) {
		// eslint-disable-next-line no-console
		console.log("[b2bApiClient] registerClient called with:", {
			...data,
			privyWalletAddress: data.privyWalletAddress ?? "MISSING!",
			privyEmail: data.privyEmail ?? "MISSING!",
			vaultsToCreate: data.vaultsToCreate ?? "both (default: creates 10 vaults = 5 chains × 2 tokens)",
		})
		const response = await this.axios.post<unknown>(`${this.baseURL}/api/v1/clients`, data)
		// eslint-disable-next-line no-console
		console.log("[b2bApiClient] registerClient response:", response.data)
		return response.data
	}

	async getClientProfile(clientId: string) {
		const response = await this.axios.get<unknown>(`${this.baseURL}/api/v1/clients/${clientId}`)
		return response.data
	}

	/**
	 * List all organizations for a Privy user
	 * Returns array of client organizations (e.g., GrabPay, GrabFood, GrabMart)
	 */
	async listOrganizationsByPrivyId(privyOrganizationId: string) {
		// eslint-disable-next-line no-console
		console.log("[b2bApiClient] Fetching organizations for Privy ID:", privyOrganizationId)
		const response = await this.axios.get<unknown>(`${this.baseURL}/api/v1/clients/privy/${privyOrganizationId}`)
		// eslint-disable-next-line no-console
		console.log("[b2bApiClient] Response:", response.data)
		return response.data
	}

	/**
	 * Get organization by product ID
	 */
	async getOrganizationByProductId(productId: string) {
		const response = await this.axios.get<unknown>(`${this.baseURL}/api/v1/clients/product/${productId}`)
		return response.data
	}

	/**
	 * Regenerate API key for existing organization
	 * ⚠️ Returns new API key (shown only once!)
	 * ⚠️ Invalidates old API key immediately
	 */
	async regenerateApiKey(productId: string) {
		// eslint-disable-next-line no-console
		console.log("[b2bApiClient] Regenerating API key for product:", productId)
		const response = await this.axios.post<unknown>(
			`${this.baseURL}/api/v1/clients/product/${productId}/regenerate-api-key`,
		)
		// eslint-disable-next-line no-console
		console.log("[b2bApiClient] API key regenerated:", response.data)
		return response.data
	}

	// Privy Account endpoints

	/**
	 * Get Privy account by organization ID
	 */
	async getPrivyAccount(privyOrganizationId: string) {
		const response = await this.axios.get<unknown>(`${this.baseURL}/api/v1/privy-accounts/${privyOrganizationId}`)
		return response.data
	}

	/**
	 * Create or update Privy account
	 * Should be called immediately after wallet creation to save identity to database
	 */
	async createPrivyAccount(data: {
		privyOrganizationId: string
		privyWalletAddress: string
		privyEmail?: string
		walletType: "MANAGED" | "USER_OWNED"
	}) {
		// eslint-disable-next-line no-console
		console.log("[b2bApiClient] createPrivyAccount called with:", data)
		const response = await this.axios.post<unknown>(`${this.baseURL}/api/v1/privy-accounts`, data)
		// eslint-disable-next-line no-console
		console.log("[b2bApiClient] createPrivyAccount response:", response.data)
		return response.data
	}

	async configureStrategies(
		productId: string, // UPDATED: Use productId instead of clientId
		data: {
			chain: string
			token?: string // Token symbol (USDC, USDT) - auto-fills token_address
			token_address: string
			strategies: { category: string; target: number }[]
		},
	) {
		const response = await this.axios.post<unknown>(`${this.baseURL}/api/v1/products/${productId}/strategies`, data)
		return response.data
	}

	// User endpoints
	async createUser(data: {
		clientId: string // Product ID from active organization
		clientUserId: string // Client's internal user ID
		email?: string
		walletAddress?: string
	}) {
		const response = await this.axios.post<unknown>(`${this.baseURL}/api/v1/users`, data)
		return response.data
	}

	async getUserBalance(userId: string, params?: { chain?: string; token?: string }) {
		// eslint-disable-next-line no-console
		console.log("[b2bApiClient] Getting user balance:", { userId, params })
		const response = await this.axios.get<unknown>(`${this.baseURL}/api/v1/users/${userId}/balance`, { params })
		// eslint-disable-next-line no-console
		console.log("[b2bApiClient] Balance response:", response.data)
		return response.data
	}

	async getUserVaults(userId: string) {
		const response = await this.axios.get<unknown>(`${this.baseURL}/api/v1/users/${userId}/vaults`)
		return response.data
	}

	// Deposit endpoints
	async createDeposit(data: {
		user_id: string
		amount: string
		currency: string
		chain: string
		token: string
		payment_method?: string // Optional: on-ramp provider
	}) {
		// ✅ Map frontend params to backend contract
		const requestBody = {
			userId: data.user_id,
			amount: data.amount,
			currency: data.currency,
			chain: data.chain,
			tokenSymbol: data.token,
			onRampProvider: data.payment_method as
				| "proxify_gateway"
				| "circle"
				| "coinbase"
				| "bridge"
				| "moonpay"
				| undefined,
		}

		// eslint-disable-next-line no-console
		console.log("[b2bApiClient] Creating deposit:", requestBody)

		const response = await this.axios.post<unknown>(`${this.baseURL}/api/v1/deposits/fiat`, requestBody)
		return response.data
	}

	async completeDeposit(data: {
		orderId: string
		transactionHash: string
		cryptoAmount: string
		chain: string
		tokenAddress: string
	}) {
		// ✅ Use correct endpoint path for completing fiat deposit
		// eslint-disable-next-line no-console
		console.log("[b2bApiClient] Completing deposit:", data)

		const requestBody = {
			cryptoAmount: data.cryptoAmount,
			chain: data.chain,
			tokenAddress: data.tokenAddress,
			transactionHash: data.transactionHash,
			gatewayFee: "0",
			proxifyFee: "0",
			networkFee: "0",
			totalFees: "0",
		}

		const response = await this.axios.post<unknown>(
			`${this.baseURL}/api/v1/deposits/fiat/${data.orderId}/complete`,
			requestBody,
		)
		return response.data
	}

	// ============================================
	// SEPARATE CONFIG ENDPOINTS (3 cards on Settings page)
	// ============================================

	/**
	 * 1. Update organization info only
	 * Card: "Organization Info"
	 */
	async updateOrganizationInfo(
		productId: string,
		data: {
			companyName?: string
			businessType?: string
			description?: string
			websiteUrl?: string
		},
	) {
		// eslint-disable-next-line no-console
		console.log("[b2bApiClient] Updating organization info:", { productId, data })

		const response = await this.axios.patch<unknown>(
			`${this.baseURL}/api/v1/clients/product/${productId}/organization`,
			data,
		)

		// eslint-disable-next-line no-console
		console.log("[b2bApiClient] Organization info updated:", response.data)

		return response.data
	}

	/**
	 * 2. Update supported currencies only
	 * Card: "Supported Currencies"
	 */
	async updateSupportedCurrencies(
		productId: string,
		data: {
			supportedCurrencies: string[]
		},
	) {
		// eslint-disable-next-line no-console
		console.log("[b2bApiClient] Updating supported currencies:", { productId, data })

		const response = await this.axios.patch<unknown>(
			`${this.baseURL}/api/v1/clients/product/${productId}/currencies`,
			data,
		)

		// eslint-disable-next-line no-console
		console.log("[b2bApiClient] Supported currencies updated:", response.data)

		return response.data
	}

	/**
	 * 3. Configure bank accounts for withdrawals (off-ramp)
	 * Card: "Settlement Bank Accounts"
	 */
	async configureBankAccounts(
		productId: string,
		data: {
			bankAccounts: {
				currency: string
				bankName?: string
				accountNumber?: string
				accountName?: string
				bankDetails?: Record<string, unknown>
				bank_name?: string
				account_number?: string
				account_name?: string
				bank_details?: Record<string, unknown>
			}[]
		},
	) {
		// eslint-disable-next-line no-console
		console.log("[b2bApiClient] Configuring bank accounts:", { productId, data })

		// Map camelCase fields to snake_case to match backend Zod DTOs
		const requestBody = {
			bankAccounts: data.bankAccounts.map((ba) => ({
				currency: ba.currency,
				bank_name: ba.bank_name ?? ba.bankName ?? "",
				account_number: ba.account_number ?? ba.accountNumber ?? "",
				account_name: ba.account_name ?? ba.accountName ?? "",
				bank_details: ba.bank_details ?? ba.bankDetails ?? undefined,
			})),
		}

		const response = await this.axios.post<unknown>(
			`${this.baseURL}/api/v1/clients/product/${productId}/bank-accounts`,
			requestBody,
		)

		// eslint-disable-next-line no-console
		console.log("[b2bApiClient] Bank accounts configured:", response.data)

		return response.data
	}

	/**
	 * Get bank accounts for a client
	 */
	async getBankAccounts(productId: string) {
		// eslint-disable-next-line no-console
		console.log("[b2bApiClient] Getting bank accounts:", productId)

		const response = await this.axios.get<unknown>(`${this.baseURL}/api/v1/clients/product/${productId}/bank-accounts`)

		// eslint-disable-next-line no-console
		console.log("[b2bApiClient] Bank accounts:", response.data)

		return response.data
	}

	// Legacy method - kept for backward compatibility
	// @deprecated Use configureBankAccounts instead
	async configureBankAccount(
		productId: string,
		data: {
			currency: string
			bank_name: string
			account_number: string
			account_name: string
			bank_details?: Record<string, unknown>
		},
	) {
		// eslint-disable-next-line no-console
		console.log("[b2bApiClient] [DEPRECATED] configureBankAccount - use configureBankAccounts instead")

		// Convert to new format and call configureBankAccounts
		return this.configureBankAccounts(productId, {
			bankAccounts: [
				{
					currency: data.currency,
					bankName: data.bank_name,
					accountNumber: data.account_number,
					accountName: data.account_name,
					bankDetails: data.bank_details,
				},
			],
		})
	}

	// Withdrawal endpoints
	async createWithdrawal(data: {
		user_id: string
		vaultId: string
		amount: string
		withdrawal_method: "crypto" | "fiat_to_client" | "fiat_to_end_user"
		destination_address?: string // For crypto withdrawals
		destination_currency?: string // For fiat withdrawals
		end_user_bank_account?: {
			// For fiat_to_end_user method
			currency: string
			bank_name: string
			account_number: string
			account_name: string
			bank_details?: Record<string, any>
		}
	}) {
		// ✅ Map frontend params to backend contract
		const requestBody = {
			clientId: "", // ✅ Will be extracted from API key by backend
			userId: data.user_id,
			vaultId: data.vaultId,
			amount: data.amount,
			withdrawal_method: data.withdrawal_method,
			destination_address: data.destination_address,
			destination_currency: data.destination_currency,
			end_user_bank_account: data.end_user_bank_account,
		}

		// eslint-disable-next-line no-console
		console.log("[b2bApiClient] Creating withdrawal:", requestBody)

		const response = await this.axios.post<unknown>(`${this.baseURL}/api/v1/withdrawals`, requestBody)

		// eslint-disable-next-line no-console
		console.log("[b2bApiClient] Withdrawal response:", response.data)

		return response.data
	}

	// Mock deposit confirmation (DEMO only)
	async mockConfirmFiatDeposit(
		orderId: string,
		data: {
			bankTransactionId: string
			paidAmount: string
			paidCurrency: string
		},
	) {
		// eslint-disable-next-line no-console
		console.log("[b2bApiClient] Mock confirming payment:", { orderId, data })

		const response = await this.axios.post<unknown>(
			`${this.baseURL}/api/v1/deposits/fiat/${orderId}/mock-confirm`,
			data,
		)

		// eslint-disable-next-line no-console
		console.log("[b2bApiClient] Mock confirm response:", response.data)

		return response.data
	}

	// Batch complete deposits (Operations Dashboard)
	async batchCompleteDeposits(data: { orderIds: string[]; paidCurrency?: string }) {
		// eslint-disable-next-line no-console
		console.log("[b2bApiClient] Batch completing deposits:", data)

		const response = await this.axios.post<unknown>(`${this.baseURL}/api/v1/deposits/batch-complete`, {
			orderIds: data.orderIds,
			paidCurrency: data.paidCurrency || "USD",
		})

		// eslint-disable-next-line no-console
		console.log("[b2bApiClient] Batch complete response:", response.data)

		return response.data
	}

	// Get deposit by order ID
	async getDepositByOrderId(orderId: string) {
		// eslint-disable-next-line no-console
		console.log("[b2bApiClient] Fetching deposit:", orderId)

		const response = await this.axios.get<unknown>(`${this.baseURL}/api/v1/deposits/${orderId}`)

		// eslint-disable-next-line no-console
		console.log("[b2bApiClient] Deposit response:", response.data)

		return response.data
	}

	// List pending deposits with currency summary
	async listPendingDeposits() {
		// eslint-disable-next-line no-console
		console.log("[b2bApiClient] Fetching pending deposits")

		const response = await this.axios.get<unknown>(`${this.baseURL}/api/v1/deposits/pending`)

		// eslint-disable-next-line no-console
		console.log("[b2bApiClient] Pending deposits response:", response.data)

		return response.data
	}

	// Vault endpoints
	async updateVaultYield(vaultId: string, data: { yield_earned: string; total_staked: string }) {
		// ✅ Map frontend params to backend contract
		const requestBody = {
			yieldAmount: data.yield_earned,
		}

		// eslint-disable-next-line no-console
		console.log("[b2bApiClient] Updating vault yield:", { vaultId, requestBody })

		const response = await this.axios.post<unknown>(
			`${this.baseURL}/api/v1/vaults/${vaultId}/index/update`,
			requestBody,
		)

		// eslint-disable-next-line no-console
		console.log("[b2bApiClient] Yield update response:", response.data)

		return response.data
	}
}

// Export singleton instance
const B2B_API_BASE_URL = (import.meta.env.VITE_B2B_API_URL as string | undefined) ?? "http://localhost:3002"

export const b2bApiClient = new B2BAPIClient(b2bAxiosClient, B2B_API_BASE_URL)

export default b2bApiClient
