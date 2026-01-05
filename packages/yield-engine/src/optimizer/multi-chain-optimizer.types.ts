/**
 * Multi-Chain Optimizer Types
 * 
 * Types and constants for dynamic multi-chain yield optimization
 */

import { z } from 'zod'
import type { Protocol, YieldOpportunity } from '../types/common.types'

/**
 * Supported chain IDs for multi-chain optimization
 * Includes testnets for sandbox environment
 */
export const SUPPORTED_CHAINS = [1, 8453, 42161, 137, 11155111] as const
export type SupportedChainId = (typeof SUPPORTED_CHAINS)[number]

/**
 * Chain metadata
 */
export const CHAIN_INFO: Record<SupportedChainId, { name: string; nativeSymbol: string }> = {
    1: { name: 'Ethereum', nativeSymbol: 'ETH' },
    8453: { name: 'Base', nativeSymbol: 'ETH' },
    42161: { name: 'Arbitrum', nativeSymbol: 'ETH' },
    137: { name: 'Polygon', nativeSymbol: 'MATIC' },
    // Testnets
    11155111: { name: 'Sepolia', nativeSymbol: 'ETH' },
}

/**
 * Target APY ranges per risk level
 * These are used to guide allocation percentages dynamically
 */
export const RISK_TARGET_APY = {
    conservative: { min: 3.0, max: 4.0 },
    moderate: { min: 4.0, max: 5.0 },
    aggressive: { min: 5.0, max: 6.0 },
} as const

export type RiskLevel = keyof typeof RISK_TARGET_APY

/**
 * Native token prices (used for gas calculation on non-ETH chains)
 * In production, these should be fetched from a price oracle
 */
export const DEFAULT_NATIVE_PRICES: Record<SupportedChainId, number> = {
    1: 3000,     // ETH
    8453: 3000,  // ETH (Base uses ETH)
    42161: 3000, // ETH (Arbitrum uses ETH)
    137: 0.85,   // MATIC
    // Testnets (use low price for testing)
    11155111: 0, // Sepolia ETH has no value
}

/**
 * Protocol gas estimates (in gas units)
 * These are relatively stable per protocol
 */
export const PROTOCOL_GAS_UNITS: Record<Protocol, { deposit: number; withdraw: number }> = {
    aave: { deposit: 250_000, withdraw: 200_000 },
    compound: { deposit: 200_000, withdraw: 150_000 },
    morpho: { deposit: 220_000, withdraw: 180_000 },
}

/**
 * Default hold period for gas amortization (in days)
 */
export const DEFAULT_HOLD_PERIOD_DAYS = 30

/**
 * Single chain opportunity with gas data
 */
export interface ChainOpportunity {
    chainId: SupportedChainId
    chainName: string
    protocol: Protocol
    supplyAPY: string
    tvl: string
    liquidity: string
    gasPriceGwei: number
    depositGasCostUSD: string
    withdrawGasCostUSD: string
    totalGasCostUSD: string
}

/**
 * Allocation for a single protocol
 */
export interface ProtocolAllocation {
    protocol: Protocol
    percentage: number
    expectedAPY: string
    tvl: string
    rationale: string
}

/**
 * Result for a single chain
 */
export interface ChainResult {
    chainId: SupportedChainId
    chainName: string
    opportunities: ChainOpportunity[]
    allocation: ProtocolAllocation[]
    blendedAPY: string
    totalGasCostUSD: string
    netAPY: string // APY after gas amortization
    isRecommended: boolean
}

/**
 * Complete multi-chain optimization result
 */
export interface MultiChainOptimizationResult {
    /** Input parameters */
    token: string
    riskLevel: RiskLevel
    positionSizeUSD: number
    holdPeriodDays: number

    /** Best recommendation */
    bestChain: {
        chainId: SupportedChainId
        chainName: string
    }
    allocation: ProtocolAllocation[]
    expectedBlendedAPY: string
    targetAPYRange: { min: number; max: number }

    /** Gas information */
    gasEstimate: {
        gasPriceGwei: number
        depositUSD: string
        withdrawUSD: string
        totalUSD: string
    }

    /** Net APY after amortized gas */
    netAPY: string

    /** All chain results for comparison */
    allChainResults: ChainResult[]

    /** Metadata */
    timestamp: number
    confidence: number
}

/**
 * Configuration for the multi-chain optimizer
 */
export const MultiChainOptimizerConfigSchema = z.object({
    /** Default position size for gas amortization calculation */
    defaultPositionSizeUSD: z.number().default(10000),
    /** Hold period for gas amortization */
    holdPeriodDays: z.number().default(30),
    /** Minimum TVL to consider a protocol */
    minProtocolTVL: z.number().default(10_000_000),
    /** Fetch timeout per chain in ms */
    fetchTimeoutMs: z.number().default(10000),
})

export type MultiChainOptimizerConfig = z.infer<typeof MultiChainOptimizerConfigSchema>
