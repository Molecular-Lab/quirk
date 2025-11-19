import { useSearchParams } from "react-router-dom"

import { type Address } from "viem"

import { nativeToAddress } from "@/utils/token/token"

export type SwapSearchParams = Partial<{
	tokenIn: string
	tokenOut: string
}>

interface ParsedSwapSearchParams {
	tokenInAddress: Address | undefined
	tokenOutAddress: Address | undefined
}

export const useSwapSearchParams = (): ParsedSwapSearchParams => {
	const [searchParams] = useSearchParams()

	const tokenIn = searchParams.get("tokenIn")
	const tokenOut = searchParams.get("tokenOut")

	return {
		tokenInAddress: nativeToAddress(tokenIn),
		tokenOutAddress: nativeToAddress(tokenOut),
	}
}
