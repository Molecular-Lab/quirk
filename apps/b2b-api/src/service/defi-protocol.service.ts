/**
 * DeFi Protocol Service
 * Fetches real-time metrics from AAVE, Compound, Morpho using yield-engine
 */

import { AaveAdapter, CompoundAdapter, MorphoAdapter } from '@proxify/yield-engine'
import type { YieldOpportunity, ProtocolMetrics } from '@proxify/yield-engine'

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
	rawMetrics?: ProtocolMetrics
}

export class DeFiProtocolService {
	private aaveAdapter: AaveAdapter | null = null
	private compoundAdapter: CompoundAdapter | null = null
	private morphoAdapter: MorphoAdapter | null = null

	constructor(chainId: number = 84532) { // Default: Base Sepolia
		// Initialize adapters gracefully - if a protocol isn't supported on this chain, skip it
		try {
			this.aaveAdapter = new AaveAdapter(chainId)
			console.log(`✅ AAVE adapter initialized for chain ${chainId}`)
		} catch (error) {
			console.warn(`⚠️  AAVE not available on chain ${chainId}:`, error instanceof Error ? error.message : error)
		}

		try {
			this.compoundAdapter = new CompoundAdapter(chainId)
			console.log(`✅ Compound adapter initialized for chain ${chainId}`)
		} catch (error) {
			console.warn(`⚠️  Compound not available on chain ${chainId}:`, error instanceof Error ? error.message : error)
		}

		try {
			this.morphoAdapter = new MorphoAdapter(chainId)
			console.log(`✅ Morpho adapter initialized for chain ${chainId}`)
		} catch (error) {
			console.warn(`⚠️  Morpho not available on chain ${chainId}:`, error instanceof Error ? error.message : error)
		}
	}

	/**
	 * Fetch AAVE metrics
	 */
	async fetchAAVEMetrics(token: string, chainId: number): Promise<ProtocolData> {
		if (!this.aaveAdapter) {
			throw new Error('AAVE adapter not available on this chain')
		}

		try {
			const opportunity = await this.aaveAdapter.getYieldOpportunity(token, chainId)
			const metrics = await this.aaveAdapter.getMetrics(token, chainId)

			// Calculate utilization
			const totalSupplied = parseFloat(metrics.totalSupplied)
			const availableLiquidity = parseFloat(metrics.availableLiquidity)
			const totalBorrowed = totalSupplied - availableLiquidity
			const utilization = totalSupplied > 0 ? (totalBorrowed / totalSupplied) * 100 : 0

			// Determine risk and status
			const { risk, status, health } = this.calculateRiskMetrics(utilization, totalSupplied)

			return {
				protocol: 'aave',
				token,
				chainId,
				supplyAPY: opportunity.apy,
				borrowAPY: metrics.borrowAPY,
				tvl: metrics.tvl,
				liquidity: metrics.availableLiquidity,
				totalSupplied: metrics.totalSupplied,
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
		if (!this.compoundAdapter) {
			throw new Error('Compound adapter not available on this chain')
		}

		try {
			const opportunity = await this.compoundAdapter.getYieldOpportunity(token, chainId)
			const metrics = await this.compoundAdapter.getMetrics(token, chainId)

			// Calculate utilization
			const totalSupplied = parseFloat(metrics.totalSupplied)
			const availableLiquidity = parseFloat(metrics.availableLiquidity)
			const totalBorrowed = totalSupplied - availableLiquidity
			const utilization = totalSupplied > 0 ? (totalBorrowed / totalSupplied) * 100 : 0

			// Determine risk and status
			const { risk, status, health } = this.calculateRiskMetrics(utilization, totalSupplied)

			return {
				protocol: 'compound',
				token,
				chainId,
				supplyAPY: opportunity.apy,
				borrowAPY: metrics.borrowAPY,
				tvl: metrics.tvl,
				liquidity: metrics.availableLiquidity,
				totalSupplied: metrics.totalSupplied,
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
		if (!this.morphoAdapter) {
			throw new Error('Morpho adapter not available on this chain')
		}

		try {
			const opportunity = await this.morphoAdapter.getYieldOpportunity(token, chainId)
			const metrics = await this.morphoAdapter.getMetrics(token, chainId)

			// Calculate utilization (Morpho may have different structure)
			const totalSupplied = parseFloat(metrics.totalSupplied || '0')
			const availableLiquidity = parseFloat(metrics.availableLiquidity || '0')
			const utilization = totalSupplied > 0 ? ((totalSupplied - availableLiquidity) / totalSupplied) * 100 : 0

			// Determine risk and status
			const { risk, status, health } = this.calculateRiskMetrics(utilization, totalSupplied)

			return {
				protocol: 'morpho',
				token,
				chainId,
				supplyAPY: opportunity.apy,
				tvl: metrics.tvl,
				liquidity: metrics.availableLiquidity || '0',
				totalSupplied: metrics.totalSupplied || '0',
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
	 * Fetch all protocols in parallel
	 */
	async fetchAllProtocols(token: string, chainId: number): Promise<ProtocolData[]> {
		const results = await Promise.allSettled([
			this.fetchAAVEMetrics(token, chainId),
			this.fetchCompoundMetrics(token, chainId),
			this.fetchMorphoMetrics(token, chainId),
		])

		// Return only successful results
		return results
			.filter((result): result is PromiseFulfilledResult<ProtocolData> => result.status === 'fulfilled')
			.map((result) => result.value)
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
}
