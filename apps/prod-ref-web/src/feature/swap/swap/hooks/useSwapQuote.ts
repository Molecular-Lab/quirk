import { RouteName } from "@/feature/swap/swap/form/components/SwapRouterBox/type"
import { useArkenQuote } from "@/hooks/swap/arken/useArkenQuote"
import { useQuote } from "@/hooks/swap/useQuote"

import { useSwapStore } from "../store/swapStore"

export const useSwapQuote = (preferredRouteName?: RouteName) => {
	const {
		amountIn,
		amountOut,
		type,
		routeName,
		computed: { typing },
	} = useSwapStore()

	// Disable quote when user is typing or when in the middle of swap process
	const disabled = typing

	const rabbitswapQuote = useQuote({ amountIn, amountOut, type, disabled })
	const arkenQuote = useArkenQuote({ amountIn, amountOut, type, disabled })

	const val = (preferredRouteName ?? routeName) === "rabbitswap" ? rabbitswapQuote : arkenQuote

	return {
		routeName: routeName,
		...val,
		isLoading: val.isLoading && !disabled,
		isFetching: val.isFetching && !disabled,
	}
}
