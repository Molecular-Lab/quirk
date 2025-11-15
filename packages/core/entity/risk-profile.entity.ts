import { z } from "zod"

/**
 * Risk Profile Entity
 * Defines user's risk tolerance and investment preferences
 */

export const riskLevelSchema = z.enum(["conservative", "moderate", "aggressive"])
export type RiskLevel = z.infer<typeof riskLevelSchema>

export const riskProfileSchema = z.object({
	id: z.string().uuid(),
	endUserId: z.string().uuid(),
	walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
	riskLevel: riskLevelSchema.default("moderate"),
	// Risk parameters
	maxSlippage: z
		.number()
		.min(0)
		.max(100)
		.default(0.5)
		.describe("Maximum acceptable slippage in percentage (e.g., 0.5 = 0.5%)"),
	minAPY: z
		.number()
		.min(0)
		.default(3.0)
		.describe("Minimum acceptable APY in percentage (e.g., 5.0 = 5%)"),
	maxAPY: z
		.number()
		.min(0)
		.optional()
		.describe("Maximum target APY (for conservative profiles)"),
	preferredProtocols: z
		.array(z.string())
		.default([])
		.describe("List of preferred DeFi protocols (e.g., ['aave', 'compound'])"),
	excludedProtocols: z
		.array(z.string())
		.default([])
		.describe("List of protocols to avoid"),
	// Auto-rebalancing settings
	autoRebalance: z.boolean().default(true).describe("Enable automatic portfolio rebalancing"),
	rebalanceThreshold: z
		.number()
		.min(0)
		.default(5.0)
		.describe("Minimum APY difference to trigger rebalance (e.g., 5.0 = 5% difference)"),
	rebalanceFrequency: z
		.enum(["hourly", "daily", "weekly", "monthly"])
		.default("daily")
		.describe("How often to check for rebalance opportunities"),
	// Position limits
	maxPositionsPerProtocol: z
		.number()
		.int()
		.positive()
		.default(3)
		.describe("Maximum number of positions per protocol"),
	maxTotalPositions: z
		.number()
		.int()
		.positive()
		.default(10)
		.describe("Maximum total number of active positions"),
	minPositionValue: z
		.string()
		.default("10")
		.describe("Minimum position value in USD (as string to avoid precision loss)"),
	maxPositionValue: z
		.string()
		.optional()
		.describe("Maximum position value in USD per position"),
	// Timestamps
	createdAt: z.date().default(() => new Date()),
	updatedAt: z.date().default(() => new Date()),
})

export type RiskProfile = z.infer<typeof riskProfileSchema>

/**
 * Create Risk Profile Input
 */
export const createRiskProfileSchema = z.object({
	endUserId: z.string().uuid(),
	walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
	riskLevel: riskLevelSchema,
	maxSlippage: z.number().min(0).max(100).optional(),
	minAPY: z.number().min(0).optional(),
	maxAPY: z.number().min(0).optional(),
	preferredProtocols: z.array(z.string()).optional(),
	excludedProtocols: z.array(z.string()).optional(),
	autoRebalance: z.boolean().optional(),
	rebalanceThreshold: z.number().min(0).optional(),
	rebalanceFrequency: z.enum(["hourly", "daily", "weekly", "monthly"]).optional(),
	maxPositionsPerProtocol: z.number().int().positive().optional(),
	maxTotalPositions: z.number().int().positive().optional(),
	minPositionValue: z.string().optional(),
	maxPositionValue: z.string().optional(),
})

export type CreateRiskProfile = z.infer<typeof createRiskProfileSchema>

/**
 * Update Risk Profile
 */
export const updateRiskProfileSchema = z.object({
	riskLevel: riskLevelSchema.optional(),
	maxSlippage: z.number().min(0).max(100).optional(),
	minAPY: z.number().min(0).optional(),
	maxAPY: z.number().min(0).optional(),
	preferredProtocols: z.array(z.string()).optional(),
	excludedProtocols: z.array(z.string()).optional(),
	autoRebalance: z.boolean().optional(),
	rebalanceThreshold: z.number().min(0).optional(),
	rebalanceFrequency: z.enum(["hourly", "daily", "weekly", "monthly"]).optional(),
	maxPositionsPerProtocol: z.number().int().positive().optional(),
	maxTotalPositions: z.number().int().positive().optional(),
	minPositionValue: z.string().optional(),
	maxPositionValue: z.string().optional(),
})

export type UpdateRiskProfile = z.infer<typeof updateRiskProfileSchema>

/**
 * Risk Score Calculation Result
 */
export const riskScoreSchema = z.object({
	score: z.number().min(0).max(100).describe("Overall risk score (0 = lowest risk, 100 = highest risk)"),
	level: riskLevelSchema,
	breakdown: z.object({
		protocolRisk: z.number().min(0).max(100).describe("Risk from protocol selection"),
		concentrationRisk: z.number().min(0).max(100).describe("Risk from portfolio concentration"),
		volatilityRisk: z.number().min(0).max(100).describe("Risk from APY volatility"),
		liquidityRisk: z.number().min(0).max(100).describe("Risk from low liquidity"),
	}),
	recommendations: z.array(z.string()).describe("Actionable recommendations to reduce risk"),
})

export type RiskScore = z.infer<typeof riskScoreSchema>

/**
 * Risk Profile Presets
 */
export const RISK_PROFILE_PRESETS: Record<RiskLevel, Partial<RiskProfile>> = {
	conservative: {
		riskLevel: "conservative",
		maxSlippage: 0.3,
		minAPY: 2.0,
		maxAPY: 8.0,
		preferredProtocols: ["aave", "compound"], // Blue-chip protocols only
		rebalanceThreshold: 3.0, // Rebalance if APY difference > 3%
		maxPositionsPerProtocol: 2,
		maxTotalPositions: 5,
	},
	moderate: {
		riskLevel: "moderate",
		maxSlippage: 0.5,
		minAPY: 4.0,
		maxAPY: 15.0,
		preferredProtocols: ["aave", "compound", "curve"],
		rebalanceThreshold: 5.0, // Rebalance if APY difference > 5%
		maxPositionsPerProtocol: 3,
		maxTotalPositions: 10,
	},
	aggressive: {
		riskLevel: "aggressive",
		maxSlippage: 1.0,
		minAPY: 8.0,
		preferredProtocols: ["aave", "compound", "curve", "uniswap"],
		rebalanceThreshold: 8.0, // Rebalance if APY difference > 8%
		maxPositionsPerProtocol: 5,
		maxTotalPositions: 20,
	},
}
