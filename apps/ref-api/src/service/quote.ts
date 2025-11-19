import { BigNumber } from "bignumber.js"
import { Address, PublicClient, getAddress, zeroAddress } from "viem"

import Logger from "@rabbitswap/logger"

import { QUOTE_FUNCTION, VICTION_CONTRACT } from "@/constants/quote"
import { GetBestQuoteResult, Quote, QuoteCallData, QuoteTokenType, QuoteType, Route } from "@/entity"
import { Timer, quoteEncoder, quoteParser } from "@/utils"

import { RouteService } from "./route"

export interface QuoteParams {
	tokenIn: string
	tokenOut: string
	amount: bigint
	type: QuoteType
	slippage: number
	recipient: Address | undefined
	/**
	 * seconds
	 */
	deadline: number
	withPoolFee?: boolean
}

/**
 * This service is used to get the best quote for a given quote params
 */
export class QuoteService {
	private readonly publicClient: PublicClient
	private readonly routeService: RouteService

	constructor(init: { publicClient: PublicClient; routeService: RouteService }) {
		this.publicClient = init.publicClient
		this.routeService = init.routeService
	}

	async getBestQuote(params: QuoteParams, timer?: Timer): Promise<{ result: GetBestQuoteResult; routeCount: number }> {
		// change the tokenIn and tokenOut to WVIC if it's ETH
		const { tokenIn, tokenOut, type: quoteTokenType } = quoteParser.parseQuoteToken(params)

		// find all route and quote
		timer?.start("getRoutes")
		const routes = await this.routeService.getRoutes(tokenIn, tokenOut)
		timer?.stop("getRoutes")
		// no route found
		if (routes.length === 0) throw new Error("NO_ROUTE")

		timer?.start("getQuotes")
		const quoteResults = await this.getQuotes(routes, params.amount, params.type)
		timer?.stop("getQuotes")
		// no valid quotes
		if (quoteResults.length === 0) throw new Error("NOT_ENOUGH_LIQUIDITY")

		// sort quoteResults by amount
		// if type is EXACT_INPUT, sort in descending order
		// if type is EXACT_OUTPUT, sort in ascending order
		quoteResults.sort((a, b) => {
			return (Number(b.amount) - Number(a.amount)) * (params.type === "EXACT_INPUT" ? 1 : -1)
		})

		const bestRoute = quoteResults[0]
		if (!bestRoute) {
			throw new Error("NOT_ENOUGH_LIQUIDITY (unexpected)")
		}

		Logger.info("quote_result", {
			event: "quote_result",
			recipient: params.recipient?.toLowerCase(),
			quoteType: params.type,
			quoteParams: params,
			routes: routes,
			quoteResults: quoteResults,
			bestRoute: bestRoute,
		})

		const callData: QuoteCallData | undefined = params.recipient
			? {
					...this.encodeCallData(
						bestRoute,
						{
							...params,
							recipient: getAddress(params.recipient),
						},
						quoteTokenType,
					),
					to: VICTION_CONTRACT.swapRouter,
				}
			: undefined

		timer?.start("calculateFee")
		const poolFee = params.withPoolFee ? await this.getFee(bestRoute, params) : undefined
		timer?.stop("calculateFee")

		const result: GetBestQuoteResult = {
			quote: bestRoute,
			callData: callData,
			poolFee: poolFee,
		}

		return {
			result: result,
			routeCount: routes.length,
		}
	}

	protected async getQuotes(routes: Route[], amount: bigint, type: QuoteType): Promise<Quote[]> {
		const result = await this.publicClient.multicall({
			contracts: routes.map((route) => ({
				...QUOTE_FUNCTION[type],
				args: [RouteService.createPathFromRoute(route, type).encoded, amount],
			})),
		})

		// map result to each route
		const rawQuotes = result.map((quote, i) => {
			return {
				route: routes[i],
				result: quote,
			}
		})

		// map quotes to a more readable format
		const quote = rawQuotes
			.map<Quote | undefined>((quote) => {
				// filter out failed quotes (e.g. insufficient liquidity)
				if (quote.result.status === "failure") {
					return undefined
				}
				const q: Quote = {
					route: quote.route ?? [],
					amount: quote.result.result[0],
					sqrtPriceX96AfterList: [...quote.result.result[1]],
					initializedTicksCrossedList: [...quote.result.result[2]],
					gasEstimate: quote.result.result[3],
				}
				return q
			})
			.filter((x) => x !== undefined)

		return quote
	}

	protected encodeCallData = (
		quoteResult: Quote,
		params: QuoteParams & { recipient: Address },
		quoteTokenType: QuoteTokenType,
	): Omit<QuoteCallData, "to"> => {
		if (params.type === "EXACT_INPUT") {
			switch (quoteTokenType) {
				case "TOKEN_TO_TOKEN": {
					return {
						data: quoteEncoder.encodeExactInput(quoteResult, params),
					}
				}

				case "ETH_TO_TOKEN": {
					// to swap exact ETH to token, we only have to send the ETH amount to the router
					return {
						data: quoteEncoder.encodeExactInput(quoteResult, params),
						value: params.amount,
					}
				}

				case "TOKEN_TO_ETH": {
					// to swap exact token to ETH, we swap WVIC first then unwrap it
					return {
						data: quoteEncoder.encodeMulticall([
							quoteEncoder.encodeExactInput(quoteResult, { ...params, recipient: zeroAddress }),
							quoteEncoder.encodeUnwrap(
								quoteParser.parseMinimumOutput(quoteResult.amount, params.slippage),
								params.recipient,
							),
						]),
					}
				}
			}
		} else {
			switch (quoteTokenType) {
				case "TOKEN_TO_TOKEN": {
					return {
						data: quoteEncoder.encodeExactOutput(quoteResult, params),
					}
				}

				case "ETH_TO_TOKEN": {
					// To swap ETH to exact token, we need to send the maximum ETH to the router
					// then, the router will use the neccessary amount of ETH
					// we must call the refundETH function to get the remaining ETH back
					return {
						data: quoteEncoder.encodeMulticall([
							quoteEncoder.encodeExactOutput(quoteResult, params),
							quoteEncoder.encodeRefund(),
						]),
						value: quoteParser.parseMaximumInput(quoteResult.amount, params.slippage),
					}
				}

				case "TOKEN_TO_ETH": {
					// To swap token to exact ETH, we swap the token to WVIC first then unwrap it
					return {
						data: quoteEncoder.encodeMulticall([
							quoteEncoder.encodeExactOutput(quoteResult, { ...params, recipient: zeroAddress }),
							quoteEncoder.encodeUnwrap(params.amount, params.recipient),
						]),
					}
				}
			}
		}
	}

	private async getQuote(routes: Route, amount: bigint, type: QuoteType): Promise<bigint> {
		const res = await this.publicClient.simulateContract({
			...QUOTE_FUNCTION[type],
			args: [RouteService.createPathFromRoute(routes, type).encoded, amount],
		})
		const resAmount = res.result[0]
		return resAmount
	}

	private async getFee(quoteResult: Quote, params: QuoteParams): Promise<{ token: Address; value: bigint }[]> {
		// get fee of each pool (in the input token currency)
		const feeAmounts = await (params.type === "EXACT_INPUT"
			? this.getFeeExactIn(quoteResult, params)
			: this.getFeeExactOut(quoteResult, params))

		return feeAmounts
	}

	private async getFeeExactIn(quoteResult: Quote, params: QuoteParams): Promise<{ token: Address; value: bigint }[]> {
		let amountIn = params.amount

		const fee = []

		for (let i = 0; i < quoteResult.route.length; i++) {
			const pool = quoteResult.route[i]!
			fee.push({
				token: pool.token0,
				amountIn: amountIn.toString(),
				value: BigInt(BigNumber(amountIn.toString()).times(quoteParser.parseFeeRate(pool.feeRate)).toFixed(0)),
			})

			// if it's the last pool, we don't need to get quote
			if (i === quoteResult.route.length - 1) continue
			amountIn = await this.getQuote([pool], amountIn, "EXACT_INPUT")
		}
		return fee
	}

	private async getFeeExactOut(quoteResult: Quote, params: QuoteParams): Promise<{ token: Address; value: bigint }[]> {
		let amountOut = params.amount

		const fee = []
		for (let i = quoteResult.route.length - 1; i >= 0; i--) {
			const pool = quoteResult.route[i]!

			// find amountIn of each step, if it's the first pool, use the quote amount
			if (i === 0) amountOut = quoteResult.amount
			else amountOut = await this.getQuote([pool], amountOut, "EXACT_OUTPUT")

			const feeRate = quoteParser.parseFeeRate(pool.feeRate)
			fee.push({
				token: pool.token0,
				amountOut: amountOut.toString(),
				// fee = amountInWithFee * fee / (1 + fee)
				value: BigInt(BigNumber(amountOut.toString()).times(feeRate).div(feeRate.plus(1)).toFixed(0)),
			})
		}
		return fee
	}
}
