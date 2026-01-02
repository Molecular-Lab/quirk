/**
 * DeFi Protocol Service
 * Fetches real-time metrics from AAVE, Compound, Morpho using yield-engine
 */

import { AaveAdapter, CompoundAdapter, MorphoAdapter, YieldOptimizer, MultiChainOptimizer } from '@quirk/yield-engine'
import type { YieldOpportunity, ProtocolMetrics, RiskProfile, MultiChainOptimizationResult, RiskLevel } from '@quirk/yield-engine'


export interface ProtocolData {
	// Identity
	protocol: 'aave' | 'compound' | 'morpho'
	token: string
	chainId: number

	// Yield Metrics
	supplyAPY: string
	borrowAPY?: string

	// Size Metrics
	tvl: string
	liquidity: string
	totalSupplied: string
	totalBorrowed?: string

	// Risk Metrics
	utilization: string
	risk: 'Low' | 'Medium' | 'High'
	status: 'healthy' | 'warning' | 'critical'

	// Metadata
	lastUpdate: Date
	protocolHealth: number

	// Raw metrics for "Raw Data" view
	rawMetrics?: YieldOpportunity
}

export interface OptimizedAllocation {
	protocol: 'aave' | 'compound' | 'morpho'
	percentage: number
	expectedAPY: string
	tvl: string
	rationale: string
}

export interface OptimizationResult {
	riskLevel: 'conservative' | 'moderate' | 'aggressive'
	allocation: OptimizedAllocation[]
	expectedBlendedAPY: string
	confidence: number
	strategy: string
	timestamp: number
}

export class DeFiProtocolService {
	// Adapters created on-demand per request based on chainId
	constructor() {
		console.log('✅ DeFiProtocolService initialized (adapters created per-request)')
	}

	/**
	 * Get or create AAVE adapter for specific chain
	 */
	private getAaveAdapter(chainId: number): AaveAdapter {
		return new AaveAdapter(chainId)
	}

	/**
	 * Get or create Compound adapter for specific chain
	 */
	private getCompoundAdapter(chainId: number): CompoundAdapter {
		return new CompoundAdapter(chainId)
	}

	/**
	 * Get or create Morpho adapter for specific chain
	 */
	private getMorphoAdapter(chainId: number): MorphoAdapter {
		return new MorphoAdapter(chainId)
	}

	/**
	 * Fetch AAVE metrics
	 */
	async fetchAAVEMetrics(token: string, chainId: number): Promise<ProtocolData> {
		try {
			const adapter = this.getAaveAdapter(chainId)
			const metrics = await adapter.getMetrics(token, chainId) // Returns YieldOpportunity
			const protocolMetrics = await adapter.getProtocolMetrics(chainId) // Returns ProtocolMetrics

			// Calculate utilization from individual token metrics
			// Available liquidity = total amount that can be withdrawn immediately
			// Total supplied = TVL from individual market
			const tvlToken = parseFloat(metrics.tvl || '0')
			const liquidityToken = parseFloat(metrics.liquidity || '0')

			// Utilization = (TVL - Available Liquidity) / TVL * 100
			// This represents how much of the supplied capital is currently being borrowed
			const totalBorrowed = tvlToken - liquidityToken
			const utilization = tvlToken > 0 ? (totalBorrowed / tvlToken) * 100 : 0

			// Use protocol-wide metrics for display
			const tvl = parseFloat(protocolMetrics.tvlUSD || '0')

			// Determine risk and status based on token-specific utilization
			const { risk, status, health } = this.calculateRiskMetrics(utilization, tvlToken)

			return {
				protocol: 'aave',
				token,
				chainId,
				supplyAPY: metrics.supplyAPY,
				borrowAPY: metrics.borrowAPY,
				tvl: protocolMetrics.tvlUSD,
				liquidity: protocolMetrics.availableLiquidityUSD,
				totalSupplied: tvlToken.toFixed(2),
				totalBorrowed: totalBorrowed.toFixed(2),
				utilization: utilization.toFixed(2),
				risk,
				status,
				lastUpdate: new Date(),
				protocolHealth: health,
				rawMetrics: metrics,
			}
		} catch (error) {
			console.error('Failed to fetch AAVE metrics:', error)
			throw new Error(`Failed to fetch AAVE metrics: ${error instanceof Error ? error.message : 'Unknown error'}`)
		}
	}

	/**
	 * Fetch Compound metrics
	 */
	async fetchCompoundMetrics(token: string, chainId: number): Promise<ProtocolData> {
		try {
			const adapter = this.getCompoundAdapter(chainId)
			const metrics = await adapter.getMetrics(token, chainId) // Returns YieldOpportunity
			const protocolMetrics = await adapter.getProtocolMetrics(chainId) // Returns ProtocolMetrics

			// Calculate utilization from individual token metrics
			const tvlToken = parseFloat(metrics.tvl || '0')
			const liquidityToken = parseFloat(metrics.liquidity || '0')

			// Utilization = (TVL - Available Liquidity) / TVL * 100
			const totalBorrowed = tvlToken - liquidityToken
			const utilization = tvlToken > 0 ? (totalBorrowed / tvlToken) * 100 : 0

			// Use protocol-wide metrics for display
			const tvl = parseFloat(protocolMetrics.tvlUSD || '0')

			// Determine risk and status based on token-specific utilization
			const { risk, status, health } = this.calculateRiskMetrics(utilization, tvlToken)

			return {
				protocol: 'compound',
				token,
				chainId,
				supplyAPY: metrics.supplyAPY,
				borrowAPY: metrics.borrowAPY,
				tvl: protocolMetrics.tvlUSD,
				liquidity: protocolMetrics.availableLiquidityUSD,
				totalSupplied: tvlToken.toFixed(2),
				totalBorrowed: totalBorrowed.toFixed(2),
				utilization: utilization.toFixed(2),
				risk,
				status,
				lastUpdate: new Date(),
				protocolHealth: health,
				rawMetrics: metrics,
			}
		} catch (error) {
			console.error('Failed to fetch Compound metrics:', error)
			throw new Error(`Failed to fetch Compound metrics: ${error instanceof Error ? error.message : 'Unknown error'}`)
		}
	}

	/**
	 * Fetch Morpho metrics
	 */
	async fetchMorphoMetrics(token: string, chainId: number): Promise<ProtocolData> {
		try {
			const adapter = this.getMorphoAdapter(chainId)
			const metrics = await adapter.getMetrics(token, chainId) // Returns YieldOpportunity
			const protocolMetrics = await adapter.getProtocolMetrics(chainId) // Returns ProtocolMetrics

			// Calculate utilization from individual token metrics
			const tvlToken = parseFloat(metrics.tvl || '0')
			const liquidityToken = parseFloat(metrics.liquidity || '0')

			// Utilization = (TVL - Available Liquidity) / TVL * 100
			const totalBorrowed = tvlToken - liquidityToken
			const utilization = tvlToken > 0 ? (totalBorrowed / tvlToken) * 100 : 0

			// Use protocol-wide metrics for display
			const tvl = parseFloat(protocolMetrics.tvlUSD || '0')

			// Determine risk and status based on token-specific utilization
			const { risk, status, health } = this.calculateRiskMetrics(utilization, tvlToken)

			return {
				protocol: 'morpho',
				token,
				chainId,
				supplyAPY: metrics.supplyAPY,
				tvl: protocolMetrics.tvlUSD,
				liquidity: protocolMetrics.availableLiquidityUSD,
				totalSupplied: tvlToken.toFixed(2),
				utilization: utilization.toFixed(2),
				risk,
				status,
				lastUpdate: new Date(),
				protocolHealth: health,
				rawMetrics: metrics,
			}
		} catch (error) {
			console.error('Failed to fetch Morpho metrics:', error)
			throw new Error(`Failed to fetch Morpho metrics: ${error instanceof Error ? error.message : 'Unknown error'}`)
		}
	}

	/**
	 * Fetch all protocols sequentially to avoid RPC rate limits
	 * TODO: Remove delays once better RPC endpoint is configured (see RPC_RATE_LIMIT_FIX.md)
	 */
	async fetchAllProtocols(token: string, chainId: number): Promise<ProtocolData[]> {
		const protocols: ProtocolData[] = []
		
		// Fetch AAVE
		try {
			const aave = await this.fetchAAVEMetrics(token, chainId)
			protocols.push(aave)
			console.log('[DeFi] ✅ AAVE fetched successfully')
		} catch (error) {
			console.error('[DeFi] ❌ AAVE fetch failed:', error instanceof Error ? error.message : 'Unknown error')
		}
		
		// Small delay to avoid rate limiting
		await new Promise(resolve => setTimeout(resolve, 300))
		
		// Fetch Compound
		try {
			const compound = await this.fetchCompoundMetrics(token, chainId)
			protocols.push(compound)
			console.log('[DeFi] ✅ Compound fetched successfully')
		} catch (error) {
			console.error('[DeFi] ❌ Compound fetch failed:', error instanceof Error ? error.message : 'Unknown error')
		}
		
		// Small delay to avoid rate limiting
		await new Promise(resolve => setTimeout(resolve, 300))
		
		// Fetch Morpho
		try {
			const morpho = await this.fetchMorphoMetrics(token, chainId)
			protocols.push(morpho)
			console.log('[DeFi] ✅ Morpho fetched successfully')
		} catch (error) {
			console.error('[DeFi] ❌ Morpho fetch failed:', error instanceof Error ? error.message : 'Unknown error')
		}
		
		console.log(`[DeFi] Fetched ${protocols.length}/3 protocols successfully`)
		return protocols
	}

	/**
	 * Get APYs summary (lightweight endpoint for client-side strategy calculation)
	 * Returns only APY values for each protocol
	 * Fetches sequentially to avoid RPC rate limits
	 */
	async getAPYsSummary(token: string, chainId: number): Promise<{
		aave: string
		compound: string
		morpho: string
		timestamp: string
	}> {
		const apys = {
			aave: '0',
			compound: '0',
			morpho: '0',
		}
		
		// Fetch AAVE APY
		try {
			const aave = await this.fetchAAVEMetrics(token, chainId)
			apys.aave = aave.supplyAPY
			console.log('[DeFi APY] ✅ AAVE:', apys.aave)
		} catch (error) {
			console.error('[DeFi APY] ❌ AAVE failed:', error instanceof Error ? error.message : 'Unknown')
		}
		
		await new Promise(resolve => setTimeout(resolve, 300)) // Delay to avoid rate limit
		
		// Fetch Compound APY
		try {
			const compound = await this.fetchCompoundMetrics(token, chainId)
			apys.compound = compound.supplyAPY
			console.log('[DeFi APY] ✅ Compound:', apys.compound)
		} catch (error) {
			console.error('[DeFi APY] ❌ Compound failed:', error instanceof Error ? error.message : 'Unknown')
		}
		
		await new Promise(resolve => setTimeout(resolve, 300)) // Delay to avoid rate limit
		
		// Fetch Morpho APY
		try {
			const morpho = await this.fetchMorphoMetrics(token, chainId)
			apys.morpho = morpho.supplyAPY
			console.log('[DeFi APY] ✅ Morpho:', apys.morpho)
		} catch (error) {
			console.error('[DeFi APY] ❌ Morpho failed:', error instanceof Error ? error.message : 'Unknown')
		}
		
		console.log('[DeFi APY] Final APYs:', apys)

		return {
			...apys,
			timestamp: new Date().toISOString(),
		}
	}

	/**
	 * Optimize portfolio allocation based on risk profile
	 */
	async optimizeAllocation(
		token: string,
		chainId: number,
		riskProfile: 'conservative' | 'moderate' | 'aggressive'
	): Promise<OptimizationResult> {
		const optimizer = new YieldOptimizer()

		// Fetch all protocols to get current data
		const protocols = await this.fetchAllProtocols(token, chainId)

		if (protocols.length === 0) {
			throw new Error('No protocols available for optimization')
		}

		// Run optimizer
		const riskProfileConfig: Partial<RiskProfile> = {
			level: riskProfile,
		}

		const result = await optimizer.optimizePosition(
			'dummy-wallet', // No real wallet needed for strategy recommendation
			token,
			chainId,
			riskProfileConfig
		)

		// Convert ranked opportunities to percentage allocations
		const allocation = this.calculatePercentageAllocation(result.rankedOpportunities, riskProfile, protocols)

		// Calculate blended APY
		const blendedAPY = allocation.reduce((sum, alloc) => {
			return sum + (parseFloat(alloc.expectedAPY) * alloc.percentage) / 100
		}, 0)

		return {
			riskLevel: riskProfile,
			allocation,
			expectedBlendedAPY: blendedAPY.toFixed(2),
			confidence: result.confidence,
			strategy: result.strategy,
			timestamp: result.timestamp,
		}
	}

	/**
	 * Calculate percentage allocation based on risk profile and ranked opportunities
	 */
	private calculatePercentageAllocation(
		rankedOpportunities: YieldOpportunity[],
		riskProfile: 'conservative' | 'moderate' | 'aggressive',
		protocols: ProtocolData[]
	): OptimizedAllocation[] {
		if (protocols.length === 0) {
			return []
		}

		const allocations: OptimizedAllocation[] = []

		if (riskProfile === 'conservative') {
			// Conservative: Prioritize stability (TVL) over yield
			// Sort by TVL (highest = most established = safest)
			const sortedByTVL = [...protocols].sort((a, b) => parseFloat(b.tvl) - parseFloat(a.tvl))

			const firstProtocol = sortedByTVL[0]
			const secondProtocol = sortedByTVL[1] || sortedByTVL[0]
			const thirdProtocol = sortedByTVL[2] || sortedByTVL[1] || sortedByTVL[0]

			allocations.push({
				protocol: firstProtocol.protocol,
				percentage: 60,
				expectedAPY: firstProtocol.supplyAPY,
				tvl: firstProtocol.tvl,
				rationale: 'Highest TVL - most established and stable protocol',
			})

			allocations.push({
				protocol: secondProtocol.protocol,
				percentage: 30,
				expectedAPY: secondProtocol.supplyAPY,
				tvl: secondProtocol.tvl,
				rationale: 'Secondary stable protocol with high TVL',
			})

			allocations.push({
				protocol: thirdProtocol.protocol,
				percentage: 10,
				expectedAPY: thirdProtocol.supplyAPY,
				tvl: thirdProtocol.tvl,
				rationale: 'Minimal diversification',
			})
		} else if (riskProfile === 'moderate') {
			// Moderate: Balance between yield and stability
			// Create a score that weights both APY (40%) and TVL (60%)
			const sortedByScore = [...protocols].sort((a, b) => {
				const maxAPY = Math.max(...protocols.map(p => parseFloat(p.supplyAPY)))
				const maxTVL = Math.max(...protocols.map(p => parseFloat(p.tvl)))

				const scoreA = (parseFloat(a.supplyAPY) / maxAPY) * 0.4 + (parseFloat(a.tvl) / maxTVL) * 0.6
				const scoreB = (parseFloat(b.supplyAPY) / maxAPY) * 0.4 + (parseFloat(b.tvl) / maxTVL) * 0.6

				return scoreB - scoreA
			})

			const firstProtocol = sortedByScore[0]
			const secondProtocol = sortedByScore[1] || sortedByScore[0]
			const thirdProtocol = sortedByScore[2] || sortedByScore[1] || sortedByScore[0]

			allocations.push({
				protocol: firstProtocol.protocol,
				percentage: 40,
				expectedAPY: firstProtocol.supplyAPY,
				tvl: firstProtocol.tvl,
				rationale: 'Best balance of yield and stability',
			})

			allocations.push({
				protocol: secondProtocol.protocol,
				percentage: 35,
				expectedAPY: secondProtocol.supplyAPY,
				tvl: secondProtocol.tvl,
				rationale: 'Secondary balanced opportunity',
			})

			allocations.push({
				protocol: thirdProtocol.protocol,
				percentage: 25,
				expectedAPY: thirdProtocol.supplyAPY,
				tvl: thirdProtocol.tvl,
				rationale: 'Diversification',
			})
		} else {
			// Aggressive: Maximize yield (APY)
			const sortedByAPY = [...protocols].sort((a, b) => parseFloat(b.supplyAPY) - parseFloat(a.supplyAPY))

			const firstProtocol = sortedByAPY[0]
			const secondProtocol = sortedByAPY[1] || sortedByAPY[0]
			const thirdProtocol = sortedByAPY[2] || sortedByAPY[1] || sortedByAPY[0]

			allocations.push({
				protocol: firstProtocol.protocol,
				percentage: 70,
				expectedAPY: firstProtocol.supplyAPY,
				tvl: firstProtocol.tvl,
				rationale: 'Maximum yield - highest APY protocol',
			})

			allocations.push({
				protocol: secondProtocol.protocol,
				percentage: 25,
				expectedAPY: secondProtocol.supplyAPY,
				tvl: secondProtocol.tvl,
				rationale: 'Secondary high-yield opportunity',
			})

			allocations.push({
				protocol: thirdProtocol.protocol,
				percentage: 5,
				expectedAPY: thirdProtocol.supplyAPY,
				tvl: thirdProtocol.tvl,
				rationale: 'Minimal diversification',
			})
		}

		return allocations
	}

	/**
	 * Calculate risk metrics based on utilization and TVL
	 */
	private calculateRiskMetrics(utilization: number, tvl: number): {
		risk: 'Low' | 'Medium' | 'High'
		status: 'healthy' | 'warning' | 'critical'
		health: number
	} {
		let risk: 'Low' | 'Medium' | 'High' = 'Low'
		let status: 'healthy' | 'warning' | 'critical' = 'healthy'
		let health = 100

		// Utilization-based risk
		if (utilization > 95) {
			risk = 'High'
			status = 'critical'
			health = 20
		} else if (utilization > 90) {
			risk = 'High'
			status = 'warning'
			health = 40
		} else if (utilization > 85) {
			risk = 'Medium'
			status = 'warning'
			health = 60
		} else if (utilization >= 60 && utilization <= 80) {
			risk = 'Low'
			status = 'healthy'
			health = 100
		} else if (utilization < 40) {
			risk = 'Low'
			status = 'healthy'
			health = 80
		}

		// TVL-based adjustments
		if (tvl < 10_000_000) {
			// Less than $10M TVL is riskier
			health = Math.max(0, health - 20)
			if (risk === 'Low') risk = 'Medium'
		}

		return { risk, status, health }
	}

	/**
	 * Multi-chain optimization using MultiChainOptimizer
	 * Compares yields across Ethereum, Base, Arbitrum, Polygon and returns the best option
	 */
	async optimizeMultiChain(
		token: string,
		riskLevel: 'conservative' | 'moderate' | 'aggressive',
		positionSizeUSD: number = 10000,
		holdPeriodDays: number = 30
	): Promise<MultiChainOptimizationResult> {
		const optimizer = new MultiChainOptimizer()

		const result = await optimizer.optimizeAcrossChains(
			token,
			riskLevel as RiskLevel,
			positionSizeUSD,
			holdPeriodDays
		)

		return result
	}
}
