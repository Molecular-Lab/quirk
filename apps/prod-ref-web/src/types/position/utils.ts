import JSBI from "jsbi"

import { Q96 } from "@/constants/jsbi"

import { TickMath } from "./tickMath"

export function nearestUsableTick(tick: number, tickSpacing: number): number {
	const rounded = Math.round(tick / tickSpacing) * tickSpacing
	if (rounded < TickMath.MIN_TICK) return rounded + tickSpacing
	if (rounded > TickMath.MAX_TICK) return rounded - tickSpacing
	return rounded
}

function maxLiquidityForAmount0(sqrtRatioAX96: JSBI, sqrtRatioBX96: JSBI, amount0: JSBI): JSBI {
	if (JSBI.greaterThan(sqrtRatioAX96, sqrtRatioBX96)) {
		;[sqrtRatioAX96, sqrtRatioBX96] = [sqrtRatioBX96, sqrtRatioAX96]
	}

	const numerator = JSBI.multiply(JSBI.multiply(amount0, sqrtRatioAX96), sqrtRatioBX96)
	const denominator = JSBI.multiply(Q96, JSBI.subtract(sqrtRatioBX96, sqrtRatioAX96))

	return JSBI.divide(numerator, denominator)
}

function maxLiquidityForAmount1(sqrtRatioAX96: JSBI, sqrtRatioBX96: JSBI, amount1: JSBI): JSBI {
	if (JSBI.greaterThan(sqrtRatioAX96, sqrtRatioBX96)) {
		;[sqrtRatioAX96, sqrtRatioBX96] = [sqrtRatioBX96, sqrtRatioAX96]
	}
	return JSBI.divide(JSBI.multiply(JSBI.BigInt(amount1), Q96), JSBI.subtract(sqrtRatioBX96, sqrtRatioAX96))
}

export function maxLiquidityForAmounts(
	sqrtRatioCurrentX96: JSBI,
	sqrtRatioAX96: JSBI,
	sqrtRatioBX96: JSBI,
	amount0: JSBI,
	amount1: JSBI,
): JSBI {
	if (JSBI.greaterThan(sqrtRatioAX96, sqrtRatioBX96)) {
		;[sqrtRatioAX96, sqrtRatioBX96] = [sqrtRatioBX96, sqrtRatioAX96]
	}

	if (JSBI.lessThanOrEqual(sqrtRatioCurrentX96, sqrtRatioAX96)) {
		return maxLiquidityForAmount0(sqrtRatioAX96, sqrtRatioBX96, amount0)
	}
	if (JSBI.lessThan(sqrtRatioCurrentX96, sqrtRatioBX96)) {
		const liquidity0 = maxLiquidityForAmount0(sqrtRatioCurrentX96, sqrtRatioBX96, amount0)
		const liquidity1 = maxLiquidityForAmount1(sqrtRatioAX96, sqrtRatioCurrentX96, amount1)
		return JSBI.lessThan(liquidity0, liquidity1) ? liquidity0 : liquidity1
	}

	return maxLiquidityForAmount1(sqrtRatioAX96, sqrtRatioBX96, amount1)
}
