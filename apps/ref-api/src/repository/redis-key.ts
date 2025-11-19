import { Address } from "viem"

import { PoolDataTimeframe, PoolSortBy, ProtocolChartTimeframe, SortDirection } from "@rabbitswap/api-core"

import { sortTokenPair } from "@/utils"

/**
 * every redis keys getter of this app should be defined here for consistency
 */
export const RedisKey = {
	tokenStat: (chainId: number) => `tokens:${chainId}:stat`,
	token: (chainId: number, address: string) => ({
		info: `token:${chainId}:${address.toLowerCase()}:info`,
		price: `token:${chainId}:${address.toLowerCase()}:price`,
	}),
	protocol: {
		tvl: `protocol:tvl`,
		tradingVolume: (timeframe: ProtocolChartTimeframe) => `protocol:volume:${timeframe}`,
	},
	poolsInfo: `pools:info`,
	poolStat: (sortBy: PoolSortBy, sortDirection: SortDirection) => `pools:stat:${sortBy}:${sortDirection}`,
	tokenPair: (tokenPair: [Address, Address]) => {
		const [token0, token1] = sortTokenPair(tokenPair)
		const prefixKey = `${token0}_${token1}`
		return {
			poolDistribution: `token_pair:${prefixKey}:distribution`,
		}
	},
	pool: (address: string) => ({
		stat: `pool:${address.toLowerCase()}:stat`,
		volumeChart: (timeframe: PoolDataTimeframe) => `pool:${address.toLowerCase()}:volume_chart:${timeframe}`,
		priceChart: (timeframe: PoolDataTimeframe) => `pool:${address.toLowerCase()}:price_chart:${timeframe}`,
		ticks: `pool:${address.toLowerCase()}:ticks`,
	}),
} as const
