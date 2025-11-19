import { z } from "zod"

export type SystemInfo = z.infer<typeof SystemInfo>
export const SystemInfo = z.object({
	name: z.string(),
	contractAddress: z.object({
		factory: z.string(),
		quoter: z.string(),
		router: z.string(),
	}),
	limitOrder: z.object({
		latestBlockNumber: z.number(),
		latestBlockTimestamp: z.number(),
	}),
})
