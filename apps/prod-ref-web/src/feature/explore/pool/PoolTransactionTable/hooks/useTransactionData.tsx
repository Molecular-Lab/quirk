import { useMemo } from "react"

import { useQuery } from "@tanstack/react-query"

import { PoolTransactionItem, TransactionType } from "@rabbitswap/api-core/dto"

import apiClient from "@/api/core"
import { QueryKeys } from "@/config/queryKey"
import { Pool } from "@/types/pool"

const usePoolTransactions = (pool?: Pool) => {
	return useQuery<PoolTransactionItem[]>({
		queryKey: QueryKeys.explore.poolTransactions(pool?.address, pool?.chainId),
		queryFn: async () => {
			const txs = await apiClient.exploreRouter.getPoolTransactions(pool!.address!)
			return txs
		},
		enabled: !!pool && !!pool.address,
	})
}

export const useTransactionData = (
	pool?: Pool,
	typeFilter?: TransactionType[],
	inverted?: boolean,
): {
	data: PoolTransactionItem[] | undefined
	isLoading: boolean
} => {
	const { isLoading, data: transactions } = usePoolTransactions(pool)

	const filteredTransactions = useMemo<PoolTransactionItem[] | undefined>(() => {
		const filter: TransactionType[] =
			typeFilter?.map((type) => {
				if (inverted) {
					if (type === "buy") return "sell"
					if (type === "sell") return "buy"
					return type
				}
				return type
			}) ?? []

		return transactions?.filter((tx) => filter.includes(tx.type))
	}, [inverted, transactions, typeFilter])

	return {
		data: isLoading ? Array.from({ length: 5 }).map(() => ({}) as PoolTransactionItem) : filteredTransactions,
		isLoading: isLoading,
	}
}
