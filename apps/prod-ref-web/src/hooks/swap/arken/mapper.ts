import BigNumber from "bignumber.js"
import { Address, Hex, encodeFunctionData, ethAddress } from "viem"

import { ArkenQuoteResponse, ArkenTradeRouteStruct } from "@rabbitswap/api-core/client/arken-client/dto"
import { MethodParameters } from "@rabbitswap/api-core/dto"
import { arkenDexAbi } from "@rabbitswap/core/constants"

export const ARKEN_DEX_ADDRESS: Address = "0xcCed039fAfE6dBb4ffc7DE4946159Fa5a432C401"

interface ArkenTradeDescriptionStruct {
	srcToken: Address
	dstToken: Address
	amountIn: bigint
	amountOutMin: bigint
	to: Address
	routes: ArkenTradeRouteStruct[]
	isRouterSource: boolean
	isSourceFee: boolean
}

interface PrepareSwapDataOptions {
	isSrcNative: boolean
	isDestNative: boolean
	recipient: Address
	slippage: number
}

interface PrepareSwapDataResult {
	methodParams: MethodParameters
}

export function prepareSwapData(
	bestRateData: ArkenQuoteResponse,
	pythUpdatedData: Buffer[] | undefined,
	tradeRoutes: ArkenTradeRouteStruct[] | null,
	options: PrepareSwapDataOptions,
): PrepareSwapDataResult {
	const amountIn = bestRateData.fromTokenAmount
	const amountOutMin = calculateMinimumAmountOut(BigNumber(bestRateData.toTokenAmount).toString(), options.slippage)

	const payload: ArkenTradeDescriptionStruct = {
		srcToken: options.isSrcNative ? ethAddress : bestRateData.fromToken,
		amountIn: BigInt(amountIn),
		dstToken: options.isDestNative ? ethAddress : bestRateData.toToken,
		amountOutMin: BigInt(amountOutMin),
		routes: tradeRoutes ?? [],
		to: options.recipient,
		isRouterSource: bestRateData.isRouterSource,
		isSourceFee: bestRateData.isSourceFee,
	}

	const priceUpdate: Hex[][] = pythUpdatedData
		? [
				pythUpdatedData.map<Hex>((e) => {
					return `0x${e.toString("hex")}`
				}),
			]
		: []

	const encodedData = encodeFunctionData({
		abi: arkenDexAbi,
		functionName: "tradePyth",
		args: [payload, priceUpdate],
	})

	return {
		methodParams: {
			data: encodedData,
			value: options.isSrcNative ? amountIn : "0x0",
			to: ARKEN_DEX_ADDRESS,
		},
	}
}

function calculateMinimumAmountOut(amountOut: string, slippagePercent: number): string {
	const amountOutBN = new BigNumber(amountOut)
	const slippageAmount = amountOutBN.multipliedBy(slippagePercent).shiftedBy(-2)
	return amountOutBN.minus(slippageAmount).toFixed(0)
}
