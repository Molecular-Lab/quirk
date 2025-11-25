import { initServer } from "@ts-rest/fastify"

import { exploreContract } from "@rabbitswap/api-core/contracts/explore"

import { ExploreService } from "@/service"
import { withLock } from "@/utils/cacheLock"

export const createExploreRouter = (
	s: ReturnType<typeof initServer>,
	{ exploreService }: { exploreService: ExploreService },
) => {
	return s.router(exploreContract, {
		protocolTvl: async () => {
			try {
				const cacheKey = "explore:protocolTvl"
				const data = await withLock(cacheKey, async () => {
					return exploreService.getTVLGraph()
				})
				const fixedData = data.filter((x) => x.timestamp !== 1744934400)

				return {
					status: 200,
					body: {
						result: fixedData,
					},
				}
			} catch (error) {
				return {
					status: 500,
					body: {
						errorCode: "INTERNAL_ERROR",
						message: `Internal server error: ${error}`,
					},
				}
			}
		},

		protocolVolume: async ({ query: { timeframe } }) => {
			try {
				const cacheKey = `explore:protocolVolume:${timeframe}`
				const data = await withLock(cacheKey, async () => {
					return exploreService.getVolumeGraph(timeframe)
				})

				return {
					status: 200,
					body: {
						result: data,
					},
				}
			} catch (error) {
				return {
					status: 500,
					body: {
						errorCode: "INTERNAL_ERROR",
						message: `Internal server error: ${error}`,
					},
				}
			}
		},

		pools: async ({ query }) => {
			try {
				const cacheKey = `explore:pools:${query.sortBy}-${query.sortDirection}`
				const data = await withLock(cacheKey, async () => {
					return exploreService.getPoolsStats(query.sortBy, query.sortDirection)
				})
				return {
					status: 200,
					body: {
						result: data,
					},
				}
			} catch (error) {
				return {
					status: 500,
					body: {
						errorCode: "INTERNAL_ERROR",
						message: `Internal server error: ${error}`,
					},
				}
			}
		},

		pool: async ({ params: { address } }) => {
			try {
				const cacheKey = `explore:pool:${address}`
				const data = await withLock(cacheKey, async () => {
					return exploreService.getPoolStats(address)
				})
				return {
					status: 200,
					body: {
						result: data,
					},
				}
			} catch (error) {
				if (error instanceof Error) {
					if (error.message.includes("not found")) {
						return {
							status: 404,
							body: {
								errorCode: "NOT_FOUND",
								message: error.message,
							},
						}
					}
				}
				return {
					status: 500,
					body: {
						errorCode: "INTERNAL_ERROR",
						message: `Internal server error: ${error}`,
					},
				}
			}
		},

		poolTicks: async ({ params: { address } }) => {
			try {
				const cacheKey = `explore:poolTicks:${address}`
				const data = await withLock(cacheKey, async () => {
					return exploreService.getPoolTicks(address)
				})
				return {
					status: 200,
					body: {
						result: data,
					},
				}
			} catch (error) {
				return {
					status: 500,
					body: {
						errorCode: "INTERNAL_ERROR",
						message: `Internal server error: ${error}`,
					},
				}
			}
		},

		poolPrice: async ({ params: { address }, query: { timeframe } }) => {
			try {
				const cacheKey = `explore:poolPrice:${address}-${timeframe}`
				const data = await withLock(cacheKey, async () => {
					return exploreService.getPoolPrice(address, timeframe)
				})
				return {
					status: 200,
					body: {
						result: data,
					},
				}
			} catch (error) {
				if (error instanceof Error) {
					if (error.message.includes("not found")) {
						return {
							status: 404,
							body: {
								errorCode: "NOT_FOUND",
								message: error.message,
							},
						}
					}
				}
				return {
					status: 500,
					body: {
						errorCode: "INTERNAL_ERROR",
						message: `Internal server error: ${error}`,
					},
				}
			}
		},

		poolVolume: async ({ params: { address }, query: { timeframe } }) => {
			try {
				const cacheKey = `explore:poolVolume:${address}-${timeframe}`
				const data = await withLock(cacheKey, async () => {
					return exploreService.getPoolVolume(address, timeframe)
				})

				return {
					status: 200,
					body: {
						result: data,
					},
				}
			} catch (error) {
				return {
					status: 500,
					body: {
						errorCode: "INTERNAL_ERROR",
						message: `Internal server error: ${error}`,
					},
				}
			}
		},

		poolTransactions: async ({ params: { address } }) => {
			try {
				const cacheKey = `explore:poolTransactions:${address}`
				const data = await withLock(cacheKey, async () => {
					return exploreService.getPoolTransactions(address)
				})
				return {
					status: 200,
					body: {
						result: data,
					},
				}
			} catch (error) {
				return {
					status: 500,
					body: {
						errorCode: "INTERNAL_ERROR",
						message: `Internal server error: ${error}`,
					},
				}
			}
		},
	})
}
