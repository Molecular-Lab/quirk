import { initContract } from "@ts-rest/core"
import { z } from "zod"

import { ArkenQuoteRequest, ArkenQuoteResponse, GetDexConfigResponse } from "./dto"

const c = initContract()
export const arkenContract = c.router({
	appConigGetDex: {
		method: "POST",
		path: "/app-config/dex/get",
		body: z.object({}),
		responses: {
			200: c.type<GetDexConfigResponse>(),
		},
	},
	quote: {
		method: "POST",
		path: "/v2/route/quote",
		body: c.type<ArkenQuoteRequest>(),
		responses: {
			200: c.type<ArkenQuoteResponse>(),
			400: c.type<{ error: string }>(),
		},
	},
})
