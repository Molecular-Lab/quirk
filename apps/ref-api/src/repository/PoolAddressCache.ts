import { Address, PublicClient, isAddressEqual } from "viem"

import { PoolCreatedEvent } from "@rabbitswap/core/constants"

import { VICTION_CONTRACT } from "@/constants/quote"
import { Pool } from "@/entity"
import { GetPoolAddressQuery } from "@/graphql/pools"
import { Logger } from "@/logger"
import { SubgraphRepository } from "@/repository/graphql"
import { RedisCacheRepository } from "@/repository/redis-cache.repository"
import { RedisKey } from "@/repository/redis-key"

interface PoolCacheData {
	lastBlock: bigint
	pools: Pool[]
}

/**
 * equivalent to PoolCacheData but no bigint
 */
interface _PoolCacheData {
	lastBlock: string
	pools: Pool[]
}

const poolAddressTtl = 2629800 // 1 month

export class PoolAddressCache {
	private readonly publicClient: PublicClient
	private readonly cacheRepository: RedisCacheRepository
	private readonly subgraphRepo: SubgraphRepository

	constructor(init: {
		publicClient: PublicClient
		cacheRepository: RedisCacheRepository
		subgraphRepo: SubgraphRepository
	}) {
		this.publicClient = init.publicClient
		this.cacheRepository = init.cacheRepository
		this.subgraphRepo = init.subgraphRepo
	}

	async getCachedData(): Promise<PoolCacheData | null> {
		const cachedData = await this.cacheRepository.get<_PoolCacheData>(RedisKey.poolsInfo)
		if (!cachedData) return cachedData
		return {
			...cachedData,
			lastBlock: BigInt(cachedData.lastBlock),
		}
	}

	async setCacheData(params: PoolCacheData): Promise<void> {
		const value: _PoolCacheData = {
			...params,
			lastBlock: params.lastBlock.toString(),
		}
		await this.cacheRepository.set(RedisKey.poolsInfo, value, poolAddressTtl)
	}

	async pools(): Promise<Pool[]> {
		const cachedData = await this.getCachedData()
		return cachedData?.pools ?? []
	}

	async initialize() {
		await this.syncPools()
		await this.watchPoolCreated()

		setInterval(
			() => this.syncPools(),
			1000 * 60, // 1 minute
		)
	}

	async getTokenPairPools(tokenPair: [Address, Address]) {
		const pools = await this.pools()
		return pools.filter(
			(pool) =>
				(isAddressEqual(pool.token0, tokenPair[0]) && isAddressEqual(pool.token1, tokenPair[1])) ||
				(isAddressEqual(pool.token0, tokenPair[1]) && isAddressEqual(pool.token1, tokenPair[0])),
		)
	}

	async syncPools() {
		try {
			const cachedData = await this.getCachedData()

			const res = await this.subgraphRepo.execute(GetPoolAddressQuery)

			const apiPools = res.pools.map((pool) => ({
				token0: pool.token0.id as Address,
				token1: pool.token1.id as Address,
				feeRate: Number(pool.feeTier),
				address: pool.id as Address,
			}))

			// set cache if new length is change
			if (apiPools.length > (cachedData?.pools.length ?? 0)) {
				const cacheValue: PoolCacheData = {
					lastBlock: 0n,
					...cachedData,
					pools: apiPools,
				}
				await this.setCacheData(cacheValue)
				Logger.info("Cached new pool data", {
					prevLength: cachedData?.pools.length,
					length: cacheValue.pools.length,
					prevBlock: cachedData?.lastBlock,
					lastBlock: cacheValue.lastBlock,
					caller: "syncPools",
				})
			}
		} catch (error) {
			Logger.error("Failed to sync pool", {
				event: "sync_pool_failed",
				err: error,
				errMsg: error instanceof Error ? error.message : undefined,
			})
		}
	}

	async watchPoolCreated() {
		const cachedData = await this.getCachedData()

		// init cache data to last block
		const currentBlockNumber = await this.publicClient.getBlockNumber()
		const cacheValue: PoolCacheData = {
			lastBlock: currentBlockNumber,
			pools: cachedData?.pools ?? [],
		}
		await this.setCacheData(cacheValue)
		Logger.info("Init cache from watchPoolCreated", {
			prevLength: cachedData?.pools.length,
			length: cacheValue.pools.length,
			prevBlock: cachedData?.lastBlock,
			lastBlock: cacheValue.lastBlock,
			caller: "watchPoolCreated",
		})

		setInterval(async () => {
			const cachedData = await this.getCachedData()
			const currentBlockNumber = await this.publicClient.getBlockNumber()
			const cachedBlock = cachedData?.lastBlock ?? 0n
			if (currentBlockNumber <= cachedBlock) return

			const poolsFromLog: Pool[] = []

			// due to large log filtering can cause an issue, filter logs gradually
			const CHUNK_SIZE = 300n
			let fromBlock = cachedBlock
			while (fromBlock < currentBlockNumber) {
				const _toBlock = fromBlock + CHUNK_SIZE
				const toBlock = _toBlock > currentBlockNumber ? currentBlockNumber : _toBlock
				const logs = await this.publicClient.getLogs({
					address: VICTION_CONTRACT.v3Factory,
					event: PoolCreatedEvent,
					fromBlock: fromBlock,
					toBlock: toBlock,
				})
				const currPoolsFromLog = logs
					.map<Pool | undefined>((log) => {
						if (!log.args.pool || !log.args.token0 || !log.args.token1 || !log.args.fee) return undefined
						return {
							address: log.args.pool,
							token0: log.args.token0,
							token1: log.args.token1,
							feeRate: log.args.fee,
						}
					})
					.filter((e) => e !== undefined)
				poolsFromLog.push(...currPoolsFromLog)
				fromBlock = toBlock + 1n
			}

			const newPools = [...(cachedData?.pools ?? []), ...poolsFromLog].filter((pool, index, self) => {
				const idx = self.findIndex((t) => t.address.toLowerCase() === pool.address.toLowerCase())
				return idx === index
			})

			// set cache
			const cacheValue: PoolCacheData = {
				lastBlock: currentBlockNumber,
				pools: newPools,
			}
			await this.setCacheData(cacheValue)
			Logger.info("Cached new pool data", {
				prevLength: cachedData?.pools.length,
				length: cacheValue.pools.length,
				prevBlock: cachedData?.lastBlock,
				lastBlock: cacheValue.lastBlock,
				caller: "watchPoolCreated",
			})
		}, this.publicClient.pollingInterval)
	}
}
