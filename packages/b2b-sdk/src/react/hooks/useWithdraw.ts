import { useCallback } from 'react'
import { useQuirkContext } from '../QuirkContext'
import { useAsyncAction } from './useAsyncAction'
import type { Withdrawal, CreateWithdrawalRequest } from '../../types'

export interface UseWithdrawReturn {
	/**
	 * Create withdrawal request (crypto or fiat)
	 * Returns pending withdrawal details
	 */
	create: (params: CreateWithdrawalRequest) => Promise<Withdrawal>

	/**
	 * Loading state (true when action is in progress)
	 */
	loading: boolean

	/**
	 * Error from last action (null if no error)
	 */
	error: Error | null
}

/**
 * Hook for managing withdrawals
 *
 * @example
 * ```tsx
 * import { useWithdraw } from '@quirk/b2b-sdk'
 *
 * function WithdrawButton() {
 *   const { create, loading, error } = useWithdraw()
 *
 *   const handleWithdraw = async () => {
 *     try {
 *       const withdrawal = await create({
 *         userId: 'user_123',
 *         vaultId: 'base-0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
 *         amount: '500.00',
 *         withdrawal_method: 'crypto',
 *         destination_address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
 *         chain: '8453',
 *         token_address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'
 *       })
 *       console.log('Withdrawal requested:', withdrawal)
 *     } catch (err) {
 *       console.error('Withdrawal failed:', err)
 *     }
 *   }
 *
 *   if (error) return <div>Error: {error.message}</div>
 *
 *   return (
 *     <button onClick={handleWithdraw} disabled={loading}>
 *       {loading ? 'Processing...' : 'Withdraw $500'}
 *     </button>
 *   )
 * }
 * ```
 *
 * @example Fiat Withdrawal
 * ```tsx
 * const { create } = useWithdraw()
 *
 * await create({
 *   userId: 'user_123',
 *   vaultId: 'base-0x833589fCD...',
 *   amount: '500.00',
 *   withdrawal_method: 'fiat_to_client',
 *   destination_currency: 'USD'
 * })
 * ```
 */
export function useWithdraw(): UseWithdrawReturn {
	const { sdk } = useQuirkContext()

	// Create withdrawal action
	const createAction = useCallback(
		async (params: CreateWithdrawalRequest) => {
			return sdk.withdrawals.create(params)
		},
		[sdk]
	)

	const { execute: create, loading, error } = useAsyncAction(createAction)

	return {
		create,
		loading,
		error,
	}
}
