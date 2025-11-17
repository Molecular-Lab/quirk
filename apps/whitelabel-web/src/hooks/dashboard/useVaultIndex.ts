import { useQuery } from '@tanstack/react-query'
import { apiClient, endpoints } from '../lib/api-client'
import { queryKeys } from '../lib/query-client'
import type {
	VaultIndex,
	IndexHistory,
	IndexGrowthMetrics,
	APIResponse,
} from '../types'

/**
 * Fetch current vault index
 */
export function useVaultIndex() {
	return useQuery({
		queryKey: queryKeys.vaultIndex.current(),
		queryFn: async () => {
			const response = await apiClient.get<APIResponse<VaultIndex>>(
				endpoints.vaultIndex.current
			)
			return response.data.data
		},
		// Refetch every 5 minutes
		refetchInterval: 5 * 60 * 1000,
	})
}

/**
 * Fetch vault index history for charts
 */
export function useVaultIndexHistory(days: number = 30) {
	return useQuery({
		queryKey: queryKeys.vaultIndex.history(days),
		queryFn: async () => {
			const response = await apiClient.get<APIResponse<IndexHistory[]>>(
				`${endpoints.vaultIndex.history}?days=${days}`
			)
			return response.data.data
		},
		// History data is less volatile, refetch every 30 minutes
		staleTime: 30 * 60 * 1000,
	})
}

/**
 * Fetch vault index growth metrics
 */
export function useVaultIndexMetrics() {
	return useQuery({
		queryKey: queryKeys.vaultIndex.metrics(),
		queryFn: async () => {
			const response = await apiClient.get<APIResponse<IndexGrowthMetrics>>(
				endpoints.vaultIndex.metrics
			)
			return response.data.data
		},
		// Refetch every minute for real-time metrics
		refetchInterval: 60 * 1000,
	})
}
