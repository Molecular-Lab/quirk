import { useQuery } from '@tanstack/react-query'
import { apiClient, endpoints } from '../lib/api-client'
import { queryKeys } from '../lib/query-client'
import type { DashboardMetrics, ClientProfile, APIResponse } from '../types'

/**
 * Fetch dashboard metrics
 */
export function useDashboardMetrics() {
	return useQuery({
		queryKey: queryKeys.dashboard.metrics(),
		queryFn: async () => {
			const response = await apiClient.get<APIResponse<DashboardMetrics>>(
				endpoints.dashboard.metrics
			)
			return response.data.data
		},
		// Refetch every minute for real-time dashboard
		refetchInterval: 60 * 1000,
	})
}

/**
 * Fetch client profile
 */
export function useClientProfile() {
	return useQuery({
		queryKey: queryKeys.client.profile(),
		queryFn: async () => {
			const response = await apiClient.get<APIResponse<ClientProfile>>(
				endpoints.client.profile
			)
			return response.data.data
		},
	})
}
