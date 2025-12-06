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
	rawMetrics?: YieldOpportunity
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

			// Calculate utilization from protocol-level metrics
			const tvl = parseFloat(protocolMetrics.tvlUSD || '0')
			const availableLiquidity = parseFloat(protocolMetrics.availableLiquidityUSD || '0')
			const totalBorrowed = parseFloat(protocolMetrics.totalBorrowsUSD || '0')
			const totalSupplied = tvl // TVL = total supplied
			const utilization = totalSupplied > 0 ? (totalBorrowed / totalSupplied) * 100 : 0

			// Determine risk and status
			const { risk, status, health } = this.calculateRiskMetrics(utilization, totalSupplied)

			return {
				protocol: 'aave',
				token,
				chainId,
				supplyAPY: metrics.supplyAPY,
				borrowAPY: metrics.borrowAPY,
				tvl: protocolMetrics.tvlUSD,
				liquidity: protocolMetrics.availableLiquidityUSD,
				totalSupplied: totalSupplied.toFixed(2),
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

			// Calculate utilization from protocol-level metrics
			const tvl = parseFloat(protocolMetrics.tvlUSD || '0')
			const availableLiquidity = parseFloat(protocolMetrics.availableLiquidityUSD || '0')
			const totalBorrowed = parseFloat(protocolMetrics.totalBorrowsUSD || '0')
			const totalSupplied = tvl // TVL = total supplied
			const utilization = totalSupplied > 0 ? (totalBorrowed / totalSupplied) * 100 : 0

			// Determine risk and status
			const { risk, status, health } = this.calculateRiskMetrics(utilization, totalSupplied)

			return {
				protocol: 'compound',
				token,
				chainId,
				supplyAPY: metrics.supplyAPY,
				borrowAPY: metrics.borrowAPY,
				tvl: protocolMetrics.tvlUSD,
				liquidity: protocolMetrics.availableLiquidityUSD,
				totalSupplied: totalSupplied.toFixed(2),
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

			// Calculate utilization from protocol-level metrics
			const tvl = parseFloat(protocolMetrics.tvlUSD || '0')
			const availableLiquidity = parseFloat(protocolMetrics.availableLiquidityUSD || '0')
			const totalBorrowed = parseFloat(protocolMetrics.totalBorrowsUSD || '0')
			const totalSupplied = tvl // TVL = total supplied
			const utilization = totalSupplied > 0 ? (totalBorrowed / totalSupplied) * 100 : 0

			// Determine risk and status
			const { risk, status, health } = this.calculateRiskMetrics(utilization, totalSupplied)

			return {
				protocol: 'morpho',
				token,
				chainId,
				supplyAPY: metrics.supplyAPY,
				tvl: protocolMetrics.tvlUSD,
				liquidity: protocolMetrics.availableLiquidityUSD,
				totalSupplied: totalSupplied.toFixed(2),
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
