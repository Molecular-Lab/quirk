import { useMemo } from "react"

import BigNumber from "bignumber.js"

import { useSwapQuote } from "@/feature/swap/swap/hooks/useSwapQuote"
import { useSpotPrices } from "@/hooks/token/useSpotPrice"
import { Price } from "@/types/price"
import { priceArrayConvert } from "@/utils/price"
import { getWrapped } from "@/utils/token"

export const usePoolPriceImpact = (): {
	isLoading: boolean
	data: BigNumber | undefined
} => {
	const { data: quote } = useSwapQuote()
	const { data: spotPrices, isLoading: isSpotPriceLoading } = useSpotPrices(
		quote?.chainId,
		quote?.route[0]?.map((r) => r.address),
	)

	const price = useMemo<Price | undefined>(() => {
		if (isSpotPriceLoading || !quote) return undefined
		return priceArrayConvert(spotPrices, getWrapped(quote.amountIn.token))
	}, [isSpotPriceLoading, quote, spotPrices])

	if (!quote || !price || spotPrices.length !== quote.route[0]?.length) {
		return {
			isLoading: true,
			data: undefined,
		}
	}

	const spotQuote = quote.amountOut.newAmountString(price.value?.multipliedBy(quote.amountIn.bigNumber).toString())

	return {
		isLoading: false,
		data: quote.amountOut.bigNumber.minus(spotQuote.bigNumber).div(spotQuote.bigNumber).shiftedBy(2),
	}
}
