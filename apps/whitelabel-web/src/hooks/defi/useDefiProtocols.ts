import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient, endpoints } from '../lib/api-client'
import { queryKeys } from '../lib/query-client'
import type {
	DefiProtocolStatus,
	DefiAllocation,
	RiskTierConfig,
	APIResponse,
} from '../types'

/**
 * Fetch all DeFi protocol statuses
 */
export function useDefiProtocols() {
	return useQuery({
		queryKey: queryKeys.defiProtocols.status(),
		queryFn: async () => {
			const response = await apiClient.get<APIResponse<DefiProtocolStatus[]>>(
				endpoints.defiProtocols.status
			)
			return response.data.data
		},
		// Refetch every 5 minutes (DeFi protocols update frequently)
		refetchInterval: 5 * 60 * 1000,
	})
}

/**
 * Fetch current DeFi allocations
 */
export function useDefiAllocations() {
	return useQuery({
		queryKey: queryKeys.defiProtocols.allocations(),
		queryFn: async () => {
			const response = await apiClient.get<APIResponse<DefiAllocation[]>>(
				endpoints.defiProtocols.allocations
			)
			return response.data.data
		},
	})
}

/**
 * Update DeFi allocation (risk tier configuration)
 */
export function useUpdateAllocation() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (config: RiskTierConfig) => {
			const response = await apiClient.post<APIResponse<DefiAllocation[]>>(
				endpoints.defiProtocols.updateAllocation,
				config
			)
			return response.data.data
		},
		onSuccess: () => {
			// Invalidate protocol data to refetch
			queryClient.invalidateQueries({
				queryKey: queryKeys.defiProtocols.all,
			})
			queryClient.invalidateQueries({
				queryKey: queryKeys.vaultIndex.all,
			})
		},
	})
}

/**
 * Get available risk tier configurations
 */
export const RISK_TIER_CONFIGS: Record<
	'low' | 'moderate' | 'high',
	RiskTierConfig
> = {
	low: {
		riskTier: 'low',
		allocations: [
			{ protocol: 'aave', percent: 70 },
			{ protocol: 'compound', percent: 30 },
		],
		expectedAPY: 5.2,
		description: 'Conservative strategy focused on stable lending protocols',
	},
	moderate: {
		riskTier: 'moderate',
		allocations: [
			{ protocol: 'aave', percent: 50 },
			{ protocol: 'compound', percent: 30 },
			{ protocol: 'curve', percent: 20 },
		],
		expectedAPY: 7.5,
		description: 'Balanced approach with some liquidity pool exposure',
	},
	high: {
		riskTier: 'high',
		allocations: [
			{ protocol: 'aave', percent: 40 },
			{ protocol: 'curve', percent: 30 },
			{ protocol: 'uniswap', percent: 30 },
		],
		expectedAPY: 12.8,
		description: 'Aggressive strategy maximizing yields with higher risk',
	},
}
