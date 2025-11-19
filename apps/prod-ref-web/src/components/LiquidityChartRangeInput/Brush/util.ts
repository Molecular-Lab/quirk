import { ScaleLinear } from "d3"

/**
 * Returns true if every element in `a` maps to the same pixel coordinate as elements in `b`
 */
export function brushAreaEqual(a: [number, number], b: [number, number], xScale: ScaleLinear<number, number>): boolean {
	// normalize pixels to 1 decimals
	const aNorm = a.map((x) => xScale(x).toFixed(1))
	const bNorm = b.map((x) => xScale(x).toFixed(1))
	return aNorm.every((v, i) => v === bNorm[i])
}
