import { useQuery } from "@tanstack/react-query"
import BigNumber from "bignumber.js"

import { ChartData, PoolDataTimeframe } from "@rabbitswap/api-core/dto"

import apiClient from "@/api/core"
import { QueryKeys } from "@/config/queryKey"
import { Pool } from "@/types/pool"

export const usePriceChartData = (pool: Pool | null | undefined, chartTimeFrame: PoolDataTimeframe) => {
	const query = useQuery<ChartData[]>({
		queryKey: QueryKeys.explore.poolPrices(pool?.address, pool?.chainId, chartTimeFrame),
		queryFn: async () => {
			if (!pool?.address) throw new Error("Pool is undefined")

			const poolPrice = await apiClient.exploreRouter.getPoolPrice(pool.address, chartTimeFrame)
			return poolPrice.map<ChartData>((item) => ({
				...item,
				data: BigNumber(item.data)
					.shiftedBy(pool.token0.decimals - pool.token1.decimals)
					.toNumber(),
			}))
		},
		enabled: !!pool && !!pool.address,
	})
	return query
}
