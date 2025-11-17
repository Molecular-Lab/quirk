/**
 * AI Agent Insights Types
 * Based on PRODUCT_OWNER_FLOW.md - AI agent for market insights
 */

export type InsightSeverity = 'info' | 'warning' | 'critical'
export type InsightCategory = 'market' | 'risk' | 'opportunity' | 'rebalance'

export interface AIInsight {
	id: string
	category: InsightCategory
	severity: InsightSeverity
	title: string
	description: string
	recommendation: string
	confidence: number // 0-100
	createdAt: string
}

export interface MarketConditions {
	aaveAPY: string
	curveAPY: string
	compoundAPY: string
	uniswapAPY: string
	volatility: 'low' | 'medium' | 'high'
	sentiment: 'bearish' | 'neutral' | 'bullish'
	updatedAt: string
}

export interface RebalanceRecommendation {
	currentAllocation: Record<string, number>
	recommendedAllocation: Record<string, number>
	expectedAPYImprovement: string
	riskChange: 'lower' | 'same' | 'higher'
	reason: string
}

/**
 * AI insights summary
 */
export interface AIInsightsSummary {
	totalInsights: number
	criticalCount: number
	highPriorityCount: number
	actionableCount: number
	actedUponCount: number
	latestInsights: AIInsight[]
}
