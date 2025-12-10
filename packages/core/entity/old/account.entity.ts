import { z } from "zod"

export const accountSnapshotSchema = z.object({
	balance: z.bigint(),
	entryIndex: z.bigint(),
	depositTimestamp: z.bigint(),
})
export type AccountSnapshot = z.infer<typeof accountSnapshotSchema>

export const accountBalanceSchema = accountSnapshotSchema.extend({
	currentValue: z.bigint(),
})
export type AccountBalance = z.infer<typeof accountBalanceSchema>

export const userAccountSummarySchema = z.object({
	totalBalance: z.bigint(),
	totalValue: z.bigint(),
	accruedYield: z.bigint(),
	activeTierCount: z.bigint(),
})
export type UserAccountSummary = z.infer<typeof userAccountSummarySchema>
