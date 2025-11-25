import { BigNumber } from "@ethersproject/bignumber"
import { type Address } from "viem"

import { EvmToken } from "@/types/tokens"

export const PoolQueryKeys = {
	allPools: (chainId: number, sortBy?: string, sortDirection?: string) => ["all-pools", chainId, sortBy, sortDirection],
	pool: (
		poolAddress: Address | undefined,
		chainId: number | undefined,
		// also include poolInfo for invalidation
		poolInfo: {
			token0Address: Address | undefined
			token1Address: Address | undefined
			fee: number | undefined
		},
	) => ["pool", poolAddress, chainId, poolInfo.token0Address, poolInfo.token1Address, poolInfo.fee],
	tokensByPoolAddress: (poolAddress: Address | undefined, chainId: number | undefined) => [
		"tokens-by-pool-address",
		poolAddress,
		chainId,
	],
	spotPrice: (poolAddress: Address | undefined, chainId: number | undefined) => ["spot-price", poolAddress, chainId],
	liquidityDistribution: (token: [EvmToken | undefined, EvmToken | undefined]) => [
		"liquidity-distribution",
		token[0]?.currencyId,
		token[1]?.currencyId,
	],
	poolClaimableFee: (poolAddress: Address | undefined) => ["pool-claimable-fee", poolAddress],
} as const

export const PositionQueryKeys = {
	positionDetails: (walletAddress: Address | undefined, chainId: number | undefined) => [
		"position-details",
		walletAddress,
		chainId,
	],
	positionDetail: (chainId: number | undefined, tokenId: BigNumber | undefined) => [
		"position-detail",
		chainId,
		tokenId,
	],
	positionFee: (chainId: number | undefined, tokenId: BigNumber | undefined) => [
		"position-fee",
		chainId,
		tokenId?.toString(),
	],
} as const
