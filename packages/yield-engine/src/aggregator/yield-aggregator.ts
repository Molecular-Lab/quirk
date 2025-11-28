import type {
	Protocol,
	YieldOpportunity,
	ProtocolPosition,
	ProtocolMetrics,
	IProtocolAdapter,
} from '../types/common.types'
import type {
	AggregatorConfig,
	AggregatedMetrics,
	AggregatedOpportunities,
	AggregatedPositions,
	OpportunityFilter,
} from './aggregator.types'
import { AggregatorConfigSchema } from './aggregator.types'
import { AaveAdapter } from '../protocols/aave/aave.adapter'
import { CompoundAdapter } from '../protocols/compound/compound.adapter'
import { MorphoAdapter } from '../protocols/morpho/morpho.adapter'
import { globalCache, generateCacheKey } from '../utils/cache'
import { compareNumbers } from '../utils/formatting'

const AGGREGATOR_CACHE_TTL = 2 * 60 * 1000 // 2 minutes

/**
 * YieldAggregator - Combines yield data from multiple DeFi protocols
 *
 * Fetches and aggregates yield opportunities from AAVE, Compound, and Morpho
 * in parallel, providing a unified view of the best yield options.
 *
 * @example
 * ```typescript
 * const aggregator = new YieldAggregator()
 *
 * // Get all USDC opportunities on Ethereum
 * const opportunities = await aggregator.fetchAllOpportunities('USDC', 1)
 * console.log(opportunities.best) // Highest APY opportunity
 *
 * // Get user's positions across all protocols
 * const positions = await aggregator.getAllPositions('0x...', 1)
 * console.log(positions.totalValueUSD)
 * ```
 */
export class YieldAggregator {
	private adapters: Map<Protocol, IProtocolAdapter>
	private config: AggregatorConfig

	constructor(config?: Partial<AggregatorConfig>) {
		this.config = AggregatorConfigSchema.parse(config ?? {})
		this.adapters = new Map()

		// Initialize adapters for enabled protocols
		const protocols = this.getEnabledProtocols()
		for (const protocol of protocols) {
			this.adapters.set(protocol, this.createAdapter(protocol))
		}
	}

	/**
	 * Get enabled protocols based on configuration
	 */
	private getEnabledProtocols(): Protocol[] {
		let protocols = this.config.protocols
		if (this.config.excludeProtocols) {
			protocols = protocols.filter((p) => !this.config.excludeProtocols?.includes(p))
		}
		return protocols
	}

	/**
	 * Create adapter instance for a protocol
	 */
	private createAdapter(protocol: Protocol): IProtocolAdapter {
		switch (protocol) {
			case 'aave':
				return new AaveAdapter(1) // Default chain, will be overridden per call
			case 'compound':
				return new CompoundAdapter(1)
			case 'morpho':
				return new MorphoAdapter(1)
			default:
				throw new Error(`Unknown protocol: ${protocol}`)
		}
	}

	/**
	 * Fetch yield opportunities from all enabled protocols for a token
	 *
	 * @param token - Token symbol (e.g., 'USDC', 'USDT')
	 * @param chainId - Chain ID (1 = Ethereum, 137 = Polygon, etc.)
	 * @param filter - Optional filter options
	 * @returns Aggregated opportunities sorted by APY
	 */
	async fetchAllOpportunities(
		token: string,
		chainId: number,
		filter?: OpportunityFilter,
	): Promise<AggregatedOpportunities> {
		const cacheKey = generateCacheKey('aggregator', 'opportunities', token, chainId.toString())
		const cached = globalCache.get<AggregatedOpportunities>(cacheKey)
		if (cached && !filter) {
			return cached
		}

		const protocols = filter?.protocols ?? this.getEnabledProtocols()
		const excludeProtocols = filter?.excludeProtocols ?? this.config.excludeProtocols

		const enabledProtocols = excludeProtocols
			? protocols.filter((p) => !excludeProtocols.includes(p))
			: protocols

		const results = await Promise.allSettled(
			enabledProtocols.map(async (protocol) => {
				const adapter = this.adapters.get(protocol)
				if (!adapter) {
					throw new Error(`Adapter not found for protocol: ${protocol}`)
				}

				// Check if protocol supports this token on this chain
				const isSupported = await adapter.supportsToken(token, chainId)
				if (!isSupported) {
					return null
				}

				const metrics = await adapter.getMetrics(token, chainId)
				return metrics
			}),
		)

		const opportunities: YieldOpportunity[] = []
		const errors: { protocol: Protocol; error: string }[] = []
		let successfulProtocols = 0
		let failedProtocols = 0

		results.forEach((result, index) => {
			const protocol = enabledProtocols[index]
			if (result.status === 'fulfilled') {
				if (result.value !== null) {
					opportunities.push(result.value)
					successfulProtocols++
				}
			} else {
				failedProtocols++
				errors.push({
					protocol,
					error: result.reason?.message ?? 'Unknown error',
				})
			}
		})

		// Apply filters
		let filteredOpportunities = this.applyFilters(opportunities, filter)

		// Sort by APY (default: descending)
		const sortDirection = filter?.sortDirection ?? 'desc'
		const sortBy = filter?.sortBy ?? 'apy'
		filteredOpportunities = this.sortOpportunities(filteredOpportunities, sortBy, sortDirection)

		// Apply limit
		if (filter?.limit && filteredOpportunities.length > filter.limit) {
			filteredOpportunities = filteredOpportunities.slice(0, filter.limit)
		}

		const best = filteredOpportunities.length > 0 ? filteredOpportunities[0] : null
		const worst =
			filteredOpportunities.length > 0
				? filteredOpportunities[filteredOpportunities.length - 1]
				: null

		const apySpread =
			best && worst
				? (parseFloat(best.supplyAPY) - parseFloat(worst.supplyAPY)).toFixed(2)
				: '0.00'

		const aggregated: AggregatedOpportunities = {
			opportunities: filteredOpportunities,
			best,
			worst,
			apySpread,
			successfulProtocols,
			failedProtocols,
			errors,
			timestamp: Date.now(),
		}

		// Cache if no custom filter was applied
		if (!filter) {
			globalCache.set(cacheKey, aggregated, this.config.cacheTTL ?? AGGREGATOR_CACHE_TTL)
		}

		return aggregated
	}

	/**
	 * Get the best yield opportunity for a token
	 *
	 * @param token - Token symbol
	 * @param chainId - Chain ID
	 * @returns Best opportunity or null if none found
	 */
	async getBestOpportunity(token: string, chainId: number): Promise<YieldOpportunity | null> {
		const result = await this.fetchAllOpportunities(token, chainId)
		return result.best
	}

	/**
	 * Fetch opportunities for multiple tokens
	 *
	 * @param tokens - Array of token symbols
	 * @param chainId - Chain ID
	 * @returns Array of all opportunities across tokens
	 */
	async fetchOpportunitiesForTokens(
		tokens: string[],
		chainId: number,
	): Promise<YieldOpportunity[]> {
		const results = await Promise.allSettled(
			tokens.map((token) => this.fetchAllOpportunities(token, chainId)),
		)

		const allOpportunities: YieldOpportunity[] = []
		for (const result of results) {
			if (result.status === 'fulfilled') {
				allOpportunities.push(...result.value.opportunities)
			}
		}

		// Sort all by APY descending
		return this.sortOpportunities(allOpportunities, 'apy', 'desc')
	}

	/**
	 * Get user's positions across all protocols
	 *
	 * @param walletAddress - User's wallet address
	 * @param chainId - Chain ID
	 * @param tokens - Optional array of tokens to check (default: ['USDC', 'USDT'])
	 * @returns Aggregated positions
	 */
	async getAllPositions(
		walletAddress: string,
		chainId: number,
		tokens: string[] = ['USDC', 'USDT'],
	): Promise<AggregatedPositions> {
		const cacheKey = generateCacheKey(
			'aggregator',
			'positions',
			walletAddress,
			chainId.toString(),
		)
		const cached = globalCache.get<AggregatedPositions>(cacheKey)
		if (cached) {
			return cached
		}

		const protocols = this.getEnabledProtocols()
		const positionPromises: Promise<ProtocolPosition | null>[] = []

		// Query all protocol-token combinations
		for (const protocol of protocols) {
			const adapter = this.adapters.get(protocol)
			if (!adapter) continue

			for (const token of tokens) {
				positionPromises.push(
					adapter.getUserPosition(walletAddress, token, chainId).catch(() => null),
				)
			}
		}

		const results = await Promise.allSettled(positionPromises)
		const positions: ProtocolPosition[] = []

		for (const result of results) {
			if (result.status === 'fulfilled' && result.value !== null) {
				positions.push(result.value)
			}
		}

		// Calculate aggregated metrics
		let totalValueUSD = 0
		let weightedApySum = 0
		let totalYieldEarned = 0
		let bestPosition: ProtocolPosition | null = null

		for (const position of positions) {
			const valueUSD = parseFloat(position.valueUSD)
			const apy = parseFloat(position.apy)

			totalValueUSD += valueUSD
			weightedApySum += apy * valueUSD

			if (position.earnedYield) {
				totalYieldEarned += parseFloat(position.earnedYield)
			}

			if (!bestPosition || apy > parseFloat(bestPosition.apy)) {
				bestPosition = position
			}
		}

		const weightedAvgAPY = totalValueUSD > 0 ? weightedApySum / totalValueUSD : 0

		// Count unique protocols
		const protocolSet = new Set(positions.map((p) => p.protocol))

		const aggregated: AggregatedPositions = {
			positions,
			totalValueUSD: totalValueUSD.toFixed(2),
			weightedAvgAPY: weightedAvgAPY.toFixed(2),
			bestPosition,
			totalYieldEarned: totalYieldEarned.toFixed(2),
			protocolCount: protocolSet.size,
			timestamp: Date.now(),
		}

		globalCache.set(cacheKey, aggregated, this.config.cacheTTL ?? AGGREGATOR_CACHE_TTL)
		return aggregated
	}

	/**
	 * Get aggregated metrics across all protocols
	 *
	 * @param chainId - Chain ID
	 * @returns Aggregated protocol metrics
	 */
	async getAggregatedMetrics(chainId: number): Promise<AggregatedMetrics> {
		const cacheKey = generateCacheKey('aggregator', 'metrics', chainId.toString())
		const cached = globalCache.get<AggregatedMetrics>(cacheKey)
		if (cached) {
			return cached
		}

		const protocols = this.getEnabledProtocols()
		const results = await Promise.allSettled(
			protocols.map((protocol) => {
				const adapter = this.adapters.get(protocol)
				if (!adapter) {
					throw new Error(`Adapter not found: ${protocol}`)
				}
				return adapter.getProtocolMetrics(chainId)
			}),
		)

		const protocolMetrics: ProtocolMetrics[] = []
		let totalTVL = 0
		let totalLiquidity = 0
		let weightedApySum = 0
		let bestAPY = 0
		let bestProtocol: Protocol | undefined
		let healthyCount = 0

		results.forEach((result, index) => {
			if (result.status === 'fulfilled') {
				const metrics = result.value
				protocolMetrics.push(metrics)

				const tvl = parseFloat(metrics.tvlUSD)
				const apy = parseFloat(metrics.avgSupplyAPY)
				const liquidity = parseFloat(metrics.availableLiquidityUSD)

				totalTVL += tvl
				totalLiquidity += liquidity
				weightedApySum += apy * tvl

				if (apy > bestAPY) {
					bestAPY = apy
					bestProtocol = protocols[index]
				}

				if (metrics.isHealthy) {
					healthyCount++
				}
			}
		})

		const weightedAvgAPY = totalTVL > 0 ? weightedApySum / totalTVL : 0

		const aggregated: AggregatedMetrics = {
			chainId,
			totalTVLUSD: totalTVL.toFixed(2),
			totalAvailableLiquidityUSD: totalLiquidity.toFixed(2),
			weightedAvgSupplyAPY: weightedAvgAPY.toFixed(2),
			bestSupplyAPY: bestAPY.toFixed(2),
			bestProtocol,
			healthyProtocolCount: healthyCount,
			totalProtocolCount: protocols.length,
			protocolMetrics,
			timestamp: Date.now(),
		}

		globalCache.set(cacheKey, aggregated, this.config.cacheTTL ?? AGGREGATOR_CACHE_TTL)
		return aggregated
	}

	/**
	 * Compare opportunities between two protocols
	 *
	 * @param token - Token symbol
	 * @param chainId - Chain ID
	 * @param protocol1 - First protocol
	 * @param protocol2 - Second protocol
	 * @returns Comparison result
	 */
	async compareProtocols(
		token: string,
		chainId: number,
		protocol1: Protocol,
		protocol2: Protocol,
	): Promise<{
		winner: Protocol
		protocol1: YieldOpportunity | null
		protocol2: YieldOpportunity | null
		apyDifference: string
	}> {
		const opportunities = await this.fetchAllOpportunities(token, chainId, {
			protocols: [protocol1, protocol2],
		})

		const opp1 = opportunities.opportunities.find((o) => o.protocol === protocol1) ?? null
		const opp2 = opportunities.opportunities.find((o) => o.protocol === protocol2) ?? null

		let winner: Protocol
		let apyDifference: string

		if (!opp1 && !opp2) {
			winner = protocol1
			apyDifference = '0.00'
		} else if (!opp1) {
			winner = protocol2
			apyDifference = opp2!.supplyAPY
		} else if (!opp2) {
			winner = protocol1
			apyDifference = opp1.supplyAPY
		} else {
			const apy1 = parseFloat(opp1.supplyAPY)
			const apy2 = parseFloat(opp2.supplyAPY)
			winner = apy1 >= apy2 ? protocol1 : protocol2
			apyDifference = Math.abs(apy1 - apy2).toFixed(2)
		}

		return {
			winner,
			protocol1: opp1,
			protocol2: opp2,
			apyDifference,
		}
	}

	/**
	 * Apply filters to opportunities
	 */
	private applyFilters(
		opportunities: YieldOpportunity[],
		filter?: OpportunityFilter,
	): YieldOpportunity[] {
		if (!filter) return opportunities

		return opportunities.filter((opp) => {
			// Min APY filter
			if (filter.minAPY && parseFloat(opp.supplyAPY) < parseFloat(filter.minAPY)) {
				return false
			}

			// Max APY filter
			if (filter.maxAPY && parseFloat(opp.supplyAPY) > parseFloat(filter.maxAPY)) {
				return false
			}

			// Min TVL filter
			if (filter.minTVL && parseFloat(opp.tvl) < parseFloat(filter.minTVL)) {
				return false
			}

			return true
		})
	}

	/**
	 * Sort opportunities by a field
	 */
	private sortOpportunities(
		opportunities: YieldOpportunity[],
		sortBy: 'apy' | 'tvl' | 'liquidity',
		direction: 'asc' | 'desc',
	): YieldOpportunity[] {
		const sorted = [...opportunities].sort((a, b) => {
			let valueA: number
			let valueB: number

			switch (sortBy) {
				case 'apy':
					valueA = parseFloat(a.supplyAPY)
					valueB = parseFloat(b.supplyAPY)
					break
				case 'tvl':
					valueA = parseFloat(a.tvl)
					valueB = parseFloat(b.tvl)
					break
				case 'liquidity':
					valueA = parseFloat(a.liquidity)
					valueB = parseFloat(b.liquidity)
					break
			}

			return direction === 'desc' ? valueB - valueA : valueA - valueB
		})

		return sorted
	}

	/**
	 * Clear all cached data
	 */
	clearCache(): void {
		// Note: This clears the entire global cache
		// In production, you might want a more targeted approach
		globalCache.clear()
	}
}
