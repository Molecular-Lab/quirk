import React, { useMemo } from "react"

import BigNumber from "bignumber.js"

import { ShapeSkeleton, Skeleton } from "@rabbitswap/ui/basic"

import { useUsdPrice } from "@/hooks/token/useUsdPrice"
import { TokenAmount } from "@/types/tokens"
import { formatFiatValue } from "@/utils/number"

import { usePoolChart } from "../context"

export const PoolPriceChartTitle: React.FC<{
	inverted?: boolean
	price: BigNumber | undefined
}> = ({ inverted, price }) => {
	const { pool } = usePoolChart()
	const [token0, token1] = useMemo(
		() => (inverted ? [pool?.token1, pool?.token0] : [pool?.token0, pool?.token1]),
		[pool, inverted],
	)
	const token0UsdPrice = useUsdPrice(token0 ? TokenAmount.fromString(token0, "1") : undefined)

	if (!pool) {
		return <ShapeSkeleton className="h-7 w-full" />
	}

	const token0PriceDisplay = formatFiatValue(price, {
		minPrecision: 3,
		symbol: "",
		showLessThanSymbol: false,
	})
	const token0UsdPriceDisplay = formatFiatValue(token0UsdPrice, {
		minPrecision: 2,
		showLessThanSymbol: false,
	})

	return (
		<div className="flex items-center gap-1 text-xl lg:text-[32px]">
			{!token0 || !token1 || price === undefined ? (
				<ShapeSkeleton className="h-7 w-[200px] lg:h-8 lg:w-[312px]" />
			) : (
				<>
					<span className="font-medium">{`1 ${token0.symbol} = ${token0PriceDisplay} ${token1.symbol}`}</span>
					<Skeleton isLoading={token0UsdPrice === undefined} width={100}>
						<span className="text-lg text-gray-500 lg:text-xl">({token0UsdPriceDisplay})</span>
					</Skeleton>
				</>
			)}
		</div>
	)
}
