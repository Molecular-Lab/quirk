import { z } from "zod"

export const vaultIndexInfoSchema = z.object({
	index: z.bigint(),
	updatedAt: z.bigint(),
})
export type VaultIndexInfo = z.infer<typeof vaultIndexInfoSchema>

export const vaultTotalsSchema = z.object({
	totalDeposits: z.bigint(),
	totalStaked: z.bigint(),
})
export type VaultTotals = z.infer<typeof vaultTotalsSchema>

export const vaultInfoSchema = vaultTotalsSchema.extend({
	vaultIndex: z.bigint(),
	indexUpdatedAt: z.bigint(),
})
export type VaultInfo = z.infer<typeof vaultInfoSchema>
