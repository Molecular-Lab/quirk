import { Address, encodeFunctionData } from "viem"

import { swapRouterAbi } from "@rabbitswap/core/constants"

import { Quote } from "@/entity"
import { QuoteParams, RouteService } from "@/service"

import { quoteParser } from "./quoteParser"

export class QuoteEncoder {
	encodeExactInput(quoteResult: Quote, params: QuoteParams) {
		if (params.recipient === undefined) {
			throw new Error("Undefined recipient call [encodeExactInput]")
		}
		return encodeFunctionData({
			abi: swapRouterAbi,
			functionName: "exactInput",
			args: [
				{
					amountIn: params.amount,
					path: RouteService.createPathFromRoute(quoteResult.route, params.type).encoded,
					recipient: params.recipient,
					deadline: quoteParser.parseDeadline(params.deadline),
					amountOutMinimum: quoteParser.parseMinimumOutput(quoteResult.amount, params.slippage),
				},
			],
		})
	}

	encodeExactOutput(quoteResult: Quote, params: QuoteParams) {
		if (params.recipient === undefined) {
			throw new Error("Undefined recipient call [encodeExactOutput]")
		}
		return encodeFunctionData({
			abi: swapRouterAbi,
			functionName: "exactOutput",
			args: [
				{
					amountOut: params.amount,
					path: RouteService.createPathFromRoute(quoteResult.route, params.type).encoded,
					recipient: params.recipient,
					deadline: quoteParser.parseDeadline(params.deadline),
					amountInMaximum: quoteParser.parseMaximumInput(quoteResult.amount, params.slippage),
				},
			],
		})
	}

	encodeRefund() {
		return encodeFunctionData({
			abi: swapRouterAbi,
			functionName: "refundETH",
			args: [],
		})
	}

	encodeUnwrap(minimumAmountOut: bigint, recipient: Address) {
		return encodeFunctionData({
			abi: swapRouterAbi,
			functionName: "unwrapWETH9",
			args: [minimumAmountOut, recipient],
		})
	}

	encodeMulticall(callDatas: Address[]) {
		return encodeFunctionData({
			abi: swapRouterAbi,
			functionName: "multicall",
			args: [callDatas],
		})
	}
}

export const quoteEncoder = new QuoteEncoder()
