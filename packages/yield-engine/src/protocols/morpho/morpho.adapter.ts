import type {
	IProtocolAdapter,
	Protocol,
	YieldOpportunity,
	ProtocolPosition,
	ProtocolMetrics,
} from '../../types/common.types'
import { ProtocolError } from '../../types/common.types'
import { getPublicClient, retryWithBackoff } from '../../utils/rpc'
import { formatAmount } from '../../utils/formatting'
import { globalCache, generateCacheKey } from '../../utils/cache'
import { METAMORPHO_VAULT_ABI } from './morpho.abi'
import {
	getVaultAddress,
	getTokenInfo,
	isTokenSupported,
	getSupportedTokens,
	MORPHO_CACHE_TTL,
} from './morpho.constants'

/**
 * Morpho Protocol Adapter
 * Implements yield optimization for Morpho lending protocol using MetaMorpho vaults
 */
export class MorphoAdapter implements IProtocolAdapter {
	constructor(chainId: number) {
		// Validate chain is supported
		const supportedTokens = getSupportedTokens(chainId)
		if (supportedTokens.length === 0) {
			throw new Error(`Morpho not supported on chain ${chainId}`)
		}
	}

	/**
	 * Get protocol name
	 */
	getProtocolName(): Protocol {
		return 'morpho'
	}

	/**
	 * Get current supply APY for a token
	 * @param token - Token symbol (e.g., "USDC")
	 * @param chainId - Chain ID
	 * @returns APY as percentage string (e.g., "5.25")
	 */
	async getSupplyAPY(token: string, chainId: number): Promise<string> {
		// Check cache first
		const cacheKey = generateCacheKey('morpho', 'supplyAPY', token, chainId)
		const cached = globalCache.get<string>(cacheKey)
		if (cached) {
			return cached
		}

		try {
			// Get vault address
			const vaultAddress = getVaultAddress(token, chainId)
			if (!vaultAddress) {
				throw new Error(`Token ${token} not supported on chain ${chainId}`)
			}

			// Fetch APY from Morpho GraphQL API using direct fetch
			const apy = await this.fetchAPYFromAPI(vaultAddress, chainId)

			// Cache the result
			globalCache.set(cacheKey, apy, MORPHO_CACHE_TTL)

			return apy
		} catch (error) {
			throw new ProtocolError(
				'morpho',
				`Failed to get supply APY for ${token} on chain ${chainId}`,
				error,
			)
		}
	}

	/**
	 * Get user's position in Morpho for a specific token
	 * @param walletAddress - User's wallet address
	 * @param token - Token symbol
	 * @param chainId - Chain ID
	 * @returns User's position or null if no position
	 */
	async getUserPosition(
		walletAddress: string,
		token: string,
		chainId: number,
	): Promise<ProtocolPosition | null> {
		try {
			// Get vault config
			const vaultConfig = getTokenInfo(token, chainId)
			if (!vaultConfig) {
				throw new Error(`Token ${token} not supported on chain ${chainId}`)
			}

			const client = getPublicClient(chainId)
			const vaultAddress = vaultConfig.vaultAddress

			// Get user's vault shares balance
			const shares = await retryWithBackoff(async () => {
				return await client.readContract({
					address: vaultAddress as `0x${string}`,
					abi: METAMORPHO_VAULT_ABI,
					functionName: 'balanceOf',
					args: [walletAddress as `0x${string}`],
				})
			})

			// If shares are zero, return null
			if (shares === 0n) {
				return null
			}

			// Convert shares to assets
			const assets = await retryWithBackoff(async () => {
				return await client.readContract({
					address: vaultAddress as `0x${string}`,
					abi: METAMORPHO_VAULT_ABI,
					functionName: 'convertToAssets',
					args: [shares],
				})
			})

			// Get current APY
			const apy = await this.getSupplyAPY(token, chainId)

			// Format amounts
			const amountFormatted = formatAmount(
				assets.toString(),
				vaultConfig.baseTokenDecimals,
				6,
			)

			// For stablecoins, assume 1:1 USD
			const valueUSD = amountFormatted

			return {
				protocol: 'morpho',
				token: vaultConfig.baseToken,
				tokenAddress: vaultConfig.baseTokenAddress,
				chainId,
				amount: assets.toString(),
				amountFormatted,
				valueUSD,
				apy,
			}
		} catch (error) {
			throw new ProtocolError(
				'morpho',
				`Failed to get user position for ${token} on chain ${chainId}`,
				error,
			)
		}
	}

	/**
	 * Get detailed metrics for a specific token market
	 * @param token - Token symbol
	 * @param chainId - Chain ID
	 * @returns Yield opportunity data
	 */
	async getMetrics(token: string, chainId: number): Promise<YieldOpportunity> {
		try {
			// Get vault config
			const vaultConfig = getTokenInfo(token, chainId)
			if (!vaultConfig) {
				throw new Error(`Token ${token} not supported on chain ${chainId}`)
			}

			const client = getPublicClient(chainId)
			const vaultAddress = vaultConfig.vaultAddress

			// Fetch APY and total assets in parallel
			const [supplyAPY, totalAssets] = await Promise.all([
				this.fetchAPYFromAPI(vaultAddress, chainId),
				retryWithBackoff(async () =>
					client.readContract({
						address: vaultAddress as `0x${string}`,
						abi: METAMORPHO_VAULT_ABI,
						functionName: 'totalAssets',
						args: [],
					}),
				),
			])

			// Format TVL
			const tvl = formatAmount(
				totalAssets.toString(),
				vaultConfig.baseTokenDecimals,
				2,
			)

			// For MetaMorpho vaults, liquidity = total assets (vaults manage liquidity internally)
			const liquidity = tvl

			// Utilization is not directly available from the API
			// For MetaMorpho vaults, this would require querying all underlying markets
			// For now, return 0.00 as a placeholder
			const utilizationPercent = '0.00'

			return {
				protocol: 'morpho',
				token: vaultConfig.baseToken,
				tokenAddress: vaultConfig.baseTokenAddress,
				chainId,
				supplyAPY,
				borrowAPY: '0.00', // MetaMorpho vaults are supply-only
				tvl,
				liquidity,
				utilization: utilizationPercent,
				timestamp: Date.now(),
				metadata: {
					vaultAddress: vaultConfig.vaultAddress,
					vaultName: vaultConfig.vaultName,
					totalAssets: totalAssets.toString(),
				},
			}
		} catch (error) {
			throw new ProtocolError(
				'morpho',
				`Failed to get metrics for ${token} on chain ${chainId}`,
				error,
			)
		}
	}

	/**
	 * Get overall protocol health and metrics
	 * @param chainId - Chain ID
	 * @returns Protocol-wide metrics
	 */
	async getProtocolMetrics(chainId: number): Promise<ProtocolMetrics> {
		try {
			// Get metrics for all supported tokens
			const supportedTokens = getSupportedTokens(chainId)
			const metricsPromises = supportedTokens.map((token) =>
				this.getMetrics(token, chainId).catch(() => null),
			)
			const allMetrics = await Promise.all(metricsPromises)

			// Filter out failed requests
			const validMetrics = allMetrics.filter(
				(m) => m !== null,
			) as YieldOpportunity[]

			// Calculate total TVL
			const tvlUSD = validMetrics
				.reduce((sum, m) => sum + parseFloat(m.tvl), 0)
				.toFixed(2)

			// Calculate available liquidity
			const availableLiquidityUSD = validMetrics
				.reduce((sum, m) => sum + parseFloat(m.liquidity), 0)
				.toFixed(2)

			// Calculate average supply APY
			const avgSupplyAPY =
				validMetrics.length > 0
					? (
							validMetrics.reduce((sum, m) => sum + parseFloat(m.supplyAPY), 0) /
							validMetrics.length
					  ).toFixed(2)
					: '0'

			return {
				protocol: 'morpho',
				chainId,
				tvlUSD,
				totalBorrowsUSD: '0.00', // MetaMorpho vaults are supply-only
				availableLiquidityUSD,
				avgSupplyAPY,
				isHealthy: validMetrics.length > 0,
				lastUpdated: Date.now(),
			}
		} catch (error) {
			throw new ProtocolError(
				'morpho',
				`Failed to get protocol metrics on chain ${chainId}`,
				error,
			)
		}
	}

	/**
	 * Check if protocol supports a given token on a chain
	 * @param token - Token symbol
	 * @param chainId - Chain ID
	 * @returns True if supported
	 */
	async supportsToken(token: string, chainId: number): Promise<boolean> {
		return isTokenSupported(token, chainId)
	}

	/**
	 * Fetch APY from Morpho GraphQL API (routes to v1 or v2 based on vault config)
	 * @private
	 */
	private async fetchAPYFromAPI(
		vaultAddress: string,
		chainId: number,
	): Promise<string> {
		// Get vault config to determine version
		const vaultConfig = getTokenInfo('', chainId)

		// Find the config by address
		const supportedTokens = getSupportedTokens(chainId)
		let config: any
		for (const token of supportedTokens) {
			const tokenConfig = getTokenInfo(token, chainId)
			if (tokenConfig?.vaultAddress.toLowerCase() === vaultAddress.toLowerCase()) {
				config = tokenConfig
				break
			}
		}

		if (!config) {
			throw new Error(`Vault config not found for address: ${vaultAddress}`)
		}

		// Route to correct API version
		if (config.version === 'v1') {
			return this.fetchAPYFromAPI_V1(vaultAddress)
		} else {
			return this.fetchAPYFromAPI_V2(vaultAddress, chainId)
		}
	}

	/**
	 * Fetch APY from Morpho V2 GraphQL API
	 * @private
	 */
	private async fetchAPYFromAPI_V2(
		vaultAddress: string,
		chainId: number,
	): Promise<string> {
		const query = `query { vaultV2ByAddress(address: "${vaultAddress}", chainId: ${chainId}) { avgNetApy } }`

		const response = await fetch('https://api.morpho.org/graphql', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ query }),
		})

		if (!response.ok) {
			throw new Error(
				`Morpho API request failed: ${response.status} ${response.statusText}`,
			)
		}

		const json = (await response.json()) as {
			data?: { vaultV2ByAddress?: { avgNetApy: number } }
			errors?: Array<{ message: string }>
		}

		if (json.errors && json.errors.length > 0) {
			throw new Error(`Morpho API error: ${json.errors[0].message}`)
		}

		if (!json.data?.vaultV2ByAddress) {
			throw new Error(`V2 Vault not found: ${vaultAddress} on chain ${chainId}`)
		}

		// Convert decimal APY to percentage string (e.g., 0.0525 -> "5.25")
		const apyPercent = (json.data.vaultV2ByAddress.avgNetApy * 100).toFixed(2)
		return apyPercent
	}

	/**
	 * Fetch APY from Morpho V1 GraphQL API
	 * @private
	 */
	private async fetchAPYFromAPI_V1(vaultAddress: string): Promise<string> {
		const query = `query { vaultByAddress(address: "${vaultAddress}") { state { netApy } } }`

		const response = await fetch('https://api.morpho.org/graphql', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ query }),
		})

		if (!response.ok) {
			throw new Error(
				`Morpho API request failed: ${response.status} ${response.statusText}`,
			)
		}

		const json = (await response.json()) as {
			data?: { vaultByAddress?: { state?: { netApy: number } } }
			errors?: Array<{ message: string }>
		}

		if (json.errors && json.errors.length > 0) {
			throw new Error(`Morpho API error: ${json.errors[0].message}`)
		}

		if (!json.data?.vaultByAddress?.state) {
			throw new Error(`V1 Vault not found: ${vaultAddress}`)
		}

		// Convert decimal APY to percentage string (e.g., 0.0525 -> "5.25")
		const apyPercent = (json.data.vaultByAddress.state.netApy * 100).toFixed(2)
		return apyPercent
	}
}
