import { useMemo } from "react"

import dayjs from "dayjs"
import { Area, AreaChart, ReferenceLine, XAxis, YAxis } from "recharts"

import { ChartData } from "@rabbitswap/api-core/dto"
import { ChartContainer, ChartTooltip } from "@rabbitswap/ui/basic"
import { useBreakpoints } from "@rabbitswap/ui/hooks"
import { useTheme } from "@rabbitswap/ui/providers"
import { PropsWithClassName, cn } from "@rabbitswap/ui/utils"

import { AreaChartLoading } from "@/components/ChartLoading"
import { PercentChange } from "@/components/PercentChange"
import { chartStyles } from "@/feature/explore/constants"
import { formatDisplayNumber } from "@/utils/number"

import { usePoolChart } from "../context"

import { PoolPriceChartTitle } from "./title"
import { usePriceChartState } from "./usePriceChartState"

const CustomizedDot: React.FC<{ cx: number; cy: number; hideOuterGlow?: boolean }> = ({ cx, cy, hideOuterGlow }) => {
	const { theme } = useTheme()
	const styles = chartStyles(theme).price

	const dotSize = 10

	return (
		<>
			{/* active dot */}
			<svg x={cx - dotSize} y={cy - dotSize} width={1024} height={1024} viewBox="0 0 1024 1024">
				{/* outer glow color */}
				{!hideOuterGlow && (
					<circle cx={dotSize} cy={dotSize} r={styles.activeDot.outerSize} fill={styles.activeDot.outerColor} />
				)}
				{/* inner dot */}
				<circle cx={dotSize} cy={dotSize} r={styles.activeDot.innerSize} fill={styles.activeDot.innerColor} />
			</svg>
		</>
	)
}

interface PoolPriceChartProps extends PropsWithClassName {
	inverted: boolean
}

export const PoolPriceChart: React.FC<PoolPriceChartProps> = ({ className, inverted }) => {
	const {
		chartData,
		setActivePayload,
		minValueIndex,
		maxValueIndex,
		displayPrice,
		activePayload,
		priceChangePercent,
		isLoading,
		isFetched,
	} = usePriceChartState({ inverted })
	const { theme } = useTheme()
	const styles = chartStyles(theme).price

	const { isMdUp } = useBreakpoints()
	const { chartTimeFrame } = usePoolChart()

	const dataLength = useMemo(() => chartData.length, [chartData.length])

	return (
		<div className={cn("size-full", className)}>
			<div className="relative size-full">
				<div className="size-full pt-12">
					{isLoading || !isFetched ? (
						<AreaChartLoading />
					) : (
						<ChartContainer
							config={{}}
							className="size-full"
							onMouseLeave={() => {
								setActivePayload(undefined)
							}}
						>
							<AreaChart
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
								<YAxis
									hide={!isMdUp}
									dataKey="data"
									tickLine={false}
									axisLine={false}
									orientation="right"
									// tickFormatter={(value: ChartData["data"]) => formatDisplayNumber(value, { precision: 3 })}
									tickFormatter={(_: ChartData["data"]) => ""}
									domain={["auto", "auto"]}
								/>

								{/* min line */}
								{/* <ReferenceLine
									y={activePayload ? minValue : undefined}
									stroke={styles.reference.lineColor}
									strokeDasharray="5 5"
									strokeWidth={styles.reference.lineWidthMinMax}
									label={
										<ReferenceLabel
											value={formatDisplayNumber(minValue, { precision: 3 })}
											backgroundColor={styles.reference.labelBg}
											fill={styles.reference.labelText}
										/>
									}
								/> */}

								{/* max line */}
								{/* <ReferenceLine
									y={activePayload ? maxValue : undefined}
									stroke={styles.reference.lineColor}
									strokeDasharray="5 5"
									strokeWidth={styles.reference.lineWidthMinMax}
									label={
										<ReferenceLabel
											value={formatDisplayNumber(maxValue, { precision: 3 })}
											backgroundColor={styles.reference.labelBg}
											fill={styles.reference.labelText}
										/>
									}
								/> */}

								{/* crosshair line */}
								<ReferenceLine y={activePayload?.data} stroke={styles.reference.lineColor} />
								<ReferenceLine x={activePayload?.timestamp} stroke={styles.reference.lineColor} />

								{/* placeholder to keep the dot visible */}
								<ChartTooltip content={<></>} cursor={false} />

								{/* chart body */}
								<Area
									animationDuration={700}
									dataKey="data"
									type="linear"
									fill={styles.fill}
									stroke={styles.strokeColor}
									strokeWidth={styles.stokeWidth}
									activeDot={(props) => <CustomizedDot {...props} />}
									label={(props: { value: number; x: number; y: number; index: number }) => {
										const { value, x, y, index } = props
										if (index !== minValueIndex && index !== maxValueIndex) return <></>
										let textAnchor = "middle"
										if (index < 30) textAnchor = "start"
										if (index > dataLength - 10) textAnchor = "end"
										let labelY = y
										if (index === minValueIndex) labelY = y + 14
										if (index === maxValueIndex) labelY = y - 8

										return (
											<>
												<CustomizedDot cx={x} cy={y} hideOuterGlow />
												<text x={x} y={labelY} fontSize={10} textAnchor={textAnchor} fill={styles.strokeColor}>
													{formatDisplayNumber(value, { precision: 3, toFixed: true })}
												</text>
											</>
										)
									}}
								/>
							</AreaChart>
						</ChartContainer>
					)}
				</div>
				<div className="absolute left-0 top-0 flex flex-col gap-y-0.5">
					<PoolPriceChartTitle inverted={inverted} price={displayPrice} />
					<div className="flex items-center gap-2 text-xs lg:text-sm">
						<PercentChange value={priceChangePercent} />
						{activePayload && (
							<div className="text-gray-600 dark:text-gray-400">
								{dayjs.unix(activePayload.timestamp).format("MMM DD, YYYY, HH:mm")}
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}
