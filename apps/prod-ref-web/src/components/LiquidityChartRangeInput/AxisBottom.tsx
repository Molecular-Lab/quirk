import { ScaleLinear, axisBottom, select } from "d3"

export const AxisBottom: React.FC<{
	xScale: ScaleLinear<number, number>
	innerHeight: number
	offset?: number
	width: string
	colors: {
		line: string
		text: string
	}
}> = ({ xScale, innerHeight, offset = 0, width, colors }) => {
	return (
		<g width="100%" transform={`translate(0, ${innerHeight + offset})`} id="price-axis" className="liqChartAxis">
			<line x1="0" y1="0" x2={width} y2="0" stroke={colors.line} />
			<g
				ref={(axis) => {
					if (axis === null) return undefined
					return select(axis)
						.call(axisBottom(xScale).ticks(6))
						.call((g) => g.select(".domain").remove())
						.call((g) => g.selectAll(".tick text").attr("fill", colors.text))
						.call((g) => g.selectAll(".tick line").attr("stroke", colors.line))
				}}
			/>
		</g>
	)
}
