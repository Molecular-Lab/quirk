import { useMemo, useState } from "react"

import { RadioButtonGroup, RadioOption, Skeleton } from "@rabbitswap/ui/basic"

import { PoolTitle } from "@/components/PoolTitle"
import { RangeBadge } from "@/components/RangeBadge"
import { PriceRangeCard } from "@/feature/liquidity/components"
import { LiquidityCard } from "@/feature/liquidity/detail/components/LiquidityCard"
import { tokenPairSorter } from "@/feature/liquidity/tokenPairSorter"
import { Position, RangeBy } from "@/types/position"
import { EvmToken } from "@/types/tokens"
import { getUnwrapped } from "@/utils/token"

export const LiquidityDetail: React.FC<{
	tokenA: EvmToken | undefined
	position: Position | undefined
	isLoading: boolean
	rangeBy?: RangeBy
}> = ({ tokenA, position, isLoading, rangeBy: _rangeBy }) => {
	const [rangeBy, setRangeBy] = useState<RangeBy>(_rangeBy ?? "sorted")

	const tokens = useMemo<[EvmToken | undefined, EvmToken | undefined]>(() => {
		if (position === undefined) {
			return [undefined, undefined]
		}
		const q = getUnwrapped(position.quote)
		const b = getUnwrapped(position.base)
		const a = getUnwrapped(tokenA)
		if (q.equals(a)) {
			return [q, b]
		}
		if (b.equals(a)) {
			return [b, q]
		}
		return [undefined, undefined]
	}, [position, tokenA])

	const rangeByOptions = useMemo<RadioOption<string>[]>(() => {
		return tokens.map<RadioOption<string>>((e, i) => {
			const cmp1 = e?.compare(getUnwrapped(position?.base))
			const cmp2 = e?.compare(getUnwrapped(position?.quote))
			const isSorted: boolean = (cmp2 ?? 0) < (cmp1 ?? 0) ? false : true
			const optionVal = (isSorted && i === 0) || (!isSorted && i !== 0) ? "sorted" : "unsorted"
			return {
				label: e?.symbol,
				value: e !== undefined ? optionVal : i.toString(),
			}
		})
	}, [position?.base, position?.quote, tokens])

	const [currencyQuote, currencyBase] = useMemo<[EvmToken | undefined, EvmToken | undefined]>(() => {
		const s = tokenPairSorter(position?.quote, position?.base)
		if (rangeBy === "sorted") {
			return s
		}
		return [s[1], s[0]]
	}, [position?.base, position?.quote, rangeBy])

	if (isLoading) {
		return (
			<>
				{/* title */}
				<div className="flex gap-2 lg:gap-3">
					<Skeleton className="size-6 rounded-full lg:size-9" />
					<Skeleton className="h-6 w-full rounded-xl lg:h-9" />
				</div>
				{/* LiquidityCard */}
				<Skeleton className="h-16 w-full rounded-xl" />
				{/* PriceRangeCard */}
				<Skeleton className="h-48 w-full rounded-xl" />
			</>
		)
	}

	if (!position || !currencyQuote || !currencyBase) {
		return <></>
	}

	return (
		<>
			<div className="flex w-full flex-wrap items-center justify-between gap-x-2 gap-y-3">
				<PoolTitle
					currencyQuote={tokens[0]}
					currencyBase={tokens[1]}
					feeRate={position.pool.fee}
					iconClassName="lg:size-9"
					titleClassName="lg:text-2xl"
				/>
				<RangeBadge positionState={position.positionState} />
			</div>
			<LiquidityCard
				quote={position.amountQuote}
				base={position.amountBase}
				feeDisplay={position.feeDisplay}
				hideTitle
			/>
			<PriceRangeCard
				hideRangeBadge
				positionState={position.positionState}
				minPrice={position.tickLowerPriceDisplay(currencyBase)}
				maxPrice={position.tickUpperPriceDisplay(currencyBase)}
				currentPrice={position.tickCurrentPriceDisplay(currencyBase)}
				rangeBySelector={
					<RadioButtonGroup
						value={rangeBy}
						onValueChange={(v) => {
							setRangeBy(v as RangeBy)
						}}
						options={rangeByOptions}
					/>
				}
				rangeBy={rangeBy}
				token0={getUnwrapped(position.base)}
				token1={getUnwrapped(position.quote)}
			/>
		</>
	)
}
