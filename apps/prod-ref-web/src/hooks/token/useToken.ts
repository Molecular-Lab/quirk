import { QueryClient, useQueries, useQuery, useQueryClient } from "@tanstack/react-query"
import { type Address, getAddress, isAddressEqual } from "viem"

import apiClient from "@/api/core"
import { QueryKeys } from "@/config/queryKey"
import { EvmToken } from "@/types/tokens"
import { getChainToken } from "@/utils/token"

async function getToken(chainId: number, address: Address): Promise<EvmToken> {
	const { native, wrapped } = getChainToken(chainId)

	if (isAddressEqual(address, getAddress(native.address))) return native
	if (isAddressEqual(address, getAddress(wrapped.address))) return wrapped

	const tokenResp = await apiClient.tokenRouter.getTokenByAddress(chainId, address)

	const token = new EvmToken({
		chainId: tokenResp.chainId,
		address: tokenResp.address,
		decimals: tokenResp.decimals,
		symbol: tokenResp.symbol,
		name: tokenResp.name,
		iconURL: tokenResp.iconURL,
		isStable: tokenResp.isStable,
	})

	// FF and FHP
	if (
		token.currencyId === "88-0x965f31014b8625F616D0A71a2CEfB6C780faFe17"
		// || token.currencyId === "88-0x0AD76adC4C629E19aFD5ade9216FaB58F778f01D"
	) {
		token.iconURL =
			"https://raw.githubusercontent.com/BuildOnViction/tokens/master/tokens/0x965f31014b8625f616d0a71a2cefb6c780fafe17.png"
	}

	return token
}

/**
 * Get token from cache, if not found, fetch from API and cache
 */
export const getCachedToken = async (
	queryClient: QueryClient,
	chainId: number,
	tokenAddress: Address,
): Promise<EvmToken> => {
	const cachedToken = queryClient.getQueryData<EvmToken>(
		QueryKeys.token.token(EvmToken.formatCurrencyId(chainId, tokenAddress)),
	)
	if (cachedToken) return cachedToken

	const token = await getToken(chainId, tokenAddress)
	queryClient.setQueryData<EvmToken>(QueryKeys.token.token(EvmToken.formatCurrencyId(chainId, tokenAddress)), token)
	return token
}

export const useToken = (chainId: number | undefined, address: string | undefined) => {
	const { native, wrapped } = getChainToken(chainId)
	let tokenAddress: string | undefined
	try {
		if (address === native.symbol) {
			tokenAddress = native.address
		} else if (address === wrapped.symbol) {
			tokenAddress = wrapped.address
		} else {
			// try to parse address, if it's not a valid address leave it as undefined
			// for token search which the input might not be a valid address
			tokenAddress = getAddress(address ?? "")
		}
	} catch {
		// ignore
	}

	const currencyId = tokenAddress && chainId ? EvmToken.formatCurrencyId(chainId, tokenAddress) : undefined

	return useQuery<EvmToken>({
		queryKey: QueryKeys.token.token(currencyId),
		queryFn: async () => getToken(chainId ?? 0, getAddress(tokenAddress!)),
		enabled: !!tokenAddress && !!chainId,
	})
}

export const useTokens = (currencyIds: string[]) => {
	const queryClient = useQueryClient()
	return useQueries({
		queries: currencyIds.map((currencyId) => ({
			queryKey: QueryKeys.token.token(currencyId),
			queryFn: async () => {
				const [chainId, address] = EvmToken.parseCurrencyId(currencyId)
				return getCachedToken(queryClient, chainId, address)
			},
		})),
		combine: (results) => {
			return {
				data: results.map((result) => result.data).filter((data) => !!data),
				isLoading: results.some((result) => result.isLoading),
			}
		},
	})
}
