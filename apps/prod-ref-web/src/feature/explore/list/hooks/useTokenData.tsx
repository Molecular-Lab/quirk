import { useMemo, useState } from "react"

import { type SortingState } from "@tanstack/react-table"
import BigNumber from "bignumber.js"
import { isAddress, isAddressEqual } from "viem"

import { useTokens } from "@/hooks/token/useToken"
import { useAllTokensStats } from "@/hooks/token/useTokenStats"
import { useSwapChainId } from "@/hooks/useChainId"
import { EvmToken } from "@/types/tokens"

export interface TokenData {
	token: EvmToken
	price?: BigNumber
	change24h?: number
	change1h?: number
	fdv?: BigNumber
	volume?: number
}

interface UseTokenDataResult {
	tokenData: TokenData[] | undefined[]
	sorting: SortingState
	setSorting: React.Dispatch<React.SetStateAction<SortingState>>
	isLoading: boolean
}

export const useTokenData = (search?: string): UseTokenDataResult => {
	const chainId = useSwapChainId()
	const { data: tokenStats, isLoading: statsLoading } = useAllTokensStats(chainId)
	const { data: tokens, isLoading: tokenLoading } = useTokens(Object.keys(tokenStats ?? {}))

	const [sorting, setSorting] = useState<SortingState>([{ id: "fdv", desc: true }])

	const tokenData = useMemo<TokenData[]>(() => {
		return tokens.map<TokenData>((t) => {
			const stats = tokenStats?.[t.currencyId]
			const x: TokenData = {
				token: t,
				price: stats?.price,
				change24h: stats?.change24h,
				change1h: stats?.change1h,
				fdv:
					stats?.price && stats.totalSupply !== undefined
						? BigNumber(stats.price).times(stats.totalSupply).shiftedBy(-t.decimals)
						: undefined,
				volume: stats?.volumeUSD,
			}
			return x
		})
	}, [tokens, tokenStats])

	const searchedTokenData = useMemo<TokenData[]>(() => {
		if (!search) return tokenData

		const searchLower = search.toLowerCase()
		return tokenData.filter((t) => {
			const foundByName = t.token.name?.toLowerCase().includes(searchLower)
			const foundBySymbol = t.token.symbol?.toLowerCase().includes(searchLower)
			const foundByAddress = isAddress(search) && isAddressEqual(t.token.address, search)
			return (foundByName ?? false) || (foundBySymbol ?? false) || foundByAddress
		})
	}, [search, tokenData])

	const sortedTokenData = useMemo<TokenData[]>(() => {
		return searchedTokenData.slice().sort((a, b) => {
			for (const sort of sorting) {
				const aValue = a[sort.id as keyof TokenData]
				const bValue = b[sort.id as keyof TokenData]

				if (aValue === undefined) return 1
				if (bValue === undefined) return -1

				const cmp = compareTokenData(aValue, bValue)
				if (cmp === 0) continue

				return sort.desc ? -cmp : cmp
			}
			return 0
		})
	}, [sorting, searchedTokenData])

	const isLoading: boolean = tokenLoading || statsLoading

	return {
		tokenData: isLoading ? Array.from({ length: 10 }).map(() => undefined) : sortedTokenData,
		sorting: sorting,
		setSorting: setSorting,
		isLoading: isLoading,
	}
}

type TokenDataValue = TokenData[keyof TokenData]
function compareTokenData<T extends Exclude<TokenDataValue, undefined>>(aValue: T, bValue: T): number {
	if (typeof aValue === "number" && typeof bValue === "number") {
		return aValue - bValue
	}

	if (aValue instanceof BigNumber && bValue instanceof BigNumber) {
		const cmp = aValue.comparedTo(bValue)
		return cmp ?? 0
	}

	if (aValue instanceof EvmToken && bValue instanceof EvmToken) {
		const cmp = aValue.compare(bValue)
		return cmp
	}

	return 0
}
