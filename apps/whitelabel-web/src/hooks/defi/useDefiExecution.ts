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
import axios from "axios"
import { usePrivy } from "@privy-io/react-auth"
import { useProducts } from "../useProducts"
import { useEnvironmentStore } from "@/store/environmentStore"

const API_BASE_URL = import.meta.env.VITE_API_URL

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

            const { data } = await axios.post<ExecutionResult>(
                `${API_BASE_URL}/defi/execute/deposit`,
                {
                    amount: params.amount,
                    riskLevel: params.riskLevel || 'moderate',
                    environment: params.environment || environment || 'sandbox',
                },
                {
                    headers: getAuthHeaders(productId, params.environment || environment)
                }
            )
            return data
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

            const { data } = await axios.post<ExecutionResult>(
                `${API_BASE_URL}/defi/execute/withdraw`,
                {
                    amount: params.amount,
                    protocol: params.protocol,
                    environment: params.environment || environment || 'sandbox',
                },
                {
                    headers: getAuthHeaders(productId, params.environment || environment)
                }
            )
            return data
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

            const { data } = await axios.post<GasEstimateResult>(
                `${API_BASE_URL}/defi/execute/estimate-gas`,
                {
                    amount: params.amount,
                    riskLevel: params.riskLevel || 'moderate',
                },
                {
                    headers: getAuthHeaders(productId, environment)
                }
            )
            return data
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

            const { data } = await axios.get<DefiTransaction[]>(
                `${API_BASE_URL}/defi/transactions`,
                {
                    params: { limit, offset },
                    headers: getAuthHeaders(productId, environment)
                }
            )
            return data
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

            const { data } = await axios.post<PrepareDepositResult>(
                `${API_BASE_URL}/defi/execute/prepare-deposit`,
                {
                    amount: params.amount,
                    riskLevel: params.riskLevel || 'moderate',
                },
                {
                    headers: getAuthHeaders(productId, environment)
                }
            )
            return data
        },
    })
}
