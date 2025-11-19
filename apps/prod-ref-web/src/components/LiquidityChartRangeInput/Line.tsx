import { ScaleLinear } from "d3"

export const Line: React.FC<{
	value: number
	xScale: ScaleLinear<number, number>
	innerHeight: number
	color: string
}> = ({ value, xScale, innerHeight, color }) => {
	return (
		<line
			opacity={0.5}
			strokeWidth={2}
			stroke={color}
			fill="none"
			x1={xScale(value)}
			y1="0"
			x2={xScale(value)}
			y2={innerHeight}
		/>
	)
}
