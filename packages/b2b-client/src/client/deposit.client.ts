/**
 * Quirk B2B Deposit Client
 * Client for managing deposits (external and internal)
 */

import type { AxiosInstance } from 'axios'
import type { CreateDepositRequest, ClientBalance } from '@quirk/core'
import type {
	APIResponse,
	PaginatedResponse,
	DepositSummary,
	ClientBalance as LocalClientBalance,
} from '../types/client.types'

/**
 * Deposit Client
 */
export class DepositClient {
	constructor(private axios: AxiosInstance) {}

	/**
	 * Create a new deposit (external or internal)
	 */
	async create(params: CreateDepositRequest): Promise<DepositSummary> {
		const response = await this.axios.post<APIResponse<DepositSummary>>(
			'/deposits',
			params
		)
		return response.data.data
	}

	/**
	 * Get deposit status by order ID
	 */
	async getStatus(orderId: string): Promise<DepositSummary> {
		const response = await this.axios.get<APIResponse<DepositSummary>>(
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
	): Promise<PaginatedResponse<DepositSummary>> {
		const response = await this.axios.get<PaginatedResponse<DepositSummary>>(
			'/deposits',
			{
				params: { userId, page, limit },
			}
		)
		return response.data
	}

	/**
	 * Get client's prepaid balance with Quirk
	 */
	async getClientBalance(): Promise<LocalClientBalance> {
		const response = await this.axios.get<APIResponse<LocalClientBalance>>(
			'/deposits/client-balance'
		)
		return response.data.data
	}
}
