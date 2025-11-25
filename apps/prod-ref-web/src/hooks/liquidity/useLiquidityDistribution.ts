import { useMemo } from "react"

import { useQuery } from "@tanstack/react-query"
import BigNumber from "bignumber.js"

import { PoolLiquidityDistribution } from "@rabbitswap/api-core/dto"

import apiClient from "@/api/core"
import { QueryKeys } from "@/config/queryKey"
import { FeeAmount } from "@/constants/dex"
import { tokenPairSorter } from "@/feature/liquidity/tokenPairSorter"
import { EvmToken } from "@/types/tokens"
import { getWrapped } from "@/utils/token"

interface LiquidityFeeDistribution {
	feeDistribution: Record<FeeAmount, number | null>
	liquidityTVL: Record<FeeAmount, string | null>
	highestTvl: FeeAmount | undefined
}

export const useLiquidityDistribution = (token: [EvmToken | undefined, EvmToken | undefined]) => {
	const sortedToken = useMemo(() => tokenPairSorter(token[0], token[1]), [token])

	return useQuery<LiquidityFeeDistribution>({
		queryKey: QueryKeys.pool.liquidityDistribution(sortedToken),
		queryFn: async () => {
			if (!token[0] || !token[1]) {
				throw new Error("[useLiquidityDistribution] token is undefined")
			}
			if (token[0].chainId !== token[1].chainId) {
				throw new Error("[useLiquidityDistribution] token is on different chains")
			}

			const res = await apiClient.poolRouter.getPoolLiquidityDistribution(token[0].chainId, [
				getWrapped(token[0]).address,
				getWrapped(token[1]).address,
			])

			const sumLiquidity = res.reduce((acc, v) => acc.plus(v.liquidity), BigNumber(0))

			const feeDistribution: Record<FeeAmount, number | null> = {
				[100]: null,
				[500]: null,
				[3000]: null,
				[10000]: null,
			}

			const usdTVLDistribution: Record<FeeAmount, string | null> = {
				[100]: null,
				[500]: null,
				[3000]: null,
				[10000]: null,
			}

			for (const v of res) {
				usdTVLDistribution[v.feeTier as FeeAmount] = v.totalValueLockedUSD
				feeDistribution[v.feeTier as FeeAmount] = v.liquidity
					? sumLiquidity.gt(0)
						? BigNumber(v.liquidity).div(sumLiquidity).toNumber()
						: 0
					: null
			}

			const highestTvl = res.reduce<PoolLiquidityDistribution | undefined>((acc, v) => {
				if (!acc) return v
				return BigNumber(v.liquidity).gt(acc.liquidity) ? v : acc
			}, undefined)

			const liquidityFeeDistribution: LiquidityFeeDistribution = {
				highestTvl: highestTvl?.feeTier as FeeAmount,
				feeDistribution: feeDistribution,
				liquidityTVL: usdTVLDistribution,
			}
			return liquidityFeeDistribution
		},
		placeholderData: {
			feeDistribution: {
				[100]: null,
				[500]: null,
				[3000]: null,
				[10000]: null,
			},
			liquidityTVL: {
				[100]: null,
				[500]: null,
				[3000]: null,
				[10000]: null,
			},
			highestTvl: undefined,
		},
		enabled: !!token[0] && !!token[1],
	})
}
