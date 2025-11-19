import { useMemo } from "react"

import { FeeAmount } from "@/constants/dex"
import { useLiquidityDistribution } from "@/hooks/liquidity/useLiquidityDistribution"
import { usePool } from "@/hooks/liquidity/usePool"
import { EvmToken } from "@/types/tokens"

/**
 * Get the representative pool for the given tokens by the amount of liquidity
 */
export const useRepresentativePool = ({
	tokenA,
	tokenB,
}: {
	tokenA: EvmToken | undefined
	tokenB: EvmToken | undefined
}) => {
	const { data: distribution } = useLiquidityDistribution([tokenA, tokenB])

	const representativeTier = useMemo<FeeAmount | undefined>(() => {
		if (!distribution) return undefined
		const sortedDistribution = Object.entries(distribution.feeDistribution).sort(
			([_, valueA], [__, valueB]) => (valueB ?? 0) - (valueA ?? 0),
		)
		const mostSelectedTier = sortedDistribution[0]
		if (!mostSelectedTier) return undefined
		const [tier, amount] = mostSelectedTier
		if (!amount) return undefined
		return Number(tier) as FeeAmount
	}, [distribution])

	return usePool([tokenA, tokenB], representativeTier, tokenA?.chainId)
}
