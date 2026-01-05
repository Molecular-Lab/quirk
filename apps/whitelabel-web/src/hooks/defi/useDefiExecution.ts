/**
 * DeFi Execution Hooks (Custodial Model)
 * 
 * Calls backend API which uses PrivyWalletService for transaction signing.
 * This replaces client-side wagmi signing (useAAVEDeposit.ts).
 * 
 * @example
 * const { mutate: deposit } = useDepositExecution()
 * deposit({ amount: '100', riskLevel: 'moderate' })
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { usePrivy } from "@privy-io/react-auth"
import { useProducts } from "../useProducts"
import { useEnvironmentStore } from "@/store/environmentStore"
import { b2bApiClient } from "@/api/b2bClient"

// ============================================================================
// Types
// ============================================================================

export type RiskLevel = 'conservative' | 'moderate' | 'aggressive'
export type Protocol = 'aave' | 'compound' | 'morpho'
export type Environment = 'sandbox' | 'production'

export interface DepositExecutionParams {
    amount: string
    riskLevel?: RiskLevel
    environment?: Environment
}

export interface WithdrawalExecutionParams {
    amount: string
    protocol?: Protocol
    environment?: Environment
}

export interface GasEstimateParams {
    amount: string
    riskLevel?: RiskLevel
}

export interface ExecutionResult {
    success: boolean
    transactionHashes: string[]
    environment: Environment
    error?: string
}

export interface GasEstimateResult {
    totalGas: string
    perProtocol: Array<{
        protocol: Protocol
        gasEstimate: string
    }>
    estimatedCostUSD?: string
}

export interface DefiTransaction {
    id: string
    txHash: string
    protocol: Protocol
    operationType: 'deposit' | 'withdrawal' | 'approval'
    amount: string
    tokenSymbol: string
    status: 'pending' | 'confirmed' | 'failed'
    gasUsed?: string
    gasCostUsd?: string
    executedAt: string
    confirmedAt?: string
}

// ============================================================================
// Helper: Get auth headers
// ============================================================================

function getAuthHeaders(productId: string, environment: Environment = 'sandbox') {
    return {
        'x-privy-org-id': productId,
        'x-environment': environment,
    }
}

// ============================================================================
// useDepositExecution
// ============================================================================

/**
 * Execute deposit via backend (custodial)
 * 
 * @example
 * const { mutate, isPending, isSuccess } = useDepositExecution()
 * mutate({ amount: '100', riskLevel: 'moderate' })
 */
export function useDepositExecution() {
    const queryClient = useQueryClient()
    const { authenticated } = usePrivy()
    const { activeProductId } = useProducts()
    const productId = activeProductId
    const apiEnvironment = useEnvironmentStore((state) => state.apiEnvironment)
    const environment: Environment = apiEnvironment

    return useMutation({
        mutationFn: async (params: DepositExecutionParams): Promise<ExecutionResult> => {
            if (!productId || !authenticated) throw new Error('Not authenticated')

            const response = await b2bApiClient.defiProtocol.executeDeposit({
                body: {
                    amount: params.amount,
                    riskLevel: params.riskLevel || 'moderate',
                    environment: params.environment || environment || 'sandbox',
                },
                extraHeaders: getAuthHeaders(productId, params.environment || environment),
            })

            if (response.status !== 200) {
                throw new Error((response.body as any).error || 'Deposit execution failed')
            }

            return response.body as ExecutionResult
        },
        onSuccess: (_result, variables) => {
            // Invalidate relevant queries
            queryClient.invalidateQueries({ queryKey: ['vault-index'] })
            queryClient.invalidateQueries({ queryKey: ['portfolio'] })
            queryClient.invalidateQueries({ queryKey: ['user-vault'] })
            queryClient.invalidateQueries({ queryKey: ['defi-transactions'] })

            toast.success('Deposit Successful! 🎉', {
                description: `Deposited $${variables.amount} across protocols`,
                duration: 5000,
            })
        },
        onError: (error: Error) => {
            console.error('Deposit execution failed:', error)
            toast.error('Deposit Failed', {
                description: error.message,
            })
        },
    })
}

// ============================================================================
// useWithdrawalExecution
// ============================================================================

/**
 * Execute withdrawal via backend (custodial)
 */
export function useWithdrawalExecution() {
    const queryClient = useQueryClient()
    const { authenticated } = usePrivy()
    const { activeProductId } = useProducts()
    const productId = activeProductId
    const apiEnvironment = useEnvironmentStore((state) => state.apiEnvironment)
    const environment: Environment = apiEnvironment

    return useMutation({
        mutationFn: async (params: WithdrawalExecutionParams): Promise<ExecutionResult> => {
            if (!productId || !authenticated) throw new Error('Not authenticated')

            const response = await b2bApiClient.defiProtocol.executeWithdrawal({
                body: {
                    amount: params.amount,
                    protocol: params.protocol,
                    environment: params.environment || environment || 'sandbox',
                },
                extraHeaders: getAuthHeaders(productId, params.environment || environment),
            })

            if (response.status !== 200) {
                throw new Error((response.body as any).error || 'Withdrawal execution failed')
            }

            return response.body as ExecutionResult
        },
        onSuccess: (_result, variables) => {
            queryClient.invalidateQueries({ queryKey: ['vault-index'] })
            queryClient.invalidateQueries({ queryKey: ['portfolio'] })
            queryClient.invalidateQueries({ queryKey: ['user-vault'] })
            queryClient.invalidateQueries({ queryKey: ['defi-transactions'] })

            toast.success('Withdrawal Successful! 💰', {
                description: `Withdrew $${variables.amount}`,
                duration: 5000,
            })
        },
        onError: (error: Error) => {
            console.error('Withdrawal execution failed:', error)
            toast.error('Withdrawal Failed', {
                description: error.message,
            })
        },
    })
}

// ============================================================================
// useGasEstimate
// ============================================================================

/**
 * Get gas estimate for deposit
 */
export function useGasEstimate(params?: GasEstimateParams) {
    const { activeProductId } = useProducts()
    const productId = activeProductId
    const apiEnvironment = useEnvironmentStore((state) => state.apiEnvironment)
    const environment: Environment = apiEnvironment

    return useQuery({
        queryKey: ['gas-estimate', params?.amount, params?.riskLevel],
        queryFn: async (): Promise<GasEstimateResult> => {
            if (!productId || !params?.amount) {
                return { totalGas: '0', perProtocol: [] }
            }

            console.log('[useGasEstimate] Calling API with:', { productId, environment, amount: params.amount })

            const response = await b2bApiClient.defiProtocol.estimateGas({
                body: {
                    amount: params.amount,
                    riskLevel: params.riskLevel || 'moderate',
                },
                extraHeaders: getAuthHeaders(productId, environment),
            })

            if (response.status !== 200) {
                throw new Error((response.body as any).error || 'Gas estimation failed')
            }

            return response.body as GasEstimateResult
        },
        enabled: Boolean(productId && params?.amount),
        staleTime: 30000, // 30 seconds
    })
}

// ============================================================================
// useTransactionHistory
// ============================================================================

/**
 * Get DeFi transaction history
 */
export function useTransactionHistory(limit = 20, offset = 0) {
    const { activeProductId } = useProducts()
    const productId = activeProductId
    const apiEnvironment = useEnvironmentStore((state) => state.apiEnvironment)
    const environment: Environment = apiEnvironment

    return useQuery({
        queryKey: ['defi-transactions', productId, environment, limit, offset],
        queryFn: async (): Promise<DefiTransaction[]> => {
            if (!productId) return []

            const response = await b2bApiClient.defiProtocol.getTransactions({
                query: { limit, offset },
                extraHeaders: getAuthHeaders(productId, environment),
            })

            if (response.status !== 200) {
                console.error('[useTransactionHistory] Failed to fetch transactions:', response)
                throw new Error('Failed to fetch transactions')
            }

            // Map API response to frontend format
            return response.body.transactions.map(tx => ({
                id: tx.id,
                txHash: tx.txHash,
                protocol: tx.protocol as Protocol,
                operationType: tx.operationType as 'deposit' | 'withdrawal' | 'approval',
                tokenSymbol: tx.tokenSymbol,
                amount: tx.amount,
                gasCostUsd: tx.gasCostUsd || null,
                status: tx.status as 'pending' | 'confirmed' | 'failed',
                executedAt: new Date(tx.executedAt),
            }))
        },
        enabled: Boolean(productId),
        staleTime: 60000, // 1 minute
    })
}

// ============================================================================
// usePrepareDeposit (Preview allocation before execution)
// ============================================================================

export interface PrepareDepositResult {
    transactions: Array<{
        protocol: Protocol
        amount: string
        percentage: number
    }>
    allocation: Array<{
        protocol: Protocol
        percentage: number
        amount: string
        expectedAPY: string
    }>
    totalAmount: string
    expectedBlendedAPY: string
    riskLevel: string
}

/**
 * Preview deposit allocation before execution
 */
export function usePrepareDeposit() {
    const { authenticated } = usePrivy()
    const { activeProductId } = useProducts()
    const productId = activeProductId
    const apiEnvironment = useEnvironmentStore((state) => state.apiEnvironment)
    const environment: Environment = apiEnvironment

    return useMutation({
        mutationFn: async (params: {
            amount: string
            riskLevel?: RiskLevel
        }): Promise<PrepareDepositResult> => {
            if (!productId || !authenticated) throw new Error('Not authenticated')

            const response = await b2bApiClient.defiProtocol.prepareDeposit({
                body: {
                    amount: params.amount,
                    riskLevel: params.riskLevel || 'moderate',
                },
                extraHeaders: getAuthHeaders(productId, environment),
            })

            if (response.status !== 200) {
                throw new Error((response.body as any).error || 'Failed to prepare deposit')
            }

            return response.body as any as PrepareDepositResult
        },
    })
}
