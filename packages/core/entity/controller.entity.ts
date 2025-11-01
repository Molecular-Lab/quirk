import type { Address } from "viem"
import { z } from "zod"
import { withdrawalExecutionSchema } from "./deposit-withdraw.entity"

const addressSchema = z.custom<Address>()

export const controllerRoleSummarySchema = z.object({
	defaultAdminRole: z.string(),
	guardianRole: z.string(),
	oracleRole: z.string(),
})
export type ControllerRoleSummary = z.infer<typeof controllerRoleSummarySchema>

export const controllerProtocolStatusSchema = z.object({
	isWhitelisted: z.boolean(),
})
export type ControllerProtocolStatus = z.infer<typeof controllerProtocolStatusSchema>

export const controllerTokenStatusSchema = z.object({
	isSupported: z.boolean(),
})
export type ControllerTokenStatus = z.infer<typeof controllerTokenStatusSchema>

export const controllerPauseStatusSchema = z.object({
	isPaused: z.boolean(),
})
export type ControllerPauseStatus = z.infer<typeof controllerPauseStatusSchema>

export const controllerWithdrawParamsSchema = z.object({
	clientId: z.string(),
	userId: z.string(),
	token: addressSchema,
	amount: z.bigint(),
	to: addressSchema,
})
export type ControllerWithdrawParams = z.infer<typeof controllerWithdrawParamsSchema>

export const executeTransferParamsSchema = z.object({
	token: addressSchema,
	protocol: addressSchema,
	amount: z.bigint(),
	tierId: z.string(),
	tierName: z.string(),
})
export type ExecuteTransferParams = z.infer<typeof executeTransferParamsSchema>

export const stakingParamsSchema = z.object({
	token: addressSchema,
	amount: z.bigint(),
	stakingExecutor: addressSchema,
})
export type StakingParams = z.infer<typeof stakingParamsSchema>

export const controllerGrantRoleParamsSchema = z.object({
	role: z.string(),
	account: addressSchema,
	senderAddress: addressSchema.optional(),
})
export type ControllerGrantRoleParams = z.infer<typeof controllerGrantRoleParamsSchema>

export const controllerRevokeRoleParamsSchema = z.object({
	role: z.string(),
	account: addressSchema,
	senderAddress: addressSchema.optional(),
})
export type ControllerRevokeRoleParams = z.infer<typeof controllerRevokeRoleParamsSchema>

export const controllerRenounceRoleParamsSchema = z.object({
	role: z.string(),
	callerConfirmation: addressSchema,
	senderAddress: addressSchema.optional(),
})
export type ControllerRenounceRoleParams = z.infer<typeof controllerRenounceRoleParamsSchema>

export const controllerRepositoryResultSchema = z.object({
	success: z.boolean(),
	data: z.any().optional(),
	message: z.string().optional(),
})
export type ControllerRepositoryResult<T = void> = z.infer<typeof controllerRepositoryResultSchema>

export const batchUpdateTierIndicesParamsSchema = z.object({
	token: addressSchema,
	tierIds: z.array(z.string()),
	newIndices: z.array(z.bigint()),
})
export type BatchUpdateTierIndicesParams = z.infer<typeof batchUpdateTierIndicesParamsSchema>

export const updateTierIndexParamsSchema = z.object({
	token: addressSchema,
	tierId: z.string(),
	newIndex: z.bigint(),
})
export type UpdateTierIndexParams = z.infer<typeof updateTierIndexParamsSchema>

export const initializeTierParamsSchema = z.object({
	token: addressSchema,
	tierId: z.string(),
})
export type InitializeTierParams = z.infer<typeof initializeTierParamsSchema>

export const batchInitializeTiersParamsSchema = z.object({
	token: addressSchema,
	tierIds: z.array(z.string()),
})
export type BatchInitializeTiersParams = z.infer<typeof batchInitializeTiersParamsSchema>

export const assignProtocolToTierParamsSchema = z.object({
	tierId: z.string(),
	protocol: addressSchema,
	senderAddress: addressSchema,
})
export type AssignProtocolToTierParams = z.infer<typeof assignProtocolToTierParamsSchema>

export const removeProtocolFromTierParamsSchema = z.object({
	tierId: z.string(),
	protocol: addressSchema,
	senderAddress: addressSchema,
})
export type RemoveProtocolFromTierParams = z.infer<typeof removeProtocolFromTierParamsSchema>

export const claimRevenueParamsSchema = z.object({
	token: addressSchema,
	to: addressSchema,
	amount: z.bigint(),
})
export type ClaimRevenueParams = z.infer<typeof claimRevenueParamsSchema>

export const claimClientRevenueParamsSchema = claimRevenueParamsSchema.extend({
	clientId: z.string(),
})
export type ClaimClientRevenueParams = z.infer<typeof claimClientRevenueParamsSchema>

export const batchWithdrawParamsSchema = z.object({
	executions: z.array(withdrawalExecutionSchema),
})
export type BatchWithdrawParams = z.infer<typeof batchWithdrawParamsSchema>