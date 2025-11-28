import { describe, it, expect, beforeEach } from 'vitest'
import { YieldOptimizer } from './yield-optimizer'
import { HighestYieldStrategy, RiskAdjustedStrategy, GasAwareStrategy } from './strategies'
import type { YieldOpportunity, ProtocolPosition, RiskProfile } from '../types/common.types'
import { globalCache } from '../utils/cache'

// Mock data for testing strategies
const mockOpportunities: YieldOpportunity[] = [
	{
		protocol: 'morpho',
		token: 'USDC',
		tokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
		chainId: 1,
		supplyAPY: '6.50',
		tvl: '148000000', // $148M
		liquidity: '148000000',
		timestamp: Date.now(),
	},
	{
		protocol: 'aave',
		token: 'USDC',
		tokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
		chainId: 1,
		supplyAPY: '5.25',
		tvl: '500000000', // $500M
		liquidity: '400000000',
		timestamp: Date.now(),
	},
	{
		protocol: 'compound',
		token: 'USDC',
		tokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
		chainId: 1,
		supplyAPY: '4.80',
		tvl: '430000000', // $430M
		liquidity: '350000000',
		timestamp: Date.now(),
	},
]

const mockPosition: ProtocolPosition = {
	protocol: 'compound',
	token: 'USDC',
	tokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
	chainId: 1,
	amount: '10000000000', // 10,000 USDC in wei
	amountFormatted: '10000.00',
	valueUSD: '10000.00',
	apy: '4.80',
}

describe('Optimization Strategies', () => {
	describe('HighestYieldStrategy', () => {
		const strategy = new HighestYieldStrategy()

		it('should rank opportunities by APY (highest first)', () => {
			const ranked = strategy.rankOpportunities(mockOpportunities, { level: 'moderate' })

			expect(ranked[0].protocol).toBe('morpho')
			expect(ranked[1].protocol).toBe('aave')
			expect(ranked[2].protocol).toBe('compound')
		})

		it('should filter by preferred protocols', () => {
			const ranked = strategy.rankOpportunities(mockOpportunities, {
				level: 'moderate',
				preferredProtocols: ['aave', 'compound'],
			})

			expect(ranked.length).toBe(2)
			expect(ranked[0].protocol).toBe('aave')
			expect(ranked.every((o) => o.protocol !== 'morpho')).toBe(true)
		})

		it('should filter by excluded protocols', () => {
			const ranked = strategy.rankOpportunities(mockOpportunities, {
				level: 'moderate',
				excludedProtocols: ['morpho'],
			})

			expect(ranked.every((o) => o.protocol !== 'morpho')).toBe(true)
		})

		it('should filter by minimum TVL', () => {
			const ranked = strategy.rankOpportunities(mockOpportunities, {
				level: 'moderate',
				minProtocolTVL: '400000000', // $400M
			})

			// Only AAVE and Compound meet this threshold
			expect(ranked.length).toBe(2)
			expect(ranked.every((o) => parseFloat(o.tvl) >= 400000000)).toBe(true)
		})

		it('should recommend rebalance when APY improvement exceeds threshold', () => {
			const shouldRebalance = strategy.shouldRebalance({
				currentPosition: mockPosition,
				opportunities: mockOpportunities,
				riskProfile: { level: 'moderate' },
				rebalanceConfig: { minApyDelta: 1.0, enabled: true },
			})

			expect(shouldRebalance).toBe(true) // Morpho is 6.50% vs 4.80% = 1.7% improvement
		})

		it('should not recommend rebalance when disabled', () => {
			const shouldRebalance = strategy.shouldRebalance({
				currentPosition: mockPosition,
				opportunities: mockOpportunities,
				riskProfile: { level: 'moderate' },
				rebalanceConfig: { minApyDelta: 1.0, enabled: false },
			})

			expect(shouldRebalance).toBe(false)
		})

		it('should calculate reasonable confidence scores', () => {
			const confidence = strategy.calculateConfidence(
				{
					currentPosition: mockPosition,
					opportunities: mockOpportunities,
					riskProfile: { level: 'moderate' },
					rebalanceConfig: { minApyDelta: 1.0, enabled: true },
				},
				mockOpportunities[0], // Morpho
			)

			expect(confidence).toBeGreaterThan(50)
			expect(confidence).toBeLessThanOrEqual(100)
		})
	})

	describe('RiskAdjustedStrategy', () => {
		const strategy = new RiskAdjustedStrategy()

		it('should weight by TVL for conservative profiles', () => {
			// Create opportunities with TVL above conservative threshold ($200M)
			const highTvlOpps: YieldOpportunity[] = [
				{ ...mockOpportunities[0], tvl: '250000000' }, // Morpho with $250M
				{ ...mockOpportunities[1] }, // AAVE with $500M
				{ ...mockOpportunities[2] }, // Compound with $430M
			]

			const ranked = strategy.rankOpportunities(highTvlOpps, {
				level: 'conservative',
			})

			// All 3 should pass the $200M minimum for conservative
			expect(ranked.length).toBe(3)
			// AAVE should rank higher due to highest TVL for conservative profile
			expect(ranked[0].protocol).toBe('aave')
		})

		it('should apply stricter TVL minimum for conservative profiles', () => {
			// Create opportunity with low TVL
			const lowTvlOpps = [
				...mockOpportunities,
				{
					...mockOpportunities[0],
					protocol: 'morpho' as const,
					tvl: '50000000', // $50M
				},
			]

			const ranked = strategy.rankOpportunities(lowTvlOpps, {
				level: 'conservative',
			})

			// Should filter out opportunities below $200M for conservative
			ranked.forEach((opp) => {
				expect(parseFloat(opp.tvl)).toBeGreaterThanOrEqual(100_000_000)
			})
		})

		it('should filter high APY for conservative profiles', () => {
			const highApyOpps = [
				...mockOpportunities,
				{
					...mockOpportunities[0],
					supplyAPY: '25.00', // Suspiciously high
					tvl: '300000000',
				},
			]

			const ranked = strategy.rankOpportunities(highApyOpps, {
				level: 'conservative',
			})

			// Should filter out > 15% APY for conservative
			ranked.forEach((opp) => {
				expect(parseFloat(opp.supplyAPY)).toBeLessThanOrEqual(15)
			})
		})

		it('should require higher APY delta for conservative rebalancing', () => {
			// Position at 4.80%, best is 5.25% (AAVE) = 0.45% delta
			// Conservative requires 1.5% minimum
			const shouldRebalance = strategy.shouldRebalance({
				currentPosition: { ...mockPosition, apy: '5.00' },
				opportunities: [mockOpportunities[1]], // Only AAVE at 5.25%
				riskProfile: { level: 'conservative' },
				rebalanceConfig: { minApyDelta: 1.0, enabled: true },
			})

			expect(shouldRebalance).toBe(false) // 0.25% is below 1.5% threshold
		})
	})

	describe('GasAwareStrategy', () => {
		const strategy = new GasAwareStrategy()

		it('should estimate gas costs correctly', () => {
			const estimate = strategy.estimateGasCost('compound', 'aave', 30, 3000)

			expect(estimate.gasUnits).toBeGreaterThan(0)
			expect(parseFloat(estimate.gasCostETH)).toBeGreaterThan(0)
			expect(parseFloat(estimate.gasCostUSD)).toBeGreaterThan(0)

			console.log(`   Gas estimate: ${estimate.gasUnits} units = $${estimate.gasCostUSD}`)
		})

		it('should calculate break-even days correctly', () => {
			// 1% APY improvement on $10,000 = ~$100/year = ~$0.27/day
			// $50 gas cost = ~185 days to break even
			const breakEven = strategy.calculateBreakEvenDays(1.0, 10000, 50)

			expect(breakEven).toBeGreaterThan(100)
			expect(breakEven).toBeLessThan(250)
		})

		it('should return Infinity for zero APY delta', () => {
			const breakEven = strategy.calculateBreakEvenDays(0, 10000, 50)
			expect(breakEven).toBe(Infinity)
		})

		it('should not recommend rebalance if gas cost exceeds max', () => {
			const shouldRebalance = strategy.shouldRebalance({
				currentPosition: mockPosition,
				opportunities: mockOpportunities,
				riskProfile: { level: 'moderate' },
				rebalanceConfig: {
					minApyDelta: 1.0,
					enabled: true,
					maxGasCostUSD: '10', // Very low max
				},
				gasPriceGwei: 100, // High gas price
				ethPriceUSD: 3000,
			})

			expect(shouldRebalance).toBe(false)
		})

		it('should not recommend if break-even is too long', () => {
			// Small position where gas is significant
			const smallPosition = { ...mockPosition, valueUSD: '100.00' } // Only $100

			const shouldRebalance = strategy.shouldRebalance({
				currentPosition: smallPosition,
				opportunities: mockOpportunities,
				riskProfile: { level: 'moderate' },
				rebalanceConfig: {
					minApyDelta: 1.0,
					enabled: true,
					maxGasCostUSD: '100',
					minGainThreshold: '10',
				},
				gasPriceGwei: 30,
				ethPriceUSD: 3000,
			})

			expect(shouldRebalance).toBe(false)
		})

		it('should recommend rebalance for large positions', () => {
			// Large position where gas is negligible
			const largePosition = { ...mockPosition, valueUSD: '100000.00' } // $100k

			const shouldRebalance = strategy.shouldRebalance({
				currentPosition: largePosition,
				opportunities: mockOpportunities,
				riskProfile: { level: 'moderate' },
				rebalanceConfig: {
					minApyDelta: 1.0,
					enabled: true,
					maxGasCostUSD: '100',
					minGainThreshold: '10',
				},
				gasPriceGwei: 30,
				ethPriceUSD: 3000,
			})

			expect(shouldRebalance).toBe(true)
		})
	})
})

describe('YieldOptimizer', () => {
	beforeEach(() => {
		globalCache.clear()
	})

	describe('Initialization', () => {
		it('should create optimizer with default config', () => {
			const optimizer = new YieldOptimizer()
			expect(optimizer).toBeDefined()
		})

		it('should create optimizer with custom config', () => {
			const optimizer = new YieldOptimizer({
				defaultStrategy: 'risk-adjusted',
				cacheTTL: 60000,
			})
			expect(optimizer).toBeDefined()
		})

		it('should return available strategies', () => {
			const optimizer = new YieldOptimizer()
			const strategies = optimizer.getAvailableStrategies()

			expect(strategies).toContain('highest-yield')
			expect(strategies).toContain('risk-adjusted')
			expect(strategies).toContain('gas-aware')
		})
	})

	describe('isRebalanceWorthIt', () => {
		const optimizer = new YieldOptimizer()

		it('should return true for good opportunity', () => {
			// 2% APY improvement on $50k = $1000/year = ~$83/month
			// Gas cost = $20, so net gain = $63 (exceeds $10 threshold)
			const result = optimizer.isRebalanceWorthIt(
				'4.00', // current APY
				'6.00', // new APY (2% improvement)
				'50000', // $50k position
				'20', // $20 gas
			)

			expect(result).toBe(true)
		})

		it('should return false for small APY improvement', () => {
			const result = optimizer.isRebalanceWorthIt(
				'4.00',
				'4.50', // Only 0.5% improvement (below 1% threshold)
				'10000',
				'30',
			)

			expect(result).toBe(false)
		})

		it('should return false when gas exceeds max', () => {
			const result = optimizer.isRebalanceWorthIt('4.00', '6.00', '10000', '100', {
				maxGasCostUSD: '50', // Gas exceeds max
			})

			expect(result).toBe(false)
		})

		it('should return false when rebalancing is disabled', () => {
			const result = optimizer.isRebalanceWorthIt('4.00', '10.00', '10000', '10', {
				enabled: false,
			})

			expect(result).toBe(false)
		})
	})

	describe('estimateBreakEvenDays', () => {
		const optimizer = new YieldOptimizer()

		it('should calculate break-even correctly', () => {
			// 2% APY improvement on $10,000 = ~$200/year = ~$0.55/day
			// $30 gas = ~55 days
			const days = optimizer.estimateBreakEvenDays('2.00', '10000.00', '30.00')

			expect(days).toBeGreaterThan(40)
			expect(days).toBeLessThan(70)
		})

		it('should return Infinity for negative APY delta', () => {
			const days = optimizer.estimateBreakEvenDays('-1.00', '10000.00', '30.00')
			expect(days).toBe(Infinity)
		})
	})

	describe('optimizePosition (Integration)', () => {
		it('should optimize position for USDC on Ethereum', async () => {
			const optimizer = new YieldOptimizer()

			// Use a dummy address that likely has no positions
			const result = await optimizer.optimizePosition(
				'0x0000000000000000000000000000000000000001',
				'USDC',
				1,
				{ level: 'moderate' },
			)

			expect(result).toBeDefined()
			expect(result.action).toMatch(/^(hold|rebalance)$/)
			expect(result.strategy).toBe('highest-yield')
			expect(result.rankedOpportunities).toBeInstanceOf(Array)
			expect(result.confidence).toBeGreaterThanOrEqual(0)
			expect(result.confidence).toBeLessThanOrEqual(100)
			expect(result.timestamp).toBeGreaterThan(0)

			console.log(`✅ Optimization Result:`)
			console.log(`   Action: ${result.action}`)
			console.log(`   Recommended: ${result.recommendedProtocol} at ${result.recommendedAPY}%`)
			console.log(`   Confidence: ${result.confidence}%`)
			console.log(`   Reason: ${result.reason}`)
		}, 30000)

		it('should use risk-adjusted strategy when specified', async () => {
			const optimizer = new YieldOptimizer()

			const result = await optimizer.optimizePosition(
				'0x0000000000000000000000000000000000000001',
				'USDC',
				1,
				{ level: 'conservative' },
				'risk-adjusted',
			)

			expect(result.strategy).toBe('risk-adjusted')
		}, 30000)
	})

	describe('getBestOpportunity (Integration)', () => {
		it('should get best USDC opportunity', async () => {
			const optimizer = new YieldOptimizer()
			const best = await optimizer.getBestOpportunity('USDC', 1)

			expect(best).toBeDefined()
			if (best) {
				expect(best.protocol).toMatch(/^(aave|compound|morpho)$/)
				expect(parseFloat(best.supplyAPY)).toBeGreaterThanOrEqual(0)

				console.log(`✅ Best USDC: ${best.supplyAPY}% on ${best.protocol}`)
			}
		}, 30000)
	})
})
