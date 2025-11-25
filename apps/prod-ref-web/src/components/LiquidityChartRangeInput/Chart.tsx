import { useEffect, useMemo } from "react"

import { D3BrushEvent } from "d3"

import { Area } from "./Area"
import { AxisBottom } from "./AxisBottom"
import { Brush } from "./Brush"
import { useChartContext } from "./contexts/ChartContext"
import { Line } from "./Line"
import { xAccessor, yAccessor } from "./utils"
import { Zoom } from "./Zoom"

export interface ChartColors {
	area: {
		// color of the ticks in range
		selection: string
		// color of the exist liquidity
		liquidity: { west: string; east: string }
	}

	brush: {
		label: string
		handle: { west: string; east: string; bar: string }
		arrow: { west: string; east: string }
	}

	axis: {
		line: string
		centerLine: string
		text: string
	}
}

export const Chart: React.FC<{
	id?: string
	colors: ChartColors
	brushLabels: (d: "w" | "e", x: number) => string
	brushDomain?: [number, number]
	onBrushDomainChange: (domain: [number, number], mode: D3BrushEvent<unknown>["mode"] | "reset") => void
	showZoomButtons?: boolean
	ticksAtLimit: {
		lower?: boolean | undefined
		upper?: boolean | undefined
	}
}> = ({
	id = "liquidityChartRangeInput",
	colors,
	brushDomain,
	brushLabels,
	onBrushDomainChange,
	showZoomButtons = true,
	ticksAtLimit,
}) => {
	const chartContext = useChartContext()

	if (!chartContext) {
		throw new Error("ChartContext is not provided")
	}

	const {
		setZoom,
		zoomRef,
		xScale,
		yScale,
		leftSeries,
		rightSeries,
		series,
		innerHeight,
		innerWidth,
		zoomFn,
		width,
		height,
		margins,
		current,
		tokenA,
		zoomLevels,
	} = chartContext

	useEffect(() => {
		setZoom(null)
	}, [zoomLevels, setZoom])

	useEffect(() => {
		if (!brushDomain) {
			const [minValue, maxValue] = xScale.domain()
			if (!minValue || !maxValue) return
			onBrushDomainChange([minValue, maxValue], "reset")
		}
	}, [brushDomain, onBrushDomainChange, xScale])

	const brushExtent = useMemo<[number, number]>(() => {
		if (brushDomain) return brushDomain
		return xScale.domain() as [number, number]
	}, [brushDomain, xScale])

	return (
		<>
			{showZoomButtons && (
				<Zoom
					zoomFn={zoomFn}
					resetBrush={() => {
						const minValue = (current.value?.toNumber() ?? 0) * zoomLevels.initialMin
						const maxValue = (current.value?.toNumber() ?? 0) * zoomLevels.initialMax
						onBrushDomainChange([minValue, maxValue], "reset")
					}}
					showResetButton={Boolean((ticksAtLimit.lower ?? false) || (ticksAtLimit.upper ?? false))}
				/>
			)}
			<svg
				width="100%"
				height="100%"
				viewBox={`0 0 ${width} ${height}`}
				className="overflow-visible"
				style={{ maxHeight: height }}
			>
				<defs>
					<linearGradient id="right-area-gradient" x1="0" y1="0" x2="0" y2="1">
						<stop offset="5%" stopColor={colors.area.liquidity.east} stopOpacity={1} />
						<stop offset="100%" stopColor={colors.area.liquidity.east} stopOpacity={1} />
					</linearGradient>
					<linearGradient id="left-area-gradient" x1="0" y1="0" x2="0" y2="1">
						<stop offset="5%" stopColor={colors.area.liquidity.west} stopOpacity={1} />
						<stop offset="100%" stopColor={colors.area.liquidity.west} stopOpacity={1} />
					</linearGradient>
				</defs>
				<defs>
					<clipPath id={`${id}-chart-clip`}>
						<rect x="0" y="0" width={innerWidth} height={height} />
					</clipPath>

					{brushDomain && (
						// mask to highlight selected area
						<mask id={`${id}-chart-area-mask`}>
							<rect
								x={xScale(brushDomain[0])}
								y="0"
								width={xScale(brushDomain[1]) - xScale(brushDomain[0])}
								height={innerHeight}
							/>
						</mask>
					)}
				</defs>

				<g transform={`translate(${margins.left},${margins.top})`}>
					<g clipPath={`url(#${id}-chart-clip)`}>
						<Area
							series={leftSeries}
							xScale={xScale}
							yScale={yScale}
							xValue={(d) => xAccessor(d, tokenA)}
							yValue={yAccessor}
							opacity={1}
							fill="url(#left-area-gradient)"
						/>
						<Area
							series={rightSeries}
							xScale={xScale}
							yScale={yScale}
							xValue={(d) => xAccessor(d, tokenA)}
							yValue={yAccessor}
							opacity={1}
							fill="url(#right-area-gradient)"
						/>

						{brushDomain && (
							// duplicate area chart with mask for selected area
							<g mask={`url(#${id}-chart-area-mask)`}>
								<Area
									opacity={0.1}
									series={series}
									xScale={xScale}
									yScale={yScale}
									xValue={(d) => xAccessor(d, tokenA)}
									yValue={yAccessor}
									fill={colors.area.selection}
								/>
							</g>
						)}

						{/* current price line */}
						<Line
							value={current.value?.toNumber() ?? 0}
							xScale={xScale}
							innerHeight={innerHeight}
							color={colors.axis.centerLine}
						/>

						{/* x-axis at the bottom */}
						<AxisBottom
							xScale={xScale}
							innerHeight={innerHeight}
							width={width.toString()}
							colors={{
								line: colors.axis.line,
								text: colors.axis.text,
							}}
						/>
					</g>

					{/* ZoomOverlay */}
					<rect
						fill="transparent"
						cursor="grab"
						width={innerWidth}
						height={height}
						ref={zoomRef}
						className="liqChartZoomOverlay"
					/>

					<Brush
						id={id}
						xScale={xScale}
						brushLabelValue={brushLabels}
						brushExtent={brushExtent}
						innerWidth={innerWidth}
						innerHeight={innerHeight}
						setBrushExtent={onBrushDomainChange}
						colors={{
							area: {
								selection: colors.area.selection,
							},
							label: {
								background: colors.brush.label,
							},
							handle: {
								west: colors.brush.handle.west,
								east: colors.brush.handle.east,
								bar: colors.brush.handle.bar,
							},
							arrow: {
								west: colors.brush.arrow.west,
								east: colors.brush.arrow.east,
							},
						}}
					/>
				</g>
			</svg>
		</>
	)
}
