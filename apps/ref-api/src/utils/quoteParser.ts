import { BigNumber } from "bignumber.js"
import { Address } from "viem"

import { WVIC_ADDRESS } from "@rabbitswap/core/constants"

import { QuoteTokenType } from "../entity"

const ETH_ADDERSS = "ETH"

export class QuoteParser {
	parseMinimumOutput(amount: bigint, slippage: number) {
		return BigInt(
			BigNumber(String(amount))
				.times(1 - slippage / 100)
				.toFixed(0)
				.toString(),
		)
	}

	parseMaximumInput(amount: bigint, slippage: number) {
		return BigInt(
			BigNumber(String(amount))
				.times(1 + slippage / 100)
				.toFixed(0)
				.toString(),
		)
	}

	parseDeadline(deadline: number) {
		return BigInt(Math.floor(Date.now() / 1000) + deadline)
	}

	/**
	 * Parse the quote token, find quote type and token address (wrapped)
	 * @param tokenIn
	 * @param tokenOut
	 * @returns The quote token, quote type and token address (wrapped)
	 */
	parseQuoteToken({ tokenIn, tokenOut }: { tokenIn: string; tokenOut: string }): {
		tokenIn: Address
		tokenOut: Address
		type: QuoteTokenType
	} {
		if (tokenIn === ETH_ADDERSS) return { type: "ETH_TO_TOKEN", tokenIn: WVIC_ADDRESS, tokenOut: tokenOut as Address }
		if (tokenOut === ETH_ADDERSS) return { type: "TOKEN_TO_ETH", tokenIn: tokenIn as Address, tokenOut: WVIC_ADDRESS }
		return { type: "TOKEN_TO_TOKEN", tokenIn: tokenIn as Address, tokenOut: tokenOut as Address }
	}

	/**
	 * Parse the fee rate to percentage
	 * @param feeRate in integer
	 * @returns The fee rate in percentage in range 0-1
	 * @example 10000 -> 1% returns 0.01
	 */
	parseFeeRate(feeRate: number) {
		return BigNumber(feeRate).div(10000).div(100)
	}
}

export const quoteParser = new QuoteParser()
