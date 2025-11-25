import { useMemo } from "react"

import BigNumber from "bignumber.js"
import JSBI from "jsbi"

import { ZERO } from "@/constants/jsbi"
import { usePoolTick } from "@/hooks/liquidity/usePoolTick"
import { Pool } from "@/types/pool"
import { tickToPrice } from "@/types/position/price"

import { ChartEntry } from "../types"

export const useDensityChartData = ({ pool }: { pool: Pool | undefined }) => {
	const { data, ...rest } = usePoolTick(pool, { retry: false })

	const formattedData = useMemo<ChartEntry[] | null | undefined>(() => {
		if (!data?.length || !pool) {
			return null
		}

		const newData: ChartEntry[] = []
		let liquidityActive = ZERO
		for (const { tick, liquidityNet } of data) {
			liquidityActive = JSBI.add(liquidityActive, JSBI.BigInt(liquidityNet))

			const chartEntry: ChartEntry = {
				activeLiquidity: BigNumber(liquidityActive.toString()),
				price: tickToPrice(pool.token0, pool.token1, tick),
				tick: tick,
			}

			newData.push(chartEntry)
		}

		return newData
	}, [data, pool])

	return useMemo(() => {
		return {
			...rest,
			formattedData: formattedData,
		}
	}, [formattedData, rest])
}
