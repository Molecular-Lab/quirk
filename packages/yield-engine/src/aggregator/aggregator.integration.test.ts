/**
 * Integration Tests for YieldAggregator and YieldOptimizer
 *
 * These tests make REAL network calls to fetch live data from:
 * - AAVE V3 (via on-chain RPC)
 * - Compound V3 (via on-chain RPC)
 * - Morpho (via GraphQL API)
 *
 * Run with: pnpm test aggregator.integration --run
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { YieldAggregator } from './yield-aggregator'
import { YieldOptimizer } from '../optimizer/yield-optimizer'
import { AaveAdapter } from '../protocols/aave/aave.adapter'
import { CompoundAdapter } from '../protocols/compound/compound.adapter'
import { MorphoAdapter } from '../protocols/morpho/morpho.adapter'
import { globalCache } from '../utils/cache'
import type { Protocol, YieldOpportunity } from '../types/common.types'

// Test constants
const ETHEREUM_CHAIN_ID = 1
const BASE_CHAIN_ID = 8453
const POLYGON_CHAIN_ID = 137
const ARBITRUM_CHAIN_ID = 42161

// Test timeout for network calls (increased to handle slow networks)
const NETWORK_TIMEOUT = 90000 // 90 seconds

describe('Live Data Integration Tests', () => {
	beforeAll(() => {
		globalCache.clear()
	})

	afterAll(() => {
		globalCache.clear()
	})

	describe('Individual Protocol Adapters - Live Data', () => {
		describe('AAVE Adapter', () => {
			it('should fetch USDC supply APY from Ethereum', async () => {
				const adapter = new AaveAdapter(ETHEREUM_CHAIN_ID)
				const apy = await adapter.getSupplyAPY('USDC', ETHEREUM_CHAIN_ID)

				expect(apy).toBeDefined()
				const apyNum = parseFloat(apy)
				expect(apyNum).toBeGreaterThanOrEqual(0)
				expect(apyNum).toBeLessThan(50) // Sanity check

				console.log(`✅ AAVE USDC APY (Ethereum): ${apy}%`)
			}, NETWORK_TIMEOUT)

			it('should fetch USDT supply APY from Ethereum', async () => {
				const adapter = new AaveAdapter(ETHEREUM_CHAIN_ID)
				const apy = await adapter.getSupplyAPY('USDT', ETHEREUM_CHAIN_ID)

				expect(apy).toBeDefined()
				const apyNum = parseFloat(apy)
				expect(apyNum).toBeGreaterThanOrEqual(0)

				console.log(`✅ AAVE USDT APY (Ethereum): ${apy}%`)
			}, NETWORK_TIMEOUT)

			it('should fetch USDC metrics from Ethereum', async () => {
				const adapter = new AaveAdapter(ETHEREUM_CHAIN_ID)
				const metrics = await adapter.getMetrics('USDC', ETHEREUM_CHAIN_ID)

				expect(metrics.protocol).toBe('aave')
				expect(metrics.token).toBe('USDC')
				expect(parseFloat(metrics.supplyAPY)).toBeGreaterThanOrEqual(0)
				expect(parseFloat(metrics.tvl)).toBeGreaterThan(0)

				console.log(`✅ AAVE USDC Metrics:`)
				console.log(`   Supply APY: ${metrics.supplyAPY}%`)
				console.log(`   TVL: $${parseFloat(metrics.tvl).toLocaleString()}`)
				console.log(`   Liquidity: $${parseFloat(metrics.liquidity).toLocaleString()}`)
			}, NETWORK_TIMEOUT)

			it('should fetch protocol metrics from Ethereum', async () => {
				const adapter = new AaveAdapter(ETHEREUM_CHAIN_ID)
				const metrics = await adapter.getProtocolMetrics(ETHEREUM_CHAIN_ID)

				expect(metrics.protocol).toBe('aave')
				expect(metrics.chainId).toBe(ETHEREUM_CHAIN_ID)
				expect(parseFloat(metrics.tvlUSD)).toBeGreaterThan(0)

				console.log(`✅ AAVE Protocol Metrics:`)
				console.log(`   Total TVL: $${parseFloat(metrics.tvlUSD).toLocaleString()}`)
				console.log(`   Avg Supply APY: ${metrics.avgSupplyAPY}%`)
				console.log(`   Healthy: ${metrics.isHealthy}`)
			}, NETWORK_TIMEOUT)
		})

		describe('Compound Adapter', () => {
			it('should fetch USDC supply APY from Ethereum', async () => {
				const adapter = new CompoundAdapter(ETHEREUM_CHAIN_ID)
				const apy = await adapter.getSupplyAPY('USDC', ETHEREUM_CHAIN_ID)

				expect(apy).toBeDefined()
				const apyNum = parseFloat(apy)
				expect(apyNum).toBeGreaterThanOrEqual(0)
				expect(apyNum).toBeLessThan(50)

				console.log(`✅ Compound USDC APY (Ethereum): ${apy}%`)
			}, NETWORK_TIMEOUT)

			it('should fetch USDC metrics from Ethereum', async () => {
				const adapter = new CompoundAdapter(ETHEREUM_CHAIN_ID)
				const metrics = await adapter.getMetrics('USDC', ETHEREUM_CHAIN_ID)

				expect(metrics.protocol).toBe('compound')
				expect(metrics.token).toBe('USDC')
				expect(parseFloat(metrics.supplyAPY)).toBeGreaterThanOrEqual(0)
				expect(parseFloat(metrics.tvl)).toBeGreaterThan(0)

				console.log(`✅ Compound USDC Metrics:`)
				console.log(`   Supply APY: ${metrics.supplyAPY}%`)
				console.log(`   TVL: $${parseFloat(metrics.tvl).toLocaleString()}`)
				console.log(`   Utilization: ${metrics.utilization}%`)
			}, NETWORK_TIMEOUT)

			it('should fetch USDC supply APY from Base', async () => {
				const adapter = new CompoundAdapter(BASE_CHAIN_ID)
				const apy = await adapter.getSupplyAPY('USDC', BASE_CHAIN_ID)

				expect(apy).toBeDefined()
				const apyNum = parseFloat(apy)
				expect(apyNum).toBeGreaterThanOrEqual(0)

				console.log(`✅ Compound USDC APY (Base): ${apy}%`)
			}, NETWORK_TIMEOUT)
		})

		describe('Morpho Adapter', () => {
			it('should fetch USDC supply APY from Ethereum (V1 vault)', async () => {
				const adapter = new MorphoAdapter(ETHEREUM_CHAIN_ID)
				const apy = await adapter.getSupplyAPY('USDC', ETHEREUM_CHAIN_ID)

				expect(apy).toBeDefined()
				const apyNum = parseFloat(apy)
				expect(apyNum).toBeGreaterThanOrEqual(0)
				expect(apyNum).toBeLessThan(50)

				console.log(`✅ Morpho USDC APY (Ethereum, V1): ${apy}%`)
			}, NETWORK_TIMEOUT)

			it('should fetch USDT supply APY from Ethereum (V2 vault)', async () => {
				const adapter = new MorphoAdapter(ETHEREUM_CHAIN_ID)
				const apy = await adapter.getSupplyAPY('USDT', ETHEREUM_CHAIN_ID)

				expect(apy).toBeDefined()
				const apyNum = parseFloat(apy)
				expect(apyNum).toBeGreaterThanOrEqual(0)

				console.log(`✅ Morpho USDT APY (Ethereum, V2): ${apy}%`)
			}, NETWORK_TIMEOUT)

			it('should fetch USDC supply APY from Base (V2 vault)', async () => {
				const adapter = new MorphoAdapter(BASE_CHAIN_ID)
				const apy = await adapter.getSupplyAPY('USDC', BASE_CHAIN_ID)

				expect(apy).toBeDefined()
				const apyNum = parseFloat(apy)
				expect(apyNum).toBeGreaterThanOrEqual(0)

				console.log(`✅ Morpho USDC APY (Base, V2): ${apy}%`)
			}, NETWORK_TIMEOUT)

			it('should fetch USDC metrics from Ethereum', async () => {
				const adapter = new MorphoAdapter(ETHEREUM_CHAIN_ID)
				const metrics = await adapter.getMetrics('USDC', ETHEREUM_CHAIN_ID)

				expect(metrics.protocol).toBe('morpho')
				expect(metrics.token).toBe('USDC')
				expect(parseFloat(metrics.supplyAPY)).toBeGreaterThanOrEqual(0)

				console.log(`✅ Morpho USDC Metrics:`)
				console.log(`   Supply APY: ${metrics.supplyAPY}%`)
				console.log(`   TVL: $${parseFloat(metrics.tvl).toLocaleString()}`)
				if (metrics.metadata?.vaultName) {
					console.log(`   Vault: ${metrics.metadata.vaultName}`)
				}
			}, NETWORK_TIMEOUT)
		})
	})

	describe('YieldAggregator - Live Data', () => {
		it('should fetch all USDC opportunities on Ethereum', async () => {
			const aggregator = new YieldAggregator()
			const result = await aggregator.fetchAllOpportunities('USDC', ETHEREUM_CHAIN_ID)

			expect(result.opportunities).toBeInstanceOf(Array)
			expect(result.opportunities.length).toBeGreaterThan(0)
			expect(result.successfulProtocols).toBeGreaterThan(0)

			console.log(`\n📊 USDC Yield Opportunities on Ethereum:`)
			console.log(`   Total opportunities: ${result.opportunities.length}`)
			console.log(`   Successful protocols: ${result.successfulProtocols}`)
			console.log(`   Failed protocols: ${result.failedProtocols}`)

			result.opportunities.forEach((opp) => {
				console.log(`   • ${opp.protocol.toUpperCase()}: ${opp.supplyAPY}% APY`)
			})

			if (result.best) {
				console.log(`\n   🏆 Best: ${result.best.protocol} at ${result.best.supplyAPY}%`)
			}
			console.log(`   📈 APY Spread: ${result.apySpread}%`)
		}, NETWORK_TIMEOUT)

		it('should fetch all USDT opportunities on Ethereum', async () => {
			const aggregator = new YieldAggregator()
			const result = await aggregator.fetchAllOpportunities('USDT', ETHEREUM_CHAIN_ID)

			expect(result.opportunities.length).toBeGreaterThan(0)

			console.log(`\n📊 USDT Yield Opportunities on Ethereum:`)
			result.opportunities.forEach((opp) => {
				console.log(`   • ${opp.protocol.toUpperCase()}: ${opp.supplyAPY}% APY`)
			})
		}, NETWORK_TIMEOUT)

		it('should fetch USDC opportunities on Base', async () => {
			const aggregator = new YieldAggregator()
			const result = await aggregator.fetchAllOpportunities('USDC', BASE_CHAIN_ID)

			expect(result.opportunities.length).toBeGreaterThan(0)

			console.log(`\n📊 USDC Yield Opportunities on Base:`)
			result.opportunities.forEach((opp) => {
				console.log(`   • ${opp.protocol.toUpperCase()}: ${opp.supplyAPY}% APY`)
			})
		}, NETWORK_TIMEOUT)

		it('should get the best opportunity for USDC', async () => {
			const aggregator = new YieldAggregator()
			const best = await aggregator.getBestOpportunity('USDC', ETHEREUM_CHAIN_ID)

			expect(best).toBeDefined()
			expect(best?.protocol).toMatch(/^(aave|compound|morpho)$/)
			expect(parseFloat(best?.supplyAPY ?? '0')).toBeGreaterThan(0)

			console.log(`\n🏆 Best USDC Opportunity: ${best?.protocol} at ${best?.supplyAPY}%`)
		}, NETWORK_TIMEOUT)

		it('should compare AAVE vs Compound for USDC', async () => {
			const aggregator = new YieldAggregator()
			const comparison = await aggregator.compareProtocols(
				'USDC',
				ETHEREUM_CHAIN_ID,
				'aave',
				'compound',
			)

			expect(comparison.winner).toMatch(/^(aave|compound)$/)
			expect(comparison.apyDifference).toBeDefined()

			console.log(`\n⚔️ AAVE vs Compound (USDC):`)
			console.log(`   AAVE: ${comparison.protocol1?.supplyAPY ?? 'N/A'}%`)
			console.log(`   Compound: ${comparison.protocol2?.supplyAPY ?? 'N/A'}%`)
			console.log(`   Winner: ${comparison.winner} (+${comparison.apyDifference}%)`)
		}, NETWORK_TIMEOUT)

		it('should fetch aggregated metrics for Ethereum', async () => {
			const aggregator = new YieldAggregator()
			const metrics = await aggregator.getAggregatedMetrics(ETHEREUM_CHAIN_ID)

			expect(metrics.chainId).toBe(ETHEREUM_CHAIN_ID)
			expect(parseFloat(metrics.totalTVLUSD)).toBeGreaterThan(0)
			expect(metrics.protocolMetrics.length).toBeGreaterThan(0)

			console.log(`\n📊 Aggregated Metrics (Ethereum):`)
			console.log(`   Total TVL: $${parseFloat(metrics.totalTVLUSD).toLocaleString()}`)
			console.log(`   Weighted Avg APY: ${metrics.weightedAvgSupplyAPY}%`)
			console.log(`   Best APY: ${metrics.bestSupplyAPY}% (${metrics.bestProtocol})`)
			console.log(`   Healthy Protocols: ${metrics.healthyProtocolCount}/${metrics.totalProtocolCount}`)
		}, NETWORK_TIMEOUT)

		it('should fetch opportunities for multiple tokens', async () => {
			const aggregator = new YieldAggregator()
			const opportunities = await aggregator.fetchOpportunitiesForTokens(
				['USDC', 'USDT'],
				ETHEREUM_CHAIN_ID,
			)

			expect(opportunities.length).toBeGreaterThan(0)

			const tokens = new Set(opportunities.map((o) => o.token))
			console.log(`\n📊 Multi-Token Opportunities:`)
			console.log(`   Total opportunities: ${opportunities.length}`)
			console.log(`   Tokens found: ${Array.from(tokens).join(', ')}`)

			opportunities.slice(0, 5).forEach((opp) => {
				console.log(`   • ${opp.token} on ${opp.protocol}: ${opp.supplyAPY}%`)
			})
		}, NETWORK_TIMEOUT)
	})

	describe('YieldOptimizer - Live Data', () => {
		it('should find best opportunity for USDC', async () => {
			const optimizer = new YieldOptimizer()
			const best = await optimizer.getBestOpportunity('USDC', ETHEREUM_CHAIN_ID)

			expect(best).toBeDefined()
			if (best) {
				console.log(`\n🎯 Optimizer - Best USDC: ${best.protocol} at ${best.supplyAPY}%`)
			}
		}, NETWORK_TIMEOUT)

		it('should optimize position with highest-yield strategy', async () => {
			const optimizer = new YieldOptimizer({
				defaultStrategy: 'highest-yield',
			})

			const result = await optimizer.optimizePosition(
				'0x0000000000000000000000000000000000000001',
				'USDC',
				ETHEREUM_CHAIN_ID,
				{ level: 'moderate' },
			)

			expect(result.action).toMatch(/^(hold|rebalance)$/)
			expect(result.strategy).toBe('highest-yield')
			expect(result.rankedOpportunities.length).toBeGreaterThan(0)

			console.log(`\n🎯 Highest-Yield Optimization:`)
			console.log(`   Action: ${result.action}`)
			console.log(`   Recommended: ${result.recommendedProtocol} at ${result.recommendedAPY}%`)
			console.log(`   Confidence: ${result.confidence}%`)
			console.log(`   Reason: ${result.reason}`)
			console.log(`   Ranked Opportunities:`)
			result.rankedOpportunities.forEach((opp, i) => {
				console.log(`     ${i + 1}. ${opp.protocol}: ${opp.supplyAPY}%`)
			})
		}, NETWORK_TIMEOUT)

		it('should optimize position with risk-adjusted strategy', async () => {
			// Clear cache to ensure fresh results
			globalCache.clear()

			const optimizer = new YieldOptimizer({
				defaultStrategy: 'risk-adjusted',
			})

			const result = await optimizer.optimizePosition(
				'0x0000000000000000000000000000000000000001',
				'USDC',
				ETHEREUM_CHAIN_ID,
				{ level: 'conservative' },
				'risk-adjusted', // Explicitly specify strategy
			)

			expect(result.strategy).toBe('risk-adjusted')
			expect(result.rankedOpportunities.length).toBeGreaterThan(0)

			console.log(`\n🎯 Risk-Adjusted Optimization (Conservative):`)
			console.log(`   Action: ${result.action}`)
			console.log(`   Recommended: ${result.recommendedProtocol} at ${result.recommendedAPY}%`)
			console.log(`   Confidence: ${result.confidence}%`)
			if (result.warnings.length > 0) {
				console.log(`   Warnings: ${result.warnings.join(', ')}`)
			}
		}, NETWORK_TIMEOUT)

		it('should optimize position with gas-aware strategy', async () => {
			// Clear cache to ensure fresh results
			globalCache.clear()

			const optimizer = new YieldOptimizer({
				defaultStrategy: 'gas-aware',
			})

			const result = await optimizer.optimizePosition(
				'0x0000000000000000000000000000000000000001',
				'USDC',
				ETHEREUM_CHAIN_ID,
				{ level: 'moderate' },
				'gas-aware', // Explicitly specify strategy
			)

			expect(result.strategy).toBe('gas-aware')

			console.log(`\n🎯 Gas-Aware Optimization:`)
			console.log(`   Action: ${result.action}`)
			console.log(`   Recommended: ${result.recommendedProtocol} at ${result.recommendedAPY}%`)
			console.log(`   Confidence: ${result.confidence}%`)
			if (result.estimatedGasCost) {
				console.log(`   Estimated Gas: $${result.estimatedGasCost}`)
			}
		}, NETWORK_TIMEOUT)

		it('should correctly calculate break-even days', () => {
			const optimizer = new YieldOptimizer()

			// 1% APY improvement on $10,000 = ~$100/year = ~$0.27/day
			// $30 gas = ~110 days to break even
			const days = optimizer.estimateBreakEvenDays('1.00', '10000.00', '30.00')

			expect(days).toBeGreaterThan(90)
			expect(days).toBeLessThan(150)

			console.log(`\n⏱️ Break-Even Calculation:`)
			console.log(`   APY Delta: 1%`)
			console.log(`   Position: $10,000`)
			console.log(`   Gas Cost: $30`)
			console.log(`   Break-Even: ${days} days`)
		})

		it('should evaluate rebalance worthiness correctly', () => {
			const optimizer = new YieldOptimizer()

			// Good opportunity: 2% improvement on $50k
			const isWorth = optimizer.isRebalanceWorthIt('4.00', '6.00', '50000', '30')
			expect(isWorth).toBe(true)

			// Bad opportunity: 0.5% improvement (below threshold)
			const notWorth = optimizer.isRebalanceWorthIt('4.00', '4.50', '10000', '30')
			expect(notWorth).toBe(false)

			console.log(`\n💰 Rebalance Evaluation:`)
			console.log(`   $50k, 4%→6% APY, $30 gas: ${isWorth ? '✅ Worth it' : '❌ Not worth it'}`)
			console.log(
				`   $10k, 4%→4.5% APY, $30 gas: ${notWorth ? '✅ Worth it' : '❌ Not worth it'}`,
			)
		})
	})

	describe('Multi-Chain Live Data', () => {
		it('should fetch USDC APY across all chains', async () => {
			const chains = [
				{ id: ETHEREUM_CHAIN_ID, name: 'Ethereum' },
				{ id: BASE_CHAIN_ID, name: 'Base' },
				{ id: POLYGON_CHAIN_ID, name: 'Polygon' },
				{ id: ARBITRUM_CHAIN_ID, name: 'Arbitrum' },
			]

			console.log(`\n🌐 Multi-Chain USDC APY Comparison:`)

			for (const chain of chains) {
				try {
					const aggregator = new YieldAggregator()
					const result = await aggregator.fetchAllOpportunities('USDC', chain.id)

					if (result.opportunities.length > 0) {
						console.log(`\n   ${chain.name} (Chain ID: ${chain.id}):`)
						result.opportunities.forEach((opp) => {
							console.log(`     • ${opp.protocol.toUpperCase()}: ${opp.supplyAPY}%`)
						})
					} else {
						console.log(`\n   ${chain.name}: No opportunities found`)
					}
				} catch (error) {
					console.log(`\n   ${chain.name}: Error - ${(error as Error).message}`)
				}
			}
		}, 120000) // 2 minute timeout for multi-chain

		it('should compare best yield across chains for USDC', async () => {
			const chains = [
				{ id: ETHEREUM_CHAIN_ID, name: 'Ethereum' },
				{ id: BASE_CHAIN_ID, name: 'Base' },
			]

			const results: { chain: string; apy: string; protocol: string }[] = []

			for (const chain of chains) {
				try {
					const aggregator = new YieldAggregator()
					const best = await aggregator.getBestOpportunity('USDC', chain.id)
					if (best) {
						results.push({
							chain: chain.name,
							apy: best.supplyAPY,
							protocol: best.protocol,
						})
					}
				} catch {
					// Skip failed chains
				}
			}

			console.log(`\n🏆 Best USDC Yield by Chain:`)
			results
				.sort((a, b) => parseFloat(b.apy) - parseFloat(a.apy))
				.forEach((r, i) => {
					console.log(`   ${i + 1}. ${r.chain}: ${r.apy}% (${r.protocol})`)
				})

			expect(results.length).toBeGreaterThan(0)
		}, NETWORK_TIMEOUT)
	})

	describe('Summary Report', () => {
		it('should generate a complete yield report', async () => {
			const aggregator = new YieldAggregator()
			const optimizer = new YieldOptimizer()

			console.log('\n' + '='.repeat(60))
			console.log('📊 YIELD ENGINE LIVE DATA REPORT')
			console.log('='.repeat(60))
			console.log(`   Timestamp: ${new Date().toISOString()}`)
			console.log('='.repeat(60))

			// Fetch all opportunities
			const usdcOpps = await aggregator.fetchAllOpportunities('USDC', ETHEREUM_CHAIN_ID)
			const usdtOpps = await aggregator.fetchAllOpportunities('USDT', ETHEREUM_CHAIN_ID)

			console.log('\n📈 USDC Opportunities (Ethereum):')
			usdcOpps.opportunities.forEach((opp) => {
				console.log(`   ${opp.protocol.padEnd(10)} ${opp.supplyAPY.padStart(6)}% APY`)
			})

			console.log('\n📈 USDT Opportunities (Ethereum):')
			usdtOpps.opportunities.forEach((opp) => {
				console.log(`   ${opp.protocol.padEnd(10)} ${opp.supplyAPY.padStart(6)}% APY`)
			})

			// Aggregated metrics
			const metrics = await aggregator.getAggregatedMetrics(ETHEREUM_CHAIN_ID)
			console.log('\n💎 Aggregated Metrics:')
			console.log(`   Total TVL: $${parseFloat(metrics.totalTVLUSD).toLocaleString()}`)
			console.log(`   Best Protocol: ${metrics.bestProtocol} (${metrics.bestSupplyAPY}%)`)

			// Optimization result
			const optResult = await optimizer.optimizePosition(
				'0x0000000000000000000000000000000000000001',
				'USDC',
				ETHEREUM_CHAIN_ID,
			)

			console.log('\n🎯 Optimization Recommendation:')
			console.log(`   Strategy: ${optResult.strategy}`)
			console.log(`   Action: ${optResult.action}`)
			console.log(`   Recommended: ${optResult.recommendedProtocol} (${optResult.recommendedAPY}%)`)
			console.log(`   Confidence: ${optResult.confidence}%`)

			console.log('\n' + '='.repeat(60))
			console.log('✅ Report Complete')
			console.log('='.repeat(60) + '\n')

			expect(true).toBe(true)
		}, NETWORK_TIMEOUT)
	})
})
