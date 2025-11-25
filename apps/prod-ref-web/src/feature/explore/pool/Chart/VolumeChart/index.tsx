import BigNumber from "bignumber.js"
import dayjs from "dayjs"
import { Bar, BarChart, XAxis } from "recharts"

import { ChartData } from "@rabbitswap/api-core/dto"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@rabbitswap/ui/basic"
import { useTheme } from "@rabbitswap/ui/providers"
import { PropsWithClassName, cn } from "@rabbitswap/ui/utils"

import { BarChartLoading } from "@/components/ChartLoading"
import { formatFee } from "@/constants/dex"
import { chartStyles } from "@/feature/explore/constants"
import { formatDisplayNumber, formatFiatValue } from "@/utils/number"

import { usePoolChart } from "../context"

import { useVolumeChartState } from "./useVolumeChartState"

interface PoolVolumeChartProps extends PropsWithClassName {}

export const PoolVolumeChart: React.FC<PoolVolumeChartProps> = ({ className }) => {
	const { chartTimeFrame, pool } = usePoolChart()
	const { theme } = useTheme()
	const styles = chartStyles(theme).volume

	const { displayData, setActivePayload, activePayload, chartData, isLoading, isFetched } = useVolumeChartState()

	return (
		<div className={cn("size-full", className)}>
			<div className="flex flex-col gap-2">
				<div className="text-xl tabular-nums lg:text-[32px]">
					{formatFiatValue(displayData.volume, { showLessThanSymbol: false, showFullValue: true })}
				</div>
				<div className="text-xs text-gray-800 dark:text-gray-200 lg:text-sm">{displayData.label}</div>
			</div>
			{isLoading || !isFetched ? (
				<BarChartLoading className="h-[calc(100%-50px)] w-full" />
			) : (
				<ChartContainer
					config={{}}
					className="h-[calc(100%-50px)] w-full"
					onMouseLeave={() => {
						setActivePayload(undefined)
					}}
				>
					<BarChart
						data={chartData}
						onMouseMove={(chart) => {
							// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
							setActivePayload(chart.activePayload?.[0].payload as ChartData)
						}}
					>
						<XAxis
							dataKey="timestamp"
							tickLine={false}
							axisLine={false}
							tickMargin={8}
							minTickGap={32}
							tickFormatter={(value: ChartData["timestamp"]) => {
								switch (chartTimeFrame) {
									case "H": {
										return dayjs.unix(value).format("HH:mm")
									}
									case "D": {
										return dayjs.unix(value).format("HH:mm")
									}
									case "W": {
										return dayjs.unix(value).format("MMM D")
									}
									case "M": {
										return dayjs.unix(value).format("MMM D")
									}
									case "Y": {
										return dayjs.unix(value).format("MMM YYYY")
									}
								}
							}}
							interval="preserveEnd"
						/>
						<ChartTooltip
							cursor={{ fill: styles.activeBarBg }}
							content={
								<ChartTooltipContent
									hideLabel
									formatter={(value) => (
										<div className="flex w-full items-center gap-2">
											<div className="grow">Fees: </div>
											{pool && (
												<div>${formatDisplayNumber(BigNumber(value.toString()).multipliedBy(formatFee(pool.fee)))}</div>
											)}
										</div>
									)}
								/>
							}
						/>
						<Bar
							dataKey="data"
							type="natural"
							fill={activePayload ? styles.bar.dimmedColor : styles.bar.normalColor}
							radius={styles.bar.radius}
							activeBar={{
								fill: styles.bar.activeColor,
							}}
						/>
					</BarChart>
				</ChartContainer>
			)}
		</div>
	)
}
