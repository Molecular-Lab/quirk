import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient, endpoints } from '../lib/api-client'
import { queryKeys } from '../lib/query-client'
import type { AIInsight, AIInsightsSummary, APIResponse } from '../types'

/**
 * Fetch AI insights with optional priority filter
 */
export function useAIInsights(priority?: string) {
	return useQuery({
		queryKey: queryKeys.aiInsights.list(priority),
		queryFn: async () => {
			const params = priority ? `?priority=${priority}` : ''
			const response = await apiClient.get<APIResponse<AIInsight[]>>(
				`${endpoints.aiInsights.list}${params}`
			)
			return response.data.data
		},
		// Refetch every 10 minutes (AI insights update less frequently)
		refetchInterval: 10 * 60 * 1000,
	})
}

/**
 * Fetch AI insights summary
 */
export function useAIInsightsSummary() {
	return useQuery({
		queryKey: queryKeys.aiInsights.summary(),
		queryFn: async () => {
			const response = await apiClient.get<APIResponse<AIInsightsSummary>>(
				endpoints.aiInsights.summary
			)
			return response.data.data
		},
		refetchInterval: 10 * 60 * 1000,
	})
}

/**
 * Mark an AI insight as acted upon
 */
export function useMarkInsightActedUpon() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (insightId: string) => {
			const response = await apiClient.post<APIResponse<AIInsight>>(
				endpoints.aiInsights.markActedUpon(insightId)
			)
			return response.data.data
		},
		onSuccess: () => {
			// Invalidate insights to refetch
			queryClient.invalidateQueries({
				queryKey: queryKeys.aiInsights.all,
			})
		},
	})
}
