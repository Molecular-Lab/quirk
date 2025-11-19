import { useEffect } from "react"

import { getAddress, isAddressEqual } from "viem"

import { C98_VICTION, RABBIT_VICTION } from "@/constants/token"
import { useSwapSearchParams } from "@/feature/swap/hooks/useSwapSearchParams"
import { isAllowedLimitOrderTokenPair } from "@/feature/swap/limit/condition"
import { useToken } from "@/hooks/token/useToken"
import { useSwapChainId } from "@/hooks/useChainId"
import { TokenAmount } from "@/types/tokens"
import { sortDisplayTokens } from "@/utils/token"

import { useLimitStore } from "../../store/limitStore"

const DEFAULT_TOKENS = [RABBIT_VICTION, C98_VICTION] as const

export const useInitToken = () => {
	const { setAmountLeft, setAmountRight } = useLimitStore()
	const chainId = useSwapChainId()

	const { tokenInAddress, tokenOutAddress } = useSwapSearchParams()
	const { data: tokenIn } = useToken(chainId, tokenInAddress)
	const { data: tokenOut } = useToken(chainId, tokenOutAddress)

	useEffect(() => {
		if (tokenIn && tokenOut) {
			if (!isAllowedLimitOrderTokenPair([tokenIn, tokenOut])) {
				setAmountLeft(new TokenAmount({ token: DEFAULT_TOKENS[0] }))
				setAmountRight(() => new TokenAmount({ token: DEFAULT_TOKENS[1] }))
				return
			}
			const [leftToken, rightToken] = sortDisplayTokens([tokenIn, tokenOut])
			setAmountLeft(new TokenAmount({ token: leftToken }))
			setAmountRight(() => new TokenAmount({ token: rightToken }))
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [tokenIn, tokenOut])

	// Reset token when chainId changes and no default token provided
	useEffect(() => {
		// no token provided
		if (!tokenInAddress && !tokenOutAddress) {
			setAmountLeft(new TokenAmount({ token: DEFAULT_TOKENS[0] }))
			setAmountRight(() => new TokenAmount({ token: DEFAULT_TOKENS[1] }))
			return
		}
		// tokenIn provided
		if (tokenInAddress) {
			return
		}
		if (!tokenOutAddress) {
			return
		}
		// only tokenOut provided, filled tokenIn
		if (!isAddressEqual(tokenOutAddress, getAddress(DEFAULT_TOKENS[0].address))) {
			setAmountLeft(new TokenAmount({ token: DEFAULT_TOKENS[0] }))
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [chainId])

	useEffect(() => {
		return () => {
			setAmountLeft(undefined)
			setAmountRight(() => undefined)
		}
	}, [setAmountLeft, setAmountRight])
}
