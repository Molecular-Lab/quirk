import type { RiskProfile } from "../entity/risk-profile.entity"
import type { DeFiPosition } from "../entity/defi-position.entity"
import type { StrategyRecommendation, YieldOpportunity } from "../entity/yield-strategy.entity"

/**
 * AI Agent DataGateway
 * Interface for AI-powered market analysis and strategy execution
 */
export interface IAIAgentDataGateway {
	/**
	 * Analyze current market conditions across all protocols
	 */
	analyzeMarketConditions(params: {
		chainIds?: number[]
		protocols?: string[]
	}): Promise<{
		timestamp: Date
		overall: {
			trend: "bullish" | "neutral" | "bearish"
			volatility: "low" | "medium" | "high"
			confidence: number
		}
		protocols: Array<{
			protocol: string
			tvl: string
			tvlChange24h: string
			avgAPY: string
			apyTrend: "up" | "stable" | "down"
			riskLevel: "low" | "medium" | "high"
		}>
		opportunities: YieldOpportunity[]
	}>

	/**
	 * Generate personalized recommendations based on user profile and market conditions
	 */
	generateRecommendations(params: {
		walletAddress: string
		currentPositions: DeFiPosition[]
		riskProfile: RiskProfile
		availableBalance: string
	}): Promise<{
		recommendations: StrategyRecommendation[]
		reasoning: string
		marketContext: string
		timestamp: Date
	}>

	/**
	 * Execute a strategy automatically
	 * This will generate transaction data for the strategy
	 */
	executeStrategy(params: {
		walletAddress: string
		strategyId: string
		amount: string
		chainId: number
	}): Promise<{
		transactions: Array<{
			to: string
			data: string
			value: string
			description: string
		}>
		estimatedGas: string
		expectedAPY: string
	}>

	/**
	 * Monitor positions and detect issues
	 */
	monitorPositions(params: {
		walletAddress: string
		positions: DeFiPosition[]
	}): Promise<{
		alerts: Array<{
			severity: "critical" | "warning" | "info"
			message: string
			position?: DeFiPosition
			action?: string
		}>
		healthScore: number
		lastChecked: Date
	}>

	/**
	 * Analyze sentiment from on-chain and off-chain data
	 */
	analyzeSentiment(params: {
		protocol: string
		timeRange?: "1h" | "24h" | "7d" | "30d"
	}): Promise<{
		protocol: string
		sentiment: "positive" | "neutral" | "negative"
		score: number
		sources: Array<{
			type: "social" | "onchain" | "news"
			sentiment: string
			weight: number
		}>
		timestamp: Date
	}>

	/**
	 * Predict APY trends using ML models
	 */
	predictAPY(params: {
		protocol: string
		tokenSymbol: string
		chainId: number
		timeHorizon: "1d" | "7d" | "30d"
	}): Promise<{
		currentAPY: string
		predictedAPY: string
		confidence: number
		factors: Array<{
			factor: string
			impact: "positive" | "negative" | "neutral"
			weight: number
		}>
	}>

	/**
	 * Auto-rebalance portfolio based on market conditions
	 */
	autoRebalance(params: {
		walletAddress: string
		currentPositions: DeFiPosition[]
		riskProfile: RiskProfile
		maxGasCost?: string
	}): Promise<{
		shouldRebalance: boolean
		transactions: Array<{
			action: "withdraw" | "deposit"
			protocol: string
			amount: string
			to: string
			data: string
			value: string
		}>
		expectedImprovement: string
		totalGasCost: string
		netBenefit: string
	}>
}
