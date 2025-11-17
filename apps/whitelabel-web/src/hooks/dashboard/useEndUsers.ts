import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient, endpoints } from '../lib/api-client'
import { queryKeys } from '../lib/query-client'
import type {
	EndUserListItem,
	EndUserValue,
	EndUserDeposit,
	APIResponse,
} from '../types'

/**
 * Fetch all end-users for the current client
 */
export function useEndUsers() {
	return useQuery({
		queryKey: queryKeys.endUsers.list(),
		queryFn: async () => {
			const response = await apiClient.get<APIResponse<EndUserListItem[]>>(
				endpoints.endUsers.list
			)
			return response.data.data
		},
	})
}

/**
 * Fetch single end-user details
 */
export function useEndUser(userId: string) {
	return useQuery({
		queryKey: queryKeys.endUsers.detail(userId),
		queryFn: async () => {
			const response = await apiClient.get<APIResponse<EndUserDeposit>>(
				endpoints.endUsers.get(userId)
			)
			return response.data.data
		},
		enabled: !!userId,
	})
}

/**
 * Fetch end-user current value (with yield calculation)
 */
export function useEndUserValue(userId: string) {
	return useQuery({
		queryKey: queryKeys.endUsers.value(userId),
		queryFn: async () => {
			const response = await apiClient.get<APIResponse<EndUserValue>>(
				endpoints.endUsers.value(userId)
			)
			return response.data.data
		},
		enabled: !!userId,
		// Refetch every minute for real-time yield updates
		refetchInterval: 60 * 1000,
	})
}

/**
 * Create a new end-user deposit (for testing/demo)
 */
export function useCreateDeposit() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (data: { userId: string; amount: number }) => {
			const response = await apiClient.post<APIResponse<EndUserDeposit>>(
				endpoints.endUsers.list,
				data
			)
			return response.data.data
		},
		onSuccess: () => {
			// Invalidate end-users list to refetch
			queryClient.invalidateQueries({ queryKey: queryKeys.endUsers.list() })
		},
	})
}
