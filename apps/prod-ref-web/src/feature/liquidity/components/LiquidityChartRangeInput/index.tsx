import { useCallback, useEffect, useMemo } from "react"

import BigNumber from "bignumber.js"

import {
	LiquidityChartRangeInput as ChartInput,
	LiquidityTemplateSelector,
} from "@/components/LiquidityChartRangeInput"
import { PriceInput } from "@/components/PriceInput"
import { TICK_SPACINGS } from "@/constants/dex"
import { useAddLiquidityStore } from "@/feature/liquidity/add/store/useAddLiquidityStore"
import { Pool } from "@/types/pool"
import { priceToClosestTick, tickToPrice } from "@/types/position/price"
import { TickMath } from "@/types/position/tickMath"
import { Price } from "@/types/price"
import { EvmToken } from "@/types/tokens"
import { getWrapped } from "@/utils/token"

import { Empty } from "./Empty"

interface LiquidityChartRangeInputProps {
	pool: Pool | null | undefined
	hasNative: boolean
	quote: EvmToken | undefined
	base: EvmToken | undefined
	isLoading?: boolean
	onFullRangeClick: () => void
}

export const LiquidityChartRangeInput: React.FC<LiquidityChartRangeInputProps> = ({
	pool,
	hasNative,
	quote,
	base,
	isLoading,
	onFullRangeClick,
}) => {
	const {
		selectedTier: feeAmount,
		priceCurrent,
		setPriceCurrent,
		rangeBy,
		priceLower,
		setPriceLower,
		priceUpper,
		setPriceUpper,
		tickLower,
		setTickLower,
		tickUpper,
		setTickUpper,
	} = useAddLiquidityStore()

	const currentPrice = useMemo(() => {
		if (pool === undefined) return undefined

		const _price = pool?.token1Price
		if (!_price) return undefined

		const price = hasNative ? _price.unwrapped : _price.wrapped

		const correctSide = price.baseCurrency.equals(getWrapped(base)) || price.quoteCurrency.equals(getWrapped(quote))

		return correctSide ? price : price.invert()
	}, [base, hasNative, pool, quote])

	// sync current price side by rangeBy
	useEffect(() => {
		setPriceCurrent((prev) => {
			if (prev !== undefined) {
				const samePair =
					(prev.quoteCurrency.equals(quote) && prev.baseCurrency.equals(base)) ||
					(prev.quoteCurrency.equals(base) && prev.baseCurrency.equals(quote))
				if (samePair) {
					// invert if needed
					const newPrice = prev
					const usedPrice =
						(rangeBy === "sorted" && !newPrice.isSorted) || (rangeBy === "unsorted" && newPrice.isSorted)
							? newPrice
							: newPrice.invert()
					return usedPrice
				}
			}
			if (!!quote && !!base) {
				const newPrice = new Price({ quote: quote, base: base, value: BigNumber(0) })
				const usedPrice =
					(rangeBy === "sorted" && newPrice.isSorted) || (rangeBy === "unsorted" && !newPrice.isSorted)
						? newPrice
						: newPrice.invert()
				return usedPrice
			}
			return prev
		})
	}, [base, quote, setPriceCurrent, rangeBy])

	const onLeftRangeInput = useCallback(
		(v: Price | undefined) => {
			setPriceLower(() => {
				if (v === undefined) return v
				if (feeAmount === undefined) return v

				// snap price into tick
				const newTick = priceToClosestTick(v, TICK_SPACINGS[feeAmount])
				if (v.wrapped.isSorted) {
					setTickLower(() => newTick)
				} else {
					setTickUpper(() => newTick)
				}
				const newPrice = tickToPrice(v.baseCurrency, v.quoteCurrency, newTick)
				return newPrice
			})
		},
		[feeAmount, setPriceLower, setTickLower, setTickUpper],
	)

	const onRightRangeInput = useCallback(
		(v: Price | undefined) => {
			setPriceUpper(() => {
				if (v === undefined) return v
				if (feeAmount === undefined) return v

				// snap price into tick
				const newTick = priceToClosestTick(v, TICK_SPACINGS[feeAmount])
				if (v.wrapped.isSorted) {
					setTickUpper(() => newTick)
				} else {
					setTickLower(() => newTick)
				}
				const newPrice = tickToPrice(v.baseCurrency, v.quoteCurrency, newTick)
				return newPrice
			})
		},
		[feeAmount, setPriceUpper, setTickLower, setTickUpper],
	)

	// ================== return components =====================

	if (!isLoading && (!base || !feeAmount)) {
		return <Empty />
	}

	const noLiquidity = pool === null
	if (noLiquidity && !isLoading) {
		return (
			<div className="flex flex-col gap-3">
				<div className="rounded-xl bg-primary/50 p-4 text-xs text-primary-700 dark:bg-primary/90">
					This pool must be initialized before you can add liquidity. To initialize, select a starting price for the
					pool. Then, enter your liquidity price range and deposit amount. Gas fees will be higher than usual due to the
					initialization transaction.
				</div>
				<div className="flex flex-col items-center justify-between gap-5">
					<LiquidityTemplateSelector
						noLiquidity={noLiquidity}
						priceCurrent={priceCurrent}
						tickSpacing={TICK_SPACINGS[feeAmount ?? 100]}
						onLeftRangeInput={onLeftRangeInput}
						onRightRangeInput={onRightRangeInput}
						setFullRange={onFullRangeClick}
					/>
					<div className="flex size-full flex-col gap-2">
						<div className="flex justify-between">
							<div className="text-primary-300 dark:text-primary-50">Set initial price</div>
							<div className="text-gray-300 dark:text-gray-400">
								{priceCurrent ? (hasNative ? priceCurrent.unwrapped : priceCurrent).toStringWithUnit(8) : "-"}
							</div>
						</div>
						<PriceInput
							isLoading={isLoading}
							value={priceCurrent}
							onValueChange={(p) => {
								setPriceCurrent(() => p)
							}}
							className="rounded-xl p-3 font-semibold"
						/>
					</div>
				</div>
			</div>
		)
	}

	return (
		<ChartInput
			pool={pool ?? undefined}
			tokenA={rangeBy === "sorted" ? quote : base}
			ticksAtLimit={{
				lower: tickLower === TickMath.MIN_TICK,
				upper: tickUpper === TickMath.MAX_TICK,
			}}
			onLeftRangeInput={onLeftRangeInput}
			onRightRangeInput={onRightRangeInput}
			onFullRangeClick={onFullRangeClick}
			priceCurrent={currentPrice ?? priceCurrent}
			priceLower={priceLower}
			priceUpper={priceUpper}
			tickUpper={tickUpper}
			tickLower={tickLower}
		/>
	)
}
