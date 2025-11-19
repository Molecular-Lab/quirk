import { useMemo } from "react"

import { QuoteResult } from "@/hooks/swap/useQuote"
import { usePrevious } from "@/utils/usePrevious"

import { useSwapStore } from "../../store/swapStore"

export const useQuoteDiffers = ({ quote }: { quote: QuoteResult | undefined }): boolean => {
	const {
		computed: { maxAmountIn, minAmountOut },
	} = useSwapStore()
	const prevQuote = usePrevious(quote)
	const prevMinAmountOut = usePrevious(minAmountOut)
	const prevMaxAmountIn = usePrevious(maxAmountIn)

	const differs = useMemo<boolean>(() => {
		if (!quote || !prevQuote) return false

		// it trade type or token changes, return true
		if (
			quote.type !== prevQuote.type ||
			!quote.amountIn.token.equals(prevQuote.amountIn.token) ||
			!quote.amountOut.token.equals(prevQuote.amountOut.token)
		)
			return true

		// if amount out decrease to less than previous min amount out, return true
		if (quote.type === "EXACT_INPUT" && prevMinAmountOut?.bigNumber.gt(quote.amountOut.bigNumber)) {
			return true
		}

		// if amount in increase to more than previous max amount in, return true
		if (quote.type === "EXACT_OUTPUT" && prevMaxAmountIn?.bigNumber.lt(quote.amountIn.bigNumber)) {
			return true
		}

		return false
	}, [quote, prevQuote, prevMinAmountOut, prevMaxAmountIn])

	return differs
}
