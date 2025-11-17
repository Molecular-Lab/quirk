import type {
	YieldStrategy,
	CreateYieldStrategy,
	YieldOpportunity,
	PortfolioOptimization,
	StrategyRecommendation,
} from "../entity/old/yield-strategy.entity"
import type { RiskProfile } from "../entity/old/risk-profile.entity"
import type { DeFiPosition } from "../entity/old/defi-position.entity"

/**
 * Yield Optimizer DataGateway
 * Interface for yield optimization business logic
 */
export interface IYieldOptimizerDataGateway {
	/**
	 * Find best yield opportunities based on user's risk profile and amount
	 */
	findBestYield(params: {
		walletAddress: string
		tokenSymbol: string
		amount: string
		riskProfile: RiskProfile
		chainId?: number
	}): Promise<YieldOpportunity[]>

	/**
	 * Get all active strategies
	 */
	getStrategies(params: {
		riskLevel?: "low" | "medium" | "high"
		protocol?: string
		chainId?: number
		minAPY?: string
	}): Promise<YieldStrategy[]>

	/**
	 * Get strategy by ID
	 */
	getStrategyById(strategyId: string): Promise<YieldStrategy | null>

	/**
	 * Create a new strategy
	 */
	createStrategy(strategy: CreateYieldStrategy): Promise<YieldStrategy>

	/**
	 * Optimize existing portfolio
	 * Analyzes current positions and suggests rebalancing
	 */
	optimizePortfolio(params: {
		walletAddress: string
		currentPositions: DeFiPosition[]
		riskProfile: RiskProfile
	}): Promise<PortfolioOptimization>

	/**
	 * Calculate if rebalancing is needed
	 */
	shouldRebalance(params: {
		currentPositions: DeFiPosition[]
		riskProfile: RiskProfile
	}): Promise<{
		shouldRebalance: boolean
		reason: string
		expectedGain: string
		recommendations: StrategyRecommendation[]
	}>

	/**
	 * Calculate expected APY for a given strategy and amount
	 */
	calculateExpectedAPY(params: {
		strategyId: string
		amount: string
		chainId: number
	}): Promise<{
		expectedAPY: string
		breakdown: {
			baseAPY: string
			rewardsAPY: string
			totalAPY: string
		}
	}>

	/**
	 * Get historical performance of a strategy
	 */
	getStrategyPerformance(params: {
		strategyId: string
		period: "7d" | "30d" | "90d" | "1y"
	}): Promise<{
		avgAPY: string
		minAPY: string
		maxAPY: string
		volatility: string
		dataPoints: Array<{
			timestamp: Date
			apy: string
			tvl: string
		}>
	}>
}
