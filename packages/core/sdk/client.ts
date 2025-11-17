/**
 * Proxify B2B API Client
 * Core SDK for client integration (YouTube, E-commerce, etc.)
 */

import axios, { type AxiosInstance } from 'axios'
import type {
	ProxifySDKConfig,
	DepositRequest,
	DepositResponse,
	Deposit,
	PaginatedDeposits,
	ClientBalance,
	APIResponse,
} from './types'

/**
 * Proxify B2B SDK Client
 *
 * @example Initialize SDK
 * ```ts
 * const proxify = new ProxifyClient({
 *   apiKey: 'pk_live_abc123',
 *   productId: 'youtube',
 *   environment: 'production'
 * })
 * ```
 */
export class ProxifyClient {
	private client: AxiosInstance
	private config: ProxifySDKConfig

	constructor(config: ProxifySDKConfig) {
		this.config = config

		// Determine base URL
		const baseUrl =
			config.baseUrl ||
			this.getBaseUrlByEnvironment(config.environment || 'production')

		// Create axios instance
		this.client = axios.create({
			baseURL: baseUrl,
			timeout: 30000,
			headers: {
				'Content-Type': 'application/json',
				'X-API-Key': config.apiKey,
				'X-Product-ID': config.productId,
			},
		})

		// Response interceptor
		this.client.interceptors.response.use(
			(response) => response,
			(error) => {
				// Handle errors
				if (error.response) {
					const status = error.response.status
					const message = error.response.data?.error?.message || error.message

					throw new ProxifyError(
						`API Error (${status}): ${message}`,
						status,
						error.response.data
					)
				} else if (error.request) {
					throw new ProxifyError('Network error - no response from server', 0)
				} else {
					throw new ProxifyError(error.message, 0)
				}
			}
		)
	}

	/**
	 * Get base URL by environment
	 */
	private getBaseUrlByEnvironment(
		env: 'production' | 'staging' | 'development'
	): string {
		switch (env) {
			case 'production':
				return 'https://api.proxify.finance/v1'
			case 'staging':
				return 'https://api-staging.proxify.finance/v1'
			case 'development':
				return 'http://localhost:8080/api/v1'
		}
	}

	// ============================================
	// DEPOSIT METHODS
	// ============================================

	/**
	 * Create a new deposit (external or internal)
	 *
	 * @param params - Deposit parameters
	 * @returns Deposit response with order details
	 *
	 * @example External Payment (Apple Pay)
	 * ```ts
	 * const deposit = await proxify.deposits.create({
	 *   type: 'external',
	 *   userId: 'user_123',
	 *   amount: 100,
	 *   currency: 'USD',
	 *   method: 'apple_pay',
	 *   userEmail: 'user@example.com',
	 *   returnUrl: 'https://myapp.com/deposit/success'
	 * })
	 *
	 * // Open payment URL
	 * window.open(deposit.data.paymentUrl, '_blank')
	 * ```
	 *
	 * @example Internal Transfer (YouTube Balance)
	 * ```ts
	 * const deposit = await proxify.deposits.create({
	 *   type: 'internal',
	 *   userId: 'creator_123',
	 *   amount: 5000,
	 *   currency: 'USD',
	 *   clientBalanceId: 'youtube_balance_abc123'
	 * })
	 *
	 * // Instant completion
	 * console.log('Transfer complete:', deposit.data.orderId)
	 * ```
	 */
	public deposits = {
		create: async (params: DepositRequest): Promise<DepositResponse> => {
			// Add productId from config if not provided
			const requestParams = {
				...params,
				productId: params.productId || this.config.productId,
			}

			const response = await this.client.post<DepositResponse>(
				'/deposits',
				requestParams
			)
			return response.data
		},

		/**
		 * Get deposit status by order ID
		 *
		 * @param orderId - Order ID from create response
		 * @returns Deposit details with current status
		 *
		 * @example
		 * ```ts
		 * const deposit = await proxify.deposits.getStatus('order_abc123')
		 *
		 * if (deposit.type === 'external' && deposit.status === 'COMPLETED') {
		 *   console.log('External payment completed!')
		 * }
		 *
		 * if (deposit.type === 'internal' && deposit.status === 'INSTANT_COMPLETED') {
		 *   console.log('Internal transfer completed!')
		 * }
		 * ```
		 */
		getStatus: async (orderId: string): Promise<Deposit> => {
			const response = await this.client.get<APIResponse<Deposit>>(
				`/deposits/${orderId}`
			)
			return response.data.data
		},

		/**
		 * List all deposits for a user
		 *
		 * @param userId - User ID to filter deposits
		 * @param page - Page number (default: 1)
		 * @param limit - Items per page (default: 20)
		 * @returns Paginated list of deposits
		 *
		 * @example
		 * ```ts
		 * const deposits = await proxify.deposits.list('user_123', 1, 20)
		 *
		 * console.log(`Total deposits: ${deposits.pagination.total}`)
		 * deposits.data.forEach(deposit => {
		 *   console.log(`${deposit.orderId}: ${deposit.status}`)
		 * })
		 * ```
		 */
		list: async (
			userId: string,
			page: number = 1,
			limit: number = 20
		): Promise<PaginatedDeposits> => {
			const response = await this.client.get<PaginatedDeposits>('/deposits', {
				params: { userId, page, limit },
			})
			return response.data
		},
	}

	// ============================================
	// CLIENT BALANCE METHODS
	// ============================================

	/**
	 * Get client's prepaid balance with Proxify
	 * Used to check available funds for internal transfers
	 *
	 * @returns Client balance details
	 *
	 * @example
	 * ```ts
	 * const balance = await proxify.getClientBalance()
	 *
	 * console.log(`Available: $${balance.available}`)
	 * console.log(`Reserved: $${balance.reserved}`)
	 * console.log(`Total: $${balance.total}`)
	 *
	 * // Check if can afford transfer
	 * if (balance.available >= 5000) {
	 *   // Can transfer $5,000
	 *   await proxify.deposits.create({
	 *     type: 'internal',
	 *     userId: 'user_123',
	 *     amount: 5000,
	 *     currency: 'USD',
	 *     clientBalanceId: 'balance_abc'
	 *   })
	 * }
	 * ```
	 */
	public async getClientBalance(): Promise<ClientBalance> {
		const response = await this.client.get<APIResponse<ClientBalance>>(
			'/deposits/client-balance'
		)
		return response.data.data
	}

	// ============================================
	// WEBHOOK VERIFICATION (for security)
	// ============================================

	/**
	 * Verify webhook signature
	 * Ensures webhook requests are from Proxify
	 *
	 * @param payload - Webhook payload (raw body)
	 * @param signature - X-Proxify-Signature header
	 * @returns true if valid, false otherwise
	 *
	 * @example
	 * ```ts
	 * // In your webhook endpoint
	 * app.post('/webhooks/proxify', (req, res) => {
	 *   const signature = req.headers['x-proxify-signature']
	 *   const isValid = proxify.verifyWebhook(req.body, signature)
	 *
	 *   if (!isValid) {
	 *     return res.status(401).send('Invalid signature')
	 *   }
	 *
	 *   // Process webhook
	 *   const event = req.body
	 *   if (event.eventName === 'ORDER_COMPLETED') {
	 *     console.log('Deposit completed:', event.orderId)
	 *   }
	 * })
	 * ```
	 */
	public verifyWebhook(payload: string, signature: string): boolean {
		// TODO: Implement HMAC signature verification
		// For now, basic check
		return !!signature && signature.length > 0
	}
}

/**
 * Custom error class for Proxify SDK
 */
export class ProxifyError extends Error {
	constructor(
		message: string,
		public statusCode: number = 0,
		public response?: unknown
	) {
		super(message)
		this.name = 'ProxifyError'
	}
}

/**
 * Default export for convenience
 */
export default ProxifyClient
