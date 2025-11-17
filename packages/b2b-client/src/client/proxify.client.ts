/**
 * Proxify B2B API Client
 * Main client class that aggregates all API clients
 */

import type { AxiosInstance } from 'axios'
import { getAxiosInstance } from '../config'
import { DepositClient } from './deposit.client'
import { ClientRegistrationClient } from './registration.client'
import { AnalyticsClient } from './analytics.client'

/**
 * Main Proxify B2B Client
 * Aggregates all B2B API functionality
 *
 * @example
 * ```typescript
 * const client = new ProxifyB2BClient()
 *
 * // Register new client
 * await client.registration.register({ ... })
 *
 * // Create deposit
 * await client.deposits.create({ ... })
 *
 * // Get analytics
 * await client.analytics.getDashboardStats('product-id')
 * ```
 */
export class ProxifyB2BClient {
	private axiosInstance: AxiosInstance

	// API Clients
	public registration: ClientRegistrationClient
	public deposits: DepositClient
	public analytics: AnalyticsClient

	constructor(axiosInstance?: AxiosInstance) {
		this.axiosInstance = axiosInstance || getAxiosInstance()

		// Initialize all clients
		this.registration = new ClientRegistrationClient(this.axiosInstance)
		this.deposits = new DepositClient(this.axiosInstance)
		this.analytics = new AnalyticsClient(this.axiosInstance)
	}

	/**
	 * Get the underlying axios instance
	 */
	getAxios(): AxiosInstance {
		return this.axiosInstance
	}
}
