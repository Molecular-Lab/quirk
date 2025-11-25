import { useMemo, useState } from "react"

import { Skeleton } from "@rabbitswap/ui/basic"

import { useUsdPrice } from "@/hooks/token/useUsdPrice"
import { TokenAmount } from "@/types/tokens"
import { formatDisplayNumber, formatFiatValue } from "@/utils/number"

export const QuoteRate: React.FC<{
	amountIn: TokenAmount | undefined
	amountOut: TokenAmount | undefined
	hasQuoteResp: boolean
}> = ({ amountIn, amountOut, hasQuoteResp }) => {
	const [isAmountInBase, setIsAmountInBase] = useState(true)

	const [base, quote] = useMemo(() => {
		return isAmountInBase ? [amountIn, amountOut] : [amountOut, amountIn]
	}, [isAmountInBase, amountIn, amountOut])

	const baseUsdPrice = useUsdPrice(base?.newAmountString("1"))

	if (!base || !quote) return null

	// if the quoteResponse is not available, don't show the rate
	const rate = hasQuoteResp ? quote.bigNumber.dividedBy(base.bigNumber) : undefined

	return (
		<div
			className="flex cursor-pointer select-none gap-1 text-sm font-medium"
			onClick={(e) => {
				e.stopPropagation()
				setIsAmountInBase((x) => !x)
			}}
		>
			<span className="whitespace-nowrap">1 {base.token.symbol} = </span>
			<Skeleton width={60}>{rate ? formatDisplayNumber(rate, { precision: 5 }) : undefined}</Skeleton>{" "}
			{quote.token.symbol}
			{!baseUsdPrice?.isZero() && <span className="font-normal text-gray-400">({formatFiatValue(baseUsdPrice)})</span>}
		</div>
	)
}
