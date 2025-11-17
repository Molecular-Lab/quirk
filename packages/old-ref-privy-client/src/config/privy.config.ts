import { PrivyClient } from '@privy-io/node'
import { ENV } from './env'

/**
 * Privy Client Singleton
 * Following contract-executor-client/config/viem-client.ts pattern
 */
export class PrivyConfig {
	private static client: PrivyClient | null = null

	/**
	 * Get or create Privy client instance (singleton pattern)
	 */
	static getClient(): PrivyClient {
		if (!this.client) {
			this.client = new PrivyClient({
				appId: ENV.PRIVY_APP_ID,
				appSecret: ENV.PRIVY_APP_SECRET,
			})
		}
		return this.client
	}

	/**
	 * Reset client instance (useful for testing)
	 */
	static reset(): void {
		this.client = null
	}

	/**
	 * Check if client is initialized
	 */
	static isInitialized(): boolean {
		return this.client !== null
	}
}
