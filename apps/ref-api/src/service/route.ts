import { Address, Hex, encodePacked, isAddressEqual } from "viem"

import { INTERMEDIATE_TOKENS } from "@/constants/quote"
import { QuoteType, Route } from "@/entity"

import { PoolService } from "./pool"

export class RouteService {
	private readonly poolService: PoolService

	constructor(init: { poolService: PoolService }) {
		this.poolService = init.poolService
	}

	async getRoutes(tokenIn: Address, tokenOut: Address): Promise<Route[]> {
		const oneHopRoutes = await this.getOneHopRoutes(tokenIn, tokenOut)
		const twoHopRoutesGroup = await Promise.all(
			INTERMEDIATE_TOKENS.map(async (intermediate) => {
				if (isAddressEqual(intermediate, tokenIn) || isAddressEqual(intermediate, tokenOut)) return []
				return await this.getTwoHopRoutes(tokenIn, tokenOut, intermediate)
			}),
		)
		const twoHopRoutes = twoHopRoutesGroup.flat()

		// const threeHopRoutes = INTERMEDIATE_TOKENS.map((intermediateOne) => {
		// 	if (isAddressEqual(intermediateOne, tokenIn) || isAddressEqual(intermediateOne, tokenOut)) return []
		// 	return INTERMEDIATE_TOKENS.map((intermediateTwo) => {
		// 		if (
		// 			isAddressEqual(intermediateTwo, tokenIn) ||
		// 			isAddressEqual(intermediateTwo, tokenOut) ||
		// 			isAddressEqual(intermediateTwo, intermediateOne)
		// 		)
		// 			return []
		// 		return this.getThreeHopRoutes(tokenIn, tokenOut, intermediateOne, intermediateTwo)
		// 	}).flat()
		// }).flat()

		const allRoutes = [...oneHopRoutes, ...twoHopRoutes]
		return allRoutes
	}

	private async getOneHopRoutes(tokenIn: Address, tokenOut: Address): Promise<Route[]> {
		const pools = await this.poolService.getTokenPairPools([tokenIn, tokenOut])
		return pools.map((pool) => [pool])
	}

	private async getTwoHopRoutes(tokenIn: Address, tokenOut: Address, intermediate: Address): Promise<Route[]> {
		const poolAB = await this.poolService.getTokenPairPools([tokenIn, intermediate])
		const poolBC = await this.poolService.getTokenPairPools([intermediate, tokenOut])

		const routes: Route[] = []

		for (const poolA of poolAB) {
			for (const poolB of poolBC) {
				routes.push([poolA, poolB])
			}
		}

		return routes
	}

	private async getThreeHopRoutes(
		tokenIn: Address,
		tokenOut: Address,
		intermediateOne: Address,
		intermediateTwo: Address,
	): Promise<Route[]> {
		const poolAB = await this.poolService.getTokenPairPools([tokenIn, intermediateOne])
		const poolBC = await this.poolService.getTokenPairPools([intermediateOne, intermediateTwo])
		const poolCD = await this.poolService.getTokenPairPools([intermediateTwo, tokenOut])

		const routes: Route[] = []

		for (const poolA of poolAB) {
			for (const poolB of poolBC) {
				for (const poolC of poolCD) {
					routes.push([poolA, poolB, poolC])
				}
			}
		}

		return routes
	}

	static createPathFromRoute = (
		route: Route,
		type: QuoteType,
	): {
		path: (string | number)[]
		encoded: Hex
	} => {
		const path: (string | number)[] = []
		const abiTypes: string[] = []

		// the path is in the format of [token0, feeRate, token1, feeRate, token2]
		for (const [i, pool] of route.entries()) {
			// append first token
			if (i === 0) {
				path.push(pool.token0)
				abiTypes.push("address")
			}
			path.push(pool.feeRate)
			abiTypes.push("uint24")
			path.push(pool.token1)
			abiTypes.push("address")
		}

		// reverse the path if type is EXACT_OUTPUT
		if (type === "EXACT_OUTPUT") {
			path.reverse()
		}

		return {
			path: path,
			encoded: encodePacked(abiTypes, path),
		}
	}
}
