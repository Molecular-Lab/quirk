/**
 * Quirk B2B Deposit Client
 * Client for managing deposits (external and internal)
 */

import type { AxiosInstance } from 'axios'
import type {
	DepositRequest,
	DepositResponse,
	Deposit,
	PaginatedDeposits,
	ClientBalance,
	APIResponse,
} from '@quirk/core'

/**
 * Deposit Client
 */
export class DepositClient {
	constructor(private axios: AxiosInstance) {}

	/**
	 * Create a new deposit (external or internal)
	 */
	async create(params: DepositRequest): Promise<DepositResponse> {
		const response = await this.axios.post<DepositResponse>('/deposits', params)
		return response.data
	}

	/**
	 * Get deposit status by order ID
	 */
	async getStatus(orderId: string): Promise<Deposit> {
		const response = await this.axios.get<APIResponse<Deposit>>(
			`/deposits/${orderId}`
		)
		return response.data.data
	}

	/**
	 * List all deposits for a user (with pagination)
	 */
	async list(
		userId: string,
		page: number = 1,
		limit: number = 20
	): Promise<PaginatedDeposits> {
		const response = await this.axios.get<PaginatedDeposits>('/deposits', {
			params: { userId, page, limit },
		})
		return response.data
	}

	/**
	 * Get client's prepaid balance with Quirk
	 */
	async getClientBalance(): Promise<ClientBalance> {
		const response = await this.axios.get<APIResponse<ClientBalance>>(
			'/deposits/client-balance'
		)
		return response.data.data
	}
}
