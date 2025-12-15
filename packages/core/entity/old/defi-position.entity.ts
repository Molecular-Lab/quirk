import { z } from "zod"

/**
 * DeFi Position Entity
 * Represents a user's active position in a DeFi protocol
 */

export const deFiProtocolSchema = z.enum(["aave", "curve", "compound", "uniswap"])
export type DeFiProtocol = z.infer<typeof deFiProtocolSchema>

export const positionStatusSchema = z.enum(["active", "withdrawn", "pending", "failed"])
export type PositionStatus = z.infer<typeof positionStatusSchema>

export const deFiPositionSchema = z.object({
	id: z.string().uuid(),
	endUserId: z.string().uuid(),
	walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
	protocol: deFiProtocolSchema,
	chainId: z.number().int().positive(),
	tokenAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
	tokenSymbol: z.string(),
	amount: z.string(), // Wei/smallest unit as string to avoid precision loss
	apy: z.string().optional(), // APY as percentage string (e.g., "5.25")
	valueUSD: z.string().optional(), // USD value as string
	depositedAt: z.date(),
	lastHarvestedAt: z.date().optional(),
	withdrawnAt: z.date().optional(),
	status: positionStatusSchema.default("active"),
	createdAt: z.date().default(() => new Date()),
	updatedAt: z.date().default(() => new Date()),
	// Protocol-specific metadata
	metadata: z.record(z.any()).optional().describe("Protocol-specific data like pool address, position ID, etc."),
})

export type DeFiPosition = z.infer<typeof deFiPositionSchema>

/**
 * Create DeFi Position Input (for new positions)
 */
export const createDeFiPositionSchema = z.object({
	endUserId: z.string().uuid(),
	walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
	protocol: deFiProtocolSchema,
	chainId: z.number().int().positive(),
	tokenAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
	tokenSymbol: z.string(),
	amount: z.string(),
	apy: z.string().optional(),
	valueUSD: z.string().optional(),
	metadata: z.record(z.any()).optional(),
})

export type CreateDeFiPosition = z.infer<typeof createDeFiPositionSchema>

/**
 * Update DeFi Position (for modifying existing positions)
 */
export const updateDeFiPositionSchema = z.object({
	amount: z.string().optional(),
	apy: z.string().optional(),
	valueUSD: z.string().optional(),
	status: positionStatusSchema.optional(),
	lastHarvestedAt: z.date().optional(),
	withdrawnAt: z.date().optional(),
	metadata: z.record(z.any()).optional(),
})

export type UpdateDeFiPosition = z.infer<typeof updateDeFiPositionSchema>

/**
 * Position Query Filters
 */
export const positionQuerySchema = z.object({
	endUserId: z.string().uuid().optional(),
	walletAddress: z
		.string()
		.regex(/^0x[a-fA-F0-9]{40}$/)
		.optional(),
	protocol: deFiProtocolSchema.optional(),
	chainId: z.number().int().positive().optional(),
	status: positionStatusSchema.optional(),
})

export type PositionQuery = z.infer<typeof positionQuerySchema>

/**
 * Position with calculated metrics
 */
export const positionWithMetricsSchema = deFiPositionSchema.extend({
	currentValue: z.string(),
	yieldEarned: z.string(),
	profitLoss: z.string(),
	profitLossPercentage: z.string(),
})

export type PositionWithMetrics = z.infer<typeof positionWithMetricsSchema>
