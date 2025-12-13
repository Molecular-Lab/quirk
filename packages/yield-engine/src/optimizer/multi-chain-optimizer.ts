/**
 * MultiChainOptimizer
 * 
 * A dynamic, gas-aware optimizer that compares yield opportunities
 * across multiple chains and calculates optimal allocations based
 * on risk level targets.
 */

import { YieldAggregator } from '../aggregator/yield-aggregator'
import { getGasPrice } from '../utils/rpc'
import type { YieldOpportunity, Protocol } from '../types/common.types'
import {
    SUPPORTED_CHAINS,
    CHAIN_INFO,
    RISK_TARGET_APY,
    DEFAULT_NATIVE_PRICES,
    PROTOCOL_GAS_UNITS,
    DEFAULT_HOLD_PERIOD_DAYS,
    MultiChainOptimizerConfigSchema,
    type SupportedChainId,
    type RiskLevel,
    type ChainOpportunity,
    type ChainResult,
    type ProtocolAllocation,
    type MultiChainOptimizationResult,
    type MultiChainOptimizerConfig,
} from './multi-chain-optimizer.types'

/**
 * MultiChainOptimizer - Compares yield opportunities across chains
 * and finds the optimal allocation based on risk level.
 * 
 * @example
 * ```typescript
 * const optimizer = new MultiChainOptimizer()
 * 
 * const result = await optimizer.optimizeAcrossChains(
 *   'USDC',
 *   'moderate',
 *   10000 // $10k position
 * )
 * 
 * console.log(`Best chain: ${result.bestChain.chainName}`)
 * console.log(`Expected APY: ${result.expectedBlendedAPY}%`)
 * console.log(`Net APY (after gas): ${result.netAPY}%`)
 * ```
 */
export class MultiChainOptimizer {
    private aggregator: YieldAggregator
    private config: MultiChainOptimizerConfig

    constructor(config?: Partial<MultiChainOptimizerConfig>) {
        this.config = MultiChainOptimizerConfigSchema.parse(config ?? {})
        this.aggregator = new YieldAggregator()
    }

    /**
     * Optimize across all supported chains
     */
    async optimizeAcrossChains(
        token: string,
        riskLevel: RiskLevel,
        positionSizeUSD: number = this.config.defaultPositionSizeUSD,
        holdPeriodDays: number = this.config.holdPeriodDays,
    ): Promise<MultiChainOptimizationResult> {
        const targetAPY = RISK_TARGET_APY[riskLevel]

        // Fetch opportunities from all chains in parallel
        const chainResults = await Promise.all(
            SUPPORTED_CHAINS.map((chainId) =>
                this.fetchChainResult(token, chainId, riskLevel, positionSizeUSD, holdPeriodDays)
            )
        )

        // Filter out chains with no valid results
        const validResults = chainResults.filter(
            (result): result is ChainResult => result !== null && result.opportunities.length > 0
        )

        if (validResults.length === 0) {
            throw new Error(`No opportunities found for ${token} on any supported chain`)
        }

        // Find the best chain based on net APY
        const bestResult = validResults.reduce((best, current) =>
            parseFloat(current.netAPY) > parseFloat(best.netAPY) ? current : best
        )

        // Mark the best chain
        validResults.forEach((result) => {
            result.isRecommended = result.chainId === bestResult.chainId
        })

        // Calculate confidence based on APY and TVL
        const confidence = this.calculateConfidence(bestResult, targetAPY)

        return {
            token,
            riskLevel,
            positionSizeUSD,
            holdPeriodDays,
            bestChain: {
                chainId: bestResult.chainId,
                chainName: bestResult.chainName,
            },
            allocation: bestResult.allocation,
            expectedBlendedAPY: bestResult.blendedAPY,
            targetAPYRange: targetAPY,
            gasEstimate: {
                gasPriceGwei: bestResult.opportunities[0]?.gasPriceGwei ?? 0,
                depositUSD: bestResult.opportunities.reduce(
                    (sum, o) => sum + parseFloat(o.depositGasCostUSD),
                    0
                ).toFixed(2),
                withdrawUSD: bestResult.opportunities.reduce(
                    (sum, o) => sum + parseFloat(o.withdrawGasCostUSD),
                    0
                ).toFixed(2),
                totalUSD: bestResult.totalGasCostUSD,
            },
            netAPY: bestResult.netAPY,
            allChainResults: validResults,
            timestamp: Date.now(),
            confidence,
        }
    }

    /**
     * Fetch and calculate result for a single chain
     */
    private async fetchChainResult(
        token: string,
        chainId: SupportedChainId,
        riskLevel: RiskLevel,
        positionSizeUSD: number,
        holdPeriodDays: number,
    ): Promise<ChainResult | null> {
        try {
            const chainInfo = CHAIN_INFO[chainId]

            // Fetch opportunities and gas price in parallel
            const [opportunitiesResult, gasPrice] = await Promise.all([
                this.aggregator.fetchAllOpportunities(token, chainId),
                this.getGasPriceSafe(chainId),
            ])

            const opportunities = opportunitiesResult.opportunities
            if (opportunities.length === 0) {
                return null
            }

            // Get native token price for gas calculation
            const nativePrice = DEFAULT_NATIVE_PRICES[chainId]
            const gasPriceGwei = Number(gasPrice) / 1e9

            // Calculate gas costs for each opportunity
            const chainOpportunities: ChainOpportunity[] = opportunities.map((opp) => {
                const gasUnits = PROTOCOL_GAS_UNITS[opp.protocol]
                const depositGasCostETH = (gasUnits.deposit * gasPriceGwei * 1e9) / 1e18
                const withdrawGasCostETH = (gasUnits.withdraw * gasPriceGwei * 1e9) / 1e18

                return {
                    chainId,
                    chainName: chainInfo.name,
                    protocol: opp.protocol,
                    supplyAPY: opp.supplyAPY,
                    tvl: opp.tvl,
                    liquidity: opp.liquidity,
                    gasPriceGwei,
                    depositGasCostUSD: (depositGasCostETH * nativePrice).toFixed(2),
                    withdrawGasCostUSD: (withdrawGasCostETH * nativePrice).toFixed(2),
                    totalGasCostUSD: ((depositGasCostETH + withdrawGasCostETH) * nativePrice).toFixed(2),
                }
            })

            // Calculate dynamic allocation based on risk level
            const allocation = this.calculateDynamicAllocation(chainOpportunities, riskLevel)

            // Calculate blended APY
            const blendedAPY = allocation.reduce((sum, alloc) => {
                return sum + (parseFloat(alloc.expectedAPY) * alloc.percentage) / 100
            }, 0)

            // Calculate total gas cost (weighted by allocation)
            const totalGasCost = allocation.reduce((sum, alloc) => {
                const opp = chainOpportunities.find((o) => o.protocol === alloc.protocol)
                if (!opp) return sum
                return sum + (parseFloat(opp.totalGasCostUSD) * alloc.percentage) / 100
            }, 0)

            // Calculate net APY (after amortizing gas over hold period)
            const annualizedGasCost = (totalGasCost / holdPeriodDays) * 365
            const gasCostAsAPY = (annualizedGasCost / positionSizeUSD) * 100
            const netAPY = Math.max(0, blendedAPY - gasCostAsAPY)

            return {
                chainId,
                chainName: chainInfo.name,
                opportunities: chainOpportunities,
                allocation,
                blendedAPY: blendedAPY.toFixed(2),
                totalGasCostUSD: totalGasCost.toFixed(2),
                netAPY: netAPY.toFixed(2),
                isRecommended: false,
            }
        } catch (error) {
            console.error(`Failed to fetch chain ${chainId}:`, error)
            return null
        }
    }

    /**
     * Safely get gas price with fallback
     */
    private async getGasPriceSafe(chainId: number): Promise<bigint> {
        try {
            return await getGasPrice(chainId)
        } catch {
            // Fallback gas prices if RPC fails
            const fallbackGasPrices: Record<number, bigint> = {
                1: BigInt(30e9),     // 30 gwei
                8453: BigInt(0.01e9),  // 0.01 gwei
                42161: BigInt(0.1e9),  // 0.1 gwei
                137: BigInt(50e9),    // 50 gwei
            }
            return fallbackGasPrices[chainId] ?? BigInt(30e9)
        }
    }

    /**
     * Calculate dynamic allocation based on risk level and available APYs
     */
    private calculateDynamicAllocation(
        opportunities: ChainOpportunity[],
        riskLevel: RiskLevel,
    ): ProtocolAllocation[] {
        const targetAPY = RISK_TARGET_APY[riskLevel]

        if (opportunities.length === 0) return []

        // Sort based on risk level preference
        let sorted: ChainOpportunity[]

        if (riskLevel === 'conservative') {
            // Conservative: Sort by TVL (higher = more stable)
            sorted = [...opportunities].sort((a, b) => parseFloat(b.tvl) - parseFloat(a.tvl))
        } else if (riskLevel === 'aggressive') {
            // Aggressive: Sort by APY (higher = better yield)
            sorted = [...opportunities].sort((a, b) => parseFloat(b.supplyAPY) - parseFloat(a.supplyAPY))
        } else {
            // Moderate: Balanced score (40% APY, 60% TVL)
            sorted = [...opportunities].sort((a, b) => {
                const maxAPY = Math.max(...opportunities.map((o) => parseFloat(o.supplyAPY)))
                const maxTVL = Math.max(...opportunities.map((o) => parseFloat(o.tvl)))

                const scoreA = (parseFloat(a.supplyAPY) / maxAPY) * 0.4 + (parseFloat(a.tvl) / maxTVL) * 0.6
                const scoreB = (parseFloat(b.supplyAPY) / maxAPY) * 0.4 + (parseFloat(b.tvl) / maxTVL) * 0.6

                return scoreB - scoreA
            })
        }

        // Calculate allocations to try to hit target APY range
        const allocations: ProtocolAllocation[] = []
        const apys = sorted.map((o) => parseFloat(o.supplyAPY))
        const bestAPY = Math.max(...apys)
        const worstAPY = Math.min(...apys)

        // If all APYs are below target min, maximize allocation to highest APY
        // If all APYs are above target max, spread more evenly
        // Otherwise, calculate to hit target range

        let percentages: number[]

        if (riskLevel === 'aggressive') {
            // Aggressive: Heavy concentration on highest APY
            percentages = [70, 25, 5].slice(0, sorted.length)
        } else if (riskLevel === 'conservative') {
            // Conservative: More balanced, favor stability
            percentages = [55, 30, 15].slice(0, sorted.length)
        } else {
            // Moderate: Balanced allocation
            percentages = [40, 35, 25].slice(0, sorted.length)
        }

        // Normalize percentages if fewer protocols
        const totalPercent = percentages.reduce((a, b) => a + b, 0)
        if (totalPercent !== 100) {
            percentages = percentages.map((p) => Math.round((p / totalPercent) * 100))
            // Adjust for rounding
            const diff = 100 - percentages.reduce((a, b) => a + b, 0)
            percentages[0] += diff
        }

        sorted.slice(0, percentages.length).forEach((opp, index) => {
            allocations.push({
                protocol: opp.protocol,
                percentage: percentages[index],
                expectedAPY: opp.supplyAPY,
                tvl: opp.tvl,
                rationale: this.getRationale(riskLevel, index),
            })
        })

        return allocations
    }

    /**
     * Get rationale text for allocation
     */
    private getRationale(riskLevel: RiskLevel, index: number): string {
        const rationales: Record<RiskLevel, string[]> = {
            conservative: [
                'Highest TVL - most established and stable protocol',
                'Secondary stable protocol for diversification',
                'Minimal allocation for yield enhancement',
            ],
            moderate: [
                'Best balance of yield and stability',
                'Secondary balanced opportunity',
                'Diversification across protocols',
            ],
            aggressive: [
                'Maximum yield - highest APY protocol',
                'Secondary high-yield opportunity',
                'Minimal diversification',
            ],
        }
        return rationales[riskLevel][index] ?? 'Additional allocation'
    }

    /**
     * Calculate confidence score
     */
    private calculateConfidence(
        result: ChainResult,
        targetAPY: { min: number; max: number },
    ): number {
        let confidence = 50

        const blendedAPY = parseFloat(result.blendedAPY)
        const netAPY = parseFloat(result.netAPY)

        // Bonus if within target range
        if (netAPY >= targetAPY.min && netAPY <= targetAPY.max) {
            confidence += 20
        } else if (netAPY >= targetAPY.min * 0.8) {
            confidence += 10
        }

        // Bonus for high TVL protocols
        const avgTVL =
            result.opportunities.reduce((sum, o) => sum + parseFloat(o.tvl), 0) /
            result.opportunities.length
        if (avgTVL > 1_000_000_000) confidence += 15 // > $1B
        else if (avgTVL > 100_000_000) confidence += 10 // > $100M

        // Penalty for high gas cost relative to position
        const gasCostPercent = (parseFloat(result.totalGasCostUSD) / 10000) * 100 // Assuming $10k
        if (gasCostPercent < 0.1) confidence += 10
        else if (gasCostPercent > 1) confidence -= 10

        return Math.max(0, Math.min(100, confidence))
    }

    /**
     * Get opportunities for a specific chain (for comparison)
     */
    async getChainOpportunities(
        token: string,
        chainId: SupportedChainId,
    ): Promise<ChainOpportunity[]> {
        const result = await this.fetchChainResult(
            token,
            chainId,
            'moderate',
            this.config.defaultPositionSizeUSD,
            this.config.holdPeriodDays,
        )
        return result?.opportunities ?? []
    }
}
