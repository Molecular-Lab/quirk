import { Bar, BarChart } from "recharts"

import { ChartContainer, ChartTooltip, ShapeSkeleton } from "@rabbitswap/ui/basic"
import { useTheme } from "@rabbitswap/ui/providers"
import { PropsWithClassName, cn } from "@rabbitswap/ui/utils"

import { BarChartLoading } from "@/components/ChartLoading"
import { chartStyles } from "@/feature/explore/constants"

import { usePoolChart } from "../context"

import { LiquidityData, useLiquidityChartState } from "./useLiquidityChartState"
import { BarData } from "./utils"

interface PoolLiquidityChartProps extends PropsWithClassName {
	inverted: boolean
}

export const PoolLiquidityChart: React.FC<PoolLiquidityChartProps> = ({ className, inverted }) => {
	const { pool } = usePoolChart()
	const { displayData, setActivePayload, chartData, activePayload, currentTickIndex, isLoading, isFetched } =
		useLiquidityChartState(inverted)
	const { theme } = useTheme()
	const styles = chartStyles(theme).liquidity

	return (
		<div className={cn("size-full", className)}>
			<div className="relative size-full">
				<div className="absolute bottom-0 size-full pt-20">
					{isLoading || !isFetched ? (
						<BarChartLoading className="pt-[5%]" />
					) : (
						<ChartContainer
							config={{}}
							className="size-full"
							onMouseLeave={() => {
								setActivePayload(undefined)
							}}
						>
							<BarChart
								accessibilityLayer
								data={chartData}
								onMouseMove={(chart) => {
									// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
									setActivePayload(chart.activePayload?.[0].payload as LiquidityData | undefined)
								}}
							>
								<ChartTooltip
									cursor={{ fill: styles.activeBarBg }}
									content={({ payload }) => {
										if (!payload?.[0]) return null

										const p = payload[0].payload as BarData

										return (
											<div className="rounded-lg border bg-white p-3 dark:bg-gray-950">
												<div className="flex w-full flex-col items-center gap-2">
													<div className="flex w-full items-center justify-between gap-1">
														<div>{pool?.token0.symbol ?? "Token0"} liquidity:</div>
														<div>{p.amount0Locked}</div>
													</div>

													<div className="flex w-full items-center justify-between gap-1">
														<div>{pool?.token1.symbol ?? "Token1"} liquidity:</div>
														<div>{p.amount1Locked}</div>
													</div>
												</div>
											</div>
										)
									}}
								/>
								<Bar
									dataKey="displayLiquidity0"
									stackId="a"
									radius={0}
									fill={styles.token0}
									activeBar={{
										fill: styles.token0Active,
									}}
									activeIndex={activePayload ? undefined : currentTickIndex}
								/>
								<Bar
									dataKey="displayLiquidity1"
									stackId="a"
									radius={0}
									fill={styles.token1}
									activeBar={{
										fill: styles.token1Active,
									}}
									activeIndex={activePayload ? undefined : currentTickIndex}
								/>
							</BarChart>
						</ChartContainer>
					)}
				</div>
				<div className="absolute left-0 top-0 flex flex-col gap-y-0.5">
					{pool ? (
						<div className="whitespace-nowrap text-xl lg:text-2xl">
							1 {pool.token0.symbol} = {displayData.token0Price} {pool.token1.symbol}
						</div>
					) : (
						<ShapeSkeleton className="h-6" />
					)}
					{pool ? (
						<div className="whitespace-nowrap text-xl lg:text-2xl">
							1 {pool.token1.symbol} = {displayData.token1Price} {pool.token0.symbol}
						</div>
					) : (
						<ShapeSkeleton className="h-6" />
					)}
					<div className="text-xs text-gray-600 dark:text-gray-400 lg:mt-1 lg:text-sm">{displayData.subTitle}</div>
				</div>
			</div>
		</div>
	)
}
