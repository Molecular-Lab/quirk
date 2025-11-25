import { useMemo, useState } from "react"

import { useQuery } from "@tanstack/react-query"
import { type SortingState } from "@tanstack/react-table"
import { isAddress, isAddressEqual } from "viem"

import { PoolData, PoolSortBy, SortDirection } from "@rabbitswap/api-core/dto"

import apiClient from "@/api/core"
import { QueryKeys } from "@/config/queryKey"
import { useTokens } from "@/hooks/token/useToken"
import { useSwapChainId } from "@/hooks/useChainId"
import { EvmToken } from "@/types/tokens"

export type PoolStats = Omit<PoolData, "token0" | "token1"> & {
	token0: EvmToken | undefined
	token1: EvmToken | undefined
}

interface UseAllPoolsResult {
	data: PoolStats[] | undefined
	isLoading: boolean
}

export const useAllPools = (sortBy: PoolSortBy, sortDirection: SortDirection): UseAllPoolsResult => {
	const chainId = useSwapChainId()

	const { data: allPoolsToken, isLoading: allPoolLoading } = useQuery<PoolData[]>({
		queryKey: QueryKeys.pool.allPools(chainId, sortBy, sortDirection),
		queryFn: async () => {
			const poolData = await apiClient.exploreRouter.getPools(sortBy, sortDirection)
			return poolData
		},
		refetchInterval: 60_000, // 1 minute
	})

	const uniqueTokenCcyIds = useMemo<string[]>(() => {
		if (allPoolsToken === undefined) return []
		const token0CcyIds = allPoolsToken.map((p) => EvmToken.formatCurrencyId(chainId, p.token0))
		const token1CcyIds = allPoolsToken.map((p) => EvmToken.formatCurrencyId(chainId, p.token1))
		return Array.from(new Set([...token0CcyIds, ...token1CcyIds]))
	}, [allPoolsToken, chainId])

	const { data: tokens, isLoading: tokenLoading } = useTokens(uniqueTokenCcyIds)

	// map token address to token object
	const pools = useMemo<PoolStats[] | undefined>(() => {
		if (allPoolsToken === undefined) {
			return undefined
		}
		return allPoolsToken.map<PoolStats>((p) => {
			return {
				...p,
				token0: tokens.find((t) => isAddressEqual(t.address, p.token0)),
				token1: tokens.find((t) => isAddressEqual(t.address, p.token1)),
			}
		})
	}, [allPoolsToken, tokens])

	return {
		data: pools,
		isLoading: allPoolLoading || tokenLoading,
	}
}

interface UsePoolDataResult {
	poolData: PoolStats[] | undefined[]
	sorting: SortingState
	setSorting: React.Dispatch<React.SetStateAction<SortingState>>
	isLoading: boolean
}

export const usePoolData = (search?: string): UsePoolDataResult => {
	const [sorting, setSorting] = useState<SortingState>([
		{
			id: "totalValueLockedUsd",
			desc: true,
		},
	])
	const { data: allPools, isLoading } = useAllPools(
		sorting[0]?.id as PoolSortBy,
		sorting[0] ? (sorting[0].desc ? "desc" : "asc") : undefined,
	)

	const filteredData = useMemo<PoolStats[] | undefined[]>(() => {
		if (isLoading || allPools === undefined) return Array.from({ length: 5 }).map(() => undefined)
		return allPools.filter(({ token0, token1, address }) => {
			// no filter
			if (!search) return true

			// cannot filter
			if (!token0 || !token1) return true

			const searchLower = search.toLowerCase()
			const foundT0ByAddress = token0.address.toLowerCase().includes(searchLower)
			const foundT1ByAddress = token1.address.toLowerCase().includes(searchLower)
			const foundPoolByAddress = address.toLowerCase().includes(searchLower)

			// search is address
			if (isAddress(search) && (foundT0ByAddress || foundT1ByAddress || foundPoolByAddress)) {
				return true
			}

			// search is normal string, filter by token symbol
			const foundT0BySymbol = token0.symbol?.toLowerCase().includes(searchLower) ?? false
			const foundT1BySymbol = token1.symbol?.toLowerCase().includes(searchLower) ?? false
			return foundT0BySymbol || foundT1BySymbol
		})
	}, [allPools, isLoading, search])

	return {
		poolData: filteredData,
		sorting: sorting,
		setSorting: setSorting,
		isLoading: isLoading,
	}
}
