import { useQuery } from "@tanstack/react-query"

import { ChartData, ProtocolChartTimeframe } from "@rabbitswap/api-core/dto"

import apiClient from "@/api/core"
import { QueryKeys } from "@/config/queryKey"

export const useVolumeChartData = (timeframe: ProtocolChartTimeframe) => {
	return useQuery<ChartData[]>({
		queryKey: QueryKeys.explore.volume(timeframe),
		queryFn: async () => {
			const volData = await apiClient.exploreRouter.getVolumeData(timeframe)
			return volData
		},
	})
}
