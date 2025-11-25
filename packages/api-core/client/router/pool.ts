import { coreContract } from "../../contracts"
import { Address } from "../../entity"
import { APIError } from "../error"

import { Router } from "./router"

export class PoolRouter extends Router<typeof coreContract> {
	async getPoolLiquidityDistribution(_chainId: number, token: [Address, Address]) {
		const response = await this.client.pool.getPoolLiquidityDistribution({
			query: {
				token0: token[0],
				token1: token[1],
			},
		})

		switch (response.status) {
			case 200: {
				return response.body
			}
			default: {
				throw new APIError(response.status, "Failed to fetch pool liquidity distribution")
			}
		}
	}
}
