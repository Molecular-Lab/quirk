import { z } from 'zod'

/**
 * Supported DeFi protocols
 */
export type Protocol = 'aave' | 'compound' | 'morpho'

/**
 * Supported blockchain networks
 */
export type ChainId = 1 | 137 | 8453 | 42161 // Ethereum, Polygon, Base, Arbitrum

/**
 * Yield opportunity from a single protocol
 */
export const YieldOpportunitySchema = z.object({
	protocol: z.enum(['aave', 'compound', 'morpho']),
	token: z.string(), // Token symbol (e.g., "USDC")
	tokenAddress: z.string(), // Contract address
	chainId: z.number(),
	supplyAPY: z.string(), // "5.25" = 5.25% annual yield
	borrowAPY: z.string().optional(), // For lending protocols
	tvl: z.string(), // Total value locked in USD
	liquidity: z.string(), // Available liquidity in USD
	utilization: z.string().optional(), // "75.5" = 75.5% utilization
	timestamp: z.number(), // Unix timestamp when data was fetched
	metadata: z.record(z.any()).optional(), // Protocol-specific data
})

export type YieldOpportunity = z.infer<typeof YieldOpportunitySchema>

/**
 * User's position in a protocol
 */
export const ProtocolPositionSchema = z.object({
	protocol: z.enum(['aave', 'compound', 'morpho']),
	token: z.string(),
	tokenAddress: z.string(),
	chainId: z.number(),
	amount: z.string(), // Amount in wei/smallest unit (as string to avoid precision loss)
	amountFormatted: z.string(), // Human-readable amount (e.g., "1000.50")
	valueUSD: z.string(), // USD value
	apy: z.string(), // Current APY for this position
	earnedYield: z.string().optional(), // Total yield earned so far
	depositedAt: z.number().optional(), // Unix timestamp of deposit
})

export type ProtocolPosition = z.infer<typeof ProtocolPositionSchema>

/**
 * Protocol metrics and health data
 */
export const ProtocolMetricsSchema = z.object({
	protocol: z.enum(['aave', 'compound', 'morpho']),
	chainId: z.number(),
	tvlUSD: z.string(), // Total value locked across all markets
	totalBorrowsUSD: z.string().optional(),
	availableLiquidityUSD: z.string(),
	avgSupplyAPY: z.string(), // Average supply APY across all markets
	isHealthy: z.boolean(), // Overall protocol health status
	lastUpdated: z.number(),
})

export type ProtocolMetrics = z.infer<typeof ProtocolMetricsSchema>

/**
 * Token information
 */
export const TokenInfoSchema = z.object({
	symbol: z.string(), // "USDC"
	name: z.string(), // "USD Coin"
	address: z.string(), // Contract address
	decimals: z.number(), // Usually 6 for USDC, 18 for most tokens
	chainId: z.number(),
	isStablecoin: z.boolean().default(false),
	priceUSD: z.string().optional(), // Current price in USD
})

export type TokenInfo = z.infer<typeof TokenInfoSchema>

/**
 * Optimization recommendation
 */
export const OptimizationResultSchema = z.object({
	action: z.enum(['hold', 'rebalance']),
	currentProtocol: z.string().optional(),
	currentAPY: z.string().optional(),
	recommendedProtocol: z.string().optional(),
	recommendedAPY: z.string().optional(),
	apyDelta: z.string().optional(), // "1.6" = 1.6% improvement
	estimatedMonthlyGain: z.string().optional(), // USD value of expected gain
	estimatedAnnualGain: z.string().optional(),
	estimatedGasCost: z.string().optional(), // Estimated gas cost in USD
	netGainAfterGas: z.string().optional(),
	reason: z.string().optional(), // Human-readable explanation
	timestamp: z.number(),
})

export type OptimizationResult = z.infer<typeof OptimizationResultSchema>

/**
 * Rebalance configuration
 */
export const RebalanceConfigSchema = z.object({
	minApyDelta: z.number().default(1.0), // Minimum APY improvement required (in percentage points)
	minGainThreshold: z.string().default('10'), // Minimum expected gain in USD to justify rebalance
	maxGasCostUSD: z.string().default('50'), // Max willing to pay in gas
	cooldownHours: z.number().default(24), // Minimum hours between rebalances
	enabled: z.boolean().default(true),
})

export type RebalanceConfig = z.infer<typeof RebalanceConfigSchema>

/**
 * Risk profile for yield optimization
 */
export const RiskProfileSchema = z.object({
	level: z.enum(['conservative', 'moderate', 'aggressive']),
	maxSlippage: z.number().default(0.5), // 0.5%
	preferredProtocols: z.array(z.enum(['aave', 'compound', 'morpho'])).optional(),
	excludedProtocols: z.array(z.enum(['aave', 'compound', 'morpho'])).optional(),
	minProtocolTVL: z.string().default('100000000'), // $100M minimum TVL
	rebalanceConfig: RebalanceConfigSchema.optional(),
})

export type RiskProfile = z.infer<typeof RiskProfileSchema>

/**
 * Cache entry structure
 */
export interface CacheEntry<T> {
	data: T
	timestamp: number
	expiresAt: number
}

/**
 * Interface that all protocol adapters must implement
 */
export interface IProtocolAdapter {
	/**
	 * Get the protocol name
	 */
	getProtocolName(): Protocol

	/**
	 * Get current supply APY for a token
	 */
	getSupplyAPY(token: string, chainId: number): Promise<string>

	/**
	 * Get user's position in this protocol
	 */
	getUserPosition(
		walletAddress: string,
		token: string,
		chainId: number,
	): Promise<ProtocolPosition | null>

	/**
	 * Get detailed metrics for a specific token market
	 */
	getMetrics(token: string, chainId: number): Promise<YieldOpportunity>

	/**
	 * Get overall protocol health and metrics
	 */
	getProtocolMetrics(chainId: number): Promise<ProtocolMetrics>

	/**
	 * Check if protocol supports a given token on a chain
	 */
	supportsToken(token: string, chainId: number): Promise<boolean>
}

/**
 * Error types
 */
export class ProtocolError extends Error {
	constructor(
		public protocol: Protocol,
		message: string,
		public originalError?: unknown,
	) {
		super(`[${protocol}] ${message}`)
		this.name = 'ProtocolError'
	}
}

export class RpcError extends Error {
	constructor(
		message: string,
		public chainId: number,
		public originalError?: unknown,
	) {
		super(`[Chain ${chainId}] ${message}`)
		this.name = 'RpcError'
	}
}

export class CacheError extends Error {
	constructor(
		message: string,
		public key: string,
	) {
		super(`[Cache: ${key}] ${message}`)
		this.name = 'CacheError'
	}
}
