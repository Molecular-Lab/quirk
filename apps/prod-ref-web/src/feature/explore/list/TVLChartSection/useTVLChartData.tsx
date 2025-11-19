import { useQuery } from "@tanstack/react-query"

import { ChartData } from "@rabbitswap/api-core/dto"

import apiClient from "@/api/core"
import { QueryKeys } from "@/config/queryKey"

export const useTVLChartData = () => {
	return useQuery<ChartData[]>({
		queryKey: QueryKeys.explore.tvl(),
		queryFn: async () => {
			const tvlData = await apiClient.exploreRouter.getTvlData()
			return tvlData
		},
	})
}
