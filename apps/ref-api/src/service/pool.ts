import { Address, PublicClient } from "viem"

import { poolAbi } from "@rabbitswap/core/constants"

import { Pool } from "@/entity"
import { GetTokenPairPoolsDataQuery } from "@/graphql/pools"
import { SubgraphRepository } from "@/repository/graphql"
import { PoolAddressCache } from "@/repository/PoolAddressCache"
import { RedisCacheRepository } from "@/repository/redis-cache.repository"
import { RedisKey } from "@/repository/redis-key"
import { sortTokenPair } from "@/utils"

const poolDistributionCacheTtl = 60 // 1 min

interface TokenPairDistributionData {
	address: Address
	feeRate: number
	liquidity: string
	totalValueLockedUSD: string
}

export class PoolService {
	private readonly publicClient: PublicClient
	private readonly poolAddressCache: PoolAddressCache
	private readonly cacheRepository: RedisCacheRepository
	private readonly subgraphRepo: SubgraphRepository

	constructor(init: {
		publicClient: PublicClient
		poolAddressCache: PoolAddressCache
		cacheRepository: RedisCacheRepository
		subgraphRepo: SubgraphRepository
	}) {
		this.publicClient = init.publicClient
		this.poolAddressCache = init.poolAddressCache
		this.cacheRepository = init.cacheRepository
		this.subgraphRepo = init.subgraphRepo
	}

	/**
	 * get pool addresses of each supported feeAmount
	 * token0 and token1 will be ordered the same as input pair
	 */
	async getTokenPairPools(tokenPair: [Address, Address]): Promise<Pool[]> {
		const pools = await this.poolAddressCache.getTokenPairPools(tokenPair)

		return pools.map((pool) => ({
			...pool,
			token0: tokenPair[0],
			token1: tokenPair[1],
		}))
	}

	/**
	 * Get the pool data by address from contract
	 * @param address poolAddress
	 * @returns The pool data
	 */
	async getPoolData(address: Address): Promise<{
		liquidity: string
		sqrtRatioX96: string
		tickCurrent: string
	}> {
		const readSlot0 = this.publicClient.readContract({
			address: address,
			abi: poolAbi,
			functionName: "slot0",
		})
		const readLiquidity = this.publicClient.readContract({
			address: address,
			abi: poolAbi,
			functionName: "liquidity",
		})

		const [slot0Res, liquidityRes] = await Promise.all([readSlot0, readLiquidity])
		const [sqrtPriceX96, tickCurrent] = slot0Res

		return {
			liquidity: liquidityRes.toString(),
			sqrtRatioX96: sqrtPriceX96.toString(),
			tickCurrent: tickCurrent.toString(),
		}
	}

	/**
	 * Get the cached pool data by token pair from redis.
	 * If not found, fetch from subgraph and cache it in redis
	 * @param tokenPair
	 * @returns The pool data
	 */
	async getTokenPairPoolsData(tokenPair: [Address, Address]): Promise<TokenPairDistributionData[]> {
		const cacheKey = RedisKey.tokenPair(tokenPair).poolDistribution
		const cachedValue = await this.cacheRepository.get<TokenPairDistributionData[]>(cacheKey)
		if (cachedValue) return cachedValue

		const [token0, token1] = sortTokenPair(tokenPair)

		const res = await this.subgraphRepo.execute(GetTokenPairPoolsDataQuery, {
			filter: {
				token0: token0.toLowerCase(),
				token1: token1.toLowerCase(),
			},
		})

		const pools = res.pools.map<TokenPairDistributionData>((pool) => ({
			address: pool.id as Address,
			feeRate: Number(pool.feeTier),
			liquidity: pool.liquidity,
			totalValueLockedUSD: pool.totalValueLockedUSD,
		}))

		// set cache
		await this.cacheRepository.set(cacheKey, pools, poolDistributionCacheTtl)

		return pools
	}
}
