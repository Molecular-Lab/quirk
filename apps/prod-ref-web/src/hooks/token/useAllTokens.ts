import { useQuery, useQueryClient } from "@tanstack/react-query"

import apiClient from "@/api/core"
import { QueryKeys } from "@/config/queryKey"
import { VIC, WVIC } from "@/constants/token"
import { EvmToken } from "@/types/tokens"

export const useAllTokens = (chainId: number) => {
	const queryClient = useQueryClient()

	const query = useQuery<EvmToken[]>({
		queryKey: QueryKeys.token.allTokens(chainId),
		queryFn: async () => {
			const res = await apiClient.tokenRouter.getAllTokens(chainId)
			const tokens = res.map((token) => {
				return new EvmToken({
					chainId: token.chainId,
					address: token.address,
					decimals: token.decimals,
					symbol: token.symbol,
					name: token.name,
					iconURL: token.iconURL,
					isStable: token.isStable,
				})
			})

			// Cache token data
			for (const token of tokens) {
				queryClient.setQueryData(QueryKeys.token.token(token.currencyId), token)
			}

			return [VIC, WVIC, ...tokens]
		},
		enabled: !!chainId,
	})

	return query
}
