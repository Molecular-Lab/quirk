import React, { useMemo, useState } from "react"

import { useQuery } from "@tanstack/react-query"
import dayjs from "dayjs"

import { ChartData } from "@rabbitswap/api-core/dto"

import apiClient from "@/api/core"
import { QueryKeys } from "@/config/queryKey"

import { usePoolChart } from "../context"

export const useVolumeChartState = () => {
	const [activePayload, setActivePayload] = useState<ChartData>()
	const { chartTimeFrame, pool } = usePoolChart()

	const {
		data: chartData,
		isLoading,
		isFetched,
	} = useQuery<ChartData[]>({
		queryKey: QueryKeys.explore.poolVolume(pool?.address, pool?.chainId, chartTimeFrame),
		queryFn: async () => {
			if (!pool?.address) throw new Error("Pool is undefined")

			const poolVolume = await apiClient.exploreRouter.getPoolVolume(pool.address, chartTimeFrame)
			return poolVolume
		},
		enabled: !!pool && !!pool.address,
	})

	const displayRange = useMemo(() => {
		switch (chartTimeFrame) {
			case "H": {
				return "Past hour"
			}
			case "D": {
				return "Past day"
			}
			case "W": {
				return "Past week"
			}
			case "M": {
				return "Past month"
			}
			case "Y": {
				return "Past year"
			}
		}
	}, [chartTimeFrame])

	const displayData = useMemo<{
		volume: number | undefined
		label: React.ReactNode
	}>(() => {
		if (activePayload) {
			return {
				volume: activePayload.data,
				label: dayjs.unix(activePayload.timestamp).format("MMM DD, YYYY, HH:mm"),
			}
		}
		return {
			volume: chartData?.reduce((acc, curr) => acc + curr.data, 0),
			label: displayRange,
		}
	}, [activePayload, chartData, displayRange])

	return {
		displayData,
		setActivePayload,
		activePayload,
		chartData,
		isLoading,
		isFetched,
	}
}
