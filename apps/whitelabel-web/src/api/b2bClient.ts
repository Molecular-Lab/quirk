import b2bAxiosClient from "@/config/axios"

import type { AxiosInstance } from "axios"

/**
 * B2B API Client
 * Following prod-ref-web pattern
 */
export class B2BAPIClient {
	private readonly axios: AxiosInstance
	private readonly baseURL: string

	constructor(axiosInstance: AxiosInstance, baseURL: string) {
		this.axios = axiosInstance
		this.baseURL = baseURL
	}

	// Client endpoints
	async registerClient(data: {
		companyName: string
		businessType: string
		walletType: "MANAGED" | "USER_OWNED"
		privyOrganizationId: string
		description?: string
		websiteUrl?: string
	}) {
		const response = await this.axios.post<unknown>(`${this.baseURL}/api/v1/clients`, data)
		return response.data
	}

	async getClientProfile(clientId: string) {
		const response = await this.axios.get<unknown>(`${this.baseURL}/api/v1/clients/${clientId}`)
		return response.data
	}

	async configureStrategies(
		clientId: string,
		data: {
			chain: string
			token_address: string
			strategies: { category: string; target: number }[]
		},
	) {
		const response = await this.axios.post<unknown>(`${this.baseURL}/api/v1/clients/${clientId}/strategies`, data)
		return response.data
	}

	// User endpoints
	async createUser(data: { user_id: string; user_type: string }) {
		const response = await this.axios.post<unknown>(`${this.baseURL}/api/v1/users`, data)
		return response.data
	}

	async getUserBalance(userId: string, params?: { chain?: string; token?: string }) {
		const response = await this.axios.get<unknown>(`${this.baseURL}/api/v1/users/${userId}/balance`, { params })
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
		payment_method: string
	}) {
		const response = await this.axios.post<unknown>(`${this.baseURL}/api/v1/deposits`, data)
		return response.data
	}

	async completeDeposit(data: { vaultId: string; transactionHash: string }) {
		const response = await this.axios.post<unknown>(`${this.baseURL}/webhooks/bitkub`, data)
		return response.data
	}

	// Withdrawal endpoints
	async createWithdrawal(data: { user_id: string; vaultId: string; amount: string; destination_address?: string }) {
		const response = await this.axios.post<unknown>(`${this.baseURL}/api/v1/withdrawals`, data)
		return response.data
	}

	// Vault endpoints
	async updateVaultYield(vaultId: string, data: { yield_earned: string; total_staked: string }) {
		const response = await this.axios.post<unknown>(`${this.baseURL}/api/v1/vaults/${vaultId}/yield`, data)
		return response.data
	}
}

// Export singleton instance
const B2B_API_BASE_URL = (import.meta.env.VITE_B2B_API_URL as string | undefined) ?? "http://localhost:3002"

export const b2bApiClient = new B2BAPIClient(b2bAxiosClient, B2B_API_BASE_URL)

export default b2bApiClient
