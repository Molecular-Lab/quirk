import { z } from "zod"

/**
 * Yield Strategy Entity
 * Represents a specific DeFi yield farming strategy
 */

export const strategyStatusSchema = z.enum(["active", "inactive", "deprecated"])
export type StrategyStatus = z.infer<typeof strategyStatusSchema>

export const yieldStrategySchema = z.object({
	id: z.string().uuid(),
	name: z.string().min(1).max(255).describe("Strategy name (e.g., 'AAVE USDC Lending')"),
	description: z.string().optional().describe("Detailed strategy description"),
	// Protocol configuration
	protocols: z.array(z.string()).min(1).describe("List of protocols involved (e.g., ['aave', 'curve'])"),
	primaryProtocol: z.string().describe("Main protocol for this strategy"),
	// Financial parameters
	minDeposit: z.string().describe("Minimum deposit amount in USD"),
	maxDeposit: z.string().optional().describe("Maximum deposit amount in USD"),
	expectedAPY: z.string().describe("Expected APY in percentage (e.g., '5.25')"),
	minAPY: z.string().optional().describe("Minimum historical APY"),
	maxAPY: z.string().optional().describe("Maximum historical APY"),
	// Risk parameters
	riskLevel: z.enum(["low", "medium", "high"]).describe("Overall risk level"),
	riskScore: z.number().min(0).max(100).optional().describe("Calculated risk score"),
	// Chain support
	supportedChains: z.array(z.number().int().positive()).describe("Supported chain IDs"),
	supportedTokens: z.array(z.string()).describe("Supported token symbols (e.g., ['USDC', 'USDT'])"),
	// Strategy metadata
	complexity: z.enum(["simple", "intermediate", "advanced"]).default("simple").describe("Strategy complexity level"),
	isActive: z.boolean().default(true).describe("Whether strategy is currently active"),
	status: strategyStatusSchema.default("active"),
	// Performance tracking
	tvl: z.string().optional().describe("Total Value Locked in USD"),
	users: z.number().int().nonnegative().optional().describe("Number of users in this strategy"),
	// Timestamps
	createdAt: z.date().default(() => new Date()),
	updatedAt: z.date().default(() => new Date()),
	// Additional metadata
	metadata: z.record(z.any()).optional().describe("Protocol-specific configuration"),
})

export type YieldStrategy = z.infer<typeof yieldStrategySchema>

/**
 * Create Yield Strategy Input
 */
export const createYieldStrategySchema = z.object({
	name: z.string().min(1).max(255),
	description: z.string().optional(),
	protocols: z.array(z.string()).min(1),
	primaryProtocol: z.string(),
	minDeposit: z.string(),
	maxDeposit: z.string().optional(),
	expectedAPY: z.string(),
	minAPY: z.string().optional(),
	maxAPY: z.string().optional(),
	riskLevel: z.enum(["low", "medium", "high"]),
	riskScore: z.number().min(0).max(100).optional(),
	supportedChains: z.array(z.number().int().positive()),
	supportedTokens: z.array(z.string()),
	complexity: z.enum(["simple", "intermediate", "advanced"]).optional(),
	isActive: z.boolean().optional(),
	metadata: z.record(z.any()).optional(),
})

export type CreateYieldStrategy = z.infer<typeof createYieldStrategySchema>

/**
 * Yield Opportunity (real-time opportunity from market)
 */
export const yieldOpportunitySchema = z.object({
	strategyId: z.string().uuid().optional(),
	protocol: z.string().describe("Protocol name"),
	name: z.string().describe("Opportunity name"),
	currentAPY: z.string().describe("Current APY"),
	tvl: z.string().describe("Total Value Locked"),
	chainId: z.number().int().positive(),
	tokenSymbol: z.string(),
	tokenAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
	riskLevel: z.enum(["low", "medium", "high"]),
	matchesProfile: z.boolean().describe("Whether it matches user's risk profile"),
	estimatedGas: z.string().optional().describe("Estimated gas cost in USD"),
	metadata: z.record(z.any()).optional(),
})

export type YieldOpportunity = z.infer<typeof yieldOpportunitySchema>

/**
 * Strategy Recommendation (AI-generated)
 */
export const strategyRecommendationSchema = z.object({
	opportunity: yieldOpportunitySchema,
	score: z.number().min(0).max(100).describe("Recommendation score (higher is better)"),
	reasoning: z.string().describe("Why this strategy is recommended"),
	expectedReturn: z.string().describe("Expected return in USD over specified period"),
	timeHorizon: z.enum(["1day", "1week", "1month", "3months", "1year"]).describe("Expected time to reach target return"),
	confidence: z.number().min(0).max(1).describe("Confidence level (0-1)"),
})

export type StrategyRecommendation = z.infer<typeof strategyRecommendationSchema>

/**
 * Portfolio Optimization Result
 */
export const portfolioOptimizationSchema = z.object({
	currentAPY: z.string().describe("Current portfolio APY"),
	optimizedAPY: z.string().describe("Expected APY after optimization"),
	improvement: z.string().describe("APY improvement percentage"),
	recommendations: z.array(
		z.object({
			action: z.enum(["deposit", "withdraw", "rebalance", "hold"]),
			protocol: z.string(),
			amount: z.string().describe("Amount to deposit/withdraw in USD"),
			fromProtocol: z.string().optional().describe("Source protocol (for rebalance)"),
			reasoning: z.string(),
		}),
	),
	estimatedGasCost: z.string().describe("Total estimated gas cost in USD"),
	netBenefit: z.string().describe("Net benefit after gas costs"),
})

export type PortfolioOptimization = z.infer<typeof portfolioOptimizationSchema>

/**
 * Predefined Yield Strategies
 * These can be used as templates
 */
export const PREDEFINED_STRATEGIES: CreateYieldStrategy[] = [
	{
		name: "AAVE USDC Stable Lending",
		description: "Lend USDC on AAVE for stable, low-risk yield",
		protocols: ["aave"],
		primaryProtocol: "aave",
		minDeposit: "100",
		expectedAPY: "4.5",
		minAPY: "3.0",
		maxAPY: "8.0",
		riskLevel: "low",
		riskScore: 20,
		supportedChains: [1, 137, 42161, 10, 8453], // Ethereum, Polygon, Arbitrum, Optimism, Base
		supportedTokens: ["USDC", "USDT"],
		complexity: "simple",
		isActive: true,
	},
	{
		name: "Curve 3Pool Stable Farming",
		description: "Provide liquidity to Curve 3Pool (USDC/USDT/DAI) for stable returns",
		protocols: ["curve"],
		primaryProtocol: "curve",
		minDeposit: "500",
		expectedAPY: "6.2",
		minAPY: "4.0",
		maxAPY: "12.0",
		riskLevel: "low",
		riskScore: 25,
		supportedChains: [1, 137, 42161],
		supportedTokens: ["USDC", "USDT", "DAI"],
		complexity: "simple",
		isActive: true,
	},
	{
		name: "Compound USDC Lending",
		description: "Supply USDC to Compound V3 for lending yield",
		protocols: ["compound"],
		primaryProtocol: "compound",
		minDeposit: "200",
		expectedAPY: "5.0",
		minAPY: "3.5",
		maxAPY: "9.0",
		riskLevel: "low",
		riskScore: 22,
		supportedChains: [1, 137, 42161, 8453],
		supportedTokens: ["USDC", "USDT"],
		complexity: "simple",
		isActive: true,
	},
	{
		name: "Uniswap V3 USDC/ETH LP",
		description: "Provide concentrated liquidity on Uniswap V3 for higher yields",
		protocols: ["uniswap"],
		primaryProtocol: "uniswap",
		minDeposit: "1000",
		expectedAPY: "15.0",
		minAPY: "8.0",
		maxAPY: "35.0",
		riskLevel: "medium",
		riskScore: 55,
		supportedChains: [1, 137, 42161, 10, 8453],
		supportedTokens: ["USDC", "ETH"],
		complexity: "intermediate",
		isActive: true,
		metadata: {
			feeTier: 0.3, // 0.3% fee tier
			priceRange: "narrow", // Concentrated liquidity
		},
	},
]
