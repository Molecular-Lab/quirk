import React, { useMemo } from "react"

import BigNumber from "bignumber.js"

import { Skeleton } from "@rabbitswap/ui/basic"

import { PoolRow } from "@/feature/liquidity/components"
import { useUsdPrice } from "@/hooks/token/useUsdPrice"
import { TokenAmount } from "@/types/tokens"
import { formatFiatValue } from "@/utils/number"

interface LiquidityCardProps {
	quote: TokenAmount | undefined
	base: TokenAmount | undefined
	feeDisplay?: string
	quoteRatio?: number | undefined
	hideTitle?: boolean
	hideFeeTier?: boolean
	showFiatValue?: boolean
}

export const LiquidityCard: React.FC<LiquidityCardProps> = ({
	quote,
	base,
	hideTitle = false,
	feeDisplay,
	quoteRatio,
	hideFeeTier,
	showFiatValue = false,
}) => {
	const liqQuotePriceUsd = useUsdPrice(quote)
	const liqBasePriceUsd = useUsdPrice(base)
	const fiatValueOfLiquidity: BigNumber | undefined = useMemo(() => {
		if (!liqQuotePriceUsd || !liqBasePriceUsd) {
			return undefined
		}
		return liqQuotePriceUsd.plus(liqBasePriceUsd)
	}, [liqBasePriceUsd, liqQuotePriceUsd])

	return (
		<div className="flex flex-col gap-3">
			{(!hideTitle || showFiatValue) && (
				<div className="flex flex-col gap-2">
					{!hideTitle && <div>Liquidity</div>}
					{showFiatValue && (
						<div className="text-2xl lg:text-[32px]">{formatFiatValue(fiatValueOfLiquidity, { minPrecision: 6 })}</div>
					)}
				</div>
			)}
			<div className="flex flex-col gap-2 rounded-xl bg-gray-50 p-3 dark:bg-gray-900">
				{quote && (
					<PoolRow
						tokenAmount={quote.unwrapped}
						tokenIconPosition="left"
						showPercentage={quoteRatio !== undefined}
						percentageIn100={quoteRatio}
					/>
				)}
				{base && (
					<PoolRow
						tokenAmount={base.unwrapped}
						tokenIconPosition="left"
						showPercentage={quoteRatio !== undefined}
						percentageIn100={quoteRatio !== undefined ? 100 - quoteRatio : undefined}
					/>
				)}
				{!hideFeeTier && (
					<div className="flex justify-between text-sm leading-5 text-gray-600 dark:text-gray-500">
						<div>Fee tier </div>
						<Skeleton width={150}>{feeDisplay}</Skeleton>
					</div>
				)}
			</div>
		</div>
	)
}
