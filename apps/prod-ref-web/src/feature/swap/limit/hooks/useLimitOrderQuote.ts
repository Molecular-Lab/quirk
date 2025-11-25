import { useMemo } from "react"

import { useQuery } from "@tanstack/react-query"
import BigNumber from "bignumber.js"

import { QueryKeys } from "@/config/queryKey"
import { isAllowedLimitOrderTokenPair } from "@/feature/swap/limit/condition"
import { useLimitStore } from "@/feature/swap/limit/store/limitStore"
import { useSwapChainId } from "@/hooks/useChainId"
import { Price } from "@/types/price"
import { TokenAmount } from "@/types/tokens"

export interface QuoteResult {
	chainId: number
	amountLeft: TokenAmount
	amountRight: TokenAmount
	type: "EXACT_LEFT" | "EXACT_RIGHT"
	quotePrice: Price
}

export const useLimitOrderQuote = () => {
	const chainId = useSwapChainId()
	const {
		type,
		priceCondition,
		amountLeft,
		amountRight,
		computed: { typing },
	} = useLimitStore()

	const isAllowed = useMemo(() => {
		return isAllowedLimitOrderTokenPair([amountLeft?.token, amountRight?.token])
	}, [amountLeft, amountRight])

	// Disable quote when user is typing or not allowed token pair
	const disabled = typing || !isAllowed

	const baseAmount = type === "EXACT_LEFT" ? amountLeft : amountRight
	const quoteAmount = type === "EXACT_LEFT" ? amountRight : amountLeft

	return useQuery<QuoteResult>({
		queryKey: QueryKeys.quote.limitOrder(baseAmount, quoteAmount, priceCondition, type),
		queryFn: () => {
			if (!priceCondition) throw new Error("Price condition is not defined")
			if (!amountLeft || !amountRight) throw new Error("Amount is not defined")
			switch (type) {
				case "EXACT_LEFT": {
					const usedPrice = priceCondition.baseCurrency.equals(amountLeft.token)
						? priceCondition
						: priceCondition.invert()
					const newAmountRight = TokenAmount.fromString(
						amountRight.token,
						usedPrice.value !== undefined && amountLeft.amount !== undefined
							? BigNumber(usedPrice.value).multipliedBy(amountLeft.bigNumber).toString()
							: undefined,
					)
					const r: QuoteResult = {
						chainId: chainId,
						amountLeft: amountLeft,
						amountRight: newAmountRight,
						type: type,
						quotePrice: priceCondition,
					}
					return r
				}
				case "EXACT_RIGHT": {
					const usedPrice = priceCondition.baseCurrency.equals(amountRight.token)
						? priceCondition
						: priceCondition.invert()
					const newAmountLeft = TokenAmount.fromString(
						amountLeft.token,
						usedPrice.value !== undefined && amountRight.amount !== undefined
							? BigNumber(usedPrice.value).multipliedBy(amountRight.bigNumber).toString()
							: undefined,
					)
					const r: QuoteResult = {
						chainId: chainId,
						amountLeft: newAmountLeft,
						amountRight: amountRight,
						type: type,
						quotePrice: priceCondition,
					}
					return r
				}
				default: {
					throw new Error(`Invalid type: ${type}`)
				}
			}
		},
		enabled: !!amountLeft && !!amountRight && !!priceCondition && !disabled,
	})
}
