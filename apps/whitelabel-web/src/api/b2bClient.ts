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
			onRampProvider: data.payment_method as "proxify_gateway" | "circle" | "coinbase" | "bridge" | "moonpay" | undefined,
		}

		// eslint-disable-next-line no-console
		console.log("[b2bApiClient] Creating deposit:", requestBody)

		const response = await this.axios.post<unknown>(`${this.baseURL}/api/v1/deposits/fiat`, requestBody)
		return response.data
	}

	async completeDeposit(data: { orderId: string; transactionHash: string; cryptoAmount: string; chain: string; tokenAddress: string }) {
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
			requestBody
		)
		return response.data
	}

	// Withdrawal endpoints
	async createWithdrawal(data: { user_id: string; vaultId: string; amount: string; destination_address?: string }) {
		// ✅ Map frontend params to backend contract
		const requestBody = {
			clientId: "", // ✅ Will be extracted from API key by backend
			userId: data.user_id,
			vaultId: data.vaultId,
			amount: data.amount,
		}

		// eslint-disable-next-line no-console
		console.log("[b2bApiClient] Creating withdrawal:", requestBody)

		const response = await this.axios.post<unknown>(`${this.baseURL}/api/v1/withdrawals`, requestBody)

		// eslint-disable-next-line no-console
		console.log("[b2bApiClient] Withdrawal response:", response.data)

		return response.data
	}

	// Mock deposit confirmation (DEMO only)
	async mockConfirmFiatDeposit(orderId: string, data: {
		bankTransactionId: string;
		paidAmount: string;
		paidCurrency: string;
	}) {
		// eslint-disable-next-line no-console
		console.log("[b2bApiClient] Mock confirming payment:", { orderId, data });

		const response = await this.axios.post<unknown>(
			`${this.baseURL}/api/v1/deposits/fiat/${orderId}/mock-confirm`,
			data
		);

		// eslint-disable-next-line no-console
		console.log("[b2bApiClient] Mock confirm response:", response.data);

		return response.data;
	}

	// Vault endpoints
	async updateVaultYield(vaultId: string, data: { yield_earned: string; total_staked: string }) {
		// ✅ Map frontend params to backend contract
		const requestBody = {
			yieldAmount: data.yield_earned,
		}

		// eslint-disable-next-line no-console
		console.log("[b2bApiClient] Updating vault yield:", { vaultId, requestBody })

		const response = await this.axios.post<unknown>(`${this.baseURL}/api/v1/vaults/${vaultId}/index/update`, requestBody)

		// eslint-disable-next-line no-console
		console.log("[b2bApiClient] Yield update response:", response.data)

		return response.data
	}
}

// Export singleton instance
const B2B_API_BASE_URL = (import.meta.env.VITE_B2B_API_URL as string | undefined) ?? "http://localhost:3002"

export const b2bApiClient = new B2BAPIClient(b2bAxiosClient, B2B_API_BASE_URL)

export default b2bApiClient
