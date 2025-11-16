/**
 * useProxifyDeposit Hook
 * Main hook for B2B deposits (both external and internal)
 *
 * Usage:
 * ```ts
 * const { deposit, status, isPending, orderId } = useProxifyDeposit()
 *
 * // External payment (Apple Pay)
 * deposit({
 *   type: 'external',
 *   userId: '123',
 *   amount: 100,
 *   method: 'apple_pay'
 * })
 *
 * // Internal transfer (YouTube balance)
 * deposit({
 *   type: 'internal',
 *   userId: '123',
 *   amount: 5000,
 *   clientBalanceId: 'youtube_balance_abc'
 * })
 * ```
 */

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { depositAPI } from '@/lib/deposit-api'
import { queryKeys } from '@/lib/query-client'
import type { DepositRequest } from '@/types/deposit'

/**
 * Main hook for deposits (BOTH external and internal)
 */
export function useProxifyDeposit() {
	const queryClient = useQueryClient()
	const [currentOrderId, setCurrentOrderId] = useState<string | null>(null)

	// Create deposit mutation
	const {
		mutate: deposit,
		mutateAsync: depositAsync,
		isPending,
		error,
		isSuccess,
		isError,
	} = useMutation({
		mutationFn: (params: DepositRequest) => depositAPI.createDeposit(params),
		onSuccess: (response: Awaited<ReturnType<typeof depositAPI.createDeposit>>) => {
			// Invalidate deposits list
			queryClient.invalidateQueries({
				queryKey: queryKeys.deposits.all,
			})

			// Store order ID for status tracking
			setCurrentOrderId(response.data.orderId)

			// Handle external payment (open payment URL)
			if (response.data.type === 'external' && response.data.paymentUrl) {
				// Open payment URL in new tab
				window.open(response.data.paymentUrl, '_blank')
			}

			// Internal transfer is instant, no need to do anything
		},
		onError: (err: Error) => {
			console.error('Failed to create deposit:', err)
		},
	})

	// Get deposit status (auto-polls for external, instant for internal)
	const { data: depositStatus, isLoading: isStatusLoading } =
		useDepositStatus(currentOrderId)

	return {
		// Functions
		deposit, // Trigger deposit (void return)
		depositAsync, // Async version (returns promise)

		// State
		isPending, // Loading state (creating order)
		isSuccess, // Order created successfully
		isError, // Order creation failed
		error, // Error object
		orderId: currentOrderId, // Current order ID
		status: depositStatus, // Deposit status (auto-updates)
		isStatusLoading, // Loading deposit status

		// Helpers
		reset: () => setCurrentOrderId(null), // Reset state
	}
}

/**
 * Get real-time deposit status
 * Polls every 5s for EXTERNAL deposits (until completed/failed)
 * No polling for INTERNAL deposits (instant completion)
 */
export function useDepositStatus(orderId: string | null) {
	return useQuery({
		queryKey: queryKeys.deposits.detail(orderId!),
		queryFn: () => depositAPI.getDepositStatus(orderId!),
		enabled: !!orderId, // Only run if orderId exists
		refetchInterval: (query: { state: { data?: Awaited<ReturnType<typeof depositAPI.getDepositStatus>> } }) => {
			const data = query.state.data

			// Don't poll if no data yet
			if (!data) return false

			// Don't poll for internal transfers (instant)
			if (data.type === 'internal') {
				return false
			}

			// Poll every 5s for external if pending/processing
			if (
				data.type === 'external' &&
				(data.status === 'PENDING' ||
					data.status === 'AWAITING_PAYMENT' ||
					data.status === 'PROCESSING')
			) {
				return 5000 // 5 seconds
			}

			return false // Stop polling when completed/failed
		},
		staleTime: 0, // Always fetch fresh data
	})
}

/**
 * List all deposits for a user
 */
export function useDeposits(userId: string, page: number = 1, limit: number = 20) {
	return useQuery({
		queryKey: queryKeys.deposits.list(userId, page),
		queryFn: () => depositAPI.listDeposits(userId, page, limit),
		enabled: !!userId,
		staleTime: 30 * 1000, // 30 seconds
	})
}

/**
 * Get client's prepaid balance (for internal transfers)
 * Shows how much fiat the client has deposited with Proxify
 */
export function useClientBalance() {
	return useQuery({
		queryKey: queryKeys.deposits.clientBalance,
		queryFn: () => depositAPI.getClientBalance(),
		staleTime: 60 * 1000, // 1 minute
		refetchOnWindowFocus: true,
	})
}
