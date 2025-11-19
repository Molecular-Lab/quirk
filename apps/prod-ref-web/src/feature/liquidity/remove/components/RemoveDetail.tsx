import React from "react"

import { Separator } from "@rabbitswap/ui/basic"

import { FeeRow, PoolRow } from "@/feature/liquidity/components"
import { TokenAmount } from "@/types/tokens"

export const RemoveDetail: React.FC<{
	currencyQuote: TokenAmount | undefined
	currencyBase: TokenAmount | undefined
	feeQuote: TokenAmount | undefined
	feeBase: TokenAmount | undefined
}> = ({ currencyQuote, currencyBase, feeQuote, feeBase }) => {
	return (
		<div className="flex flex-col gap-2 rounded-lg bg-gray-50 px-4 py-3 text-gray-600 dark:bg-gray-900">
			<PoolRow tokenAmount={currencyQuote} tokenIconPosition="right" tokenPrefix="Pooled" />
			<PoolRow tokenAmount={currencyBase} tokenIconPosition="right" tokenPrefix="Pooled" />
			{(feeQuote?.amount !== 0n || feeBase?.amount !== 0n) && <Separator className="my-2" />}
			{feeQuote?.amount !== 0n && <FeeRow tokenAmount={feeQuote} tokenIconPosition="right" tokenSuffix="Fees Earned" />}
			{feeBase?.amount !== 0n && <FeeRow tokenAmount={feeBase} tokenIconPosition="right" tokenSuffix="Fees Earned" />}
		</div>
	)
}
