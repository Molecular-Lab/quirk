import React, { useMemo, useState } from "react"

import dayjs from "dayjs"
import { Area, AreaChart, ReferenceLine, XAxis, YAxis } from "recharts"

import { ChartData, PoolDataTimeframe } from "@rabbitswap/api-core/dto"
import { ChartContainer, ChartTooltip, ReferenceLabel } from "@rabbitswap/ui/basic"
import { useBreakpoints } from "@rabbitswap/ui/hooks"
import { useTheme } from "@rabbitswap/ui/providers"
import { PropsWithClassName, cn } from "@rabbitswap/ui/utils"

import { AreaChartLoading } from "@/components/ChartLoading"
import { PercentChange } from "@/components/PercentChange"
import { chartStyles } from "@/feature/explore/constants"
import { useRepresentativePool } from "@/hooks/liquidity/useRepresentativePool"
import { Pool } from "@/types/pool"
import { Price } from "@/types/price"
import { EvmToken } from "@/types/tokens"
import { formatDisplayNumber } from "@/utils/number"

import { ChartTimeFrameController } from "./ChartTimeFrameController"
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

interface LimitOrderPriceChartProps extends PropsWithClassName {
	tokenIn: EvmToken | undefined
	tokenOut: EvmToken | undefined
	priceCondition?: Price | undefined
	side?: "Buy" | "Sell"
}

export const LimitOrderPriceChart: React.FC<LimitOrderPriceChartProps> = ({
	tokenIn,
	tokenOut,
	priceCondition,
	side,
	className,
}) => {
	const [chartTimeFrame, setChartTimeFrame] = useState<PoolDataTimeframe>("M")
	const { data: _pool, isLoading: isPoolLoading } = useRepresentativePool({ tokenA: tokenIn, tokenB: tokenOut })

	const pool = useMemo(() => {
		if (tokenIn?.isNative) {
			return _pool?.unwrapped
		}
		if (tokenOut?.isNative) {
			return _pool?.unwrapped
		}
		return _pool
	}, [_pool, tokenIn?.isNative, tokenOut?.isNative])

	const inverted = useMemo<boolean>(() => {
		return pool?.displayInverted ?? false
	}, [pool])

	const {
		chartData,
		setActivePayload,
		currentValue,
		minValue,
		maxValue,
		minValueIndex,
		maxValueIndex,
		displayPrice,
		activePayload,
		priceChangePercent,
		isLoading,
	} = usePriceChartState({ inverted, pool, chartTimeFrame })

	return (
		<div className={cn("flex w-full flex-col gap-2", className)}>
			<div className={cn("flex flex-col gap-y-0.5", !!pool && "w-full")}>
				<PoolPriceChartTitle
					inverted={inverted}
					price={displayPrice}
					pool={pool}
					isLoading={isLoading || isPoolLoading}
				/>
				<div className="flex h-4 items-center gap-2 text-xs lg:text-sm">
					{pool && (
						<>
							<PercentChange value={priceChangePercent} isLoading={isLoading} />
							{activePayload && (
								<div className="text-gray-600 dark:text-gray-400">
									{dayjs.unix(activePayload.timestamp).format("MMM DD, YYYY, HH:mm")}
								</div>
							)}
						</>
					)}
				</div>
			</div>
			<div className="mx-auto size-full max-w-screen-md flex-1 grow xl:max-w-none">
				<MainChartArea
					pool={pool}
					chartData={chartData}
					chartTimeFrame={chartTimeFrame}
					isLoading={isLoading}
					currentValue={currentValue}
					minValue={minValue}
					minValueIndex={minValueIndex}
					maxValue={maxValue}
					maxValueIndex={maxValueIndex}
					priceCondition={priceCondition}
					activePayload={activePayload}
					setActivePayload={setActivePayload}
					side={side}
				/>
			</div>
			<ChartTimeFrameController chartTimeFrame={chartTimeFrame} setChartTimeFrame={setChartTimeFrame} />
		</div>
	)
}

const MainChartArea: React.FC<{
	pool: Pool | null | undefined
	chartData: ChartData[]
	chartTimeFrame: PoolDataTimeframe
	isLoading: boolean
	currentValue: number | undefined
	minValue: number | undefined
	minValueIndex: number
	maxValue: number | undefined
	maxValueIndex: number
	priceCondition: Price | undefined
	activePayload: ChartData | undefined
	setActivePayload: (payload: ChartData | undefined) => void
	side?: "Buy" | "Sell"
}> = ({
	pool,
	chartData,
	chartTimeFrame,
	isLoading,
	currentValue,
	minValueIndex,
	maxValueIndex,
	priceCondition,
	activePayload,
	setActivePayload,
	side,
}) => {
	const { theme } = useTheme()
	const styles = useMemo(() => chartStyles(theme).price, [theme])
	const { isMdUp } = useBreakpoints()

	const dataLength = useMemo(() => chartData.length, [chartData.length])

	if (isLoading) {
		return <AreaChartLoading className="size-full xl:aspect-[3/2]" />
	}
	if (!pool || chartData.length === 0) {
		return (
			<div className="flex size-full items-center justify-center text-center text-gray-500 xl:aspect-[3/2]">
				Chart is not available for this token pair
			</div>
		)
	}
	return (
		<ChartContainer
			config={{}}
			className="aspect-[4/3] size-full md:aspect-video xl:aspect-[3/2]"
			onMouseLeave={() => {
				setActivePayload(undefined)
			}}
		>
			<AreaChart
				data={chartData}
				className="h-full"
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
					domain={([dMin, dMax]) => {
						const center = (dMin + dMax) / 2
						const scaleFactor = 0.125
						const [min, max] = [dMin - (center - dMin) * scaleFactor, dMax + (dMax - center) * scaleFactor]
						if (!priceCondition?.value) {
							return [min, max]
						}
						if (priceCondition.value.lt(min)) {
							const newMin = priceCondition.value.toNumber()
							const newCenter = (newMin + max) / 2
							return [newMin - (newCenter - newMin) * scaleFactor, max]
						}
						if (priceCondition.value.gt(max)) {
							const newMax = priceCondition.value.toNumber()
							const newCenter = (min + newMax) / 2
							return [min, newMax + (newMax - newCenter) * scaleFactor]
						}
						return [min, max]
					}}
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

				{/* current price */}
				<ReferenceLine
					y={activePayload ? currentValue : undefined}
					stroke={styles.reference.lineColor}
					strokeDasharray="2.5 2.5"
					strokeWidth={styles.reference.lineWidthCurrent}
					label={
						<ReferenceLabel
							value={formatDisplayNumber(currentValue, { precision: 3, toFixed: true })}
							backgroundColor={styles.reference.labelBg}
							fill={styles.reference.labelText}
						/>
					}
				/>

				{/* input price */}
				<ReferenceLine
					y={priceCondition?.value?.toNumber()}
					stroke={side ? styles.reference[side].lineColor : styles.reference.lineColor}
					strokeWidth={2}
					className="hidden lg:block"
					label={
						<ReferenceLabel
							value={formatDisplayNumber(priceCondition?.value, { precision: 3, toFixed: true })}
							backgroundColor={side ? styles.reference[side].labelBg : styles.reference.labelBg}
							fill={side ? styles.reference[side].labelText : styles.reference.labelText}
						/>
					}
				/>

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
	)
}
