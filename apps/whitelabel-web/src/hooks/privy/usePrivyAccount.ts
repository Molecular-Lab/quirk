/**
 * Hook to get or create Privy account in database
 * Uses react-query for caching and automatic refetching
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { createPrivyAccount, getPrivyAccount } from "@/api/b2bClientHelpers"
import { B2BQueryKeys } from "@/config/queryKeys"

/**
 * Get Privy account from database
 */
export const usePrivyAccount = (privyOrganizationId: string | undefined) => {
	return useQuery({
		queryKey: B2BQueryKeys.privyAccount.get(privyOrganizationId),
		queryFn: async () => {
			if (!privyOrganizationId) throw new Error("Privy organization ID is required")

			const data = await getPrivyAccount(privyOrganizationId)
			return data
		},
		enabled: !!privyOrganizationId,
		retry: false, // Don't retry on 404 - means account doesn't exist yet
	})
}

/**
 * Create or update Privy account in database
 * Idempotent - safe to call multiple times (uses ON CONFLICT)
 */
export const useCreatePrivyAccount = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationKey: B2BQueryKeys.privyAccount.create(),
		mutationFn: async (data: {
			privyOrganizationId: string
			privyWalletAddress: string
			privyEmail?: string
			walletType: "MANAGED" | "USER_OWNED"
		}) => {
			return await createPrivyAccount(data)
		},
		onSuccess: async (_data, variables) => {
			// Invalidate and refetch Privy account query
			await queryClient.invalidateQueries({
				queryKey: B2BQueryKeys.privyAccount.get(variables.privyOrganizationId),
			})

			// Also invalidate organizations list (might have been created)
			await queryClient.invalidateQueries({
				queryKey: B2BQueryKeys.client.listByPrivyId(variables.privyOrganizationId),
			})
		},
	})
}
