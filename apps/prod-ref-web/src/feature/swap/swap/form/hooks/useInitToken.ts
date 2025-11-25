import { useEffect } from "react"

import { getAddress, isAddressEqual } from "viem"

import { useSwapSearchParams } from "@/feature/swap/hooks/useSwapSearchParams"
import { useToken } from "@/hooks/token/useToken"
import { useSwapChainId } from "@/hooks/useChainId"
import { TokenAmount } from "@/types/tokens"
import { getChainEvmToken } from "@/utils/token"

import { useSwapStore } from "../../store/swapStore"

export const useInitToken = () => {
	const { setAmountIn, setAmountOut } = useSwapStore()
	const chainId = useSwapChainId()
	const { native } = getChainEvmToken(chainId)

	const DEFAULT_TOKEN = native

	const { tokenInAddress, tokenOutAddress } = useSwapSearchParams()
	const { data: tokenIn } = useToken(chainId, tokenInAddress)
	const { data: tokenOut } = useToken(chainId, tokenOutAddress)

	useEffect(() => {
		if (tokenIn) {
			setAmountIn(new TokenAmount({ token: tokenIn }))
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [tokenIn])

	useEffect(() => {
		if (tokenOut) {
			setAmountOut(new TokenAmount({ token: tokenOut }))
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [tokenOut])

	// Reset token when chainId changes and no default token provided
	useEffect(() => {
		if (
			!tokenInAddress &&
			((tokenOutAddress !== undefined && !isAddressEqual(tokenOutAddress, getAddress(DEFAULT_TOKEN.address))) ||
				!tokenOutAddress)
		) {
			setAmountIn(new TokenAmount({ token: DEFAULT_TOKEN }))
		}
		if (!tokenOutAddress) setAmountOut(undefined)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [chainId])

	useEffect(() => {
		return () => {
			setAmountIn(undefined)
			setAmountOut(undefined)
		}
	}, [setAmountIn, setAmountOut])
}
