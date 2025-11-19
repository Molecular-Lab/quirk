import { useMemo } from "react"

import { BigNumber } from "@ethersproject/bignumber"

import { usePositionAndFee } from "@/hooks/liquidity/usePositionAndFee"
import { useUsdPrice } from "@/hooks/token/useUsdPrice"

export const useUsdPositionFee = (tokenId: BigNumber, chainId: number) => {
	const {
		fee: [token0, token1],
	} = usePositionAndFee(tokenId, chainId)

	const token0Price = useUsdPrice(token0)
	const token1Price = useUsdPrice(token1)

	const usdPosition = useMemo(() => {
		const totalFeeUsd = token0Price && token1Price ? token0Price.plus(token1Price) : undefined
		return {
			token0: token0Price,
			token1: token1Price,
			total: totalFeeUsd,
		}
	}, [token0Price, token1Price])

	return usdPosition
}
