import { useQuery } from "@tanstack/react-query"

import { TickData } from "@rabbitswap/api-core/dto"

import apiClient from "@/api/core"
import { QueryKeys } from "@/config/queryKey"
import { Pool } from "@/types/pool"

export const usePoolTick = (pool: Pool | undefined, options?: { retry?: boolean }) => {
	const query = useQuery<TickData[]>({
		queryKey: QueryKeys.explore.poolTicks(pool?.address, pool?.chainId),
		queryFn: async () => {
			if (!pool?.address) throw new Error("Pool is undefined")

			const ticks = await apiClient.exploreRouter.getPoolTicks(pool.address)
			return ticks
		},
		enabled: !!pool && !!pool.address,
		retry: options?.retry,
	})
	return query
}
