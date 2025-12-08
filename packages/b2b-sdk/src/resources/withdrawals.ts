/**
 * Withdrawal Resource - Withdrawal Endpoints
 */

import { HttpClient } from "../utils/http-client"

import type {
	CompleteWithdrawalRequest,
	CreateWithdrawalRequest,
	FailWithdrawalRequest,
	PaginationParams,
	Withdrawal,
	WithdrawalStats,
	WithdrawalStatus,
} from "../types"

export class WithdrawalResource {
	constructor(private http: HttpClient) {}

	/**
	 * 5.1 Request Withdrawal
	 * Request a new withdrawal
	 */
	async create(data: CreateWithdrawalRequest): Promise<Withdrawal> {
		return this.http.post<Withdrawal>("/api/v1/withdrawals", data)
	}

	/**
	 * 5.2 Get Withdrawal by ID
	 * Retrieve withdrawal details
	 */
	async getById(id: string): Promise<Withdrawal> {
		return this.http.get<Withdrawal>(`/api/v1/withdrawals/${id}`)
	}

	/**
	 * 5.3 Complete Withdrawal
	 * Mark withdrawal as completed
	 */
	async complete(id: string, data: CompleteWithdrawalRequest): Promise<Withdrawal> {
		return this.http.post<Withdrawal>(`/api/v1/withdrawals/${id}/complete`, data)
	}

	/**
	 * 5.4 Fail Withdrawal
	 * Mark withdrawal as failed and restore shares
	 */
	async fail(id: string, data: FailWithdrawalRequest): Promise<Withdrawal> {
		return this.http.post<Withdrawal>(`/api/v1/withdrawals/${id}/fail`, data)
	}

	/**
	 * 5.5 List Withdrawals by Client
	 * List withdrawals for a client
	 */
	async listByClient(
		clientId: string,
		params?: PaginationParams & { status?: WithdrawalStatus },
	): Promise<Withdrawal[]> {
		const queryString = params ? this.http.buildQueryString(params) : ""
		return this.http.get<Withdrawal[]>(`/api/v1/withdrawals/client/${clientId}${queryString}`)
	}

	/**
	 * 5.6 List Withdrawals by User
	 * List withdrawals for a user
	 */
	async listByUser(userId: string, params?: PaginationParams): Promise<Withdrawal[]> {
		const queryString = params ? this.http.buildQueryString(params) : ""
		return this.http.get<Withdrawal[]>(`/api/v1/withdrawals/user/${userId}${queryString}`)
	}

	/**
	 * 5.7 Get Withdrawal Stats
	 * Get withdrawal statistics for a client
	 */
	async getStats(clientId: string, params?: { vaultId?: string }): Promise<WithdrawalStats> {
		const queryString = params ? this.http.buildQueryString(params) : ""
		return this.http.get<WithdrawalStats>(`/api/v1/withdrawals/stats/${clientId}${queryString}`)
	}
}
