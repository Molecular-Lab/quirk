import { initContract } from "@ts-rest/core"
import { z } from "zod"

import { ErrorResponse, PoolLiquidityDistribution } from "../dto"

const c = initContract()
export const poolContract = c.router({
	getPoolLiquidityDistribution: {
		method: "GET",
		path: "/pools/liquidity-distribution",
		query: z.object({
			token0: z.string(),
			token1: z.string(),
		}),
		responses: {
			200: c.type<PoolLiquidityDistribution[]>(),
			400: c.type<ErrorResponse>(),
		},
	},
})
