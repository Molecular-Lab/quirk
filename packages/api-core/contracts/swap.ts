import { initContract } from "@ts-rest/core"

import { ErrorResponse, QuoteAPIResponse, QuoteRequest } from "../dto"

const c = initContract()
export const swapContract = c.router({
	quote: {
		method: "POST",
		path: "/quote",
		body: QuoteRequest,
		responses: {
			200: c.type<QuoteAPIResponse>(),
			400: c.type<ErrorResponse>(),
			500: c.type<ErrorResponse>(),
		},
	},
})
