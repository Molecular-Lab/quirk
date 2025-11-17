import type { Address } from "viem"
import { z } from "zod"

const addressSchema = z.custom<Address>()

// Tier-specific index information
export const tierIndexInfoSchema = z.object({
	tierId: z.string(), // bytes32 as hex string
	index: z.bigint(),
	updatedAt: z.bigint(),
})
export type TierIndexInfo = z.infer<typeof tierIndexInfoSchema>

// Tier-specific account information
export const tierAccountSchema = z.object({
	tierId: z.string(),
	balance: z.bigint(),
	entryIndex: z.bigint(),
	depositedAt: z.bigint(),
	currentValue: z.bigint(), // Computed value based on current tier index
})
export type TierAccount = z.infer<typeof tierAccountSchema>

// User's account summary across all tiers
export const userTierSummarySchema = z.object({
	tierAccounts: z.array(tierAccountSchema),
	totalBalance: z.bigint(),
	totalValue: z.bigint(),
	accruedYield: z.bigint(),
	activeTierCount: z.number(),
})
export type UserTierSummary = z.infer<typeof userTierSummarySchema>

// Tier initialization parameters
export const tierInitParamsSchema = z.object({
	token: addressSchema,
	tierId: z.string(),
})
export type TierInitParams = z.infer<typeof tierInitParamsSchema>

// Batch tier initialization
export const batchTierInitParamsSchema = z.object({
	token: addressSchema,
	tierIds: z.array(z.string()),
})
export type BatchTierInitParams = z.infer<typeof batchTierInitParamsSchema>

// Tier index update parameters
export const tierIndexUpdateSchema = z.object({
	token: addressSchema,
	tierId: z.string(),
	newIndex: z.bigint(),
})
export type TierIndexUpdate = z.infer<typeof tierIndexUpdateSchema>

// Batch tier index update
export const batchTierIndexUpdateSchema = z.object({
	token: addressSchema,
	updates: z.array(
		z.object({
			tierId: z.string(),
			newIndex: z.bigint(),
		}),
	),
})
export type BatchTierIndexUpdate = z.infer<typeof batchTierIndexUpdateSchema>
