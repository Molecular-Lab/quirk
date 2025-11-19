import { z } from "zod"

import { Address, Hex } from "../entity"

export const QuoteRequest = z.object({
	tokenInChainId: z.number(),
	tokenIn: z.string(),
	tokenOutChainId: z.number(),
	tokenOut: z.string(),
	amount: z.string(),
	type: z.enum(["EXACT_INPUT", "EXACT_OUTPUT"]),
	swapper: z.string().optional(),
	slippageTolerance: z.string(),
	/**
	 * seconds
	 */
	deadline: z.number(),
	withPoolFee: z.boolean().optional(),
})
export type QuoteRequest = z.infer<typeof QuoteRequest>

export interface MethodParameters {
	data: Hex
	value: string
	to: Address
}

export interface SwapPool {
	address: Address
	tokenIn: {
		address: Address
	}
	tokenOut: {
		address: Address
	}
	fee: string
	amountIn?: string
	amountOut?: string
}

export interface QuoteResponse {
	methodParameters: MethodParameters
	chainId: number
	route: SwapPool[][]
	input: {
		amount: string
	}
	output: {
		amount: string
	}
	poolFeeAmounts: {
		token: Address
		value: string
	}[]
}

export interface QuoteAPIResponse {
	quote: QuoteResponse
	routeCount: number
}
