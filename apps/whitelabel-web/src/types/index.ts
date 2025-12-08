/**
 * Centralized Type Exports
 */

export * from "./ai-insights"
export * from "./client"
export * from "./currency"
export * from "./defi-protocol"
export * from "./end-user"
export * from "./registration"
export * from "./transaction"
export * from "./vault-index"

/**
 * Common API response types
 */
export interface APIResponse<T> {
	success: boolean
	data: T
	error?: string
	timestamp: string
}

export interface PaginatedResponse<T> {
	data: T[]
	total: number
	page: number
	pageSize: number
	hasMore: boolean
}

/**
 * Dashboard metrics
 */
export interface DashboardMetrics {
	totalAUM: number
	currentValue: number
	allTimeReturn: number
	allTimeReturnPercent: number
	activeUsers: number
	currentAPY: number
	todayYield: number
	weekYield: number
	monthYield: number
}

/**
 * Client profile for dashboard
 */
export interface ClientProfile {
	id: string
	companyName: string
	productId: string
	walletAddress: string
	totalAUM: number
	activeUsers: number
	currentAPY: number
	allTimeReturn: number
	riskTier: "low" | "moderate" | "high"
}
