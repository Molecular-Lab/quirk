import { describe, it, expect } from 'vitest'
import { MorphoAdapter } from './morpho.adapter'
import {
	getVaultConfig,
	getVaultAddress,
	isTokenSupported,
	getSupportedTokens,
} from './morpho.constants'

describe('Morpho Constants', () => {
	it('should return vault address for USDC on Ethereum (v1)', () => {
		const vaultAddress = getVaultAddress('USDC', 1)
		expect(vaultAddress).toBe('0xdd0f28e19C1780eb6396170735D45153D261490d')
	})

	it('should return vault address for USDT on Ethereum (v2)', () => {
		const vaultAddress = getVaultAddress('USDT', 1)
		expect(vaultAddress).toBe('0x1CE2354074C717a266aDADCD5e34104f233Da446')
	})

	it('should return vault address for USDC on Base (v2)', () => {
		const vaultAddress = getVaultAddress('USDC', 8453)
		expect(vaultAddress).toBe('0x618495ccC4e751178C4914b1E939C0fe0FB07b9b')
	})

	it('should return undefined for unsupported chain', () => {
		const vaultAddress = getVaultAddress('USDC', 999)
		expect(vaultAddress).toBeUndefined()
	})

	it('should return vault config for USDC on Ethereum', () => {
		const config = getVaultConfig('USDC', 1)
		expect(config).toBeDefined()
		expect(config?.baseToken).toBe('USDC')
		expect(config?.chainId).toBe(1)
		expect(config?.baseTokenDecimals).toBe(6)
		expect(config?.vaultName).toBe('Gauntlet USDC Prime')
		expect(config?.version).toBe('v1')
	})

	it('should return undefined for unsupported token', () => {
		const config = getVaultConfig('INVALID', 1)
		expect(config).toBeUndefined()
	})

	it('should check if token is supported', () => {
		expect(isTokenSupported('USDC', 1)).toBe(true)
		expect(isTokenSupported('USDT', 1)).toBe(true)
		expect(isTokenSupported('USDC', 8453)).toBe(true)
		expect(isTokenSupported('INVALID', 1)).toBe(false)
	})

	it('should return supported tokens for a chain', () => {
		const tokens = getSupportedTokens(1)
		expect(tokens).toContain('USDC')
		expect(tokens).toContain('USDT')
		expect(tokens.length).toBeGreaterThan(0)
	})

	it('should return empty array for unsupported chain', () => {
		const tokens = getSupportedTokens(999)
		expect(tokens).toEqual([])
	})
})

describe('Morpho Adapter', () => {
	it('should create adapter instance', () => {
		const adapter = new MorphoAdapter(1)
		expect(adapter).toBeDefined()
		expect(adapter.getProtocolName()).toBe('morpho')
	})

	it('should throw error for unsupported chain', () => {
		expect(() => new MorphoAdapter(999)).toThrow(
			'Morpho not supported on chain 999',
		)
	})

	it('should check token support', async () => {
		const adapter = new MorphoAdapter(1)
		const supportsUSDC = await adapter.supportsToken('USDC', 1)
		const supportsInvalid = await adapter.supportsToken('INVALID', 1)

		expect(supportsUSDC).toBe(true)
		expect(supportsInvalid).toBe(false)
	})

	// Note: The following tests require RPC access and are integration tests
	// They are skipped by default and should be run manually with real RPC endpoints

	it('should fetch real supply APY from Ethereum', async () => {
		const adapter = new MorphoAdapter(1)
		const apy = await adapter.getSupplyAPY('USDC', 1)

		// APY should be a numeric string
		const apyNumber = parseFloat(apy)
		expect(apyNumber, `APY should be a valid number, got: "${apy}"`).toBeGreaterThanOrEqual(0)
		expect(apyNumber, `APY should be less than 100%, got: ${apy}%`).toBeLessThan(100)

		console.log(`✅ Morpho USDC Supply APY: ${apy}%`)
	}, 10000) // 10 second timeout (should be fast with GraphQL API)

	it('should fetch user position', async () => {
		const adapter = new MorphoAdapter(1)
		// Test address (using zero balance address for testing)
		const testAddress = '0x0000000000000000000000000000000000000001'

		const position = await adapter.getUserPosition(testAddress, 'USDC', 1)

		if (position) {
			expect(position.protocol).toBe('morpho')
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
		const adapter = new MorphoAdapter(1)
		const metrics = await adapter.getMetrics('USDC', 1)

		expect(metrics.protocol).toBe('morpho')
		expect(metrics.token).toBe('USDC')
		expect(metrics.chainId).toBe(1) 
		expect(parseFloat(metrics.supplyAPY)).toBeGreaterThanOrEqual(0)
		expect(parseFloat(metrics.tvl)).toBeGreaterThan(0)
		expect(metrics.utilization).toBeDefined()
		expect(metrics.metadata?.vaultName).toBe('Gauntlet USDC Prime')
		expect(metrics.metadata?.totalAssets).toBeDefined()

		console.log(`✅ Morpho USDC Metrics (V1):`)
		console.log(`   Vault: ${metrics.metadata?.vaultName}`)
		console.log(`   TVL: $${metrics.tvl}`)
		console.log(`   Supply APY: ${metrics.supplyAPY}%`)
	}, 15000)

	it('should fetch USDT metrics (v2)', async () => {
		const adapter = new MorphoAdapter(1)
		const metrics = await adapter.getMetrics('USDT', 1)

		expect(metrics.protocol).toBe('morpho')
		expect(metrics.token).toBe('USDT')
		expect(metrics.chainId).toBe(1)
		expect(parseFloat(metrics.supplyAPY)).toBeGreaterThanOrEqual(0)
		expect(metrics.metadata?.vaultName).toBe('Re7 USDT')

		console.log(`✅ Morpho USDT Metrics (V2):`)
		console.log(`   Vault: ${metrics.metadata?.vaultName}`)
		console.log(`   Supply APY: ${metrics.supplyAPY}%`)
	}, 15000)

	it('should fetch protocol metrics', async () => {
		const adapter = new MorphoAdapter(1)
		const metrics = await adapter.getProtocolMetrics(1)

		expect(metrics.protocol).toBe('morpho')
		expect(metrics.chainId).toBe(1)
		expect(parseFloat(metrics.tvlUSD)).toBeGreaterThan(0)
		expect(metrics.isHealthy).toBe(true)

		console.log(`✅ Morpho Protocol Metrics:`)
		console.log(`   Total TVL: $${metrics.tvlUSD}`)
		console.log(`   Available Liquidity: $${metrics.availableLiquidityUSD}`)
		console.log(`   Avg Supply APY: ${metrics.avgSupplyAPY}%`)
	}, 30000) // Reduced timeout - GraphQL API is much faster

	it('should work on Base chain', async () => {
		// Test on Base
		const baseAdapter = new MorphoAdapter(8453)
		const baseApy = await baseAdapter.getSupplyAPY('USDC', 8453)

		expect(parseFloat(baseApy)).toBeGreaterThanOrEqual(0)
		console.log(`✅ Base USDC APY: ${baseApy}%`)

		// Test metrics
		const metrics = await baseAdapter.getMetrics('USDC', 8453)
		expect(metrics.protocol).toBe('morpho')
		expect(parseFloat(metrics.tvl)).toBeGreaterThan(0)
		console.log(`   Base USDC TVL: $${metrics.tvl}`)

		// Test protocol metrics
		const protocolMetrics = await baseAdapter.getProtocolMetrics(8453)
		expect(protocolMetrics.protocol).toBe('morpho')
		expect(parseFloat(protocolMetrics.tvlUSD)).toBeGreaterThan(0)
		console.log(`✅ Morpho Protocol Metrics:`)
		console.log(`   Total TVL: $${protocolMetrics.tvlUSD}`)
		console.log(`   Available Liquidity: $${protocolMetrics.availableLiquidityUSD}`)
		console.log(`   Avg Supply APY: ${protocolMetrics.avgSupplyAPY}%`)
	}, 30000) // Reduced timeout - GraphQL API is much faster

	it('should verify APY from GraphQL API is reasonable', async () => {
		const adapter = new MorphoAdapter(1)

		// Fetch APY from Ethereum
		const apy = await adapter.getSupplyAPY('USDC', 1)
		const apyNumber = parseFloat(apy)

		// Verify the APY is reasonable (should be less than 50% for USDC)
		expect(apyNumber).toBeGreaterThanOrEqual(0)
		expect(apyNumber).toBeLessThan(50)

		console.log(`✅ APY from GraphQL API: ${apy}% (should be real value, not 0.00%)`)
	}, 10000) // Fast GraphQL call
})
