import { initServer } from "@ts-rest/fastify"
import { getAddress, isAddress } from "viem"

import { poolContract } from "@rabbitswap/api-core/contracts/pool"
import { PoolLiquidityDistribution } from "@rabbitswap/api-core/dto"

import { PoolService } from "@/service"
import { withLock } from "@/utils/cacheLock"

export function createPoolRouter(s: ReturnType<typeof initServer>, { poolService }: { poolService: PoolService }) {
	return s.router(poolContract, {
		getPoolLiquidityDistribution: async ({ query: { token0, token1 } }) => {
			if (!isAddress(token0) || !isAddress(token1)) {
				return {
					status: 400,
					body: {
						errorCode: "INVALID_TOKEN_ADDRESS",
						message: "Invalid token address",
					},
				}
			}

			const token0Address = getAddress(token0)
			const token1Address = getAddress(token1)

			const cacheKey = `pool:tokenPairPools:${token0Address}-${token1Address}`
			const tokenPools = await withLock(cacheKey, async () => {
				return poolService.getTokenPairPoolsData([token0Address, token1Address])
			})

			const resp = tokenPools.map<PoolLiquidityDistribution>((pool) => ({
				feeTier: pool.feeRate,
				liquidity: pool.liquidity,
				totalValueLockedUSD: pool.totalValueLockedUSD,
			}))

			return {
				status: 200,
				body: resp,
			}
		},
	})
}
