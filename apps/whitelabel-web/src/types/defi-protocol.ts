/**
 * DeFi Protocol Allocation Types
 * Based on PRODUCT_OWNER_FLOW.md - defi_allocations table schema
 */

export type ProtocolName = "aave" | "compound" | "curve" | "uniswap"

export interface DefiAllocation {
	id: string
	clientId: string
	protocol: ProtocolName
	allocationPercent: string // e.g., "70.00" = 70%
	amountDeployed: string // Current USDC deployed
	currentValue: string // Current value with yield
	createdAt: string
}

export interface ProtocolStatus {
	protocol: ProtocolName
	isHealthy: boolean
	currentAPY: string
	tvl: string // Total Value Locked
	lastUpdate: string
}

/**
 * DeFi protocol status with metrics (alias)
 */
export interface DefiProtocolStatus {
	protocol: ProtocolName
	name: string
	riskLevel: "low" | "moderate" | "high"
	allocationPercent: number
	amountDeployed: number
	currentValue: number
	currentAPY: number
	profit: number
	profitPercent: number
	isActive: boolean
	lastUpdated: string
}

/**
 * Risk tier configuration
 */
export interface RiskTierConfig {
	riskTier: "low" | "moderate" | "high"
	allocations: {
		protocol: ProtocolName
		percent: number
	}[]
	expectedAPY: number
	description: string
}

export interface UpdateAllocationRequest {
	protocol: ProtocolName
	allocationPercent: string
}
