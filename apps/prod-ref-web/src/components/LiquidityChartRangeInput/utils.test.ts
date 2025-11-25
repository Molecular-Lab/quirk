import BigNumber from "bignumber.js"
import { describe, expect, it } from "vitest"

import { TickMath } from "@/types/position/tickMath"

import { calcLeverage } from "./utils"

const sampleLiquidities: { tick: number; activeLiquidity: BigNumber }[] = [
	{
		activeLiquidity: new BigNumber("171421738343043512788848"),
		tick: -887220,
	},
	{
		activeLiquidity: new BigNumber("171447716023963948293698"),
		tick: -19860,
	},
	{
		activeLiquidity: new BigNumber("172068503109177598311298"),
		tick: -18900,
	},
	{
		activeLiquidity: new BigNumber("188560932269974252097003"),
		tick: -14040,
	},
	{
		activeLiquidity: new BigNumber("648913139190042043908944"),
		tick: -13980,
	},
	{
		activeLiquidity: new BigNumber("862476770323590130814854"),
		tick: -13920,
	},
]

describe("calcLeverage", () => {
	const totalLiquidity = sampleLiquidities.reduce((acc, entry) => acc.plus(entry.activeLiquidity), new BigNumber(0))

	it("should return 0 when tickLower equals tickUpper", () => {
		const result = calcLeverage({
			liquidities: sampleLiquidities,
			tickUpper: -14000,
			tickLower: -14000,
		})
		expect(result.toString()).toBe("0")
	})

	it("should handle a range that captures all liquidity", () => {
		const result = calcLeverage({
			liquidities: sampleLiquidities,
			tickLower: TickMath.MIN_TICK,
			tickUpper: TickMath.MAX_TICK,
		})
		expect(result.toString()).toBe("1")
	})

	it("should calculate leverage correctly for a specific range", () => {
		const result = calcLeverage({
			liquidities: sampleLiquidities,
			tickLower: -18900,
			tickUpper: -14040,
		})
		expect(result.isGreaterThan(1)).toBe(true)

		const expectedResult = totalLiquidity.div(BigNumber("172068503109177598311298"))
		expect(result.toString()).toBe(expectedResult.toString())
	})

	it("should handle more complex overlapping ranges", () => {
		const result = calcLeverage({
			liquidities: sampleLiquidities,
			tickLower: -19000,
			tickUpper: -14000,
		})
		expect(result.isGreaterThan(1)).toBe(true)

		const bar1 = BigNumber("171447716023963948293698")
			.div(-18900 - -19860)
			.times(-18900 - -19000)
		const bar2 = BigNumber("172068503109177598311298")
		const bar3 = BigNumber("188560932269974252097003")
			.div(-13980 - -14040)
			.times(-14000 - -14040)

		const expectedResult = totalLiquidity.div(bar1.plus(bar2).plus(bar3))
		expect(result.toString()).toBe(expectedResult.toString())
	})
})
