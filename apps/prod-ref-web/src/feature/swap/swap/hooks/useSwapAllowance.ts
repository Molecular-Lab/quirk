import { RouteName } from "@/feature/swap/swap/form/components/SwapRouterBox/type"
import { useAllowance } from "@/hooks/token/useAllowance"
import { useSwapChainId } from "@/hooks/useChainId"

import { useSwapStore } from "../store/swapStore"

import { useSwapSpender } from "./useSwapSpender"

export const useSwapAllowance = (routeName: RouteName) => {
	const chainId = useSwapChainId()
	const { spender } = useSwapSpender(chainId, routeName)

	const {
		computed: { maxAmountIn },
	} = useSwapStore()

	return useAllowance({
		amount: maxAmountIn,
		spender: spender,
	})
}
