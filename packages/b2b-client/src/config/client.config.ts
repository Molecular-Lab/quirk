/**
 * Quirk B2B Client Configuration
 * Singleton instance for API client
 */

import axios, { type AxiosInstance } from 'axios'
import { ENV, getBaseURL } from './env'

/**
 * SDK Configuration
 */
export interface QuirkClientConfig {
	apiKey: string
	productId: string
	baseURL: string
	timeout?: number
}

/**
 * Create Quirk client configuration
 */
export function createClientConfig(
	overrides?: Partial<QuirkClientConfig>
): QuirkClientConfig {
	return {
		apiKey: ENV.PROXIFY_API_KEY,
		productId: ENV.PROXIFY_PRODUCT_ID,
		baseURL: getBaseURL(),
		timeout: 30000,
		...overrides,
	}
}

/**
 * Create configured axios instance
 */
export function createAxiosInstance(
	config: QuirkClientConfig
): AxiosInstance {
	const instance = axios.create({
		baseURL: config.baseURL,
		timeout: config.timeout,
		headers: {
			'Content-Type': 'application/json',
			'X-API-Key': config.apiKey,
			'X-Product-ID': config.productId,
		},
	})

	// Request interceptor
	instance.interceptors.request.use(
		(req) => {
			// Log request in development
			if (ENV.PROXIFY_ENVIRONMENT === 'development') {
				console.log(`[Quirk] ${req.method?.toUpperCase()} ${req.url}`)
			}
			return req
		},
		(error) => {
			return Promise.reject(error)
		}
	)

	// Response interceptor
	instance.interceptors.response.use(
		(response) => {
			// Log response in development
			if (ENV.PROXIFY_ENVIRONMENT === 'development') {
				console.log(
					`[Quirk] Response: ${response.status} ${response.statusText}`
				)
			}
			return response
		},
		(error) => {
			// Handle errors
			if (error.response) {
				const status = error.response.status
				const message = error.response.data?.error?.message || error.message

				console.error(`[Quirk] API Error (${status}): ${message}`)
			} else if (error.request) {
				console.error('[Quirk] Network error - no response from server')
			} else {
				console.error('[Quirk] Request error:', error.message)
			}

			return Promise.reject(error)
		}
	)

	return instance
}

/**
 * Singleton axios instance
 */
let axiosInstance: AxiosInstance | null = null

/**
 * Get singleton axios instance
 */
export function getAxiosInstance(): AxiosInstance {
	if (!axiosInstance) {
		const config = createClientConfig()
		axiosInstance = createAxiosInstance(config)
	}
	return axiosInstance
}

/**
 * Reset axios instance (for testing)
 */
export function resetAxiosInstance(): void {
	axiosInstance = null
}
