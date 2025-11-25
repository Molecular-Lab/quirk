import BigNumber from "bignumber.js"
import JSBI from "jsbi"

import { TickData } from "@rabbitswap/api-core/dto"

import { ZERO } from "@/constants/jsbi"
import { Pool } from "@/types/pool"
import { SqrtPriceMath } from "@/types/position/sqrtPriceMath"
import { TickMath } from "@/types/position/tickMath"
import { TokenAmount } from "@/types/tokens"
import { calculateTokensLocked } from "@/utils/pool"

export const calculateActiveTokensLocked = (pool: Pool, liquidityActive: JSBI) => {
	const tickSpacing = pool.tickSpacing

	const nextSqrtX96 = TickMath.getSqrtRatioAtTick(Math.floor(pool.tickCurrent / tickSpacing) * tickSpacing)
	const prevSqrtX96 = TickMath.getSqrtRatioAtTick(Math.ceil(pool.tickCurrent / tickSpacing) * tickSpacing)
	const poolSqrtRatioX96 = JSBI.BigInt(pool.sqrtRatioX96.toString())

	const token1Amount = BigNumber(
		SqrtPriceMath.getAmount1Delta(prevSqrtX96, poolSqrtRatioX96, liquidityActive).toString(),
	)
	const token0Amount = BigNumber(
		SqrtPriceMath.getAmount0Delta(nextSqrtX96, poolSqrtRatioX96, liquidityActive).toString(),
	)

	return {
		amount0Locked: TokenAmount.fromWei(pool.token0, token0Amount.lte(0) ? "0" : token0Amount.toFixed(0)),
		amount1Locked: TokenAmount.fromWei(pool.token1, token1Amount.lte(0) ? "0" : token1Amount.toFixed(0)),
	}
}

export interface BarData {
	tick: number
	liquidity: string
	amount0Locked: string
	amount1Locked: string
	displayLiquidity0: string
	displayLiquidity1: string
}

export const calculateBarData = (
	_data?: TickData[],
	pool?: Pool,
	inverted?: boolean,
): { barData: BarData[]; activeTickIndex: number } => {
	const barData: BarData[] = []

	if (!_data || !pool) return { barData: [], activeTickIndex: -1 }

	const data = _data.sort((a, b) => a.tick - b.tick)
	let liquidityActive = ZERO

	const tickSpacing = pool.tickSpacing
	const tickActive = Math.floor(pool.tickCurrent / tickSpacing) * tickSpacing

	const activeTickIndex = data.findIndex((tickData) => tickData.tick > tickActive) - 1
	data[activeTickIndex]!.tick = tickActive

	for (const { tick, liquidityNet } of data) {
		liquidityActive = JSBI.add(liquidityActive, JSBI.BigInt(liquidityNet))
		const { amount0Locked, amount1Locked } = calculateTokensLocked(pool, tick, liquidityActive)

		barData.push({
			tick: tick,
			liquidity: liquidityActive.toString(),
			amount0Locked: tick > tickActive ? amount0Locked.toFormat({ decimalPlaces: 3 }) : "0",
			amount1Locked: tick <= tickActive ? amount1Locked.toFormat({ decimalPlaces: 3 }) : "0",
			displayLiquidity0: tick > tickActive ? liquidityActive.toString() : "0",
			displayLiquidity1: tick <= tickActive ? liquidityActive.toString() : "0",
		})
	}

	const amount0Percent =
		tickSpacing === 0
			? BigNumber(0)
			: BigNumber((((pool.tickCurrent % tickSpacing) + tickSpacing) % tickSpacing) / tickSpacing)

	const activeLiquidity = barData[activeTickIndex]!.liquidity
	const activeLocked = calculateActiveTokensLocked(
		pool,
		JSBI.add(JSBI.BigInt(activeLiquidity), JSBI.BigInt(data[activeTickIndex]!.liquidityNet)),
	)

	barData[activeTickIndex] = {
		...barData[activeTickIndex]!,
		amount0Locked: activeLocked.amount0Locked.toFormat({ decimalPlaces: 3 }),
		amount1Locked: activeLocked.amount1Locked.toFormat({ decimalPlaces: 3 }),
		displayLiquidity0: amount0Percent.multipliedBy(activeLiquidity).toString(),
		displayLiquidity1: BigNumber(1).minus(amount0Percent).multipliedBy(activeLiquidity).toString(),
	}

	if (inverted) {
		return {
			barData,
			activeTickIndex,
		}
	}

	return {
		barData: barData.reverse(),
		activeTickIndex: barData.length - activeTickIndex - 1,
	}
}
