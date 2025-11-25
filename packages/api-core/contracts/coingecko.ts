import { initContract } from "@ts-rest/core"
import { z } from "zod"

export type GetTokenPriceResponse = Record<string, Record<string, number>>

const c = initContract()
export const coingeckoContract = c.router({
	tokenPrice: {
		method: "GET",
		path: "/simple/token_price/:chainId",
		responses: {
			200: c.type<GetTokenPriceResponse>(),
		},
		query: z.object({
			contract_addresses: z.string(),
			vs_currencies: z.string(),
		}),
	},
})
