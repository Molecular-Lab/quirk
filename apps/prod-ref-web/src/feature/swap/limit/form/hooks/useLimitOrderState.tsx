import { ComponentProps, useEffect, useMemo, useState } from "react"

import BigNumber from "bignumber.js"

import { Button } from "@rabbitswap/ui/basic"

import { usePreLimitOrderState } from "@/feature/swap/limit/form/hooks/usePreLimitOrderState"
import { useLimitOrderQuote } from "@/feature/swap/limit/hooks/useLimitOrderQuote"
import { useLimitStore } from "@/feature/swap/limit/store/limitStore"
import { useRepresentativePool } from "@/hooks/liquidity/useRepresentativePool"
import { QuoteError } from "@/hooks/swap/useQuote"
import { Price } from "@/types/price"
import { formatQuoteResult } from "@/utils/number"
import { sortDisplayTokens } from "@/utils/token"

export const useLimitOrderState = () => {
	const preLimitOrderState = usePreLimitOrderState()
	const {
		type,
		amountLeft,
		setAmountLeft,
		amountRight,
		setAmountRight,
		setPriceCondition,
		triggerExpiresAt,
		side,
		computed: { amountOut },
	} = useLimitStore()
	const [openReview, setOpenReview] = useState(false)

	const tokenIn = useMemo(() => amountLeft?.token, [amountLeft])
	const tokenOut = useMemo(() => amountRight?.token, [amountRight])

	// representative pool
	const { data: _pool } = useRepresentativePool({ tokenA: tokenIn, tokenB: tokenOut })
	const pool = useMemo(() => {
		if (tokenIn?.isNative) {
			return _pool?.unwrapped
		}
		if (tokenOut?.isNative) {
			return _pool?.unwrapped
		}
		return _pool
	}, [_pool, tokenIn?.isNative, tokenOut?.isNative])

	const currentPoolPrice = useMemo(() => {
		if (!pool) {
			const [leftToken, rightToken] = sortDisplayTokens([tokenIn, tokenOut])
			if (!leftToken) return undefined
			return new Price({
				base: leftToken,
				quote: rightToken,
			})
		}
		if (pool.displayInverted) return pool.token1Price
		return pool.token0Price
	}, [pool, tokenIn, tokenOut])

	// sync price from current price
	useEffect(() => {
		if (currentPoolPrice) {
			setPriceCondition((prev) => {
				if (
					prev?.quoteCurrency.equals(currentPoolPrice.quoteCurrency) &&
					prev.baseCurrency.equals(currentPoolPrice.baseCurrency)
				) {
					return prev
				}
				return currentPoolPrice
			})
		}
	}, [currentPoolPrice, setPriceCondition])

	// ====================== Quote ======================
	const { data: quote, error: quoteError, isLoading: quoteLoading } = useLimitOrderQuote()

	// Set quote amount
	useEffect(() => {
		if (!quote || quote.type !== type) return
		switch (type) {
			case "EXACT_LEFT": {
				// If the value used to quote isn't equal to current input, don't update
				if (!amountLeft?.equal(quote.amountLeft)) return
				setAmountRight(() => formatQuoteResult(quote.amountRight, BigNumber.ROUND_DOWN, 9))
				break
			}
			case "EXACT_RIGHT": {
				if (!amountRight?.equal(quote.amountRight)) return
				setAmountLeft(formatQuoteResult(quote.amountLeft, BigNumber.ROUND_DOWN, 9))
				break
			}
			default: {
				throw new Error(`Invalid type: ${type}`)
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [quote])

	// If quote error, set quote side to zero
	useEffect(() => {
		if (!quoteError) return
		const { request } = quoteError as QuoteError
		if (!amountLeft?.equal(request.amountIn)) return
		setAmountRight((amountRight) => amountRight?.newAmount())
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [quoteError])

	// ====================== Button State ======================
	const buttonState = useMemo<Partial<ComponentProps<typeof Button>>>(() => {
		if (preLimitOrderState) return preLimitOrderState

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

		if (!amountOut || amountOut.bigNumber.isZero()) {
			return {
				disabled: true,
				loading: false,
				children: "Cannot swap to zero amount",
			}
		}

		if (side === "Buy") {
			return {
				children: `Buy ${amountLeft?.toFormat({
					decimalPlaces: 2,
					withUnit: true,
					rounding: BigNumber.ROUND_DOWN,
					toFixed: true,
				})}`,
				buttonColor: "positive",
				onClick: () => {
					triggerExpiresAt()
					setOpenReview(true)
				},
			}
		}

		return {
			children: `Sell ${amountLeft?.toFormat({
				decimalPlaces: 2,
				withUnit: true,
				rounding: BigNumber.ROUND_DOWN,
				toFixed: true,
			})}`,
			buttonColor: "negative",
			onClick: () => {
				triggerExpiresAt()
				setOpenReview(true)
			},
		}
	}, [amountLeft, amountOut, preLimitOrderState, quoteError, quoteLoading, side, triggerExpiresAt])

	return {
		buttonState,
		openReview,
		setOpenReview,
		currentPoolPrice,
		quoteLoading,
	}
}
