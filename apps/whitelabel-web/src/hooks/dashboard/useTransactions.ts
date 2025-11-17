import { useQuery } from '@tanstack/react-query'
import { apiClient, endpoints } from '../lib/api-client'
import { queryKeys } from '../lib/query-client'
import type {
	Transaction,
	TransactionListItem,
	TransactionSummary,
	APIResponse,
	PaginatedResponse,
} from '../types'

/**
 * Fetch transaction list with optional filters
 */
export function useTransactions(filters?: {
	type?: string
	userId?: string
	page?: number
	pageSize?: number
}) {
	return useQuery({
		queryKey: queryKeys.transactions.list(filters),
		queryFn: async () => {
			const params = new URLSearchParams()
			if (filters?.type) params.append('type', filters.type)
			if (filters?.userId) params.append('userId', filters.userId)
			if (filters?.page) params.append('page', filters.page.toString())
			if (filters?.pageSize)
				params.append('pageSize', filters.pageSize.toString())

			const response = await apiClient.get<
				APIResponse<PaginatedResponse<TransactionListItem>>
			>(`${endpoints.transactions.list}?${params.toString()}`)
			return response.data.data
		},
	})
}

/**
 * Fetch transaction summary
 */
export function useTransactionSummary() {
	return useQuery({
		queryKey: queryKeys.transactions.summary(),
		queryFn: async () => {
			const response = await apiClient.get<APIResponse<TransactionSummary>>(
				endpoints.transactions.summary
			)
			return response.data.data
		},
	})
}

/**
 * Fetch single transaction detail
 */
export function useTransaction(txId: string) {
	return useQuery({
		queryKey: queryKeys.transactions.detail(txId),
		queryFn: async () => {
			const response = await apiClient.get<APIResponse<Transaction>>(
				endpoints.transactions.get(txId)
			)
			return response.data.data
		},
		enabled: !!txId,
	})
}
