import { createContext, useContext } from "react"

import { PoolDataTimeframe } from "@rabbitswap/api-core/dto"

import { Pool } from "@/types/pool"

import { PoolChartType } from "./type"

interface PoolChartContextData {
	pool: Pool | undefined
	chartType: PoolChartType
	setChartType: (_: PoolChartType) => void
	chartTimeFrame: PoolDataTimeframe
	setChartTimeFrame: (_: PoolDataTimeframe) => void
}

export const PoolChartContext = createContext<PoolChartContextData>({
	pool: undefined,
	chartType: "VOL",
	setChartType: () => {},
	chartTimeFrame: "M",
	setChartTimeFrame: () => {},
})

export const usePoolChart = () => {
	const ctx = useContext(PoolChartContext)

	return ctx
}
