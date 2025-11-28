import { create } from "zustand"
import { persist } from "zustand/middleware"

/**
 * Transaction type for DeFi protocol operations
 */
export interface VaultTransaction {
    id: string
    type:
        | "aave_deposit"
        | "aave_withdraw"
        | "curve_swap"
        | "compound_supply"
        | "compound_redeem"
        | "uniswap_swap"
        | "onramp_deposit"
        | "offramp_withdrawal"
    protocol: "AAVE" | "Curve" | "Compound" | "Uniswap" | "OnRamp" | "OffRamp"
    amount: string
    token: string
    status: "pending" | "confirmed" | "failed"
    timestamp: number
    txHash: string
    blockNumber?: bigint
}

/**
 * Vault allocation across DeFi protocols
 */
export interface VaultAllocation {
    protocol: "AAVE" | "Curve" | "Compound" | "Uniswap"
    amount: string
    percentage: number
    apy: number
}

/**
 * Vault state interface
 */
interface VaultState {
    // Vault index tracking
    currentIndex: number
    entryIndex: number

    // Vault allocations
    allocations: VaultAllocation[]

    // Transaction history
    transactions: VaultTransaction[]

    // Portfolio metrics
    totalValue: string
    totalYield: string
    apy: number

    // Actions
    setCurrentIndex: (index: number) => void
    setEntryIndex: (index: number) => void
    addTransaction: (transaction: VaultTransaction) => void
    updateTransaction: (id: string, updates: Partial<VaultTransaction>) => void
    setAllocations: (allocations: VaultAllocation[]) => void
    setPortfolioMetrics: (metrics: { totalValue: string; totalYield: string; apy: number }) => void
    clearTransactions: () => void
}

/**
 * Vault Store - Manages DeFi protocol operations and portfolio state
 *
 * Uses Zustand with persistence to localStorage
 */
export const useVaultStore = create<VaultState>()(
    persist(
        (set) => ({
            // Initial state
            currentIndex: 1.0,
            entryIndex: 1.0,
            allocations: [],
            transactions: [],
            totalValue: "0",
            totalYield: "0",
            apy: 0,

            // Actions
            setCurrentIndex: (index) => set({ currentIndex: index }),

            setEntryIndex: (index) => set({ entryIndex: index }),

            addTransaction: (transaction) =>
                set((state) => ({
                    transactions: [transaction, ...state.transactions],
                })),

            updateTransaction: (id, updates) =>
                set((state) => ({
                    transactions: state.transactions.map((tx) =>
                        tx.id === id ? { ...tx, ...updates } : tx
                    ),
                })),

            setAllocations: (allocations) => set({ allocations }),

            setPortfolioMetrics: (metrics) =>
                set({
                    totalValue: metrics.totalValue,
                    totalYield: metrics.totalYield,
                    apy: metrics.apy,
                }),

            clearTransactions: () => set({ transactions: [] }),
        }),
        {
            name: "vault-storage", // localStorage key
            partialize: (state) => ({
                // Only persist these fields
                transactions: state.transactions,
                currentIndex: state.currentIndex,
                entryIndex: state.entryIndex,
            }),
        }
    )
)
