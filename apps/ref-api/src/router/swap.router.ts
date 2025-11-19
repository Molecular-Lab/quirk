import { initServer } from "@ts-rest/fastify"
import { getAddress, isAddress } from "viem"

import { swapContract } from "@rabbitswap/api-core/contracts/swap"
import { QuoteRequest, QuoteResponse, SwapPool } from "@rabbitswap/api-core/dto"
import Logger from "@rabbitswap/logger"

import { GetBestQuoteResult } from "@/entity"
import { QuoteParams, QuoteService } from "@/service"
import { Timer } from "@/utils"

export function createSwapRouter(s: ReturnType<typeof initServer>, { quoteService }: { quoteService: QuoteService }) {
	return s.router(swapContract, {
		quote: async ({ body: quoteRequest }) => {
			const timer = new Timer()

			if (quoteRequest.swapper !== undefined && !isAddress(quoteRequest.swapper)) {
				return {
					status: 400,
					body: {
						errorCode: "INVALID_SWAPPER",
						message: "swapper must be address",
					},
				}
			}
			if (quoteRequest.tokenInChainId !== quoteRequest.tokenOutChainId) {
				return {
					status: 400,
					body: {
						errorCode: "INVALID_CHAIN_ID",
						message: "tokenInChainId and tokenOutChainId must be the same",
					},
				}
			}
			if (quoteRequest.tokenIn === quoteRequest.tokenOut) {
				return {
					status: 400,
					body: {
						errorCode: "INVALID_TOKEN_PAIR",
						message: "tokenIn and tokenOut must be different",
					},
				}
			}
			const quoteParams: QuoteParams = {
				tokenIn: quoteRequest.tokenIn,
				tokenOut: quoteRequest.tokenOut,
				amount: BigInt(quoteRequest.amount),
				type: quoteRequest.type,
				slippage: Number(quoteRequest.slippageTolerance),
				recipient: quoteRequest.swapper,
				deadline: quoteRequest.deadline,
				withPoolFee: quoteRequest.withPoolFee,
			}

			try {
				const { result, routeCount } = await quoteService.getBestQuote(quoteParams, timer)

				const quoteResp = formatQuoteResponse(quoteRequest, result)

				return {
					status: 200,
					body: {
						quote: quoteResp,
						routeCount: routeCount,
						stats: timer.stats,
					},
				}
			} catch (error) {
				if (error instanceof Error) {
					if (error.message === "NO_ROUTE") {
						return {
							status: 400,
							body: {
								errorCode: "NO_ROUTE",
								message: "No route",
							},
						}
					}
					if (error.message === "NOT_ENOUGH_LIQUIDITY") {
						return {
							status: 400,
							body: {
								errorCode: "NOT_ENOUGH_LIQUIDITY",
								message: "Not enough liquidity",
							},
						}
					}
				}
				Logger.error("Quote error", {
					event: "quote_error",
					err: error,
					params: quoteRequest,
				})
				return {
					status: 500,
					body: {
						errorCode: "INTERNAL_SERVER_ERROR",
						message: "Internal server error",
					},
				}
			}
		},
	})
}

const formatQuoteResponse = (
	request: QuoteRequest,
	{ quote, callData, poolFee }: GetBestQuoteResult,
): QuoteResponse => {
	const [input, output] =
		request.type === "EXACT_INPUT" ? [request.amount, quote.amount] : [quote.amount, request.amount]

	const route: SwapPool[] = quote.route.map<SwapPool>((route, idx, arr) => {
		const swapPool: SwapPool = {
			address: route.address,
			tokenIn: {
				address: route.token0,
			},
			tokenOut: {
				address: route.token1,
			},
			fee: route.feeRate.toString(),
			amountIn: idx === 0 ? input.toString() : undefined,
			amountOut: idx === arr.length - 1 ? output.toString() : undefined,
		}

		return swapPool
	})

	const poolFeeAmounts = (poolFee ?? []).map((fee) => ({
		token: getAddress(fee.token),
		value: fee.value.toString(),
	}))

	const quoteResp: QuoteResponse = {
		methodParameters: {
			to: callData?.to ?? "0x",
			data: callData?.data ?? "0x",
			value: callData?.value?.toString() ?? "",
		},
		chainId: request.tokenInChainId,
		input: {
			amount: input.toString(),
		},
		output: {
			amount: output.toString(),
		},
		route: [route],
		poolFeeAmounts: poolFeeAmounts,
	}

	return quoteResp
}
