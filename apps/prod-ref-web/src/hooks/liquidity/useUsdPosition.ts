import { useMemo } from "react"

import { useUsdPrice } from "@/hooks/token/useUsdPrice"
import { Position } from "@/types/position"

export const useUsdPosition = (position?: Position) => {
	const token0Price = useUsdPrice(position?.amount0)
	const token1Price = useUsdPrice(position?.amount1)

	const usdPosition = useMemo(() => {
		return {
			token0: token0Price,
			token1: token1Price,
			total: token0Price && token1Price ? token0Price.plus(token1Price) : undefined,
		}
	}, [token0Price, token1Price])

	return usdPosition
}
