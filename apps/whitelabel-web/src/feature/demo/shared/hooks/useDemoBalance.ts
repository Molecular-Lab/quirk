/**
 * useDemoBalance Hook
 *
 * Custom hook for fetching and managing user balance state across demo platforms.
 * Handles loading states, errors, and automatic refetching based on dependencies.
 */

import { useState, useEffect, useCallback } from "react"
import { getUserBalance } from "@/api/b2bClientHelpers"

// Real balance type from API
interface UserBalance {
	balance: string
	currency: string
	yield_earned: string
	apy: string
	status: string
	entry_index: string
	current_index: string
}

interface UseDemoBalanceParams {
	endUserClientUserId: string | null
	hasEarnAccount: boolean
	selectedEnvironment: "sandbox" | "production"
	platformName: string
}

interface UseDemoBalanceReturn {
	realBalance: UserBalance | null
	isLoadingBalance: boolean
	balanceError: string | null
	refetchBalance: () => Promise<void>
}

/**
 * Hook to fetch and manage real balance for demo apps
 *
 * @param params - Configuration parameters
 * @returns Balance state and refetch function
 */
export function useDemoBalance({
	endUserClientUserId,
	hasEarnAccount,
	selectedEnvironment,
	platformName,
}: UseDemoBalanceParams): UseDemoBalanceReturn {
	const [realBalance, setRealBalance] = useState<UserBalance | null>(null)
	const [isLoadingBalance, setIsLoadingBalance] = useState(false)
	const [balanceError, setBalanceError] = useState<string | null>(null)

	const fetchBalance = useCallback(async () => {
		if (!endUserClientUserId || !hasEarnAccount) {
			setRealBalance(null)
			return
		}

		setIsLoadingBalance(true)
		setBalanceError(null)

		try {
			console.log(`[${platformName} Demo] Fetching real balance for user:`, endUserClientUserId, "environment:", selectedEnvironment)
			const response = await getUserBalance(endUserClientUserId, { environment: selectedEnvironment })

			if (response.found && response.data) {
				console.log(`[${platformName} Demo] Real balance fetched:`, response.data)
				setRealBalance(response.data)
			} else {
				console.warn(`[${platformName} Demo] Balance not found for user:`, endUserClientUserId)
				setBalanceError("Balance not found")
			}
		} catch (err) {
			console.error(`[${platformName} Demo] Failed to fetch balance:`, err)
			setBalanceError(err instanceof Error ? err.message : "Failed to load balance")
		} finally {
			setIsLoadingBalance(false)
		}
	}, [endUserClientUserId, hasEarnAccount, selectedEnvironment, platformName])

	// Fetch balance when dependencies change
	useEffect(() => {
		fetchBalance()
	}, [fetchBalance])

	return {
		realBalance,
		isLoadingBalance,
		balanceError,
		refetchBalance: fetchBalance,
	}
}
