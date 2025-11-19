import { Address } from "viem"

import { SWAP_ROUTER_ADDRESSES } from "@/constants/dex"
import { RouteName } from "@/feature/swap/swap/form/components/SwapRouterBox/type"
import { ARKEN_DEX_ADDRESS } from "@/hooks/swap/arken/mapper"
import { useSwapChainId } from "@/hooks/useChainId"

export const useSwapSpender = (
	_chainId: number | undefined,
	routeName: RouteName | undefined,
): { spender: Address | undefined } => {
	const defaultChainId = useSwapChainId()
	const chainId = _chainId ?? defaultChainId

	if (routeName === "arken") {
		return {
			spender: ARKEN_DEX_ADDRESS,
		}
	}

	return {
		spender: SWAP_ROUTER_ADDRESSES[chainId],
	}
}
