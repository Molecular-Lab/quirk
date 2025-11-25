import { Address, Hex } from "viem"

export interface Pool {
	token0: Address
	token1: Address
	feeRate: number
	address: Address
}

export type Route = Pool[]
export interface Quote {
	route: Route
	amount: bigint
	gasEstimate: bigint
	sqrtPriceX96AfterList: bigint[]
	initializedTicksCrossedList: number[]
}

export interface QuoteCallData {
	to: Address
	data: Hex
	value?: bigint
}

export interface GetBestQuoteResult {
	quote: Quote
	callData?: QuoteCallData
	poolFee?: { token: string; value: bigint }[]
}

export type QuoteType = "EXACT_INPUT" | "EXACT_OUTPUT"
export type QuoteTokenType = "ETH_TO_TOKEN" | "TOKEN_TO_ETH" | "TOKEN_TO_TOKEN"
