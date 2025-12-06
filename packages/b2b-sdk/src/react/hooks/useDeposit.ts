import { useCallback, useMemo } from 'react'
import { useQuirkContext } from '../QuirkContext'
import { useAsyncAction } from './useAsyncAction'
import type { Deposit, CreateFiatDepositRequest, InitiateCryptoDepositRequest } from '../../types'

export interface UseDepositReturn {
	/**
	 * Create fiat deposit (bank transfer)
	 * Returns deposit order with payment instructions
	 */
	createFiat: (params: CreateFiatDepositRequest) => Promise<Deposit>

	/**
	 * Initiate crypto deposit (on-chain transfer)
	 * Returns custodial wallet address for deposit
	 */
	createCrypto: (params: InitiateCryptoDepositRequest) => Promise<{
		orderId: string
		status: string
		custodialWalletAddress: string
		chain: string
		tokenAddress: string
		tokenSymbol: string
		expectedAmount: string
		expiresAt: string
		createdAt: string
	}>

	/**
	 * Loading state (true when any action is in progress)
	 */
	loading: boolean

	/**
	 * Error from last action (null if no error)
	 */
	error: Error | null
}

/**
 * Hook for managing deposits (fiat & crypto)
 *
 * @example
 * ```tsx
 * import { useDeposit } from '@quirk/b2b-sdk'
 *
 * function DepositButton() {
 *   const { createFiat, loading, error } = useDeposit()
 *
 *   const handleFiatDeposit = async () => {
 *     try {
 *       const deposit = await createFiat({
 *         userId: 'user_123',
 *         amount: '1000.00',
 *         currency: 'USD',
 *         tokenSymbol: 'USDC'
 *       })
 *       console.log('Payment instructions:', deposit.paymentInstructions)
 *     } catch (err) {
 *       console.error('Deposit failed:', err)
 *     }
 *   }
 *
 *   if (error) return <div>Error: {error.message}</div>
 *
 *   return (
 *     <button onClick={handleFiatDeposit} disabled={loading}>
 *       {loading ? 'Processing...' : 'Deposit $1000'}
 *     </button>
 *   )
 * }
 * ```
 */
export function useDeposit(): UseDepositReturn {
	const { sdk } = useQuirkContext()

	// Create fiat deposit action
	const createFiatAction = useCallback(
		async (params: CreateFiatDepositRequest) => {
			return sdk.deposits.createFiat(params)
		},
		[sdk]
	)

	const {
		execute: createFiat,
		loading: fiatLoading,
		error: fiatError,
	} = useAsyncAction(createFiatAction)

	// Create crypto deposit action
	const createCryptoAction = useCallback(
		async (params: InitiateCryptoDepositRequest) => {
			return sdk.deposits.initiateCrypto(params)
		},
		[sdk]
	)

	const {
		execute: createCrypto,
		loading: cryptoLoading,
		error: cryptoError,
	} = useAsyncAction(createCryptoAction)

	// Combine loading and error states
	const loading = useMemo(() => fiatLoading || cryptoLoading, [fiatLoading, cryptoLoading])
	const error = useMemo(() => fiatError || cryptoError, [fiatError, cryptoError])

	return {
		createFiat,
		createCrypto,
		loading,
		error,
	}
}
