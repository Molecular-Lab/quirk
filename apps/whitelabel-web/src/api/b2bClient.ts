import { b2bContract } from "@quirk/b2b-api-core"
import { type AppRouter, type ClientArgs, type InitClientReturn, initClient } from "@ts-rest/core"
import { type AxiosInstance, type Method, isAxiosError } from "axios"

import b2bAxiosClient from "@/config/axios"
import { ENV } from "@/config/env"

/**
 * Helper function to get Privy organization ID from localStorage
 * Used for dashboard API authentication (not SDK)
 */
const getPrivyOrgId = (): string | null => {
	try {
		const userStore = localStorage.getItem("proxify-user-credentials")
		if (userStore) {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			const parsed = JSON.parse(userStore)
			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
			return parsed.state.privyOrganizationId as string
		}
	} catch (_e) {
		console.error("[b2bClient] Failed to get Privy org ID from store")
	}
	return null
}

// Type-safe B2B API client
export type B2BAPIClient<T extends AppRouter> = InitClientReturn<T, ClientArgs>

/**
 * Initialize type-safe B2B API client using ts-rest
 * Following prod-ref-web pattern
 */
export function initB2BAPIClient<T extends AppRouter>(
	axiosInstance: AxiosInstance,
	contract: T,
	baseUrl: string,
): B2BAPIClient<T> {
	// Auto-inject x-privy-org-id header for dashboard requests
	axiosInstance.interceptors.request.use((config) => {
		const privyOrgId = getPrivyOrgId()
		if (privyOrgId) {
			config.headers["x-privy-org-id"] = privyOrgId
			// eslint-disable-next-line no-console
			console.log("[b2bApiClient] Auto-injected x-privy-org-id header:", privyOrgId.substring(0, 20) + "...")
		}
		return config
	})

	const client = initClient(contract, {
		baseUrl: baseUrl,
		baseHeaders: {},
		jsonQuery: true,
		api: async (args) => {
			try {
				const result = await axiosInstance.request({
					method: args.method as Method,
					url: args.path,
					headers: args.headers,
					data: args.body,
				})
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				return { status: result.status, body: result.data, headers: result.headers as any }
			} catch (error) {
				if (isAxiosError(error) && error.response) {
					return {
						status: error.response.status,
						body: error.response.data,
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						headers: error.response.headers as any,
					}
				}
				throw error
			}
		},
	})

	return client
}

// Export singleton instance with full type safety
export const b2bApiClient = initB2BAPIClient(b2bAxiosClient, b2bContract, ENV.API_URL)

export default b2bApiClient
