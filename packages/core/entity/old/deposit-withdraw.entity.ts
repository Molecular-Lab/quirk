import type { Address } from "viem"
import { z } from "zod"

const addressSchema = z.custom<Address>()

export const depositParamsSchema = z.object({
	clientId: z.string(),
	userId: z.string(),
	token: addressSchema,
	amount: z.bigint(),
	from: addressSchema,
})
export type DepositParams = z.infer<typeof depositParamsSchema>

export const withdrawParamsSchema = z.object({
	clientId: z.string(),
	userId: z.string(),
	token: addressSchema,
	amount: z.bigint(),
})
export type WithdrawParams = z.infer<typeof withdrawParamsSchema>

// Tier-specific withdrawal for Proxify
export const tierWithdrawalSchema = z.object({
	tierId: z.string(), // bytes32 as hex string
	reductionAmount: z.bigint(), // Amount to reduce from this tier
})
export type TierWithdrawal = z.infer<typeof tierWithdrawalSchema>

export const withdrawFromTiersParamsSchema = z.object({
	clientId: z.string(),
	userId: z.string(),
	token: addressSchema,
	tierWithdrawals: z.array(tierWithdrawalSchema),
	to: addressSchema,
})
export type WithdrawFromTiersParams = z.infer<typeof withdrawFromTiersParamsSchema>

// Batch withdrawal execution for Proxify
export const withdrawalExecutionSchema = z.object({
	clientId: z.string(),
	userId: z.string(),
	token: addressSchema,
	tierIds: z.array(z.string()), // Array of tier IDs
	tierReductions: z.array(z.bigint()), // Corresponding reduction amounts
	to: addressSchema,
	totalValue: z.bigint(), // Total value being withdrawn
	operationFee: z.bigint(), // Operation fee charged
	serviceFee: z.bigint(), // Service fee charged
	netAmount: z.bigint(), // Net amount to user
})
export type WithdrawalExecution = z.infer<typeof withdrawalExecutionSchema>

export const batchWithdrawParamsSchema = z.object({
	executions: z.array(withdrawalExecutionSchema),
})
export type BatchWithdrawParams = z.infer<typeof batchWithdrawParamsSchema>

export const batchWithdrawResultSchema = z.object({
	batchId: z.string(),
	executedCount: z.number(),
	totalGasUsed: z.bigint(),
})
export type BatchWithdrawResult = z.infer<typeof batchWithdrawResultSchema>
