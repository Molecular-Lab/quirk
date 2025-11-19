import BigNumber from "bignumber.js"

import { usePriceImpact } from "@/feature/swap/hooks/usePriceImpact"
import { useSwapQuote } from "@/feature/swap/swap/hooks/useSwapQuote"
import { useSwapSpender } from "@/feature/swap/swap/hooks/useSwapSpender"
import { useSwapProcessStore } from "@/feature/swap/swap/store/swapProcessStore"
import { useSwapStore } from "@/feature/swap/swap/store/swapStore"
import { useArkenSwapMutation } from "@/hooks/swap/arken/useArkenSwapMutation"
import { useSwapMutation } from "@/hooks/swap/useSwapMutation"
import { useApproveMutation } from "@/hooks/token/useApproveMutation"

export const useConfirmMutation = () => {
	const { mutateAsync: swapMutation } = useSwapMutation()
	const { mutateAsync: arkenSwapMutation } = useArkenSwapMutation()
	const { mutateAsync: approveMutation } = useApproveMutation()
	const { routeName, setProcess, setSwapTx, setType, setAmounts } = useSwapProcessStore()
	const { reset } = useSwapStore()

	const { data: quote, routeName: quoteRouteName } = useSwapQuote(routeName)
	const { data: priceImpact } = usePriceImpact({
		amountIn: quote?.amountIn,
		amountOut: quote?.amountOut,
	})
	const { spender } = useSwapSpender(quote?.chainId, quoteRouteName)

	return {
		swap: () => {
			if (!quote) {
				throw new Error("[Swap] quote is not available")
			}
			if (!confirmHighPriceImpact(priceImpact.priceImpact ?? BigNumber(0))) return

			void (routeName === "rabbitswap" ? swapMutation : arkenSwapMutation)(
				{
					...quote,
				},
				{
					onInit: (data) => {
						setAmounts([data.amountIn, data.amountOut])
						setProcess("SWAP_SIGNING")
					},
					onError: () => {
						setProcess("REVIEWING")

						// if user reject swap after approving, change the process to single
						setType("single")
					},
					onSubmitted: (data) => {
						setProcess("SWAP_SUBMITTED")
						setSwapTx(data.tx)
						reset()
					},
					onSuccess: (data) => {
						setProcess("SWAP_SUCCESS")
						setSwapTx(data.tx)
					},
					onTxError: () => {
						setProcess("REVIEWING")
						setType("single")
					},
				},
			)
		},
		approve: () => {
			if (!quote) {
				throw new Error("[Swap-Approve] quote is not available")
			}
			void approveMutation(
				{
					token: quote.amountIn.token,
					spender: spender,
				},
				{
					onInit: () => {
						setProcess("APPROVE_SIGNING")
					},
					onError: () => {
						setProcess("REVIEWING")
					},
					onSubmitted: () => {
						setProcess("APPROVE_SUBMITTED")
					},
					onTxError: () => {
						setProcess("REVIEWING")
					},
				},
			)
		},
	}
}

const confirmHighPriceImpact = (priceImpact: BigNumber) => {
	// if price impact is not available, confirm the swap
	if (priceImpact.isNaN()) return true

	// if price impact is greater than 10%, prompt user to type :confirm to continue
	if (priceImpact.lte(-10)) {
		const confirm = prompt(
			`This swap has a price impact of at least 10%. Please type the word "confirm" to continue with this swap.`,
		)
		if (confirm !== "confirm") return false
		return true
	}

	// if price impact is greater than 5%, prompt user to confirm to continue
	if (priceImpact.lte(-5)) {
		return confirm(
			`This swap has a price impact of at least 5%. Please confirm that you would like to continue with this swap.`,
		)
	}

	return true
}
