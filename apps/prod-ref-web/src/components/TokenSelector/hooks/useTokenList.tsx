import { useCallback, useMemo } from "react"

import { useLocalStorage } from "localstore"
import { Address } from "viem"

import { useUnlistedTokenModal } from "@/components/UnlistedTokenModal/store"
import { useAllTokens } from "@/hooks/token/useAllTokens"
import { useMyTokens } from "@/hooks/token/useMyTokens"
import { useToken, useTokens } from "@/hooks/token/useToken"
import { useSwapChainId } from "@/hooks/useChainId"
import { EvmToken } from "@/types/tokens"
import { useDebounced } from "@/utils/hooks/useDebounced"

interface UseTokenListParam {
	onSelect?: (token: EvmToken) => void
	onClose?: () => void
	balanceWallet?: Address
}

interface UseTokenListResult {
	query: ReturnType<typeof useDebounced<string>>
	handleSelect: (token: EvmToken) => void
	isSearching: boolean
	isLoading: boolean
	tokens: {
		search: EvmToken[]
		recentSearch: EvmToken[]
		my: EvmToken[]
		normal: EvmToken[]
	}
}

export const useTokenList = (param?: UseTokenListParam): UseTokenListResult => {
	const onSelect = param?.onSelect
	const onClose = param?.onClose
	const chainId = useSwapChainId()
	const { data: tokens, isLoading: tokensLoading } = useAllTokens(chainId)
	const { openModal: openUnlistedAlertModal } = useUnlistedTokenModal()

	// Search
	const [searchHistoryCcyId, setSearchHistoryCcyId] = useLocalStorage("token-search-history", [])
	const searchString = useDebounced<string>("")
	const isSearching = useMemo(() => searchString.debounced !== "", [searchString.debounced])
	const { data: searchedTokenByAddress, isLoading: searchedTokenByAddressLoading } = useToken(
		chainId,
		searchString.debounced,
	)

	const searchedTokens = useMemo<EvmToken[]>(() => {
		if (!tokens) return []

		const tokenBySearchString = tokens.filter((token) => {
			const searchStringLower = searchString.debounced.toLowerCase()
			const nameMatched = token.name?.toLowerCase().includes(searchStringLower) ?? false
			const symbolMatched = token.symbol?.toLowerCase().includes(searchStringLower) ?? false
			return nameMatched || symbolMatched
		})

		return [
			...tokenBySearchString,
			// Not allow to search native token by address
			...(searchedTokenByAddress && !searchedTokenByAddress.isNative ? [searchedTokenByAddress] : []),
		]
	}, [tokens, searchString.debounced, searchedTokenByAddress])

	// Recent search
	const { data: recentSearchTokens } = useTokens(searchHistoryCcyId)

	// My Tokens
	const { data: myTokensData } = useMyTokens({ balanceWallet: param?.balanceWallet })
	// Filter my tokens that not in search history
	const myTokens = useMemo<EvmToken[]>(() => {
		return myTokensData.myTokens.filter((token) => !searchHistoryCcyId.includes(token.currencyId))
	}, [myTokensData, searchHistoryCcyId])

	// Rest Tokens (not in my tokens and recent search)
	const restToken = useMemo<EvmToken[]>(() => {
		if (!tokens) return []
		return tokens.filter((token) => {
			const isMyToken = myTokens.some((t) => t.equals(token))
			const isRecentSearch = searchHistoryCcyId.includes(token.currencyId)
			return !isMyToken && !isRecentSearch
		})
	}, [tokens, myTokens, searchHistoryCcyId])

	// handle select
	const handleSelect = useCallback(
		async (token: EvmToken) => {
			// if selected token is not in standard list, show modal
			const ack = await openUnlistedAlertModal({ token })
			if (!ack) return

			// If in search mode, move the selected token to the top of the search history
			if (isSearching) {
				setSearchHistoryCcyId(
					[token.currencyId, ...searchHistoryCcyId.filter((id) => id !== token.currencyId)].slice(0, 3),
				)
			}

			onSelect?.(token)
			onClose?.()
		},
		[openUnlistedAlertModal, isSearching, onSelect, onClose, setSearchHistoryCcyId, searchHistoryCcyId],
	)

	return {
		query: searchString,
		handleSelect: (token) => {
			void handleSelect(token)
		},
		isSearching: isSearching,
		isLoading: tokensLoading || searchedTokenByAddressLoading,
		tokens: {
			search: searchedTokens,
			recentSearch: recentSearchTokens,
			my: myTokens,
			normal: restToken,
		},
	}
}
