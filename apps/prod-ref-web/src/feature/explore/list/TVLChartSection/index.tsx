import { useState } from "react"

import dayjs from "dayjs"
import { Area, AreaChart, ReferenceLine, XAxis } from "recharts"

import { ChartData } from "@rabbitswap/api-core/dto"
import { ChartContainer, ChartTooltip, ChartTooltipContent, Skeleton } from "@rabbitswap/ui/basic"
import { useTheme } from "@rabbitswap/ui/providers"
import { cn } from "@rabbitswap/ui/utils"

import { AreaChartLoading } from "@/components/ChartLoading"
import { chartStyles } from "@/feature/explore/constants"
import { formatDisplayNumber, formatFiatValue } from "@/utils/number"

import { useTVLChartData } from "./useTVLChartData"

const CustomizedDot: React.FC<{ cx: number; cy: number }> = ({ cx, cy }) => {
	const { theme } = useTheme()
	const styles = chartStyles(theme).tvl

	const dotSize = 10

	return (
		<>
			{/* fill linear gradient after active dot */}
			<defs>
				<linearGradient id="gradientId" x1="0%" y1="0%" x2="100%" y2="0%">
					<stop offset="0%" style={{ stopColor: styles.overlay.gradientLeftColor, stopOpacity: 1 }} />
					<stop offset="2%" style={{ stopColor: styles.overlay.gradientRightColor, stopOpacity: 1 }} />
					<stop offset="100%" style={{ stopColor: styles.overlay.gradientRightColor, stopOpacity: 1 }} />
				</linearGradient>
			</defs>
			<rect x={cx - dotSize} y="-35" width="1024" height="100%" fill="url(#gradientId)" />

			{/* active dot */}
			<svg x={cx - dotSize} y={cy - dotSize} width={1024} height={1024} viewBox="0 0 1024 1024">
				{/* outer glow color */}
				<circle cx={dotSize} cy={dotSize} r={styles.activeDot.outerSize} fill={styles.activeDot.outerColor} />
				{/* inner dot */}
				<circle cx={dotSize} cy={dotSize} r={styles.activeDot.innerSize} fill={styles.activeDot.innerColor} />
			</svg>
		</>
	)
}

export const TVLChartSection: React.FC = () => {
	const [activePayload, setActivePayload] = useState<ChartData | undefined>(undefined)
	const { data: chartData, isLoading } = useTVLChartData()
	const data = activePayload ?? chartData?.[chartData.length - 1]
	const { theme } = useTheme()
	const styles = chartStyles(theme).tvl

	return (
		<div
			className={cn(
				"w-full",
				"rounded-xl bg-gray-50 p-3 dark:bg-gray-950",
				"flex flex-col gap-3 md:rounded-none md:bg-transparent md:p-0 md:dark:bg-transparent",
			)}
		>
			<div className="text-sm lg:text-base">RabbitSwap TVL</div>
			<Skeleton className="text-xl tabular-nums lg:text-[32px]" isLoading={isLoading} width={120}>
				{formatFiatValue(data?.data, { showFullValue: true })}
			</Skeleton>
			<Skeleton isLoading={!data} className={cn("text-xs lg:text-sm")} width={100}>
				{data && dayjs.unix(data.timestamp).format("MMM DD, YYYY")}
			</Skeleton>

			{isLoading ? (
				<AreaChartLoading className="hidden h-[250px] w-full md:flex" />
			) : (
				<ChartContainer
					config={{}}
					className="hidden h-[250px] w-full md:flex"
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
							tickFormatter={(value: ChartData["timestamp"]) => dayjs.unix(value).format("MMM DD, YYYY")}
							interval="preserveEnd"
						/>
						<ChartTooltip
							content={
								<ChartTooltipContent
									labelFormatter={(_, payload) => {
										const p = payload[0]?.payload as ChartData
										return dayjs.unix(p.timestamp).format("MMM DD, YYYY")
									}}
									formatter={(value) => (
										<div className="flex w-full items-center gap-2">
											<div className="size-2 rounded-sm bg-primary-500" />
											<div className="grow">TVL</div>
											<div>${formatDisplayNumber(value.toString())}</div>
										</div>
									)}
								/>
							}
						/>

						{/* crosshair line */}
						<ReferenceLine y={activePayload?.data} stroke={styles.reference.lineColor} />
						<ReferenceLine x={activePayload?.timestamp} stroke={styles.reference.lineColor} />

						{/* chart body */}
						<Area
							animationDuration={700}
							dataKey="data"
							type="monotone"
							fill={styles.fill}
							stroke={styles.strokeColor}
							strokeWidth={styles.stokeWidth}
							activeDot={(props) => <CustomizedDot {...props} />}
						/>
					</AreaChart>
				</ChartContainer>
			)}
		</div>
	)
}
