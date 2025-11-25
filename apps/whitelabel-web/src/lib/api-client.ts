import axios, { type AxiosInstance, type AxiosError } from 'axios'

/**
 * API Client Configuration
 * Follows Proxify pattern for centralized API management
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1'

/**
 * Axios instance with interceptors
 */
export const apiClient: AxiosInstance = axios.create({
	baseURL: API_BASE_URL,
	timeout: 30000,
	headers: {
		'Content-Type': 'application/json',
	},
})

/**
 * Request interceptor - Add auth token
 */
apiClient.interceptors.request.use(
	(config) => {
		// Add Privy auth token if available
		const token = localStorage.getItem('privy:token')
		if (token) {
			config.headers.Authorization = `Bearer ${token}`
		}
		return config
	},
	(error) => {
		return Promise.reject(error)
	}
)

/**
 * Response interceptor - Handle errors
 */
apiClient.interceptors.response.use(
	(response) => response,
	(error: AxiosError) => {
		if (error.response) {
			// Server responded with error
			const status = error.response.status

			switch (status) {
				case 401:
					// Unauthorized - clear auth and redirect to login
					localStorage.removeItem('privy:token')
					window.location.href = '/login'
					break
				case 403:
					console.error('Forbidden - insufficient permissions')
					break
				case 404:
					console.error('Resource not found')
					break
				case 500:
					console.error('Server error - please try again later')
					break
				default:
					console.error(`API Error: ${status}`)
			}
		} else if (error.request) {
			// Request made but no response
			console.error('Network error - please check your connection')
		} else {
			// Something else happened
			console.error('Request error:', error.message)
		}

		return Promise.reject(error)
	}
)

/**
 * API Endpoints
 */
export const endpoints = {
	// Client endpoints
	client: {
		profile: '/client/profile',
		update: '/client/update',
	},

	// End-users endpoints
	endUsers: {
		list: '/end-users',
		get: (userId: string) => `/end-users/${userId}`,
		value: (userId: string) => `/end-users/${userId}/value`,
	},

	// Vault index endpoints
	vaultIndex: {
		current: '/vault/index',
		history: '/vault/index/history',
		metrics: '/vault/index/metrics',
	},

	// DeFi protocols endpoints
	defiProtocols: {
		list: '/defi/protocols',
		status: '/defi/protocols/status',
		allocations: '/defi/allocations',
		updateAllocation: '/defi/allocations/update',
	},

	// Transactions endpoints
	transactions: {
		list: '/transactions',
		summary: '/transactions/summary',
		get: (txId: string) => `/transactions/${txId}`,
	},

	// AI insights endpoints
	aiInsights: {
		list: '/ai/insights',
		summary: '/ai/insights/summary',
		markActedUpon: (insightId: string) => `/ai/insights/${insightId}/act`,
	},

	// Dashboard metrics
	dashboard: {
		metrics: '/dashboard/metrics',
	},

	// Deposit endpoints (B2B On-Ramp)
	deposits: {
		create: '/deposits',
		getById: (orderId: string) => `/deposits/${orderId}`,
		list: '/deposits',
		clientBalance: '/deposits/client-balance',
	},
}

export default apiClient
