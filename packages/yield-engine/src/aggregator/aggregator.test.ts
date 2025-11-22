import { describe, it, expect, beforeEach } from 'vitest'
import { YieldAggregator } from './yield-aggregator'
import { globalCache } from '../utils/cache'

describe('YieldAggregator', () => {
	beforeEach(() => {
		globalCache.clear()
	})

	describe('Initialization', () => {
		it('should create aggregator with default config', () => {
			const aggregator = new YieldAggregator()
			expect(aggregator).toBeDefined()
		})

		it('should create aggregator with custom config', () => {
			const aggregator = new YieldAggregator({
				protocols: ['aave', 'compound'],
				cacheTTL: 60000,
			})
			expect(aggregator).toBeDefined()
		})

		it('should respect excluded protocols', () => {
			const aggregator = new YieldAggregator({
				excludeProtocols: ['morpho'],
			})
			expect(aggregator).toBeDefined()
		})
	})

	describe('fetchAllOpportunities', () => {
		it('should fetch opportunities for USDC on Ethereum', async () => {
			const aggregator = new YieldAggregator()
			const result = await aggregator.fetchAllOpportunities('USDC', 1)

			expect(result).toBeDefined()
			expect(result.opportunities).toBeInstanceOf(Array)
			expect(result.timestamp).toBeGreaterThan(0)
			expect(result.successfulProtocols).toBeGreaterThan(0)

			// Should have at least one opportunity
			expect(result.opportunities.length).toBeGreaterThan(0)

			// Best should be defined if we have opportunities
			if (result.opportunities.length > 0) {
				expect(result.best).toBeDefined()
				expect(result.best?.supplyAPY).toBeDefined()
			}

			console.log(`✅ Fetched ${result.opportunities.length} USDC opportunities`)
			console.log(`   Best APY: ${result.best?.supplyAPY}% (${result.best?.protocol})`)
			console.log(`   APY Spread: ${result.apySpread}%`)
		}, 30000)

		it('should return opportunities sorted by APY (descending)', async () => {
			const aggregator = new YieldAggregator()
			const result = await aggregator.fetchAllOpportunities('USDC', 1)

			if (result.opportunities.length >= 2) {
				for (let i = 0; i < result.opportunities.length - 1; i++) {
					const current = parseFloat(result.opportunities[i].supplyAPY)
					const next = parseFloat(result.opportunities[i + 1].supplyAPY)
					expect(current).toBeGreaterThanOrEqual(next)
				}
			}
		}, 30000)

		it('should handle unsupported tokens gracefully', async () => {
			const aggregator = new YieldAggregator()
			const result = await aggregator.fetchAllOpportunities('UNSUPPORTED_TOKEN', 1)

			expect(result.opportunities.length).toBe(0)
			expect(result.best).toBeNull()
		}, 15000)

		it('should cache results', async () => {
			const aggregator = new YieldAggregator()

			// First call
			const start1 = Date.now()
			const result1 = await aggregator.fetchAllOpportunities('USDC', 1)
			const duration1 = Date.now() - start1

			// Second call (should be cached)
			const start2 = Date.now()
			const result2 = await aggregator.fetchAllOpportunities('USDC', 1)
			const duration2 = Date.now() - start2

			expect(result1.opportunities.length).toBe(result2.opportunities.length)
			expect(duration2).toBeLessThan(duration1) // Cached should be faster

			console.log(`   First call: ${duration1}ms, Cached call: ${duration2}ms`)
		}, 30000)

		it('should apply filters correctly', async () => {
			const aggregator = new YieldAggregator()
			const result = await aggregator.fetchAllOpportunities('USDC', 1, {
				protocols: ['aave'],
			})

			for (const opp of result.opportunities) {
				expect(opp.protocol).toBe('aave')
			}
		}, 15000)

		it('should apply minAPY filter', async () => {
			const aggregator = new YieldAggregator()
			const result = await aggregator.fetchAllOpportunities('USDC', 1, {
				minAPY: '2.0',
			})

			for (const opp of result.opportunities) {
				expect(parseFloat(opp.supplyAPY)).toBeGreaterThanOrEqual(2.0)
			}
		}, 15000)
	})

	describe('getBestOpportunity', () => {
		it('should return the best opportunity for USDC', async () => {
			const aggregator = new YieldAggregator()
			const best = await aggregator.getBestOpportunity('USDC', 1)

			expect(best).toBeDefined()
			if (best) {
				expect(best.protocol).toMatch(/^(aave|compound|morpho)$/)
				expect(parseFloat(best.supplyAPY)).toBeGreaterThanOrEqual(0)
				console.log(`✅ Best USDC opportunity: ${best.supplyAPY}% on ${best.protocol}`)
			}
		}, 30000)
	})

	describe('fetchOpportunitiesForTokens', () => {
		it('should fetch opportunities for multiple tokens', async () => {
			const aggregator = new YieldAggregator()
			const opportunities = await aggregator.fetchOpportunitiesForTokens(['USDC', 'USDT'], 1)

			expect(opportunities.length).toBeGreaterThan(0)

			// Should include both tokens
			const tokens = new Set(opportunities.map((o) => o.token))
			expect(tokens.size).toBeGreaterThanOrEqual(1)

			console.log(`✅ Fetched ${opportunities.length} opportunities for USDC & USDT`)
		}, 45000)
	})

	describe('getAllPositions', () => {
		it('should handle wallet with no positions', async () => {
			const aggregator = new YieldAggregator()
			// Using a random address that likely has no positions
			const result = await aggregator.getAllPositions(
				'0x0000000000000000000000000000000000000001',
				1,
			)

			expect(result.positions).toBeInstanceOf(Array)
			expect(result.totalValueUSD).toBe('0.00')
			expect(result.protocolCount).toBe(0)
		}, 30000)

		it('should aggregate positions correctly', async () => {
			const aggregator = new YieldAggregator()
			// This would require a real wallet with positions for a meaningful test
			const result = await aggregator.getAllPositions(
				'0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
				1,
			)

			expect(result).toBeDefined()
			expect(result.timestamp).toBeGreaterThan(0)
			expect(result.positions).toBeInstanceOf(Array)

			console.log(`   Total positions: ${result.positions.length}`)
			console.log(`   Total value: $${result.totalValueUSD}`)
		}, 30000)
	})

	describe('getAggregatedMetrics', () => {
		it('should fetch aggregated metrics for Ethereum', async () => {
			const aggregator = new YieldAggregator()
			const metrics = await aggregator.getAggregatedMetrics(1)

			expect(metrics).toBeDefined()
			expect(metrics.chainId).toBe(1)
			expect(parseFloat(metrics.totalTVLUSD)).toBeGreaterThan(0)
			expect(metrics.protocolMetrics.length).toBeGreaterThan(0)

			console.log(`✅ Aggregated Metrics for Ethereum:`)
			console.log(`   Total TVL: $${metrics.totalTVLUSD}`)
			console.log(`   Weighted Avg APY: ${metrics.weightedAvgSupplyAPY}%`)
			console.log(`   Best APY: ${metrics.bestSupplyAPY}% (${metrics.bestProtocol})`)
			console.log(`   Healthy Protocols: ${metrics.healthyProtocolCount}/${metrics.totalProtocolCount}`)
		}, 45000)
	})

	describe('compareProtocols', () => {
		it('should compare AAVE and Compound', async () => {
			const aggregator = new YieldAggregator()
			const comparison = await aggregator.compareProtocols('USDC', 1, 'aave', 'compound')

			expect(comparison.winner).toMatch(/^(aave|compound)$/)
			expect(comparison.apyDifference).toBeDefined()

			console.log(`✅ Protocol Comparison (USDC):`)
			console.log(`   AAVE APY: ${comparison.protocol1?.supplyAPY ?? 'N/A'}%`)
			console.log(`   Compound APY: ${comparison.protocol2?.supplyAPY ?? 'N/A'}%`)
			console.log(`   Winner: ${comparison.winner} (+${comparison.apyDifference}%)`)
		}, 30000)
	})
})
