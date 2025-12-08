/**
 * Client Resource - Client Management Endpoints
 */

import { HttpClient } from "../utils/http-client"

import type {
	BalanceOperationRequest,
	BankAccount,
	Client,
	ClientBalance,
	ConfigureBankAccountsRequest,
	ConfigureStrategiesRequest,
	CreateClientRequest,
	UpdateCurrenciesRequest,
	UpdateOrganizationRequest,
} from "../types"

export class ClientResource {
	constructor(private http: HttpClient) {}

	/**
	 * 1.1 Create Client
	 * Register a new B2B client organization
	 */
	async create(data: CreateClientRequest): Promise<Client> {
		return this.http.post<Client>("/api/v1/clients", data)
	}

	/**
	 * 1.2 Get Client by ID
	 * Retrieve client information by internal ID
	 */
	async getById(id: string): Promise<Client> {
		return this.http.get<Client>(`/api/v1/clients/${id}`)
	}

	/**
	 * 1.3 Get Client by Product ID
	 * Retrieve client by product ID (primary lookup)
	 */
	async getByProductId(productId: string): Promise<Client> {
		return this.http.get<Client>(`/api/v1/clients/product/${productId}`)
	}

	/**
	 * 1.4 List Clients by Privy Organization ID
	 * List all clients for a Privy user
	 */
	async listByPrivyOrganization(privyOrganizationId: string): Promise<Client[]> {
		return this.http.get<Client[]>(`/api/v1/clients/privy/${privyOrganizationId}`)
	}

	/**
	 * 1.5 Regenerate API Key
	 * Generate new API key for existing client (invalidates old key)
	 */
	async regenerateApiKey(productId: string): Promise<{
		success: boolean
		api_key: string
		productId: string
		message: string
	}> {
		return this.http.post(`/api/v1/clients/product/${productId}/regenerate-api-key`, {})
	}

	/**
	 * 1.6 Get Client Balance
	 * Retrieve client account balance
	 */
	async getBalance(clientId: string): Promise<ClientBalance> {
		return this.http.get<ClientBalance>(`/api/v1/clients/${clientId}/balance`)
	}

	/**
	 * 1.7 Add Funds to Client
	 * Add funds to client balance
	 */
	async addFunds(clientId: string, data: BalanceOperationRequest): Promise<{ success: boolean; message: string }> {
		return this.http.post(`/api/v1/clients/${clientId}/balance/add`, data)
	}

	/**
	 * 1.8 Reserve Funds
	 * Reserve funds from available balance
	 */
	async reserveFunds(clientId: string, data: BalanceOperationRequest): Promise<{ success: boolean; message: string }> {
		return this.http.post(`/api/v1/clients/${clientId}/balance/reserve`, data)
	}

	/**
	 * 1.9 Release Reserved Funds
	 * Release reserved funds back to available
	 */
	async releaseFunds(clientId: string, data: BalanceOperationRequest): Promise<{ success: boolean; message: string }> {
		return this.http.post(`/api/v1/clients/${clientId}/balance/release`, data)
	}

	/**
	 * 1.10 Deduct Reserved Funds
	 * Deduct from reserved balance
	 */
	async deductFunds(clientId: string, data: BalanceOperationRequest): Promise<{ success: boolean; message: string }> {
		return this.http.post(`/api/v1/clients/${clientId}/balance/deduct`, data)
	}

	/**
	 * 1.11 Configure Vault Strategies (FLOW 2)
	 * Configure DeFi strategy allocation for client vault
	 */
	async configureStrategies(
		productId: string,
		data: ConfigureStrategiesRequest,
	): Promise<{ success: boolean; message: string }> {
		return this.http.post(`/api/v1/products/${productId}/strategies`, data)
	}

	/**
	 * 1.12 Update Organization Info
	 * Update organization information only
	 */
	async updateOrganization(
		productId: string,
		data: UpdateOrganizationRequest,
	): Promise<{
		success: boolean
		productId: string
		companyName?: string
		businessType?: string
		description?: string
		websiteUrl?: string
		message: string
	}> {
		return this.http.patch(`/api/v1/clients/product/${productId}/organization`, data)
	}

	/**
	 * 1.13 Update Supported Currencies
	 * Update list of supported currencies
	 */
	async updateCurrencies(
		productId: string,
		data: UpdateCurrenciesRequest,
	): Promise<{
		success: boolean
		productId: string
		supportedCurrencies: string[]
		message: string
	}> {
		return this.http.patch(`/api/v1/clients/product/${productId}/currencies`, data)
	}

	/**
	 * 1.14 Configure Bank Accounts
	 * Configure bank accounts for fiat withdrawals (off-ramp)
	 */
	async configureBankAccounts(
		productId: string,
		data: ConfigureBankAccountsRequest,
	): Promise<{
		success: boolean
		productId: string
		bankAccounts: BankAccount[]
		supportedCurrencies: string[]
		message: string
	}> {
		return this.http.post(`/api/v1/clients/product/${productId}/bank-accounts`, data)
	}

	/**
	 * 1.15 Get Bank Accounts
	 * Retrieve configured bank accounts
	 */
	async getBankAccounts(productId: string): Promise<{
		productId: string
		bankAccounts: BankAccount[]
		supportedCurrencies: string[]
	}> {
		return this.http.get(`/api/v1/clients/product/${productId}/bank-accounts`)
	}
}
