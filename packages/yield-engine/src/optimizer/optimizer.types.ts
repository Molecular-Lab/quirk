import { z } from 'zod'
import type {
	Protocol,
	YieldOpportunity,
	ProtocolPosition,
	OptimizationResult,
	RiskProfile,
	RebalanceConfig,
} from '../types/common.types'

/**
 * Strategy names for yield optimization
 */
export type OptimizationStrategy = 'highest-yield' | 'risk-adjusted' | 'gas-aware'

/**
 * Configuration for the optimizer
 */
export const OptimizerConfigSchema = z.object({
	/** Default strategy to use */
	defaultStrategy: z
		.enum(['highest-yield', 'risk-adjusted', 'gas-aware'])
		.default('highest-yield'),
	/** Default risk profile */
	defaultRiskProfile: z
		.object({
			level: z.enum(['conservative', 'moderate', 'aggressive']).default('moderate'),
			maxSlippage: z.number().default(0.5),
			minProtocolTVL: z.string().default('100000000'),
		})
		.optional(),
	/** Default rebalance configuration */
	defaultRebalanceConfig: z
		.object({
			minApyDelta: z.number().default(1.0),
			minGainThreshold: z.string().default('10'),
			maxGasCostUSD: z.string().default('50'),
			cooldownHours: z.number().default(24),
			enabled: z.boolean().default(true),
		})
		.optional(),
	/** Cache TTL in milliseconds */
	cacheTTL: z.number().default(2 * 60 * 1000),
})

export type OptimizerConfig = z.infer<typeof OptimizerConfigSchema>

/**
 * Partial risk profile for simpler API usage (defaults will be applied)
 */
export type PartialRiskProfile = Partial<RiskProfile> & { level: RiskProfile['level'] }

/**
 * Partial rebalance config for simpler API usage (defaults will be applied)
 */
export type PartialRebalanceConfig = Partial<RebalanceConfig>

/**
 * Input for optimization analysis
 */
export interface OptimizationInput {
	/** Current position (if any) */
	currentPosition: ProtocolPosition | null
	/** Available yield opportunities */
	opportunities: YieldOpportunity[]
	/** User's risk profile */
	riskProfile: PartialRiskProfile
	/** Rebalance configuration */
	rebalanceConfig: PartialRebalanceConfig
	/** Current gas price in gwei (optional) */
	gasPriceGwei?: number
	/** ETH price in USD (optional) */
	ethPriceUSD?: number
}

/**
 * Extended optimization result with additional analysis
 */
export interface ExtendedOptimizationResult extends OptimizationResult {
	/** Strategy used for this optimization */
	strategy: OptimizationStrategy
	/** All opportunities considered (sorted by preference) */
	rankedOpportunities: YieldOpportunity[]
	/** Risk score of recommended protocol (0-100) */
	riskScore?: number
	/** Days until gas cost is recovered via higher APY */
	breakEvenDays?: number
	/** Confidence level in recommendation (0-100) */
	confidence: number
	/** Warnings or notes about the recommendation */
	warnings: string[]
}

/**
 * Gas estimation for a rebalance operation
 */
export interface GasEstimate {
	/** Estimated gas units */
	gasUnits: number
	/** Gas price in gwei */
	gasPriceGwei: number
	/** Total gas cost in ETH */
	gasCostETH: string
	/** Total gas cost in USD */
	gasCostUSD: string
	/** Estimated time in minutes */
	estimatedTimeMinutes?: number
}

/**
 * Strategy interface that all optimization strategies must implement
 */
export interface IOptimizationStrategy {
	/** Strategy name */
	readonly name: OptimizationStrategy

	/**
	 * Rank opportunities based on strategy logic
	 *
	 * @param opportunities - Available opportunities
	 * @param riskProfile - User's risk preferences (partial, defaults will be applied)
	 * @returns Ranked opportunities (best first)
	 */
	rankOpportunities(
		opportunities: YieldOpportunity[],
		riskProfile: PartialRiskProfile,
	): YieldOpportunity[]

	/**
	 * Determine if a rebalance should be recommended
	 *
	 * @param input - Optimization input data
	 * @returns Whether to recommend rebalancing
	 */
	shouldRebalance(input: OptimizationInput): boolean

	/**
	 * Calculate confidence score for recommendation
	 *
	 * @param input - Optimization input data
	 * @param recommendedOpportunity - The recommended opportunity
	 * @returns Confidence score (0-100)
	 */
	calculateConfidence(input: OptimizationInput, recommendedOpportunity: YieldOpportunity): number
}

/**
 * Risk assessment for a protocol
 */
export interface ProtocolRiskAssessment {
	protocol: Protocol
	/** Overall risk score (0-100, lower is safer) */
	riskScore: number
	/** TVL-based trust score */
	tvlScore: number
	/** Protocol health status */
	isHealthy: boolean
	/** Risk factors identified */
	factors: string[]
}

/**
 * Comparison between current position and recommended opportunity
 */
export interface PositionComparison {
	/** Current APY */
	currentAPY: string
	/** Recommended APY */
	recommendedAPY: string
	/** APY improvement (positive = higher recommended) */
	apyDelta: string
	/** Percentage improvement */
	apyImprovementPercent: string
	/** Current protocol */
	currentProtocol: Protocol
	/** Recommended protocol */
	recommendedProtocol: Protocol
	/** Estimated annual gain in USD */
	estimatedAnnualGainUSD: string
	/** Estimated monthly gain in USD */
	estimatedMonthlyGainUSD: string
}

/**
 * History entry for tracking optimization decisions
 */
export interface OptimizationHistoryEntry {
	/** Unique ID */
	id: string
	/** When the optimization was recommended */
	timestamp: number
	/** Token being optimized */
	token: string
	/** Chain ID */
	chainId: number
	/** Result of the optimization */
	result: ExtendedOptimizationResult
	/** Whether the user executed the recommendation */
	executed?: boolean
	/** Actual outcome if tracked */
	actualOutcome?: {
		actualGainUSD: string
		actualGasCostUSD: string
		netGainUSD: string
	}
}
