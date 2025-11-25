import { useMemo } from "react"

import BigNumber from "bignumber.js"

import { usePoolPriceImpact } from "@/feature/swap/hooks/usePoolPriceImpact"
import { useUsdPriceImpact } from "@/feature/swap/hooks/useUsdPriceImpact"
import { TokenAmount } from "@/types/tokens"

export const usePriceImpact = ({
	amountIn,
	amountOut,
}: {
	amountIn: TokenAmount | undefined
	amountOut: TokenAmount | undefined
}) => {
	const { data: poolPriceImpact, isLoading: poolLoading } = usePoolPriceImpact()
	const { data: usdPriceImpact, isLoading: usdLoading } = useUsdPriceImpact({ amountIn, amountOut })

	const priceImpact = useMemo(() => {
		if (usdPriceImpact && poolPriceImpact) {
			return BigNumber.max(usdPriceImpact, poolPriceImpact)
		}
		if (poolPriceImpact) return poolPriceImpact
		if (usdPriceImpact) return usdPriceImpact
		return undefined
	}, [poolPriceImpact, usdPriceImpact])

	return {
		isLoading: poolLoading || usdLoading,
		data: { priceImpact, poolPriceImpact, usdPriceImpact },
	}
}
