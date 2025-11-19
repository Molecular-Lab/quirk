import BigNumber from "bignumber.js"
import dayjs, { Dayjs } from "dayjs"
import { Address, getAddress, isHash } from "viem"

import {
	ChartData,
	ExplorePoolStats,
	PoolData,
	PoolDataTimeframe,
	PoolSortBy,
	PoolTransactionItem,
	ProtocolChartTimeframe,
	SortDirection,
	TickData,
} from "@rabbitswap/api-core/dto"
import Logger from "@rabbitswap/logger"

import { POOL_PRICE_GRAPH_CONFIG, POOL_VOLUME_GRAPH_CONFIG } from "@/constants/explore"
import {
	Pool5MinData_OrderBy,
	PoolDayData_OrderBy,
	PoolHourData_OrderBy,
	PoolTransaction_OrderBy,
	UniDayData_OrderBy,
} from "@/graphql/__generated__/graphql"
import {
	GetPoolPrice5MinuteQuery,
	GetPoolPriceDayQuery,
	GetPoolPriceHourQuery,
	GetPoolQuery,
	GetPoolTicksQuery,
	GetPoolTransactionsQuery,
	GetPoolVolume5MinsGraphQuery,
	GetPoolVolumeDayGraphQuery,
	GetPoolVolumeHourGraphQuery,
	GetPoolsQuery,
} from "@/graphql/pools"
import { GetTVLGraphQuery, GetVolumeGraphQuery } from "@/graphql/protocol"
import { SubgraphRepository } from "@/repository/graphql"
import { RedisCacheRepository } from "@/repository/redis-cache.repository"
import { RedisKey } from "@/repository/redis-key"
import { DateHandler, aggregateByInterval, formatByInterval, parseSqrtPrice, secondInOneDay } from "@/utils"
import { TransactionEventType, parseTransactionType } from "@/utils/transaction"

const MINIMUM_TVL_ETH = 50

const protocolTvlTtl = 60 // 1 min
const protocolVolTtl = 60 // 1 min
const poolsStatTtl = 60 // 1 min
const poolStatTtl = 60 // 1 min
const poolTicksTtl = 30 // 30 sec
const poolVolTtl = 60 // 1 min
const poolPriceTtl = 60 // 1 min

/**
 * This service is used to fetch data from the subgraph and cache it in redis.
 * It's used to fetch data for the explore page, and also for rendering liquidity chart input
 */
export class ExploreService {
	private readonly cacheRepository: RedisCacheRepository
	private readonly subgraphRepo: SubgraphRepository

	constructor(init: { cacheRepository: RedisCacheRepository; subgraphRepo: SubgraphRepository }) {
		this.cacheRepository = init.cacheRepository
		this.subgraphRepo = init.subgraphRepo
	}

	/**
	 * Returns the pool stats for a given date
	 * @param sortBy sort by totalValueLockedUsd | volume24HUsd | fee24HUsd | apr (default totalValueLockedUsd)
	 * @param sortDirection asc | desc (default desc)
	 * @returns Array of PoolStats
	 */
	async getPoolsStats(
		sortBy: PoolSortBy = "totalValueLockedUsd",
		sortDirection: SortDirection = "desc",
	): Promise<PoolData[]> {
		const cacheKey = RedisKey.poolStat(sortBy, sortDirection)
		try {
			const cachedValue = await this.cacheRepository.get<PoolData[]>(cacheKey)
			if (cachedValue) return cachedValue

			const res = await this.subgraphRepo.execute(GetPoolsQuery, {
				filter: {
					totalValueLockedETH_gte: MINIMUM_TVL_ETH.toString(),
				},
			})
			const formattedData = res.pools
				.map<PoolData | undefined>((pool) => {
					const latest24HourData = pool.poolHourData.filter(
						(e) => DateHandler.poolHourDataIdToDate(e.id).diff(dayjs(), "day") === 0,
					)
					const fee24HUsd = latest24HourData.reduce((acc, e) => acc.plus(e.feesUSD), BigNumber(0))
					const volume24HUsd = latest24HourData.reduce((acc, e) => acc.plus(e.volumeUSD), BigNumber(0))

					return {
						token0: pool.token0.id as Address,
						token1: pool.token1.id as Address,
						feeRate: Number(pool.feeTier),
						address: pool.id as Address,
						totalValueLockedUsd: Number(pool.totalValueLockedUSD),
						volume24HUsd: volume24HUsd.toNumber(),
						fee24HUsd: fee24HUsd.toNumber(),
						apr: fee24HUsd.div(pool.totalValueLockedUSD).multipliedBy(36_500).toNumber(),
					}
				})
				.filter((x) => x !== undefined)

			const result = formattedData.sort((a, b) => {
				if (sortDirection === "asc") {
					return a[sortBy] - b[sortBy]
				} else {
					return b[sortBy] - a[sortBy]
				}
			})

			await this.cacheRepository.set(cacheKey, result, poolsStatTtl)

			return result
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(`Failed to fetch pools stats: ${error.message}`)
			}
			throw new Error("Unknown error")
		}
	}

	/**
	 * get stat of single pool by poolAddress
	 */
	async getPoolStats(_poolAddress: string): Promise<ExplorePoolStats> {
		const poolAddress = _poolAddress.toLowerCase()
		const cacheKey = RedisKey.pool(poolAddress).stat

		try {
			const cachedValue = await this.cacheRepository.get<ExplorePoolStats>(cacheKey)
			if (cachedValue) return cachedValue

			const res = await this.subgraphRepo.execute(GetPoolQuery, {
				poolId: poolAddress.toLowerCase(),
			})
			if (!res.pool) {
				throw new Error("Pool not found")
			}

			const todayData = res.pool.poolHourData.filter((e) => dayjs.unix(e.timestamp).diff(dayjs(), "day") === 0)
			const yesterdayData = res.pool.poolHourData.filter((e) => dayjs.unix(e.timestamp).diff(dayjs(), "day") === -1)

			const fee24HUsd = todayData.reduce((acc, e) => acc.plus(e.feesUSD), BigNumber(0))
			const volume24HUsd = todayData.reduce((acc, e) => acc.plus(e.volumeUSD), BigNumber(0))
			const yesterdayVolumeUsd = yesterdayData.reduce((acc, e) => acc.plus(e.volumeUSD), BigNumber(0))
			const yesterdayTvlUsd = Number(yesterdayData[yesterdayData.length - 1]?.tvlUSD ?? res.pool.totalValueLockedUSD)

			const poolStat: ExplorePoolStats = {
				totalValueLockedUsd: Number(res.pool.totalValueLockedUSD),
				volume24HUsd: volume24HUsd.toNumber(),
				fee24HUsd: fee24HUsd.toNumber(),
				totalValueLockedToken0: res.pool.totalValueLockedToken0,
				totalValueLockedToken1: res.pool.totalValueLockedToken1,
				tvlChangePercent: ((Number(res.pool.totalValueLockedUSD) - yesterdayTvlUsd) / yesterdayTvlUsd) * 100,
				volumeChangePercent: volume24HUsd.minus(yesterdayVolumeUsd).div(yesterdayVolumeUsd).shiftedBy(2).toNumber(),
			}

			await this.cacheRepository.set(cacheKey, poolStat, poolStatTtl)

			return poolStat
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(`Failed to fetch pool stats: ${error.message}`)
			}
			throw new Error("Unknown error")
		}
	}

	async getPoolTicks(poolAddress: string): Promise<TickData[]> {
		const cacheKey = RedisKey.pool(poolAddress).ticks

		try {
			const cachedValue = await this.cacheRepository.get<TickData[]>(cacheKey)
			if (cachedValue) return cachedValue

			const res = await this.subgraphRepo.execute(GetPoolTicksQuery, {
				poolId: poolAddress.toLowerCase(),
			})
			if (!res.pool) {
				throw new Error("Cannot get pool ticks")
			}

			const formattedData = res.pool.ticks
				.map<TickData | undefined>((e) => ({
					tick: Number(e.tickIdx),
					liquidityNet: e.liquidityNet,
				}))
				.filter((x) => x !== undefined)

			await this.cacheRepository.set(cacheKey, formattedData, poolTicksTtl)

			return formattedData
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(`Failed to fetch pool ticks: ${error.message}`)
			}
			throw new Error("Unknown error")
		}
	}

	async getPoolTransactions(_poolAddress: string): Promise<PoolTransactionItem[]> {
		const poolAddress = _poolAddress.toLowerCase()

		try {
			const res = await this.subgraphRepo.execute(GetPoolTransactionsQuery, {
				filter: {
					pool: poolAddress.toLowerCase(),
					type_in: ["Swap", "IncreaseLiquidity", "DecreaseLiquidity"],
				},
				first: 100,
				orderBy: PoolTransaction_OrderBy.Timestamp,
				sortDirection: "desc",
			})

			return res.poolTransactions
				.map<PoolTransactionItem | undefined>((res) => {
					const hash = res.id.split("#")[0]
					if (!hash || !isHash(hash)) return undefined
					const x: PoolTransactionItem = {
						timestamp: Number(res.timestamp),
						txHash: hash,
						wallet: getAddress(res.maker),
						token0Amount: res.token0Amount,
						token1Amount: res.token1Amount,
						valueUsd: res.amountUSD,
						type: parseTransactionType(TransactionEventType.parse(res.type), Number(res.token0Amount)),
					}
					return x
				})
				.filter((x) => x !== undefined)
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(`Failed to fetch pool transactions: ${error.message}`)
			}
			throw new Error("Unknown error")
		}
	}

	/**
	 * Returns a list of tvlUSD at latest date to oldest date
	 */
	async getTVLGraph(): Promise<ChartData[]> {
		const cacheKey = RedisKey.protocol.tvl

		try {
			const cachedValue = await this.cacheRepository.get<ChartData[]>(cacheKey)
			if (cachedValue) return cachedValue

			const res = await this.subgraphRepo.execute(GetTVLGraphQuery, {
				orderBy: UniDayData_OrderBy.Timestamp,
			})

			const nodes = res.uniDayDatas
			if (nodes.length === 0) {
				return []
			}
			const latestDate = nodes[0]!.timestamp
			const oldestDate = nodes[nodes.length - 1]!.timestamp

			const allDates: number[] = []
			for (let d = oldestDate; d <= latestDate; d += secondInOneDay) {
				allDates.push(d)
			}

			// Round timestamps to nearest day
			// incase the data can be 20xx-xx-xx 23:59:59 we round it to 20xx-xx-xx
			const dataMap = new Map(
				nodes.map<[number, number]>((node) => {
					const key = Math.floor(node.timestamp / secondInOneDay) * secondInOneDay
					const value = Number(node.tvlUSD)
					return [key, value]
				}),
			)

			const tvlChartData = allDates
				.map<ChartData | undefined>((date) => {
					const data = dataMap.get(Math.floor(date / secondInOneDay) * secondInOneDay)
					if (data === undefined) return undefined
					return {
						timestamp: date,
						data: data,
					}
				})
				.filter((e) => e !== undefined)

			await this.cacheRepository.set(cacheKey, tvlChartData, protocolTvlTtl)

			return tvlChartData
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(`Failed to fetch TVL graph: ${error.message}`)
			}
			throw new Error("Unknown error")
		}
	}

	/**
	 * Returns a list of volumeUSD base on the timeframe
	 * if the date doesn't exist the value will be 0
	 */
	async getVolumeGraph(timeframe: ProtocolChartTimeframe = "D"): Promise<ChartData[]> {
		const cacheKey = RedisKey.protocol.tradingVolume(timeframe)
		try {
			const cachedValue = await this.cacheRepository.get<ChartData[]>(cacheKey)
			if (cachedValue) return cachedValue

			const { startDate, endDate, duration } = DateHandler.getDateRangeVolumeGraph(timeframe)

			const uniday = await this.subgraphRepo.execute(GetVolumeGraphQuery, {
				orderBy: UniDayData_OrderBy.Timestamp,
				filter: {
					timestamp_gte: startDate.unix(),
					timestamp_lte: endDate.unix(),
				},
			})

			const nodes = uniday.uniDayDatas.map((node) => ({
				timestamp: node.timestamp,
				volumeUSD: Number(node.volumeUSD),
			}))

			const slotTimeFn = timeframe === "M" ? (itemTime: Dayjs) => itemTime.startOf("month") : undefined
			const data = aggregateByInterval(nodes, duration, "volumeUSD", [startDate, endDate], slotTimeFn)

			await this.cacheRepository.set(cacheKey, data, protocolVolTtl)

			return data
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(`Failed to fetch volume graph: ${error.message}`)
			}
			throw new Error("Unknown error")
		}
	}

	async getPoolVolume(_poolAddress: string, timeframe: PoolDataTimeframe = "M"): Promise<ChartData[]> {
		const poolAddress = _poolAddress.toLowerCase()
		const cacheKey = RedisKey.pool(poolAddress).volumeChart(timeframe)
		try {
			const cachedValue = await this.cacheRepository.get<ChartData[]>(cacheKey)
			if (cachedValue) return cachedValue

			const config = POOL_VOLUME_GRAPH_CONFIG[timeframe]
			const startDate = dayjs().subtract(config.duration)

			let data: { timestamp: number; volumeUSD: string }[] | undefined

			switch (timeframe) {
				case "M":
				case "Y": {
					const res = await this.subgraphRepo.execute(GetPoolVolumeDayGraphQuery, {
						poolId: poolAddress,
						orderBy: PoolDayData_OrderBy.Timestamp,
						filter: {
							timestamp_gte: startDate.unix(),
						},
					})
					data = res.pool?.poolDayData

					break
				}

				case "W":
				case "D": {
					const res = await this.subgraphRepo.execute(GetPoolVolumeHourGraphQuery, {
						poolId: poolAddress,
						orderBy: PoolHourData_OrderBy.Timestamp,
						filter: {
							timestamp_gte: startDate.unix(),
						},
					})
					data = res.pool?.poolHourData

					break
				}

				case "H": {
					const res = await this.subgraphRepo.execute(GetPoolVolume5MinsGraphQuery, {
						poolId: poolAddress,
						orderBy: Pool5MinData_OrderBy.Timestamp,
						filter: {
							timestamp_gte: startDate.unix(),
						},
					})
					data = res.pool?.pool5MinData

					break
				}
			}

			if (!data) {
				throw new Error("No pool found")
			}

			const graph = aggregateByInterval(
				data.map((item) => ({
					...item,
					volumeUSD: Number(item.volumeUSD),
				})),
				config.interval,
				"volumeUSD",
				[startDate.add(config.interval), dayjs()],
			)

			await this.cacheRepository.set(cacheKey, graph, poolVolTtl)

			return graph
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(`Failed to fetch pool volume: ${error.message}`)
			}
			throw new Error("Unknown error")
		}
	}

	async getPoolPrice(_poolAddress: string, timeframe: PoolDataTimeframe = "D"): Promise<ChartData[]> {
		const poolAddress = _poolAddress.toLowerCase()
		const cacheKey = RedisKey.pool(poolAddress).priceChart(timeframe)

		try {
			const cachedValue = await this.cacheRepository.get<ChartData[]>(cacheKey)
			if (cachedValue) return cachedValue

			const config = POOL_PRICE_GRAPH_CONFIG[timeframe]
			const startDate = dayjs().subtract(config.duration)

			let data: ({ timestamp: number; sqrtPrice: string } | null)[] | undefined

			const getItemCount = (itemInterval: plugin.Duration) => {
				return Math.ceil(config.duration.asMilliseconds() / itemInterval.asMilliseconds()) + 1
			}

			switch (timeframe) {
				case "Y": {
					const res = await this.subgraphRepo.execute(GetPoolPriceDayQuery, {
						poolId: poolAddress,
						first: getItemCount(dayjs.duration(1, "day")),
					})
					data = res.pool?.poolDayData

					break
				}

				case "M":
				case "W":
				case "D": {
					const res = await this.subgraphRepo.execute(GetPoolPriceHourQuery, {
						poolId: poolAddress,
						first: getItemCount(dayjs.duration(1, "hour")),
					})
					data = res.pool?.poolHourData

					break
				}

				case "H": {
					const res = await this.subgraphRepo.execute(GetPoolPrice5MinuteQuery, {
						poolId: poolAddress,
						first: getItemCount(dayjs.duration(5, "minute")),
					})
					data = res.pool?.pool5MinData

					break
				}
			}

			if (!data) {
				throw new Error("Pool price not found")
			}

			const formattedData = data
				.filter((x) => x !== null)
				.map(({ timestamp, sqrtPrice }) => ({
					timestamp: timestamp,
					data: parseSqrtPrice(sqrtPrice),
				}))
				.sort((a, b) => a.timestamp - b.timestamp) // sort by timestamp ascending

			const result = formatByInterval(formattedData, startDate, config.interval)

			await this.cacheRepository.set(cacheKey, result, poolPriceTtl)

			return result
		} catch (error) {
			Logger.error("Failed to fetch pool price", {
				event: "fetch_pool_price",
				err: error,
				poolAddress: poolAddress,
				timeframe: timeframe,
			})
			if (error instanceof Error) {
				throw new Error(`Failed to fetch pool price: ${error.message}`)
			}
			throw new Error("Unknown error")
		}
	}
}
