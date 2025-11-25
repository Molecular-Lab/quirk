import BigNumber from "bignumber.js"

import { ChartEntry } from "@/components/LiquidityChartRangeInput/types"
import { TickMath } from "@/types/position/tickMath"
import { EvmToken } from "@/types/tokens"
import { getWrapped } from "@/utils/token"

export const xAccessor = (d: ChartEntry, base: EvmToken | undefined): number => {
	const price = d.price
	if (getWrapped(price.baseCurrency).equals(getWrapped(base))) {
		return Math.min(price.value?.toNumber() ?? 0, 1e32)
	}
	return Math.min(price.invert().value?.toNumber() ?? 0, 1e32)
}

export const yAccessor = (d: ChartEntry): number => d.activeLiquidity.toNumber()

/**
 * Leverage = totalLiquidity / liquidity between selected range
 */
export function calcLeverage({
	liquidities,
	tickUpper,
	tickLower,
}: {
	liquidities: { tick: number; activeLiquidity: BigNumber }[]
	tickUpper: number
	tickLower: number
}): BigNumber {
	if (tickUpper === tickLower) return BigNumber(0)
	const totalLiquidity = liquidities.reduce((acc, curr) => acc.plus(curr.activeLiquidity), BigNumber(0))

	// transform input into tick range
	const formattedTick = liquidities.map<{ fromTick: number; toTick: number; liquidity: BigNumber }>((v, i, arr) => {
		const fromTick = v.tick
		const toTick = arr[i + 1]?.tick ?? TickMath.MAX_TICK
		const liquidity = v.activeLiquidity
		return { fromTick, toTick, liquidity }
	})

	const selectedLiquidity = formattedTick.reduce((acc, curr) => {
		if (curr.toTick < tickLower) return acc
		if (curr.fromTick > tickUpper) return acc
		const fromTick = Math.max(curr.fromTick, tickLower)
		const toTick = Math.min(curr.toTick, tickUpper)
		const tickWidth = toTick - fromTick
		const prevWidth = curr.toTick - curr.fromTick
		const liquidity = curr.liquidity.div(prevWidth).times(tickWidth)
		return acc.plus(liquidity)
	}, BigNumber(0))

	if (selectedLiquidity.eq(0)) return BigNumber(0)

	const leverage = totalLiquidity.div(selectedLiquidity)
	return leverage
}
