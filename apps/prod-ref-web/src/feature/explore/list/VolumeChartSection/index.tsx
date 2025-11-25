import dayjs from "dayjs"
import { Bar, BarChart, XAxis } from "recharts"

import { ChartData, ProtocolChartTimeframe } from "@rabbitswap/api-core/dto"
import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
	RadioButtonGroup,
	RadioOption,
	Skeleton,
} from "@rabbitswap/ui/basic"
import { useTheme } from "@rabbitswap/ui/providers"
import { cn } from "@rabbitswap/ui/utils"

import { BarChartLoading } from "@/components/ChartLoading"
import { chartStyles } from "@/feature/explore/constants"
import { formatDisplayNumber, formatFiatValue } from "@/utils/number"

import { useVolumeChartState } from "./useVolumeChartState"

const timeFrameOptions: RadioOption<ProtocolChartTimeframe>[] = [
	{ label: "D", value: "D" },
	{ label: "W", value: "W" },
	{ label: "M", value: "M" },
]

export const VolumeChartSection: React.FC = () => {
	const { displayData, setActivePayload, activePayload, chartData, barRange, setBarRange, isLoading } =
		useVolumeChartState()
	const { theme } = useTheme()
	const styles = chartStyles(theme).volume

	return (
		<div
			className={cn(
				"size-full flex-col justify-between gap-3",
				"rounded-xl bg-gray-50 p-3 dark:bg-gray-950",
				"md:rounded-none md:bg-transparent md:p-0 md:dark:bg-transparent",
				"hidden md:flex",
			)}
		>
			<div className="flex items-start justify-between">
				<div className="flex flex-col gap-3 md:gap-2 lg:gap-3">
					<div className="text-sm lg:text-base">RabbitSwap Volume</div>
					<Skeleton
						className="max-w-[320px] truncate text-xl tabular-nums md:text-3xl lg:text-[32px]"
						isLoading={isLoading}
						width={200}
					>
						{formatFiatValue(displayData?.volume, { showFullValue: true })}
					</Skeleton>
					<Skeleton className="text-xs text-gray-700 dark:text-gray-300 lg:text-sm" isLoading={isLoading} width={100}>
						{displayData?.label}
					</Skeleton>
				</div>
				<RadioButtonGroup
					className="hidden md:flex"
					itemClassName={cn("px-3 aria-[checked=false]:px-3")}
					size="sm"
					options={timeFrameOptions}
					value={barRange}
					onValueChange={(v) => {
						setBarRange(v as ProtocolChartTimeframe)
					}}
				/>
			</div>
			<div className="hidden md:flex">
				{isLoading ? (
					<BarChartLoading className="h-[250px]" />
				) : (
					<ChartContainer
						config={{}}
						className="hidden h-[250px] w-full md:flex"
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
									switch (barRange) {
										case "D": {
											return dayjs.unix(value).format("MMM DD")
										}
										case "W": {
											return dayjs.unix(value).format("MMM YYYY")
										}
										case "M": {
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
										labelFormatter={(_, payload) => {
											const p = payload[0]?.payload as ChartData
											return dayjs.unix(p.timestamp).format("MMM DD, YYYY")
										}}
										formatter={(value) => (
											<div className="flex w-full items-center gap-2">
												<div className="size-2 rounded-sm" style={{ backgroundColor: styles.bar.activeColor }} />
												<div className="grow">Volume</div>
												<div>${formatDisplayNumber(value.toString())}</div>
											</div>
										)}
									/>
								}
							/>
							<Bar
								dataKey="data"
								type="natural"
								fill={activePayload ? styles.bar.dimmedColor : styles.bar.normalColor}
								radius={4}
								activeBar={{
									fill: styles.bar.activeColor,
								}}
							/>
						</BarChart>
					</ChartContainer>
				)}
			</div>
		</div>
	)
}
