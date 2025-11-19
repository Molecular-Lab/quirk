import { useQueries, useQuery, useQueryClient } from "@tanstack/react-query"
import BigNumber from "bignumber.js"
import { getAddress } from "viem"
import { viction } from "viem/chains"

import { TokenStats as _TokenStats } from "@rabbitswap/api-core/dto"

import apiClient from "@/api/core"
import { QueryKeys } from "@/config/queryKey"
import { EvmToken } from "@/types/tokens"
import { getWrapped } from "@/utils/token"

export interface TokenStats extends Omit<_TokenStats, "price"> {
	price: BigNumber
}

/**
 * ccyId -> stat
 */
type TokenStatsResult = Record<string, TokenStats>

export const useAllTokensStats = (chainId: number) => {
	const queryClient = useQueryClient()

	return useQuery<TokenStatsResult>({
		queryKey: QueryKeys.token.tokensStats(chainId),
		queryFn: async () => {
			const res = await apiClient.tokenRouter.getTokensStats(chainId)

			const response: TokenStatsResult = {}
			for (const [tokenAddr, tokenStat] of Object.entries(res)) {
				const stats: TokenStats = {
					...tokenStat,
					price: BigNumber(tokenStat.price ?? 0),
				}

				const currencyId = EvmToken.formatCurrencyId(chainId, getAddress(tokenAddr))
				response[currencyId] = stats
				// cache
				queryClient.setQueryData(QueryKeys.token.tokenStats(currencyId), stats)
			}

			return response
		},
		refetchInterval: 60_000, // 1 minute
	})
}

const getTokenStats = async (token?: EvmToken) => {
	if (!token) return null

	const wrappedToken = getWrapped(token)
	const res = await apiClient.tokenRouter.getTokensStats(wrappedToken.chainId)
	const tokenStat = res[wrappedToken.address.toLocaleLowerCase()]

	if (tokenStat) {
		const stats: TokenStats = {
			...tokenStat,
			price: BigNumber(tokenStat.price ?? 0),
		}
		return stats
	}

	return null
}

export const useTokensStats = (tokens: EvmToken[]) => {
	return useQueries({
		queries: tokens.map((token) => ({
			queryKey: QueryKeys.token.tokenStats(getWrapped(token).currencyId),
			queryFn: async () => await getTokenStats(token),
		})),
		combine: (results) => {
			const stats: TokenStatsResult = {}

			for (const result of results) {
				if (!result.data) continue
				stats[result.data.address.toLowerCase()] = result.data
			}

			const isLoading = results.some((result) => result.isLoading)

			return {
				data: isLoading ? undefined : stats,
				isLoading: isLoading,
			}
		},
	})
}

export const useTokenStats = (token?: EvmToken) => {
	const wrappedToken = token ? getWrapped(token) : undefined

	return useQuery<TokenStats | null>({
		queryKey: QueryKeys.token.tokenStats(wrappedToken?.currencyId),
		queryFn: async () => {
			const tokenStat = await getTokenStats(wrappedToken)

			if (tokenStat) return tokenStat

			// If token stats not found, try to fetch from coingecko (only non-viction tokens)
			if (token?.chainId !== viction.id) {
				const stat = await getTokenPriceFromCoingecko(token)
				return stat
			}

			return null
		},
		enabled: !!wrappedToken,
		refetchInterval: 60_000, // 1 minute
	})
}

const getTokenPriceFromCoingecko = async (token: EvmToken | undefined): Promise<TokenStats | null> => {
	if (!token) return null

	const wrappedToken = getWrapped(token)

	const coingeckoPrices = await apiClient.coingeckoRouter.getTokenPrice(wrappedToken.chainId, [wrappedToken.address])

	const price = coingeckoPrices[wrappedToken.address.toLocaleLowerCase()]
	if (price === undefined) return null

	const r: TokenStats = {
		price: BigNumber(price),
		change24h: 0,
		change1h: 0,
		totalSupply: undefined,
		address: getAddress(wrappedToken.address),
	}

	return r
}
