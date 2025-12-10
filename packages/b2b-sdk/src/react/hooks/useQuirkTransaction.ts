import { useCallback, useMemo } from "react"

import { useQuirkContext } from "../QuirkContext"

import { useAsyncAction } from "./useAsyncAction"

import type {
	CreateFiatDepositRequest,
	CreateWithdrawalRequest,
	Deposit,
	DepositStats,
	InitiateCryptoDepositRequest,
	Withdrawal,
	WithdrawalStats,
} from "../../types"

export interface UseQuirkTransactionReturn {
	/**
	 * Deposit operations
	 */
	deposit: {
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
	}

	/**
	 * Withdrawal operations
	 */
	withdraw: {
		/**
		 * Create withdrawal request (crypto or fiat)
		 * Returns pending withdrawal details
		 */
		create: (params: CreateWithdrawalRequest) => Promise<Withdrawal>
	}

	/**
	 * Transaction statistics
	 * Automatically uses productId from QuirkProvider context
	 */
	stats: {
		/**
		 * Get deposit statistics for this client/product
		 */
		getDeposits: () => Promise<DepositStats>

		/**
		 * Get withdrawal statistics for this client/product
		 */
		getWithdrawals: () => Promise<WithdrawalStats>
	}

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
 * Hook for managing transactions (deposits, withdrawals, stats)
 *
 * @example Basic Deposit
 * ```tsx
 * import { useQuirkTransaction } from '@quirk/sdk'
 *
 * function DepositButton() {
 *   const { deposit, loading, error } = useQuirkTransaction()
 *
 *   const handleDeposit = async () => {
 *     try {
 *       const result = await deposit.createFiat({
 *         userId: 'user_123',
 *         amount: '1000.00',
 *         currency: 'USD',
 *         tokenSymbol: 'USDC'
 *       })
 *       console.log('Deposit created:', result)
 *     } catch (err) {
 *       console.error('Deposit failed:', err)
 *     }
 *   }
 *
 *   return (
 *     <button onClick={handleDeposit} disabled={loading}>
 *       {loading ? 'Processing...' : 'Deposit $1000'}
 *     </button>
 *   )
 * }
 * ```
 *
 * @example Withdrawal
 * ```tsx
 * const { withdraw, loading } = useQuirkTransaction()
 *
 * await withdraw.create({
 *   userId: 'user_123',
 *   vaultId: 'base-0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
 *   amount: '500.00',
 *   withdrawal_method: 'crypto',
 *   destination_address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0'
 * })
 * ```
 *
 * @example Get Stats
 * ```tsx
 * const { stats } = useQuirkTransaction()
 *
 * const depositStats = await stats.getDeposits()
 * const withdrawalStats = await stats.getWithdrawals()
 *
 * console.log('Total deposits:', depositStats.totalDeposits)
 * console.log('Total withdrawals:', withdrawalStats.totalWithdrawals)
 * ```
 */
export function useQuirkTransaction(): UseQuirkTransactionReturn {
	const { sdk, productId } = useQuirkContext()

	// ==================== DEPOSITS ====================

	// Create fiat deposit action
	const createFiatAction = useCallback(
		async (params: CreateFiatDepositRequest) => {
			return sdk.deposits.createFiat(params)
		},
		[sdk],
	)

	const { execute: createFiat, loading: fiatLoading, error: fiatError } = useAsyncAction(createFiatAction)

	// Create crypto deposit action
	const createCryptoAction = useCallback(
		async (params: InitiateCryptoDepositRequest) => {
			return sdk.deposits.initiateCrypto(params)
		},
		[sdk],
	)

	const { execute: createCrypto, loading: cryptoLoading, error: cryptoError } = useAsyncAction(createCryptoAction)

	// ==================== WITHDRAWALS ====================

	// Create withdrawal action
	const createWithdrawalAction = useCallback(
		async (params: CreateWithdrawalRequest) => {
			return sdk.withdrawals.create(params)
		},
		[sdk],
	)

	const {
		execute: createWithdrawal,
		loading: withdrawalLoading,
		error: withdrawalError,
	} = useAsyncAction(createWithdrawalAction)

	// ==================== STATS ====================

	// Get deposit stats action
	const getDepositStatsAction = useCallback(async () => {
		return sdk.deposits.getStats(productId)
	}, [sdk, productId])

	const {
		execute: getDepositStats,
		loading: depositStatsLoading,
		error: depositStatsError,
	} = useAsyncAction(getDepositStatsAction)

	// Get withdrawal stats action
	const getWithdrawalStatsAction = useCallback(async () => {
		return sdk.withdrawals.getStats(productId)
	}, [sdk, productId])

	const {
		execute: getWithdrawalStats,
		loading: withdrawalStatsLoading,
		error: withdrawalStatsError,
	} = useAsyncAction(getWithdrawalStatsAction)

	// ==================== COMBINED STATE ====================

	// Combine all loading states
	const loading = useMemo(
		() => fiatLoading || cryptoLoading || withdrawalLoading || depositStatsLoading || withdrawalStatsLoading,
		[fiatLoading, cryptoLoading, withdrawalLoading, depositStatsLoading, withdrawalStatsLoading],
	)

	// Combine all error states (return first error found)
	const error = useMemo(
		() => fiatError || cryptoError || withdrawalError || depositStatsError || withdrawalStatsError,
		[fiatError, cryptoError, withdrawalError, depositStatsError, withdrawalStatsError],
	)

	// ==================== RETURN API ====================

	return {
		deposit: {
			createFiat,
			createCrypto,
		},
		withdraw: {
			create: createWithdrawal,
		},
		stats: {
			getDeposits: getDepositStats,
			getWithdrawals: getWithdrawalStats,
		},
		loading,
		error,
	}
}
