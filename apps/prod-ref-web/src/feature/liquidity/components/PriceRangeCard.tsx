import React, { useMemo } from "react"

import BigNumber from "bignumber.js"

import { ArrowH } from "@rabbitswap/ui/icons"

import { RangeBadge } from "@/components/RangeBadge"
import { PositionState, RangeBy } from "@/types/position"
import { Price } from "@/types/price"
import { EvmToken } from "@/types/tokens"

import { PriceCard } from "./PriceCard"

interface PriceRangeCardProps {
	positionState: PositionState | undefined
	token0: EvmToken | undefined
	token1: EvmToken | undefined
	minPrice: string | undefined
	maxPrice: string | undefined
	currentPrice: string | undefined
	rangeBySelector: React.ReactElement
	rangeBy: RangeBy
	title?: string
	hideRangeBadge?: boolean
}

export const PriceRangeCard: React.FC<PriceRangeCardProps> = ({
	positionState,
	token0,
	token1,
	minPrice,
	maxPrice,
	currentPrice,
	rangeBySelector,
	rangeBy,
	title = "Price Range",
	hideRangeBadge = false,
}) => {
	const unit = useMemo(() => {
		if (!token0 || !token1) {
			return ""
		}
		if (rangeBy === "sorted") {
			return new Price({
				base: token0,
				quote: token1,
				value: BigNumber(0),
			}).unit
		}
		return new Price({
			base: token1,
			quote: token0,
			value: BigNumber(0),
		}).unit
	}, [rangeBy, token0, token1])

	const inRangeLabel = "Your position will be 100% at this price."

	return (
		<div className="flex flex-col gap-3">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3">
					<span>{title}</span>
					{!hideRangeBadge && <RangeBadge positionState={positionState} />}
				</div>
				{rangeBySelector}
			</div>
			<div className="flex flex-col gap-3">
				<div className="flex items-center gap-2 lg:gap-3">
					<PriceCard title="Min Price" price={minPrice} unit={unit}>
						{positionState === "inRange" && (
							<div className="mt-1 text-center text-xs text-gray-400 dark:text-gray-500">{inRangeLabel}</div>
						)}
					</PriceCard>
					<ArrowH className="size-6 text-gray-400" />
					<PriceCard title="Max Price" price={maxPrice} unit={unit}>
						{positionState === "inRange" && (
							<div className="mt-1 text-center text-xs text-gray-400 dark:text-gray-500">{inRangeLabel}</div>
						)}
					</PriceCard>
				</div>
				<PriceCard title="Current Price" price={currentPrice} unit={unit} />
			</div>
		</div>
	)
}
