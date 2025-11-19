import { useMemo } from "react"

import { LimitOrderItem } from "@/feature/swap/limit/types"
import { stripZero } from "@/utils/number"
import { sortDisplayTokens } from "@/utils/token"

export const PriceInfo: React.FC<{ order: LimitOrderItem | undefined }> = ({ order }) => {
	const displayPrice = useMemo(() => {
		if (!order) return undefined
		const [leftToken] = sortDisplayTokens([order.fromTokenAmount.token, order.toTokenAmount.token])
		return order.price.baseCurrency.equals(leftToken) ? order.price : order.price.invert()
	}, [order])

	if (!displayPrice) {
		return <></>
	}

	return (
		<div className="flex flex-col">
			<div className="text-xs">{`${stripZero(displayPrice.toPrecision())} ${displayPrice.quoteCurrency.symbol}`}</div>
			<div className="text-xs text-gray-400 dark:text-gray-600">{`per ${displayPrice.baseCurrency.symbol}`}</div>
		</div>
	)
}
