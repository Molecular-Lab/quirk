import { useQueries, useQuery } from "@tanstack/react-query"

import { ExplorePoolStats } from "@rabbitswap/api-core/dto"

import apiClient from "@/api/core"
import { QueryKeys } from "@/config/queryKey"
import { Pool } from "@/types/pool"

export const usePoolStats = (pool: Pool | undefined) => {
	const query = useQuery<ExplorePoolStats>({
		queryKey: QueryKeys.explore.poolStats(pool?.address, pool?.chainId),
		queryFn: () => apiClient.exploreRouter.getPool(pool!.address!),
		enabled: !!pool && !!pool.address,
		refetchInterval: 60_000, // 1 minute
	})
	return query
}

export const usePoolsStats = (pools: (Pool | undefined)[]) => {
	return useQueries({
		queries: pools.map((pool) => {
			return {
				queryKey: QueryKeys.explore.poolStats(pool?.address, pool?.chainId),
				queryFn: () => apiClient.exploreRouter.getPool(pool!.address!),
				enabled: !!pool && !!pool.address,
				refetchInterval: 60_000, // 1 minute
			}
		}),
		combine: (results) => {
			return {
				data: results.map((result) => result.data).filter((data) => !!data),
				isLoading: results.some((result) => result.isLoading),
			}
		},
	})
}
