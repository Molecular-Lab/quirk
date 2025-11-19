import { useCallback } from "react"

import BigNumber from "bignumber.js"

import { TICK_SPACINGS } from "@/constants/dex"
import { LiquidityPriceRangeInput } from "@/feature/liquidity/components"
import { priceToClosestTick } from "@/types/position/price"
import { TickMath } from "@/types/position/tickMath"

import { useAddLiquidityState } from "../hooks/useAddLiquidityState"
import { useAddLiquidityStore } from "../store/useAddLiquidityStore"

export const PriceRangeInputs: React.FC = () => {
	const {
		rangeBy,
		selectedTier: feeAmount,
		setTickLower,
		setTickUpper,
		priceLower,
		setPriceLower,
		priceUpper,
		setPriceUpper,
	} = useAddLiquidityStore()

	const { priceLowerDisplay, priceUpperDisplay, clearPriceDisplay } = useAddLiquidityState()

	const handleSetTickGap = useCallback(
		(tick: "lower" | "upper", side: "up" | "down") => {
			if (!feeAmount) {
				return
			}
			const setTick = tick === "upper" ? setTickUpper : setTickLower
			const factor = side === "up" ? 1 : -1
			setTick((tick) => {
				if (tick === undefined) {
					return tick
				}
				const _nextTick = tick + TICK_SPACINGS[feeAmount] * factor
				return TickMath.bound(_nextTick)
			})
		},
		[feeAmount, setTickLower, setTickUpper],
	)

	const onIncrementLow = () => {
		if (rangeBy === "sorted") {
			handleSetTickGap("upper", "down")
		} else {
			handleSetTickGap("lower", "up")
		}
	}

	const onDecrementLow = () => {
		if (rangeBy === "sorted") {
			handleSetTickGap("upper", "up")
		} else {
			handleSetTickGap("lower", "down")
		}
	}

	const onIncrementHigh = () => {
		if (rangeBy === "sorted") {
			handleSetTickGap("lower", "down")
		} else {
			handleSetTickGap("upper", "up")
		}
	}

	const onDecrementHigh = () => {
		if (rangeBy === "sorted") {
			handleSetTickGap("lower", "up")
		} else {
			handleSetTickGap("upper", "down")
		}
	}

	const onPriceLowerChange = (newPriceValue: string) => {
		if (priceLower === undefined || newPriceValue === "" || !feeAmount) {
			return
		}
		if (!isNaN(Number(newPriceValue))) {
			const p = priceLower.clone()
			p.value = BigNumber(newPriceValue)
			if (p.value.eq(0)) {
				if (!priceLower.wrapped.isSorted) {
					setTickUpper(() => TickMath.MAX_TICK)
				} else {
					setTickLower(() => TickMath.MIN_TICK)
				}
				return
			}
			const newTick = priceToClosestTick(p, TICK_SPACINGS[feeAmount])
			const setTick = !priceLower.wrapped.isSorted ? setTickUpper : setTickLower
			setTick(() => TickMath.bound(newTick))
		}
	}

	const onPriceUpperChange = (newPriceValue: string) => {
		if (priceUpper === undefined || newPriceValue === "" || !feeAmount) {
			return
		}
		if (!isNaN(Number(newPriceValue))) {
			const p = priceUpper.clone()
			p.value = BigNumber(newPriceValue)
			if (p.value.eq(0)) {
				if (!priceUpper.wrapped.isSorted) {
					setTickLower(() => TickMath.MAX_TICK)
				} else {
					setTickUpper(() => TickMath.MIN_TICK)
				}
				return
			}
			const newTick = priceToClosestTick(p, TICK_SPACINGS[feeAmount])
			const setTick = !priceUpper.wrapped.isSorted ? setTickLower : setTickUpper
			setTick(() => TickMath.bound(newTick))
		}
	}

	return (
		<div className="flex w-full flex-col items-center justify-center gap-4 lg:flex-row">
			<LiquidityPriceRangeInput
				label="Low price"
				onIncrement={onIncrementLow}
				onDecrement={onDecrementLow}
				price={priceLower}
				setPrice={(p) => {
					setPriceLower(() => p)
				}}
				priceDisplay={priceLowerDisplay}
				clearPriceDisplay={clearPriceDisplay}
				onPriceStringChange={onPriceLowerChange}
			/>
			<LiquidityPriceRangeInput
				label="High price"
				onIncrement={onIncrementHigh}
				onDecrement={onDecrementHigh}
				price={priceUpper}
				setPrice={(p) => {
					setPriceUpper(() => p)
				}}
				priceDisplay={priceUpperDisplay}
				clearPriceDisplay={clearPriceDisplay}
				onPriceStringChange={onPriceUpperChange}
			/>
		</div>
	)
}
