import { Address } from "viem"

import { PoolDataTimeframe, ProtocolChartTimeframe } from "@rabbitswap/api-core/dto"

export const ExploreQueryKeys = {
	poolStats: (poolAddress: Address | undefined, chainId: number | undefined) => ["pool-stats", poolAddress, chainId],
	poolTicks: (poolAddress: Address | undefined, chainId: number | undefined) => ["pool-ticks", poolAddress, chainId],
	poolPrices: (poolAddress: Address | undefined, chainId: number | undefined, timeframe: PoolDataTimeframe) => [
		"pool-prices",
		poolAddress,
		chainId,
		timeframe,
	],
	poolVolume: (poolAddress: Address | undefined, chainId: number | undefined, timeframe: PoolDataTimeframe) => [
		"pool-volume",
		poolAddress,
		chainId,
		timeframe,
	],
	poolTransactions: (poolAddress: Address | undefined, chainId: number | undefined) => [
		"pool-transactions",
		poolAddress,
		chainId,
	],
	tvl: () => ["explore", "tvl"],
	volume: (timeframe: ProtocolChartTimeframe) => ["explore", "volume", timeframe],
} as const
