import { BigNumber } from "bignumber.js"
import dayjs from "dayjs"
import { Address, erc20Abi, getContract, isAddressEqual } from "viem"
import { viction } from "viem/chains"

import { TokenStats } from "@rabbitswap/api-core/dto"
import { WVIC_ADDRESS, WVIC_SUPPLY, tokens } from "@rabbitswap/core/constants"
import { Token } from "@rabbitswap/core/entity"

import { GetTokensQuery } from "@/graphql/tokens"
import { SubgraphRepository } from "@/repository/graphql"
import { RedisCacheRepository } from "@/repository/redis-cache.repository"
import { RedisKey } from "@/repository/redis-key"
import { getViemClient } from "@/utils"
import { priceChangeInDuration } from "@/utils/price"

const tokenInfoTtl = 60 * 5 // 5 minutes
const tokenPriceTtl = 60 * 1 // 1 minutes
const tokenStatTtl = 60 * 1 // 1 minutes

export class TokenService {
	private readonly cacheRepository: RedisCacheRepository
	private readonly subgraphRepo: SubgraphRepository

	constructor(init: { cacheRepository: RedisCacheRepository; subgraphRepo: SubgraphRepository }) {
		this.cacheRepository = init.cacheRepository
		this.subgraphRepo = init.subgraphRepo
	}

	async getTokenFromChain(chainId: number, address: Address): Promise<Token> {
		const cacheKey = RedisKey.token(chainId, address).info

		const cachedValue = await this.cacheRepository.get<Token>(cacheKey)
		if (cachedValue) return cachedValue

		const viemClient = getViemClient(chainId)

		const contract = getContract({
			address: address,
			abi: erc20Abi,
			client: viemClient,
		})

		const [tokenSymbol, tokenName, tokenDecimals] = await Promise.all([
			contract.read.symbol(),
			contract.read.name(),
			contract.read.decimals(),
		])

		const result: Token = {
			// chain info
			chainId: chainId,
			chain: viemClient.chain?.name ?? "",
			// token info
			address: address,
			symbol: tokenSymbol,
			name: tokenName,
			decimals: tokenDecimals,
			iconURL: "",
			isStable: false,
		}

		await this.cacheRepository.set(cacheKey, result, tokenInfoTtl)
		return result
	}

	async getConfigTokens(): Promise<Token[]> {
		const filteredTokens = tokens.filter((e) => !e.hidden)
		return Promise.resolve(filteredTokens)
	}

	async getTokenStats(chainId: number): Promise<TokenStats[]> {
		const cacheKey = RedisKey.tokenStat(chainId)

		const cachedValue = await this.cacheRepository.get<TokenStats[]>(cacheKey)
		if (cachedValue && cachedValue.length > 0) return cachedValue

		return this.getTokenStatsWithoutCache(chainId)
	}

	async getTokenStatsWithoutCache(chainId: number): Promise<TokenStats[]> {
		const res = await this.subgraphRepo.execute(GetTokensQuery, {
			filter: {
				derivedETH_not: "0",
			},
		})

		const tokens = res.tokens

		// Fetch total sypply
		const viemClient = getViemClient(viction.id)
		const totalSupply = await viemClient.multicall({
			contracts: tokens.map((token) => ({
				abi: erc20Abi,
				address: token.id as Address,
				functionName: "totalSupply",
			})),
		})

		const formattedData = tokens.map<TokenStats>((token, idx) => {
			const todayData = token.tokenHourData.filter((e) => dayjs.unix(e.timestamp).diff(dayjs(), "day") === 0)

			const volume24HUsd = todayData.reduce((acc, e) => acc.plus(e.volumeUSD), BigNumber(0))
			const priceChange24h = priceChangeInDuration(
				token.tokenHourData
					.map((e) => ({
						timestamp: e.timestamp,
						priceUSD: Number(e.priceUSD),
						open: Number(e.open),
					}))
					.sort((a, b) => a.timestamp - b.timestamp),
				dayjs.duration(1, "day"),
			)

			const priceChange1h = priceChangeInDuration(
				token.token5MinData
					.map((e) => ({
						timestamp: e.timestamp,
						priceUSD: Number(e.priceUSD),
						open: Number(e.open),
					}))
					.sort((a, b) => a.timestamp - b.timestamp),
				dayjs.duration(1, "hour"),
			)

			return {
				address: token.id as Address,
				price: Number(token.derivedUSD),
				change24h: priceChange24h,
				change1h: priceChange1h,
				totalSupply: isAddressEqual(WVIC_ADDRESS, token.id as Address)
					? WVIC_SUPPLY
					: (totalSupply[idx]?.result?.toString() ?? "0"),
				volumeUSD: volume24HUsd.toNumber(),
			}
		})

		// cache each token usd price
		await Promise.all(
			formattedData.map((token) => {
				const tokenPriceCacheKey = RedisKey.token(chainId, token.address).price
				const cacheValue = token.price
				return this.cacheRepository.set(tokenPriceCacheKey, cacheValue, tokenPriceTtl)
			}),
		)

		// cache entire token stat
		const cacheKey = RedisKey.tokenStat(chainId)
		await this.cacheRepository.set(cacheKey, formattedData, tokenStatTtl)

		return formattedData
	}

	async getUsdPrice(chainId: number, addressList: Address[]): Promise<Record<string, string>> {
		// get every tokens from cache
		const cachedTokenPrices = await Promise.all(
			addressList.map(async (address) => {
				const cacheKey = RedisKey.token(chainId, address).price
				const tokenPrice = await this.cacheRepository.get<number>(cacheKey)
				return {
					address: address,
					price: tokenPrice,
				}
			}),
		)

		const cachedRes = cachedTokenPrices.reduce<Record<string, string>>((acc, { address, price }) => {
			if (price !== null) {
				return {
					...acc,
					[address]: price.toString(),
				}
			}
			return acc
		}, {})

		// find tokens that are not in cache
		const missingTokenAddresses = cachedTokenPrices.filter(({ price }) => price === null).map(({ address }) => address)

		if (missingTokenAddresses.length === 0) {
			return cachedRes
		}

		// if some token is missing, fetch the missing
		const data = await this.getTokenStatsWithoutCache(chainId)
		const res = data.reduce<Record<string, string>>((acc, { address, price }) => {
			if (price !== undefined) {
				return {
					...acc,
					[address]: price.toString(),
				}
			}
			return acc
		}, cachedRes)

		return res
	}
}
