import { Address } from "viem"

import { QuoteType } from "@rabbitswap/api-core/entity"

import { Price } from "@/types/price"
import { TokenAmount } from "@/types/tokens"

export const QuoteQueryKeys = {
	allRabbitswap: () => ["quote"],
	rabbitswap: (
		baseAmount: TokenAmount | undefined,
		quoteAmount: TokenAmount | undefined,
		type: QuoteType,
		slippage: number,
		deadline: number,
		recipient: Address | undefined,
	) => [
		"quote",
		baseAmount?.token.currencyId,
		baseAmount?.string,
		quoteAmount?.token.currencyId, // don't use quoteAmount value as dependency
		type,
		slippage,
		deadline,
		recipient,
	],
	allArken: () => ["quote-arken"],
	arken: (baseAmount: TokenAmount | undefined, quoteAmount: TokenAmount | undefined, type: QuoteType) => [
		"quote-arken",
		baseAmount?.token.currencyId,
		baseAmount?.string,
		quoteAmount?.token.currencyId, // don't use quoteAmount value as dependency
		type,
	],
	limitOrder: (
		baseAmount: TokenAmount | undefined,
		quoteAmount: TokenAmount | undefined,
		price: Price | undefined,
		type: "EXACT_LEFT" | "EXACT_RIGHT",
	) => [
		"limit-order-quote",
		baseAmount?.token.currencyId,
		baseAmount?.string,
		quoteAmount?.token.currencyId, // don't use quoteAmount value as dependency
		type,
		price?.toStringWithUnit(),
	],
} as const
