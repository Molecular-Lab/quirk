import { z } from 'zod'
import type { Protocol, YieldOpportunity } from '../types/common.types'

/**
 * Configuration for the yield aggregator
 */
export const AggregatorConfigSchema = z.object({
	/** Protocols to include in aggregation (default: all) */
	protocols: z.array(z.enum(['aave', 'compound', 'morpho'])).default(['aave', 'compound', 'morpho']),
	/** Protocols to exclude from aggregation */
	excludeProtocols: z.array(z.enum(['aave', 'compound', 'morpho'])).optional(),
	/** Minimum TVL required for a protocol to be included (in USD) */
	minTVL: z.string().optional(),
	/** Cache TTL for aggregated results in milliseconds (default: 2 minutes) */
	cacheTTL: z.number().default(2 * 60 * 1000),
	/** Whether to include unhealthy protocols (default: false) */
	includeUnhealthy: z.boolean().default(false),
})

export type AggregatorConfig = z.infer<typeof AggregatorConfigSchema>

/**
 * Aggregated metrics across all protocols
 */
export const AggregatedMetricsSchema = z.object({
	/** Chain ID for these metrics */
	chainId: z.number(),
	/** Total TVL across all protocols in USD */
	totalTVLUSD: z.string(),
	/** Total available liquidity across all protocols */
	totalAvailableLiquidityUSD: z.string(),
	/** Weighted average supply APY across all protocols */
	weightedAvgSupplyAPY: z.string(),
	/** Best supply APY available */
	bestSupplyAPY: z.string(),
	/** Protocol with best supply APY */
	bestProtocol: z.enum(['aave', 'compound', 'morpho']).optional(),
	/** Number of healthy protocols */
	healthyProtocolCount: z.number(),
	/** Total number of protocols checked */
	totalProtocolCount: z.number(),
	/** Individual protocol metrics */
	protocolMetrics: z.array(ProtocolMetricsSchema),
	/** Timestamp when data was fetched */
	timestamp: z.number(),
})

// Import the schema for use in the aggregated metrics
import { ProtocolMetricsSchema } from '../types/common.types'

export type AggregatedMetrics = z.infer<typeof AggregatedMetricsSchema>

/**
 * Result of fetching opportunities from multiple protocols
 */
export interface AggregatedOpportunities {
	/** All opportunities sorted by APY (highest first) */
	opportunities: YieldOpportunity[]
	/** Best opportunity (highest APY) */
	best: YieldOpportunity | null
	/** Worst opportunity (lowest APY) */
	worst: YieldOpportunity | null
	/** APY spread (best - worst) */
	apySpread: string
	/** Number of protocols that returned data */
	successfulProtocols: number
	/** Number of protocols that failed */
	failedProtocols: number
	/** Error messages from failed protocols */
	errors: { protocol: Protocol; error: string }[]
	/** Timestamp when data was fetched */
	timestamp: number
}

/**
 * User's aggregated positions across all protocols
 */
export interface AggregatedPositions {
	/** All positions across protocols */
	positions: import('../types/common.types').ProtocolPosition[]
	/** Total value across all positions in USD */
	totalValueUSD: string
	/** Weighted average APY based on position values */
	weightedAvgAPY: string
	/** Position with highest APY */
	bestPosition: import('../types/common.types').ProtocolPosition | null
	/** Total yield earned across all positions */
	totalYieldEarned: string
	/** Number of protocols where user has positions */
	protocolCount: number
	/** Timestamp when data was fetched */
	timestamp: number
}

/**
 * Filter options for fetching opportunities
 */
export interface OpportunityFilter {
	/** Minimum APY to include (e.g., "3.0" for 3%) */
	minAPY?: string
	/** Maximum APY to include */
	maxAPY?: string
	/** Minimum TVL in USD */
	minTVL?: string
	/** Only include specific protocols */
	protocols?: Protocol[]
	/** Exclude specific protocols */
	excludeProtocols?: Protocol[]
	/** Sort direction */
	sortDirection?: 'asc' | 'desc'
	/** Sort by field */
	sortBy?: 'apy' | 'tvl' | 'liquidity'
	/** Maximum number of results */
	limit?: number
}
