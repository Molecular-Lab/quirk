import { Address } from "../../entity"

export interface Protocol {
	chain: string
	dexName: string
	part: number
	fromTokenAddress: string
	toTokenAddress: string
	fromRouterAddress: string
	toRouterAddress: string
	lpAddress: string
	fee?: number
	partPool?: number
	dodoDirection?: number
	fromTokenIndex?: number
	toTokenIndex?: number
	updatedAt?: number
	updatedBlock?: number
}

/**
 * chainName -> dexName -> dexConfig
 */
export type GetDexConfigResponse = Record<string, Record<string, DexConfig>>

export interface DexConfig {
	chain: string
	dex: string
	dexInterface: number
	dexAddress: string
	config: {
		displayName: string
	}
}

export interface ArkenQuoteRequest {
	fromTokenAddress: string
	toTokenAddress: string
	amount: string
	chain: string
	mode: "max_return" | "lowest_gas"
	fromAddress: string
	isSourceNative: boolean
	isDestinationNative: boolean
	includedSources: ("Arken" | "0x" | "1inch")[]
}

export interface ArkenQuoteResponse {
	fromToken: Address
	toToken: Address
	fromTokenAmount: string
	toTokenAmount: string
	toTokenAmountWithoutArkenFee: string
	priceImpact: string
	arkenFee: string
	transactionFee: string
	protocols: Protocol[][]
	isSourceFee: boolean
	isRouterSource: boolean
	isOutSide: boolean
	extraValue?: string
	pyth?: {
		updatedData: string // base64
		updateFee: string // decimal
		baseTokenPriceId: string
		quoteTokenPriceId: string
	}[]
}

export interface ArkenTradeRouteStruct {
	routerAddress: Address
	lpAddress: Address
	fromToken: Address
	toToken: Address
	from: Address
	to: Address
	part: number
	direction: number
	fromTokenIndex: number
	toTokenIndex: number
	amountAfterFee: number
	dexInterface: number
}
