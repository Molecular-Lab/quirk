/**
 * useCustodialBalance Hook
 *
 * React Query hook that fetches user balance from the backend API
 * using the custodial model (backend manages wallets).
 *
 * This hook:
 * - Automatically gets Privy user ID from usePrivy()
 * - Automatically uses current environment from store (sandbox/production)
 * - Returns parsed numeric values for easy display
 * - Includes user ID and environment in query key for automatic refetch
 * - Provides proper loading/error states via React Query
 *
 * @example
 * const { data: balance, isLoading, error } = useCustodialBalance()
 * if (balance) {
 *   console.log(`Balance: $${balance.balance} with ${balance.apy} APY`)
 * }
 */

import { useQuery } from "@tanstack/react-query"
import { usePrivy } from "@privy-io/react-auth"
import { getUserBalance } from "@/api/b2bClientHelpers"
import { useEnvironmentStore } from "@/store/environmentStore"

export interface CustodialBalance {
  balance: number           // Total effective balance as number (USD)
  yieldEarned: number      // Yield earned as number (USD)
  apy: string              // Annual percentage yield as string (e.g., "3.5%")
  currency: string         // Currency code (e.g., "USD")
  status: string           // Account status ("active" | "inactive")
  entryIndex: string       // User's weighted entry index
  currentIndex: string     // Current client growth index
}

/**
 * Hook to fetch custodial balance for the authenticated user
 *
 * @param enabled - Whether the query should be enabled (default: true)
 * @returns React Query result with CustodialBalance data
 */
export function useCustodialBalance(enabled = true) {
  const { user, authenticated } = usePrivy()
  const apiEnvironment = useEnvironmentStore((state) => state.apiEnvironment)

  return useQuery({
    queryKey: ["custodialBalance", user?.id, apiEnvironment],
    queryFn: async (): Promise<CustodialBalance | null> => {
      if (!user?.id) {
        throw new Error("User not authenticated")
      }

      const response = await getUserBalance(user.id, {
        environment: apiEnvironment,
      })

      if (!response.found || !response.data) {
        return null
      }

      // Parse string values to numbers for easier display
      return {
        balance: parseFloat(response.data.balance),
        yieldEarned: parseFloat(response.data.yield_earned),
        apy: response.data.apy,
        currency: response.data.currency,
        status: response.data.status,
        entryIndex: response.data.entry_index,
        currentIndex: response.data.current_index,
      }
    },
    enabled: enabled && authenticated && !!user?.id,
    staleTime: 30000,  // 30 seconds - data is considered fresh for this duration
    refetchInterval: 60000,  // Refetch every 60 seconds for fresh balance data
  })
}
