import { useMemo, useState } from "react"

import { useQuery } from "@tanstack/react-query"
import dayjs from "dayjs"

import { ChartData, ProtocolChartTimeframe } from "@rabbitswap/api-core/dto"

import apiClient from "@/api/core"
import { QueryKeys } from "@/config/queryKey"

export const useVolumeChartState = () => {
	const [activePayload, setActivePayload] = useState<ChartData>()
	const [barRange, setBarRange] = useState<ProtocolChartTimeframe>("D")

	const { data: chartData, isLoading } = useQuery<ChartData[]>({
		queryKey: QueryKeys.explore.volume(barRange),
		queryFn: async () => {
			const volData = await apiClient.exploreRouter.getVolumeData(barRange)
			return volData
		},
	})

	const displayData = useMemo<{ volume: number; label: string } | undefined>(() => {
		if (!chartData) return undefined
		if (activePayload) {
			return {
				volume: activePayload.data,
				label: dayjs.unix(activePayload.timestamp).format("MMM DD, YYYY"),
			}
		}
		return {
			volume: chartData.reduce((acc, curr) => acc + curr.data, 0),
			label: barRange === "D" ? "Past month" : barRange === "W" ? "Past year" : "All time",
		}
	}, [activePayload, chartData, barRange])

	return { displayData, setActivePayload, activePayload, chartData, barRange, setBarRange, isLoading }
}
