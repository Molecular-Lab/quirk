import { ComponentProps, useEffect, useMemo, useState } from "react"

import BigNumber from "bignumber.js"

import { Button } from "@rabbitswap/ui/basic"

import { useAccountMode } from "@/feature/sub-account/context"
import { QuoteError } from "@/hooks/swap/useQuote"
import { formatQuoteResult } from "@/utils/number"

import { useSwapQuote } from "../../hooks/useSwapQuote"
import { useSwapStore } from "../../store/swapStore"

import { useFormMutation } from "./useFormMutation"
import { usePreSwapState } from "./usePreSwapState"

export const useSwapState = () => {
	const { accountMode } = useAccountMode()
	const preSwapState = usePreSwapState()
	const {
		amountIn,
		amountOut,
		setAmountIn,
		setAmountOut,
		type,
		computed: { swapFn },
	} = useSwapStore()

	const { pending, wrap, unwrap } = useFormMutation()
	const [review, setReview] = useState(false)

	// ====================== Quote ======================
	const { data: quote, error: quoteError, isLoading: quoteLoading } = useSwapQuote()

	// Set quote amount
	useEffect(() => {
		if (!quote || quote.type !== type) return
		if (type === "EXACT_INPUT") {
			// If the value used to quote isn't equal to current input, don't update
			if (!amountIn?.equal(quote.amountIn)) return
			setAmountOut(formatQuoteResult(quote.amountOut, BigNumber.ROUND_DOWN))
		} else {
			if (!amountOut?.equal(quote.amountOut)) return
			setAmountIn(formatQuoteResult(quote.amountIn, BigNumber.ROUND_UP))
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [quote])

	// If quote error, set quote side to zero
	useEffect(() => {
		if (!quoteError) return
		const request = (quoteError as QuoteError).request
		if (request.type !== type) return
		if (type === "EXACT_INPUT") {
			if (!amountIn?.equal(request.amountIn)) return
			setAmountOut(amountOut?.newAmount())
		} else {
			if (!amountOut?.equal(request.amountOut)) return
			else setAmountIn(amountIn?.newAmount())
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [quoteError])

	// ====================== Wrap/Unwrap ======================

	// handle the opposite side's amount when wrap/unwrap
	// set the quote side equal to the base side
	useEffect(() => {
		if (swapFn === "swap") return
		if (type === "EXACT_INPUT" && amountIn) setAmountOut(amountOut?.newAmountString(amountIn.string))
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [swapFn, amountIn, type])

	useEffect(() => {
		if (swapFn === "swap") return
		if (type === "EXACT_OUTPUT" && amountOut) setAmountIn(amountIn?.newAmountString(amountOut.string))
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [swapFn, amountOut, type])

	// ====================== Button State ======================
	const buttonState = useMemo<Partial<ComponentProps<typeof Button>>>(() => {
		if (swapFn === "swap") {
			if (quoteError && quoteError instanceof QuoteError && quoteError.name === "NOT_ENOUGH_LIQUIDITY") {
				return {
					disabled: true,
					children: "Insufficient liquidity for this trade",
				}
			}

			if (quoteLoading) {
				return {
					disabled: true,
					loading: true,
					children: "Fetching best route",
				}
			}

			if (!quote) {
				if (preSwapState) return preSwapState
				return {
					disabled: true,
					loading: false,
					children: "Cannot find a route",
				}
			}

			if (quote.amountOut.bigNumber.isZero()) {
				return {
					disabled: true,
					loading: false,
					children: "Cannot swap to zero amount",
				}
			}
		}

		if (pending) {
			return {
				disabled: true,
				loading: true,
				children: accountMode !== "sub" ? "Proceed in your wallet" : "Proceeding",
			}
		}

		if (preSwapState) return preSwapState

		if (swapFn === "wrap") {
			return {
				children: "Wrap",
				onClick: () => {
					void wrap()
				},
			}
		}

		if (swapFn === "unwrap") {
			return {
				children: "Unwrap",
				onClick: () => {
					void unwrap()
				},
			}
		}

		return {
			children: "Swap",
			onClick: () => {
				setReview(true)
			},
		}
	}, [swapFn, pending, preSwapState, quoteError, quoteLoading, quote, accountMode, wrap, unwrap])

	return {
		buttonState: buttonState,
		review: review,
		onCloseReview: () => {
			setReview(false)
		},
	}
}
