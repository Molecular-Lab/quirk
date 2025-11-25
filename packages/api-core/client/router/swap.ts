import { coreContract } from "../../contracts"
import { QuoteRequest, QuoteResponse } from "../../dto"
import { APIError } from "../error"

import { Router } from "./router"

export class SwapRouter extends Router<typeof coreContract> {
	async getQuote(params: QuoteRequest): Promise<{ quote: QuoteResponse; routeCount: number }> {
		const response = await this.client.swap.quote({
			body: params,
		})

		switch (response.status) {
			case 200: {
				return {
					quote: response.body.quote,
					routeCount: response.body.routeCount,
				}
			}
			case 400: {
				if (response.body.errorCode === "NO_ROUTE" || response.body.errorCode === "NOT_ENOUGH_LIQUIDITY") {
					throw new APIError(response.status, response.body.errorCode, response.body)
				}
				throw new APIError(response.status, "Failed to fetch quote")
			}
			default: {
				throw new APIError(response.status, "Failed to fetch quote")
			}
		}
	}
}
