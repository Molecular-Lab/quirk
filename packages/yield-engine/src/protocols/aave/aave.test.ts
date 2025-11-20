import { describe, it, expect } from 'vitest'
import { AaveAdapter } from './aave.adapter'
import {
	getPoolAddress,
	getTokenAddress,
	isTokenSupported,
	getSupportedTokens,
} from './aave.constants'

describe('AAVE Constants', () => {
	it('should return Pool address for Ethereum', () => {
		const poolAddress = getPoolAddress(1)
		expect(poolAddress).toBe('0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2')
	})

	it('should return Pool address for Polygon', () => {
		const poolAddress = getPoolAddress(137)
		expect(poolAddress).toBe('0x794a61358D6845594F94dc1DB02A252b5b4814aD')
	})

	it('should throw error for unsupported chain', () => {
		expect(() => getPoolAddress(999)).toThrow('AAVE Pool not supported on chain 999')
	})

	it('should return USDC address for Ethereum', () => {
		const usdcAddress = getTokenAddress('USDC', 1)
		expect(usdcAddress).toBe('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48')
	})

	it('should return undefined for unsupported token', () => {
		const address = getTokenAddress('INVALID', 1)
		expect(address).toBeUndefined()
	})

	it('should check if token is supported', () => {
		expect(isTokenSupported('USDC', 1)).toBe(true)
		expect(isTokenSupported('USDT', 1)).toBe(true)
		expect(isTokenSupported('INVALID', 1)).toBe(false)
	})

	it('should return supported tokens for a chain', () => {
		const tokens = getSupportedTokens(1)
		expect(tokens).toContain('USDC')
		expect(tokens).toContain('USDT')
	})
})

describe('AAVE Adapter', () => {
	it('should create adapter instance', () => {
		const adapter = new AaveAdapter(1)
		expect(adapter).toBeDefined()
		expect(adapter.getProtocolName()).toBe('aave')
	})

	it('should check token support', async () => {
		const adapter = new AaveAdapter(1)
		const supportsUSDC = await adapter.supportsToken('USDC', 1)
		const supportsInvalid = await adapter.supportsToken('INVALID', 1)

		expect(supportsUSDC).toBe(true)
		expect(supportsInvalid).toBe(false)
	})

	// Note: The following tests require RPC access and are integration tests
	// They are skipped by default and should be run manually with real RPC endpoints

	it('should fetch real supply APY from Ethereum', async () => {
		const adapter = new AaveAdapter(1)
		const apy = await adapter.getSupplyAPY('USDC', 1)

		// APY should be a numeric string
		const apyNumber = parseFloat(apy)
		expect(apyNumber, `APY should be a valid number, got: "${apy}"`).toBeGreaterThanOrEqual(0)
		expect(apyNumber, `APY should be less than 100%, got: ${apy}%`).toBeLessThan(100)

		console.log(`✅ AAVE USDC Supply APY: ${apy}%`)
	}, 30000) // 30 second timeout for RPC calls

	it('should fetch user position', async () => {
		const adapter = new AaveAdapter(1)
		const testAddress = '0xe328217347865ed09179b3dca98b3faefcd39e9a' // Replace with actual address

		const position = await adapter.getUserPosition(testAddress, 'USDC', 1)

		if (position) {
			expect(position.protocol).toBe('aave')
			expect(position.token).toBe('USDC')
			expect(position.chainId).toBe(1)
		} else {
			// No position is also valid
			expect(position).toBeNull()
		}
	}, 30000)

	it('should fetch metrics for USDC on Ethereum', async () => {
		const adapter = new AaveAdapter(1)
		const metrics = await adapter.getMetrics('USDC', 1)

		expect(metrics.protocol).toBe('aave')
		expect(metrics.token).toBe('USDC')
		expect(metrics.chainId).toBe(1)
		expect(parseFloat(metrics.supplyAPY)).toBeGreaterThanOrEqual(0)
		expect(parseFloat(metrics.tvl)).toBeGreaterThan(0)
	}, 30000)

	it('should fetch protocol metrics', async () => {
		const adapter = new AaveAdapter(1)
		const metrics = await adapter.getProtocolMetrics(1)

		expect(metrics.protocol).toBe('aave')
		expect(metrics.chainId).toBe(1)
		expect(parseFloat(metrics.tvlUSD)).toBeGreaterThan(0)
		expect(metrics.isHealthy).toBe(true)
	}, 60000) // Longer timeout for multiple RPC calls
})
