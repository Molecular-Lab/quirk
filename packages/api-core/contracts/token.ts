import { initContract } from "@ts-rest/core"

import { ErrorResponse, GetTokenItem, GetTokenStatsResponse } from "../dto"

const c = initContract()
export const tokenContract = c.router({
	getAllTokens: {
		method: "GET",
		path: "/tokens",
		responses: {
			200: c.type<{ tokens: GetTokenItem[] }>(),
			400: c.type<ErrorResponse>(),
		},
	},
	getTokenByAddress: {
		method: "GET",
		path: "/token/:address",
		responses: {
			200: c.type<{ token: GetTokenItem }>(),
			400: c.type<ErrorResponse>(),
		},
	},
	getTokensStats: {
		method: "GET",
		path: "/stats",
		responses: {
			200: c.type<GetTokenStatsResponse>(),
			400: c.type<ErrorResponse>(),
		},
	},
})
