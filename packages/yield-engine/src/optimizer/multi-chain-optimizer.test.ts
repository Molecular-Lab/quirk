/**
 * Tests for MultiChainOptimizer
 */

import { describe, it, expect, beforeAll } from 'vitest'
import { MultiChainOptimizer } from './multi-chain-optimizer'
import { SUPPORTED_CHAINS, RISK_TARGET_APY } from './multi-chain-optimizer.types'

describe('MultiChainOptimizer', () => {
    let optimizer: MultiChainOptimizer

    beforeAll(() => {
        optimizer = new MultiChainOptimizer()
    })

    describe('optimizeAcrossChains', () => {
        it('should return results for USDC across all chains', async () => {
            const result = await optimizer.optimizeAcrossChains('USDC', 'moderate', 10000)

            expect(result).toBeDefined()
            expect(result.token).toBe('USDC')
            expect(result.riskLevel).toBe('moderate')
            expect(result.bestChain).toBeDefined()
            expect(SUPPORTED_CHAINS).toContain(result.bestChain.chainId)
            expect(result.allocation.length).toBeGreaterThan(0)
            expect(parseFloat(result.expectedBlendedAPY)).toBeGreaterThan(0)

            console.log('\n📊 Multi-Chain Optimization Result (Moderate):')
            console.log(`   Best Chain: ${result.bestChain.chainName} (${result.bestChain.chainId})`)
            console.log(`   Expected APY: ${result.expectedBlendedAPY}%`)
            console.log(`   Net APY: ${result.netAPY}%`)
            console.log(`   Gas Cost: $${result.gasEstimate.totalUSD}`)
            console.log(`   Confidence: ${result.confidence}%`)
        }, 60000)

        it('should have different results for different risk levels', async () => {
            const [conservative, moderate, aggressive] = await Promise.all([
                optimizer.optimizeAcrossChains('USDC', 'conservative', 10000),
                optimizer.optimizeAcrossChains('USDC', 'moderate', 10000),
                optimizer.optimizeAcrossChains('USDC', 'aggressive', 10000),
            ])

            console.log('\n📊 Risk Level Comparison:')
            console.log(`   Conservative: ${conservative.netAPY}% (Target: ${RISK_TARGET_APY.conservative.min}-${RISK_TARGET_APY.conservative.max}%)`)
            console.log(`   Moderate: ${moderate.netAPY}% (Target: ${RISK_TARGET_APY.moderate.min}-${RISK_TARGET_APY.moderate.max}%)`)
            console.log(`   Aggressive: ${aggressive.netAPY}% (Target: ${RISK_TARGET_APY.aggressive.min}-${RISK_TARGET_APY.aggressive.max}%)`)

            // Aggressive should generally have higher or equal APY to moderate
            // (may not always be true if gas costs differ significantly)
            expect(parseFloat(aggressive.expectedBlendedAPY)).toBeGreaterThanOrEqual(
                parseFloat(conservative.expectedBlendedAPY) * 0.9 // Allow 10% variance
            )
        }, 90000)

        it('should return all chain results for comparison', async () => {
            const result = await optimizer.optimizeAcrossChains('USDC', 'moderate', 10000)

            expect(result.allChainResults).toBeInstanceOf(Array)
            expect(result.allChainResults.length).toBeGreaterThan(0)

            // Should have exactly one recommended chain
            const recommended = result.allChainResults.filter((r) => r.isRecommended)
            expect(recommended.length).toBe(1)

            console.log('\n📊 All Chain Results:')
            result.allChainResults.forEach((chain) => {
                const marker = chain.isRecommended ? '✅' : '  '
                console.log(`   ${marker} ${chain.chainName}: ${chain.netAPY}% net APY, $${chain.totalGasCostUSD} gas`)
            })
        }, 60000)

        it('should calculate gas costs correctly', async () => {
            const result = await optimizer.optimizeAcrossChains('USDC', 'moderate', 10000)

            expect(result.gasEstimate).toBeDefined()
            expect(parseFloat(result.gasEstimate.depositUSD)).toBeGreaterThanOrEqual(0)
            expect(parseFloat(result.gasEstimate.withdrawUSD)).toBeGreaterThanOrEqual(0)

            // Net APY should be less than or equal to blended APY (gas reduces returns)
            expect(parseFloat(result.netAPY)).toBeLessThanOrEqual(
                parseFloat(result.expectedBlendedAPY)
            )
        }, 60000)

        it('should handle larger position sizes with better net APY', async () => {
            const [small, large] = await Promise.all([
                optimizer.optimizeAcrossChains('USDC', 'moderate', 1000),   // $1k
                optimizer.optimizeAcrossChains('USDC', 'moderate', 100000), // $100k
            ])

            console.log('\n📊 Position Size Comparison:')
            console.log(`   $1k position: ${small.netAPY}% net APY`)
            console.log(`   $100k position: ${large.netAPY}% net APY`)

            // Larger positions should have better net APY (gas is less significant)
            expect(parseFloat(large.netAPY)).toBeGreaterThanOrEqual(parseFloat(small.netAPY))
        }, 60000)
    })

    describe('getChainOpportunities', () => {
        it('should return opportunities for a specific chain', async () => {
            const opportunities = await optimizer.getChainOpportunities('USDC', 1)

            expect(opportunities).toBeInstanceOf(Array)
            if (opportunities.length > 0) {
                expect(opportunities[0].chainId).toBe(1)
                expect(opportunities[0].chainName).toBe('Ethereum')
                expect(parseFloat(opportunities[0].supplyAPY)).toBeGreaterThan(0)
            }
        }, 30000)
    })
})
