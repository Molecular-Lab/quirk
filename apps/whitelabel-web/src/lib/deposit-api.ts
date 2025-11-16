/**
 * Deposit API Client
 * B2B On-Ramp API for both external and internal deposits
 */

import { apiClient, endpoints } from './api-client'
import type {
	DepositRequest,
	DepositResponse,
	Deposit,
	PaginatedDeposits,
	ClientBalance,
} from '@/types/deposit'

/**
 * Generic API response wrapper
 */
interface APIResponse<T> {
	success: boolean
	data: T
	message?: string
}

/**
 * Deposit API Methods
 */
export const depositAPI = {
	/**
	 * Create a new deposit order (BOTH external and internal types)
	 * POST /api/v1/deposits
	 *
	 * @param params - Deposit request (external or internal)
	 * @returns Deposit response with order details
	 *
	 * @example External Payment (Apple Pay)
	 * ```ts
	 * const response = await depositAPI.createDeposit({
	 *   type: 'external',
	 *   productId: 'my-ecommerce',
	 *   userId: 'user_123',
	 *   amount: 100,
	 *   currency: 'USD',
	 *   method: 'apple_pay',
	 *   userEmail: 'user@example.com',
	 *   returnUrl: 'https://myapp.com/deposit/success'
	 * })
	 * // Opens Apple Pay popup via response.data.paymentUrl
	 * ```
	 *
	 * @example Internal Balance Transfer
	 * ```ts
	 * const response = await depositAPI.createDeposit({
	 *   type: 'internal',
	 *   productId: 'youtube',
	 *   userId: 'creator_123',
	 *   amount: 5000,
	 *   currency: 'USD',
	 *   clientBalanceId: 'youtube_balance_abc123'
	 * })
	 * // Instant completion, no payment URL needed
	 * ```
	 */
	createDeposit: async (params: DepositRequest): Promise<DepositResponse> => {
		const response = await apiClient.post<DepositResponse>(
			endpoints.deposits.create,
			params
		)
		return response.data
	},

	/**
	 * Get deposit status by order ID
	 * GET /api/v1/deposits/:orderId
	 *
	 * @param orderId - Order ID from createDeposit response
	 * @returns Deposit details with current status
	 *
	 * @example
	 * ```ts
	 * const deposit = await depositAPI.getDepositStatus('order_abc123')
	 * if (deposit.status === 'COMPLETED') {
	 *   console.log('Deposit completed!')
	 * }
	 * ```
	 */
	getDepositStatus: async (orderId: string): Promise<Deposit> => {
		const response = await apiClient.get<APIResponse<Deposit>>(
			endpoints.deposits.getById(orderId)
		)
		return response.data.data
	},

	/**
	 * List all deposits for a user (with pagination)
	 * GET /api/v1/deposits?userId=xxx&page=1&limit=20
	 *
	 * @param userId - User ID to filter deposits
	 * @param page - Page number (default: 1)
	 * @param limit - Items per page (default: 20)
	 * @returns Paginated list of deposits
	 *
	 * @example
	 * ```ts
	 * const deposits = await depositAPI.listDeposits('user_123', 1, 20)
	 * console.log(`Total deposits: ${deposits.pagination.total}`)
	 * deposits.data.forEach(deposit => {
	 *   console.log(`${deposit.orderId}: ${deposit.status}`)
	 * })
	 * ```
	 */
	listDeposits: async (
		userId: string,
		page: number = 1,
		limit: number = 20
	): Promise<PaginatedDeposits> => {
		const response = await apiClient.get<PaginatedDeposits>(
			endpoints.deposits.list,
			{
				params: { userId, page, limit },
			}
		)
		return response.data
	},

	/**
	 * Get client's prepaid balance with Proxify (for internal transfers)
	 * GET /api/v1/deposits/client-balance
	 *
	 * This shows how much fiat the client has deposited with Proxify.
	 * Used to validate internal transfers (must have sufficient balance).
	 *
	 * @returns Client balance details
	 *
	 * @example
	 * ```ts
	 * const balance = await depositAPI.getClientBalance()
	 * console.log(`Available: $${balance.available}`)
	 * console.log(`Reserved: $${balance.reserved}`)
	 * console.log(`Total: $${balance.total}`)
	 *
	 * // Check if client can afford internal transfer
	 * if (balance.available >= 5000) {
	 *   // Can transfer $5,000
	 * }
	 * ```
	 */
	getClientBalance: async (): Promise<ClientBalance> => {
		const response = await apiClient.get<APIResponse<ClientBalance>>(
			endpoints.deposits.clientBalance
		)
		return response.data.data
	},
}
