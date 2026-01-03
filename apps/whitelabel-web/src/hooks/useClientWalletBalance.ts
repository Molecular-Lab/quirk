/**
 * Hook to fetch client wallet balance (for B2B whitelabel dashboard)
 * Fetches from client_vaults table, not end_user_vaults
 */

import { useQuery } from "@tanstack/react-query"
import { useEnvironmentStore } from "@/store/environmentStore"
import { useUserStore } from "@/store/userStore"
import { b2bApiClient } from "@/api/b2bClient"

export interface ClientWalletBalance {
	productId: string
	totalIdleBalance: number
	totalEarningBalance: number
	totalBalance: number
	totalClientRevenue: number
	totalPlatformRevenue: number
	totalEnduserRevenue: number
	totalCumulativeYield: number
}

/**
 * Fetch client wallet balance for the active product
 * This shows the platform's vault balance (client_vaults), not end-user balance
 */
export function useClientWalletBalance(enabled = true) {
	const { activeProductId } = useUserStore()
	const apiEnvironment = useEnvironmentStore((state) => state.apiEnvironment)

	return useQuery({
		queryKey: ["clientWalletBalance", activeProductId, apiEnvironment],
		queryFn: async (): Promise<ClientWalletBalance | null> => {
			if (!activeProductId) {
				throw new Error("No active product")
			}

			const response = await b2bApiClient.client.getWalletBalances({
				params: { productId: activeProductId },
				query: { environment: apiEnvironment },
			})

			if (response.status === 200 && response.body.found && response.body.data) {
				const data = response.body.data
				const idleBalance = parseFloat(data.totalIdleBalance)
				const earningBalance = parseFloat(data.totalEarningBalance)

				return {
					productId: data.productId,
					totalIdleBalance: idleBalance,
					totalEarningBalance: earningBalance,
					totalBalance: idleBalance + earningBalance,
					totalClientRevenue: parseFloat(data.totalClientRevenue),
					totalPlatformRevenue: parseFloat(data.totalPlatformRevenue),
					totalEnduserRevenue: parseFloat(data.totalEnduserRevenue),
					totalCumulativeYield: parseFloat(data.totalCumulativeYield),
				}
			}

			return null
		},
		enabled: enabled && !!activeProductId,
		staleTime: 30000, // 30 seconds
		refetchInterval: 60000, // Refetch every 60 seconds
	})
}

