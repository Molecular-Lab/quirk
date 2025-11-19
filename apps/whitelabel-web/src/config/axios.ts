import axios from "axios"

/**
 * Axios client for B2B API
 * Following prod-ref-web pattern
 */
export const b2bAxiosClient = axios.create({
	timeout: 30000,
	headers: {
		"Content-Type": "application/json",
	},
})

/**
 * Request interceptor - Add auth token
 */
b2bAxiosClient.interceptors.request.use(
	(config) => {
		// Add API key from localStorage if available
		const apiKey = localStorage.getItem("b2b:api_key")
		if (apiKey) {
			config.headers.Authorization = `Bearer ${apiKey}`
		}
		return config
	},
	(error: Error) => {
		return Promise.reject(error)
	},
)

/**
 * Response interceptor - Handle errors
 */
b2bAxiosClient.interceptors.response.use(
	(response) => response,
	(error: unknown) => {
		if (axios.isAxiosError(error)) {
			if (error.response) {
				const status = error.response.status

				switch (status) {
					case 401:
						// Unauthorized - clear auth
						localStorage.removeItem("b2b:api_key")
						break
					case 403:
						// eslint-disable-next-line no-console
						console.error("[B2B API] Forbidden - insufficient permissions")
						break
					case 404:
						// eslint-disable-next-line no-console
						console.error("[B2B API] Resource not found")
						break
					case 500:
						// eslint-disable-next-line no-console
						console.error("[B2B API] Server error")
						break
					default:
						// eslint-disable-next-line no-console
						console.error(`[B2B API] Error: ${status}`)
				}
			} else if (error.request) {
				// eslint-disable-next-line no-console
				console.error("[B2B API] Network error - please check your connection")
			} else {
				// eslint-disable-next-line no-console
				console.error("[B2B API] Request error:", error.message)
			}
		}

		return Promise.reject(error instanceof Error ? error : new Error(String(error)))
	},
)

export default b2bAxiosClient
