import { useMemo, useState } from "react"

import { Skeleton } from "@rabbitswap/ui/basic"

import { useUsdPrice } from "@/hooks/token/useUsdPrice"
import { Price } from "@/types/price"
import { TokenAmount } from "@/types/tokens"
import { formatDisplayNumber, formatFiatValue } from "@/utils/number"

export const LimitOrderRate: React.FC<{
	price: Price | undefined
}> = ({ price: _price }) => {
	const [isAmountInBase, setIsAmountInBase] = useState(true)

	const price = useMemo(() => {
		return isAmountInBase ? _price : _price?.invert()
	}, [_price, isAmountInBase])

	const [base, quote] = useMemo(() => {
		return [price?.baseCurrency, price?.quoteCurrency]
	}, [price])

	const baseUsdPrice = useUsdPrice(base ? TokenAmount.fromString(base, "1") : undefined)

	if (!base || !quote) return null

	return (
		<div
			className="flex cursor-pointer select-none gap-1 text-sm font-medium"
			onClick={(e) => {
				e.stopPropagation()
				setIsAmountInBase((x) => !x)
			}}
		>
			<span className="whitespace-nowrap">1 {base.symbol} = </span>
			<Skeleton width={60}>{price ? formatDisplayNumber(price.value, { precision: 5 }) : undefined}</Skeleton>{" "}
			{quote.symbol}
			{!baseUsdPrice?.isZero() && <span className="font-normal text-gray-400">({formatFiatValue(baseUsdPrice)})</span>}
		</div>
	)
}
