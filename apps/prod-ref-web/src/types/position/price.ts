import { Price } from "@/types/price"
import { EvmToken } from "@/types/tokens"

import { TickMath } from "./tickMath"

export function tickToPrice<TBase extends EvmToken = EvmToken, TQuote extends EvmToken = EvmToken>(
	baseToken: TBase,
	quoteToken: TQuote,
	tick: number,
): Price<TBase, TQuote> {
	// bound
	if (tick < TickMath.MIN_TICK) {
		tick = TickMath.MIN_TICK
	}
	if (tick > TickMath.MAX_TICK) {
		tick = TickMath.MAX_TICK
	}

	const sqrtRatioX96 = TickMath.getSqrtRatioAtTick(tick)

	if (baseToken.compare(quoteToken) >= 0) {
		return Price.fromSqrtRatio({
			base: quoteToken,
			quote: baseToken,
			sqrtRatioX96: sqrtRatioX96,
		}).invert()
	}

	return Price.fromSqrtRatio({
		base: baseToken,
		quote: quoteToken,
		sqrtRatioX96: sqrtRatioX96,
	})
}

/**
 * Returns the first tick for which the given price is greater than or equal to the tick price
 * @param price for which to return the closest tick that represents a price less than or equal to the input price,
 * i.e. the price of the returned tick is less than or equal to the input price
 */
export function priceToClosestTick(price: Price, tickSpacing = 1): number {
	const sqrtRatioX96 = price.sqrtRatioX96

	let tick = TickMath.getTickAtSqrtRatio(sqrtRatioX96)
	const nextTick = tick + tickSpacing
	const nextTickPrice = tickToPrice(price.baseCurrency, price.quoteCurrency, nextTick)

	if (price.isSorted) {
		if (!price.lessThan(nextTickPrice)) {
			tick += tickSpacing
		}
	} else if (!price.greaterThan(nextTickPrice)) {
		tick += tickSpacing
	}

	const snappedTick = Math.round(tick / tickSpacing) * tickSpacing
	return snappedTick
}
