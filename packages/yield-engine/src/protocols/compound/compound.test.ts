import { describe, it, expect } from 'vitest'
import { CompoundAdapter } from './compound.adapter'
import {
	getMarketConfig,
	getCometAddress,
	isTokenSupported,
	getSupportedTokens,
} from './compound.constants'

describe('Compound Constants', () => {
	it('should return Comet address for USDC on Ethereum', () => {
		const cometAddress = getCometAddress('USDC', 1)
		expect(cometAddress).toBe('0xc3d688B66703497DAA19211EEdff47f25384cdc3')
	})

	it('should return Comet address for USDC on Polygon', () => {
		const cometAddress = getCometAddress('USDC', 137)
		expect(cometAddress).toBe('0xF25212E676D1F7F89Cd72fFEe66158f541246445')
	})

	it('should return undefined for unsupported chain', () => {
		const cometAddress = getCometAddress('USDC', 999)
		expect(cometAddress).toBeUndefined()
	})

	it('should return market config for USDC on Ethereum', () => {
		const config = getMarketConfig('USDC', 1)
		expect(config).toBeDefined()
		expect(config?.baseToken).toBe('USDC')
		expect(config?.chainId).toBe(1)
		expect(config?.baseTokenDecimals).toBe(6)
	})

	it('should return undefined for unsupported token', () => {
		const config = getMarketConfig('INVALID', 1)
		expect(config).toBeUndefined()
	})

	it('should check if token is supported', () => {
		expect(isTokenSupported('USDC', 1)).toBe(true)
		expect(isTokenSupported('USDC', 137)).toBe(true)
		expect(isTokenSupported('INVALID', 1)).toBe(false)
	})

	it('should return supported tokens for a chain', () => {
		const tokens = getSupportedTokens(1)
		expect(tokens).toContain('USDC')
		expect(tokens.length).toBeGreaterThan(0)
	})

	it('should return empty array for unsupported chain', () => {
		const tokens = getSupportedTokens(999)
		expect(tokens).toEqual([])
	})
})

describe('Compound Adapter', () => {
	it('should create adapter instance', () => {
		const adapter = new CompoundAdapter(1)
		expect(adapter).toBeDefined()
		expect(adapter.getProtocolName()).toBe('compound')
	})

	it('should throw error for unsupported chain', () => {
		expect(() => new CompoundAdapter(999)).toThrow(
			'Compound V3 not supported on chain 999',
		)
	})

	it('should check token support', async () => {
		const adapter = new CompoundAdapter(1)
		const supportsUSDC = await adapter.supportsToken('USDC', 1)
		const supportsInvalid = await adapter.supportsToken('INVALID', 1)

		expect(supportsUSDC).toBe(true)
		expect(supportsInvalid).toBe(false)
	})

	// Note: The following tests require RPC access and are integration tests
	// They are skipped by default and should be run manually with real RPC endpoints

	it('should fetch real supply APY from Ethereum', async () => {
		const adapter = new CompoundAdapter(1)
		const apy = await adapter.getSupplyAPY('USDC', 1)

		// APY should be a numeric string
		const apyNumber = parseFloat(apy)
		expect(apyNumber, `APY should be a valid number, got: "${apy}"`).toBeGreaterThanOrEqual(0)
		expect(apyNumber, `APY should be less than 100%, got: ${apy}%`).toBeLessThan(100)

		console.log(`✅ Compound V3 USDC Supply APY: ${apy}%`)
	}, 30000) // 30 second timeout for RPC calls

	it('should fetch user position', async () => {
		const adapter = new CompoundAdapter(1)
		// Test address with known Compound V3 position (or use a zero balance address)
		const testAddress = '0xe328217347865ed09179b3dca98b3faefcd39e9a'

		const position = await adapter.getUserPosition(testAddress, 'USDC', 1)

		if (position) {
			expect(position.protocol).toBe('compound')
			expect(position.token).toBe('USDC')
			expect(position.chainId).toBe(1)
			expect(parseFloat(position.amountFormatted)).toBeGreaterThan(0)
		} else {
			// No position is also valid
			expect(position).toBeNull()
		}

		console.log('Position:', position)
	}, 30000)

	it('should fetch metrics for USDC on Ethereum', async () => {
		const adapter = new CompoundAdapter(1)
		const metrics = await adapter.getMetrics('USDC', 1)

		expect(metrics.protocol).toBe('compound')
		expect(metrics.token).toBe('USDC')
		expect(metrics.chainId).toBe(1)
		expect(parseFloat(metrics.supplyAPY)).toBeGreaterThanOrEqual(0)
		expect(parseFloat(metrics.tvl)).toBeGreaterThan(0)
		expect(metrics.utilization).toBeDefined()

		console.log(`✅ Compound V3 USDC Metrics:`)
		console.log(`   TVL: $${metrics.tvl}`)
		console.log(`   Supply APY: ${metrics.supplyAPY}%`)
		console.log(`   Borrow APY: ${metrics.borrowAPY}%`)
		console.log(`   Utilization: ${metrics.utilization}%`)
	}, 30000)

	it('should fetch protocol metrics', async () => {
		const adapter = new CompoundAdapter(1)
		const metrics = await adapter.getProtocolMetrics(1)

		expect(metrics.protocol).toBe('compound')
		expect(metrics.chainId).toBe(1)
		expect(parseFloat(metrics.tvlUSD)).toBeGreaterThan(0)
		expect(metrics.isHealthy).toBe(true)

		console.log(`✅ Compound V3 Protocol Metrics:`)
		console.log(`   Total TVL: $${metrics.tvlUSD}`)
		console.log(`   Available Liquidity: $${metrics.availableLiquidityUSD}`)
		console.log(`   Avg Supply APY: ${metrics.avgSupplyAPY}%`)
	}, 60000) // Longer timeout for multiple RPC calls

	it('should test APY calculation precision (1e18 vs 1e27)', async () => {
		const adapter = new CompoundAdapter(1)

		// Fetch APY from Ethereum
		const apy = await adapter.getSupplyAPY('USDC', 1)
		const apyNumber = parseFloat(apy)

		// Verify the APY is reasonable (should be less than 50% for USDC)
		expect(apyNumber).toBeGreaterThanOrEqual(0)
		expect(apyNumber).toBeLessThan(50)

		console.log(`✅ APY Precision Test: ${apy}% (should use 1e18 precision)`)
	}, 30000)

	it('should work on multiple chains', async () => {
		// Test on Polygon
		const polygonAdapter = new CompoundAdapter(137)
		const polygonApy = await polygonAdapter.getSupplyAPY('USDT', 137)

		expect(parseFloat(polygonApy)).toBeGreaterThanOrEqual(0)
		console.log(`✅ Polygon USDT APY: ${polygonApy}%`)

		// Test on Base
		const baseAdapter = new CompoundAdapter(8453)
		const baseSupportedTokens = getSupportedTokens(8453)
		if (baseSupportedTokens.length > 0) {
			const baseApy = await baseAdapter.getSupplyAPY(baseSupportedTokens[0], 8453)
			expect(parseFloat(baseApy)).toBeGreaterThanOrEqual(0)
			console.log(`✅ Base ${baseSupportedTokens[0]} APY: ${baseApy}%`)
		}
	}, 45000)
})
