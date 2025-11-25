import { ScaleLinear, area, curveStepAfter } from "d3"

import { ChartEntry } from "./types"

export const Area: React.FC<{
	series: ChartEntry[]
	xScale: ScaleLinear<number, number>
	yScale: ScaleLinear<number, number>
	xValue: (d: ChartEntry) => number
	yValue: (d: ChartEntry) => number
	fill: string
	opacity?: number
}> = ({ series, xScale, yScale, xValue, yValue, fill, opacity }) => {
	return (
		<path
			opacity={opacity ?? 0.5}
			fill={fill}
			stroke={fill}
			d={
				area()
					.curve(curveStepAfter)
					.x((d: unknown) => xScale(xValue(d as ChartEntry)))
					.y1((d: unknown) => yScale(yValue(d as ChartEntry)))
					.y0(yScale(0))(series as Iterable<[number, number]>) ?? undefined
			}
		/>
	)
}
