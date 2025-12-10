import { coingeckoContract } from "../../contracts/coingecko"
import { APIError } from "../error"

import { Router } from "./router"

const COIN_GECKO_CHAIN_ID: Record<number, string> = {
	1: "ethereum",
	88: "tomochain",
}

const tokenPriceCache: Record<string, number> = {}
const getTokenPriceCacheKey = (chainId: number, tokenAddress: string) => `${chainId}-${tokenAddress.toLowerCase()}`

export class CoingeckoRouter extends Router<typeof coingeckoContract> {
	async getTokenPrice(chainId: number, tokenAddress: string[]) {
		const coingeckoChainId = COIN_GECKO_CHAIN_ID[chainId]
		if (!coingeckoChainId) throw new Error(`[Coin Gecko Get Token Price] Chain ID ${chainId} is not supported`)

		// check cached price
		const toFetchAddresses: string[] = []
		const response: Record<string, number> = {}

		for (const address of tokenAddress) {
			const cacheKey = getTokenPriceCacheKey(chainId, address)
			if (tokenPriceCache[cacheKey]) {
				response[address.toLowerCase()] = tokenPriceCache[cacheKey]
			} else {
				toFetchAddresses.push(address)
			}
		}

		if (toFetchAddresses.length === 0) return response

		// fetch all token prices that are not cached
		const fetchedPrice = await this.client.tokenPrice({
			params: {
				chainId: coingeckoChainId,
			},
			query: {
				contract_addresses: tokenAddress.join(","),
				vs_currencies: "usd",
			},
		})

		if (fetchedPrice.status !== 200) {
			throw new APIError(fetchedPrice.status, "Failed to fetch token price")
		}

		for (const address of Object.keys(fetchedPrice.body)) {
			const price = fetchedPrice.body[address].usd
			if (price) {
				const cacheKey = getTokenPriceCacheKey(chainId, address)
				tokenPriceCache[cacheKey] = price
				response[address] = price
			}
		}

		return response
	}
}
