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
import { COMET_ABI } from './compound.abi'
import {
	getCometAddress,
	getTokenInfo,
	isTokenSupported,
	getSupportedTokens,
	SECONDS_PER_YEAR,
	COMPOUND_RATE_PRECISION,
	COMPOUND_CACHE_TTL,
} from './compound.constants'

/**
 * Compound V3 (Comet) Protocol Adapter
 * Implements yield optimization for Compound V3 lending protocol
 */
export class CompoundAdapter implements IProtocolAdapter {
	constructor(chainId: number) {
		// Validate chain is supported
		const supportedTokens = getSupportedTokens(chainId)
		if (supportedTokens.length === 0) {
			throw new Error(`Compound V3 not supported on chain ${chainId}`)
		}
	}

	/**
	 * Get protocol name
	 */
	getProtocolName(): Protocol {
		return 'compound'
	}

	/**
	 * Get current supply APY for a token
	 * @param token - Token symbol (e.g., "USDC")
	 * @param chainId - Chain ID
	 * @returns APY as percentage string (e.g., "5.25")
	 */
	async getSupplyAPY(token: string, chainId: number): Promise<string> {
		// Check cache first
		const cacheKey = generateCacheKey('compound', 'supplyAPY', token, chainId)
		const cached = globalCache.get<string>(cacheKey)
		if (cached) {
			return cached
		}

		try {
			// Get Comet address
			const cometAddress = getCometAddress(token, chainId)
			if (!cometAddress) {
				throw new Error(`Token ${token} not supported on chain ${chainId}`)
			}

			const client = getPublicClient(chainId)

			// Get current utilization
			const utilization = await retryWithBackoff(async () => {
				return await client.readContract({
					address: cometAddress as `0x${string}`,
					abi: COMET_ABI,
					functionName: 'getUtilization',
					args: [],
				})
			})

			// Get supply rate per second (in 1e18 precision)
			const supplyRatePerSecond = await retryWithBackoff(async () => {
				return await client.readContract({
					address: cometAddress as `0x${string}`,
					abi: COMET_ABI,
					functionName: 'getSupplyRate',
					args: [utilization],
				})
			})

			// Calculate APY using compound interest formula
			const apy = this.calculateAPY(supplyRatePerSecond)

			// Cache the result
			globalCache.set(cacheKey, apy, COMPOUND_CACHE_TTL)

			return apy
		} catch (error) {
			throw new ProtocolError(
				'compound',
				`Failed to get supply APY for ${token} on chain ${chainId}`,
				error,
			)
		}
	}

	/**
	 * Get user's position in Compound for a specific token
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
			// Get market config
			const marketConfig = getTokenInfo(token, chainId)
			if (!marketConfig) {
				throw new Error(`Token ${token} not supported on chain ${chainId}`)
			}

			const client = getPublicClient(chainId)
			const cometAddress = marketConfig.cometAddress

			// Get user's balance from Comet (includes principal + accrued interest)
			const balance = await retryWithBackoff(async () => {
				return await client.readContract({
					address: cometAddress as `0x${string}`,
					abi: COMET_ABI,
					functionName: 'balanceOf',
					args: [walletAddress as `0x${string}`],
				})
			})

			// If balance is zero, return null
			if (balance === 0n) {
				return null
			}

			// Get current APY
			const apy = await this.getSupplyAPY(token, chainId)

			// Format amounts
			const amountFormatted = formatAmount(
				balance.toString(),
				marketConfig.baseTokenDecimals,
				6,
			)

			// For stablecoins, assume 1:1 USD
			// In production, you'd fetch actual price from oracle
			const valueUSD = amountFormatted

			return {
				protocol: 'compound',
				token: marketConfig.baseToken,
				tokenAddress: marketConfig.baseTokenAddress,
				chainId,
				amount: balance.toString(),
				amountFormatted,
				valueUSD,
				apy,
			}
		} catch (error) {
			throw new ProtocolError(
				'compound',
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
			// Get market config
			const marketConfig = getTokenInfo(token, chainId)
			if (!marketConfig) {
				throw new Error(`Token ${token} not supported on chain ${chainId}`)
			}

			const client = getPublicClient(chainId)
			const cometAddress = marketConfig.cometAddress

			// Get market data in parallel
			const [totalSupply, totalBorrow, utilization] = await Promise.all([
				retryWithBackoff(async () => {
					return await client.readContract({
						address: cometAddress as `0x${string}`,
						abi: COMET_ABI,
						functionName: 'totalSupply',
						args: [],
					})
				}),
				retryWithBackoff(async () => {
					return await client.readContract({
						address: cometAddress as `0x${string}`,
						abi: COMET_ABI,
						functionName: 'totalBorrow',
						args: [],
					})
				}),
				retryWithBackoff(async () => {
					return await client.readContract({
						address: cometAddress as `0x${string}`,
						abi: COMET_ABI,
						functionName: 'getUtilization',
						args: [],
					})
				}),
			])

			// Get supply and borrow rates
			const [supplyRatePerSecond, borrowRatePerSecond] = await Promise.all([
				retryWithBackoff(async () => {
					return await client.readContract({
						address: cometAddress as `0x${string}`,
						abi: COMET_ABI,
						functionName: 'getSupplyRate',
						args: [utilization],
					})
				}),
				retryWithBackoff(async () => {
					return await client.readContract({
						address: cometAddress as `0x${string}`,
						abi: COMET_ABI,
						functionName: 'getBorrowRate',
						args: [utilization],
					})
				}),
			])

			// Calculate APY
			const supplyAPY = this.calculateAPY(supplyRatePerSecond)
			const borrowAPY = this.calculateAPY(borrowRatePerSecond)

			// Format TVL (total value locked)
			const tvl = formatAmount(
				totalSupply.toString(),
				marketConfig.baseTokenDecimals,
				2,
			)

			// Calculate available liquidity (TVL - total borrows)
			const availableLiquidity = totalSupply - totalBorrow
			const liquidity = formatAmount(
				availableLiquidity.toString(),
				marketConfig.baseTokenDecimals,
				2,
			)

			// Calculate utilization percentage
			const utilizationPercent = totalSupply > 0n
				? ((Number(totalBorrow) * 100) / Number(totalSupply)).toFixed(2)
				: '0.00'

			return {
				protocol: 'compound',
				token: marketConfig.baseToken,
				tokenAddress: marketConfig.baseTokenAddress,
				chainId,
				supplyAPY,
				borrowAPY,
				tvl,
				liquidity,
				utilization: utilizationPercent,
				timestamp: Date.now(),
				metadata: {
					cometAddress: marketConfig.cometAddress,
					totalSupply: totalSupply.toString(),
					totalBorrow: totalBorrow.toString(),
				},
			}
		} catch (error) {
			throw new ProtocolError(
				'compound',
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

			// Calculate total borrows
			const totalBorrowsUSD = validMetrics
				.reduce((sum, m) => {
					const totalBorrow = m.metadata?.totalBorrow
					if (totalBorrow && typeof totalBorrow === 'string') {
						// Need decimals to format - use 6 for stablecoins
						return sum + parseFloat(formatAmount(totalBorrow, 6, 2))
					}
					return sum
				}, 0)
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
				protocol: 'compound',
				chainId,
				tvlUSD,
				totalBorrowsUSD,
				availableLiquidityUSD,
				avgSupplyAPY,
				isHealthy: validMetrics.length > 0, // Healthy if at least one market is active
				lastUpdated: Date.now(),
			}
		} catch (error) {
			throw new ProtocolError(
				'compound',
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
	 * Calculate APY from per-second rate (1e18 precision)
	 * Uses compound interest formula: APY = ((1 + ratePerSecond) ^ SECONDS_PER_YEAR) - 1
	 * @private
	 */
	private calculateAPY(ratePerSecond: bigint): string {
		try {
			// Convert 1e18 precision to decimal
			const rateDecimal = Number(ratePerSecond) / COMPOUND_RATE_PRECISION

			// Calculate APY using compound interest formula
			// Compounds every second for accurate calculation
			const apyDecimal =
				Math.pow(1 + rateDecimal, SECONDS_PER_YEAR) - 1

			// Convert to percentage and return with 2 decimal places
			return (apyDecimal * 100).toFixed(2)
		} catch (error) {
			console.error('APY calculation failed:', {
				ratePerSecond: ratePerSecond.toString(),
				error,
			})
			return '0.00'
		}
	}
}
