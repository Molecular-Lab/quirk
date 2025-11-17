/**
 * Client Registration Client
 * Handles B2B client (product owner) registration and onboarding
 */

import type { AxiosInstance } from 'axios'
import type {
	ClientOrganization,
	CreateClientRequest,
	CreateClientResponse,
	UpdateRiskTierRequest,
	ClientDashboardStats,
	APIResponse,
} from '../types/client.types'

export class ClientRegistrationClient {
	constructor(private axios: AxiosInstance) {}

	/**
	 * Register new client organization
	 * Step 1: Submit organization info
	 * Step 2: Create Privy account (redirected)
	 * Step 3: Save to database
	 */
	async register(params: CreateClientRequest): Promise<CreateClientResponse> {
		const response = await this.axios.post<CreateClientResponse>(
			'/clients/register',
			params,
		)
		return response.data
	}

	/**
	 * Complete registration after Privy account creation
	 * Called after redirect back from Privy
	 */
	async completeRegistration(params: {
		tempRegistrationId: string
		privyUserId: string
		privyWalletAddress: string
	}): Promise<APIResponse<ClientOrganization>> {
		const response = await this.axios.post<APIResponse<ClientOrganization>>(
			'/clients/register/complete',
			params,
		)
		return response.data
	}

	/**
	 * Get client organization details
	 */
	async getClient(productId: string): Promise<APIResponse<ClientOrganization>> {
		const response = await this.axios.get<APIResponse<ClientOrganization>>(
			`/clients/${productId}`,
		)
		return response.data
	}

	/**
	 * Get current authenticated client
	 */
	async getCurrentClient(): Promise<APIResponse<ClientOrganization>> {
		const response = await this.axios.get<APIResponse<ClientOrganization>>('/clients/me')
		return response.data
	}

	/**
	 * Update risk tier preferences
	 */
	async updateRiskTier(
		productId: string,
		params: UpdateRiskTierRequest,
	): Promise<APIResponse<ClientOrganization>> {
		const response = await this.axios.put<APIResponse<ClientOrganization>>(
			`/clients/${productId}/risk-tier`,
			params,
		)
		return response.data
	}

	/**
	 * Update webhook configuration
	 */
	async updateWebhook(
		productId: string,
		params: { webhookUrl: string },
	): Promise<APIResponse<ClientOrganization>> {
		const response = await this.axios.put<APIResponse<ClientOrganization>>(
			`/clients/${productId}/webhook`,
			params,
		)
		return response.data
	}

	/**
	 * Get dashboard statistics
	 */
	async getDashboardStats(productId: string): Promise<APIResponse<ClientDashboardStats>> {
		const response = await this.axios.get<APIResponse<ClientDashboardStats>>(
			`/clients/${productId}/dashboard`,
		)
		return response.data
	}

	/**
	 * Regenerate API key
	 */
	async regenerateAPIKey(productId: string): Promise<
		APIResponse<{
			apiKey: string
			apiKeyPrefix: string
		}>
	> {
		const response = await this.axios.post(`/clients/${productId}/api-key/regenerate`)
		return response.data
	}

	/**
	 * Deactivate client account
	 */
	async deactivate(productId: string): Promise<APIResponse<ClientOrganization>> {
		const response = await this.axios.delete<APIResponse<ClientOrganization>>(
			`/clients/${productId}`,
		)
		return response.data
	}
}
