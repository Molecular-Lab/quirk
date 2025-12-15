import { z } from "zod"

import type { Address } from "viem"

const addressSchema = z.custom<Address>()

export const clientInfoSchema = z.object({
	name: z.string(),
	clientAddress: addressSchema,
	isActive: z.boolean(),
	registeredAt: z.bigint(),
	feeBps: z.number(), // Client revenue share (basis points)
	serviceFeeBps: z.number(), // Service fee (basis points)
	clientFeeBps: z.number(), // Client's share of service fee (basis points)
})
export type ClientInfo = z.infer<typeof clientInfoSchema>

export const clientRegistrationParamsSchema = z.object({
	clientId: z.string(),
	clientAddress: addressSchema,
	name: z.string(),
	feeBps: z.number(),
	serviceFeeBps: z.number(),
	clientFeeBps: z.number(),
})
export type ClientRegistrationParams = z.infer<typeof clientRegistrationParamsSchema>

export const clientActivationParamsSchema = z.object({
	clientId: z.string(),
	senderAddress: addressSchema,
})
export type ClientActivationParams = z.infer<typeof clientActivationParamsSchema>

export const clientDeactivationParamsSchema = z.object({
	clientId: z.string(),
	senderAddress: addressSchema,
})
export type ClientDeactivationParams = z.infer<typeof clientDeactivationParamsSchema>

export const clientAddressUpdateParamsSchema = z.object({
	clientId: z.string(),
	newAddress: addressSchema,
	senderAddress: addressSchema,
})
export type ClientAddressUpdateParams = z.infer<typeof clientAddressUpdateParamsSchema>

export const clientRegistryRepositoryResultSchema = z.object({
	success: z.boolean(),
	data: z.any().optional(),
	message: z.string().optional(),
})
export type ClientRegistryRepositoryResult<T = void> = z.infer<typeof clientRegistryRepositoryResultSchema>

export const clientStatusSchema = z.object({
	isRegistered: z.boolean(),
	isActive: z.boolean(),
})
export type ClientStatus = z.infer<typeof clientStatusSchema>

// Risk Tier types for Proxify
export const riskTierSchema = z.object({
	tierId: z.string(), // bytes32 as hex string
	name: z.string(),
	allocationBps: z.number(), // Allocation in basis points (e.g., 7000 = 70%)
	isActive: z.boolean(),
})
export type RiskTier = z.infer<typeof riskTierSchema>

export const setClientRiskTiersParamsSchema = z.object({
	clientId: z.string(),
	riskTiers: z.array(riskTierSchema),
	senderAddress: addressSchema,
})
export type SetClientRiskTiersParams = z.infer<typeof setClientRiskTiersParamsSchema>

export const addClientRiskTierParamsSchema = z.object({
	clientId: z.string(),
	tier: riskTierSchema,
	senderAddress: addressSchema,
})
export type AddClientRiskTierParams = z.infer<typeof addClientRiskTierParamsSchema>

export const updateTierAllocationParamsSchema = z.object({
	clientId: z.string(),
	tierId: z.string(),
	newAllocationBps: z.number(),
	senderAddress: addressSchema,
})
export type UpdateTierAllocationParams = z.infer<typeof updateTierAllocationParamsSchema>

export const setTierActiveParamsSchema = z.object({
	clientId: z.string(),
	tierId: z.string(),
	isActive: z.boolean(),
	senderAddress: addressSchema,
})
export type SetTierActiveParams = z.infer<typeof setTierActiveParamsSchema>

export const updateClientFeesParamsSchema = z.object({
	clientId: z.string(),
	feeBps: z.number(),
	serviceFeeBps: z.number(),
	senderAddress: addressSchema,
})
export type UpdateClientFeesParams = z.infer<typeof updateClientFeesParamsSchema>
