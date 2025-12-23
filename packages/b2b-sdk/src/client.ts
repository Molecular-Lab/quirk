/**
 * Quirk SDK - Main Client
 * Official TypeScript SDK for Quirk B2B API - Earn-as-a-Service Platform
 */

import { ClientResource } from "./resources/clients"
import { DashboardResource } from "./resources/dashboard"
import { DeFiResource } from "./resources/defi"
import { DepositResource } from "./resources/deposits"
import { UserResource } from "./resources/users"
import { VaultResource } from "./resources/vaults"
import { WithdrawalResource } from "./resources/withdrawals"
import { HttpClient } from "./utils/http-client"

import type { SDKConfig } from "./types"

/**
 * Default API base URLs
 */
const DEFAULT_BASE_URLS = {
	production: "https://api.quirk.io", // Update with actual production URL
	sandbox: "https://api-sandbox.quirk.io", // Update with actual sandbox URL
}

/**
 * Quirk SDK Client
 *
 * @example
 * ```typescript
 * import { QuirkSDK } from '@quirk/b2b-sdk'
 *
 * const sdk = new QuirkSDK({
 *   apiKey: 'your-api-key',
 *   environment: 'production'
 * })
 *
 * // Create a new user
 * const user = await sdk.users.createOrGet({
 *   clientId: 'client_123',
 *   clientUserId: 'user_456',
 *   email: 'user@example.com'
 * })
 *
 * // Create a fiat deposit
 * const deposit = await sdk.deposits.createFiat({
 *   userId: user.id,
 *   amount: '1000.00',
 *   currency: 'USD'
 * })
 * ```
 */
export class QuirkSDK {
	private httpClient: HttpClient

	// Resource instances
	public readonly clients: ClientResource
	public readonly vaults: VaultResource
	public readonly users: UserResource
	public readonly deposits: DepositResource
	public readonly withdrawals: WithdrawalResource
	public readonly defi: DeFiResource
	public readonly dashboard: DashboardResource

	/**
	 * Initialize Quirk SDK
	 *
	 * @param config - SDK configuration
	 */
	constructor(config: SDKConfig) {
		// Validate API key
		if (!config.apiKey) {
			throw new Error("API key is required")
		}

		// Determine base URL
		const baseURL =
			config.baseURL || (config.environment === "sandbox" ? DEFAULT_BASE_URLS.sandbox : DEFAULT_BASE_URLS.production)

		// Initialize HTTP client
		this.httpClient = new HttpClient({
			baseURL,
			apiKey: config.apiKey,
			timeout: config.timeout,
			maxRetries: config.maxRetries,
		})

		// Initialize resource instances
		this.clients = new ClientResource(this.httpClient)
		this.vaults = new VaultResource(this.httpClient)
		this.users = new UserResource(this.httpClient)
		this.deposits = new DepositResource(this.httpClient)
		this.withdrawals = new WithdrawalResource(this.httpClient)
		this.defi = new DeFiResource(this.httpClient)
		this.dashboard = new DashboardResource(this.httpClient)
	}

	/**
	 * Get SDK version
	 */
	static get version(): string {
		return "1.0.0"
	}

	/**
	 * Check if SDK is configured for sandbox mode
	 */
	get isSandbox(): boolean {
		return this.httpClient.baseURL?.includes("sandbox") || false
	}
}
