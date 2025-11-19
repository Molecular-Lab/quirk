import { useMemo, useState } from "react"

import BigNumber from "bignumber.js"

import { ChartData, PoolDataTimeframe } from "@rabbitswap/api-core/dto"

import { usePriceChartData } from "@/feature/explore/pool/Chart/PriceChart/usePriceChartData"
import { Pool } from "@/types/pool"

export const usePriceChartState = ({
	inverted,
	pool,
	chartTimeFrame,
}: {
	inverted?: boolean
	pool: Pool | null | undefined
	chartTimeFrame: PoolDataTimeframe
}) => {
	const [activePayload, setActivePayload] = useState<ChartData>()

	const { data: priceData, isLoading } = usePriceChartData(pool, chartTimeFrame)

	const chartData = useMemo<ChartData[]>(() => {
		if (priceData === undefined) return []
		if (inverted) {
			return priceData.map<ChartData>((item) => ({
				...item,
				data: item.data !== 0 ? BigNumber(1).dividedBy(item.data).toNumber() : 0,
			}))
		}
		return priceData
	}, [inverted, priceData])

	const { minValue, minValueIndex, maxValue, maxValueIndex, firstData, lastData } = useMemo(() => {
		const minValue = Math.min(...chartData.map((data) => data.data))
		const maxValue = Math.max(...chartData.map((data) => data.data))
		const minValueIndex = chartData.findIndex(({ data }) => data === minValue)
		const maxValueIndex = chartData.findIndex(({ data }) => data === maxValue)
		return {
			minValue: minValue,
			minValueIndex: minValueIndex,
			maxValue: maxValue,
			maxValueIndex: maxValueIndex,
			firstData: chartData[0],
			lastData: chartData[chartData.length - 1],
		}
	}, [chartData])

	const currentValue = useMemo<number | undefined>(() => {
		return lastData?.data
	}, [lastData])

	const displayPrice = useMemo<BigNumber | undefined>(() => {
		if (activePayload) {
			return BigNumber(activePayload.data)
		}
		if (lastData) {
			return BigNumber(lastData.data)
		}
		return undefined
	}, [activePayload, lastData])

	const priceChangePercent = useMemo<number>(() => {
		if (firstData === undefined || firstData.data === 0) {
			return 0
		}
		return (((displayPrice?.toNumber() ?? 0) - firstData.data) / firstData.data) * 100
	}, [displayPrice, firstData])

	return {
		setActivePayload,
		activePayload,
		chartData,
		minValue,
		currentValue,
		maxValue,
		minValueIndex,
		maxValueIndex,
		displayPrice,
		priceChangePercent,
		isLoading,
	}
}
