import { useMemo, useState } from "react"

import { PoolDataTimeframe } from "@rabbitswap/api-core/dto"

import { Pool } from "@/types/pool"

import { PoolChartContext } from "./context"
import { ChartController } from "./controller"
import { PoolLiquidityChart } from "./LiquidityChart"
import { PoolPriceChart } from "./PriceChart"
import { PoolChartType } from "./type"
import { PoolVolumeChart } from "./VolumeChart"

export const PoolChart: React.FC<{ pool: Pool | undefined; inverted: boolean }> = ({ pool, inverted }) => {
	const [chartType, setChartType] = useState<PoolChartType>("VOL")
	const [chartTimeFrame, setChartTimeFrame] = useState<PoolDataTimeframe>("D")

	const chart = useMemo(() => {
		switch (chartType) {
			case "VOL": {
				return <PoolVolumeChart />
			}
			case "PRICE": {
				return <PoolPriceChart inverted={inverted} />
			}
			case "LIQ": {
				return <PoolLiquidityChart inverted={inverted} />
			}
		}
	}, [chartType, inverted])

	return (
		<PoolChartContext.Provider value={{ pool, chartType, setChartType, chartTimeFrame, setChartTimeFrame }}>
			<div className="flex flex-col gap-7">
				<div className="h-[302px] lg:h-[362px]">{chart}</div>
				<ChartController />
			</div>
		</PoolChartContext.Provider>
	)
}
