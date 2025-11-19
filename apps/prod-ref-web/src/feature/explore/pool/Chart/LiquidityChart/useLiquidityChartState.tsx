import { useMemo, useState } from "react"

import { usePoolTick } from "@/hooks/liquidity/usePoolTick"
import { tickToPrice } from "@/types/position/price"
import { formatDisplayNumber } from "@/utils/number"

import { usePoolChart } from "../context"

import { calculateBarData } from "./utils"

export interface LiquidityData {
	tick: number
	token0Amount: number
	token1Amount: number
}

export const useLiquidityChartState = (inverted: boolean) => {
	const { pool } = usePoolChart()
	const [activePayload, setActivePayload] = useState<LiquidityData>()

	const { data, isLoading, isFetched } = usePoolTick(pool)

	const { barData: chartData, activeTickIndex: currentTickIndex } = useMemo(() => {
		return calculateBarData(data, pool, inverted)
	}, [data, pool, inverted])

	const displayData = useMemo<{
		token0Price: React.ReactNode
		token1Price: React.ReactNode
		subTitle: React.ReactNode
	}>(() => {
		if (!activePayload || pool?.tickCurrent === activePayload.tick) {
			return {
				token0Price: pool ? formatDisplayNumber(pool.token0Price.value, { precision: 6 }) : "-",
				token1Price: pool ? formatDisplayNumber(pool.token1Price.value, { precision: 6 }) : "-",
				subTitle: activePayload ? "" : "Active tick range",
			}
		}
		return {
			token0Price: pool
				? formatDisplayNumber(tickToPrice(pool.token0, pool.token1, activePayload.tick).value, { precision: 6 })
				: "-",
			token1Price: pool
				? formatDisplayNumber(tickToPrice(pool.token0, pool.token1, activePayload.tick).invert().value, {
						precision: 6,
					})
				: "-",
			subTitle: "",
		}
	}, [activePayload, pool])

	return {
		displayData,
		setActivePayload,
		activePayload,
		chartData,
		currentTickIndex,
		isLoading,
		isFetched,
	}
}
