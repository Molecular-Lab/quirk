/**
 * DeFi Protocol Service
 *
 * Wraps yield-engine adapters and provides data for Market Dashboard
 * Fetches real-time APY, TVL, and metrics from AAVE, Compound, Morpho
 */

// TODO: Fix yield-engine package exports
// import { AaveAdapter, CompoundAdapter, MorphoAdapter } from "@proxify/yield-engine"
const AaveAdapter = {} as any
const CompoundAdapter = {} as any
const MorphoAdapter = {} as any

export interface ProtocolData {
	protocol: "aave" | "compound" | "morpho"
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
	risk: "Low" | "Medium" | "High"
	status: "healthy" | "warning" | "critical"

	// Metadata
	lastUpdate: Date
	protocolHealth: number

	// Raw contract data (for "Raw Data" view)
	rawMetrics?: any
}

export class DeFiProtocolService {
	private aave: any
	private compound: any
	private morpho: any

	constructor(chainId = 8453) {
		// Default: Base mainnet
		this.aave = new AaveAdapter(chainId)
		this.compound = new CompoundAdapter(chainId)
		this.morpho = new MorphoAdapter(chainId)
	}

	/**
	 * Fetch AAVE protocol data
	 */
	async fetchAAVEMetrics(token = "USDC", chainId = 8453): Promise<ProtocolData> {
		try {
			const [supplyAPY, borrowAPY, metrics] = await Promise.all([
				this.aave.getSupplyAPY(token, chainId),
				this.aave.getBorrowAPY(token, chainId).catch(() => null),
				this.aave.getMetrics(token, chainId),
			])

			const utilization = this.calculateUtilization(metrics.tvl, metrics.liquidity)
			const status = this.determineStatus(parseFloat(utilization))

			return {
				protocol: "aave",
				token,
				chainId,
				supplyAPY: this.formatAPY(supplyAPY),
				borrowAPY: borrowAPY ? this.formatAPY(borrowAPY) : undefined,
				tvl: this.formatCurrency(metrics.tvl),
				liquidity: this.formatCurrency(metrics.liquidity),
				totalSupplied: this.formatCurrency(metrics.tvl),
				utilization: utilization,
				risk: this.calculateRisk(parseFloat(utilization), parseFloat(metrics.tvl)),
				status,
				lastUpdate: new Date(),
				protocolHealth: this.calculateHealthScore(parseFloat(utilization)),
				rawMetrics: metrics,
			}
		} catch (error) {
			console.error("[DeFiProtocolService] AAVE fetch failed:", error)
			throw error
		}
	}

	/**
	 * Fetch Compound protocol data
	 */
	async fetchCompoundMetrics(token = "USDC", chainId = 8453): Promise<ProtocolData> {
		try {
			const [supplyAPY, borrowAPY, metrics] = await Promise.all([
				this.compound.getSupplyAPY(token, chainId),
				this.compound.getBorrowAPY(token, chainId).catch(() => null),
				this.compound.getMetrics(token, chainId),
			])

			const utilization = this.calculateUtilization(metrics.tvl, metrics.liquidity)
			const status = this.determineStatus(parseFloat(utilization))

			return {
				protocol: "compound",
				token,
				chainId,
				supplyAPY: this.formatAPY(supplyAPY),
				borrowAPY: borrowAPY ? this.formatAPY(borrowAPY) : undefined,
				tvl: this.formatCurrency(metrics.tvl),
				liquidity: this.formatCurrency(metrics.liquidity),
				totalSupplied: this.formatCurrency(metrics.tvl),
				utilization: utilization,
				risk: this.calculateRisk(parseFloat(utilization), parseFloat(metrics.tvl)),
				status,
				lastUpdate: new Date(),
				protocolHealth: this.calculateHealthScore(parseFloat(utilization)),
				rawMetrics: metrics,
			}
		} catch (error) {
			console.error("[DeFiProtocolService] Compound fetch failed:", error)
			throw error
		}
	}

	/**
	 * Fetch Morpho protocol data
	 */
	async fetchMorphoMetrics(token = "USDC", chainId = 8453): Promise<ProtocolData> {
		try {
			const [supplyAPY, metrics] = await Promise.all([
				this.morpho.getSupplyAPY(token, chainId),
				this.morpho.getMetrics(token, chainId),
			])

			// Morpho vaults don't have direct utilization like lending protocols
			const utilization = "0" // Morpho is vault-based, not utilization-based

			return {
				protocol: "morpho",
				token,
				chainId,
				supplyAPY: this.formatAPY(supplyAPY),
				tvl: this.formatCurrency(metrics.tvl || "0"),
				liquidity: this.formatCurrency(metrics.tvl || "0"), // Morpho has full liquidity
				totalSupplied: this.formatCurrency(metrics.tvl || "0"),
				utilization: utilization,
				risk: "Low", // Morpho vaults are typically lower risk
				status: "healthy",
				lastUpdate: new Date(),
				protocolHealth: 95, // Morpho is generally healthy
				rawMetrics: metrics,
			}
		} catch (error) {
			console.error("[DeFiProtocolService] Morpho fetch failed:", error)
			throw error
		}
	}

	/**
	 * Aggregate all protocols (graceful failure)
	 * If one protocol fails, still return others
	 */
	async aggregateAllProtocols(token = "USDC", chainId = 8453) {
		const results = await Promise.allSettled([
			this.fetchAAVEMetrics(token, chainId),
			this.fetchCompoundMetrics(token, chainId),
			this.fetchMorphoMetrics(token, chainId),
		])

		// Extract successful results
		const protocols: ProtocolData[] = results
			.filter((r): r is PromiseFulfilledResult<ProtocolData> => r.status === "fulfilled")
			.map((r) => r.value)

		// Log failures
		results.forEach((r, index) => {
			if (r.status === "rejected") {
				const protocolName = ["AAVE", "Compound", "Morpho"][index]
				console.error(`[DeFiProtocolService] ${protocolName} failed:`, r.reason)
			}
		})

		return {
			protocols,
			timestamp: new Date(),
			totalProtocols: protocols.length,
			failedProtocols: 3 - protocols.length,
		}
	}

	// ==================== Helper Methods ====================

	/**
	 * Calculate utilization rate
	 * Formula: (TVL - Liquidity) / TVL * 100
	 */
	private calculateUtilization(tvl: string, liquidity: string): string {
		const tvlNum = parseFloat(tvl)
		const liqNum = parseFloat(liquidity)

		if (tvlNum === 0) return "0.00"

		const borrowed = tvlNum - liqNum
		const utilization = (borrowed / tvlNum) * 100

		return utilization.toFixed(2)
	}

	/**
	 * Determine protocol health status based on utilization
	 */
	private determineStatus(utilization: number): "healthy" | "warning" | "critical" {
		if (utilization > 90) return "critical" // Risk of bank run
		if (utilization > 80) return "warning" // High utilization
		return "healthy"
	}

	/**
	 * Calculate risk level based on utilization and TVL
	 */
	private calculateRisk(utilization: number, tvl: number): "Low" | "Medium" | "High" {
		// High utilization = higher risk
		if (utilization > 85) return "High"
		if (utilization > 70) return "Medium"

		// Low TVL = higher risk (less liquidity)
		if (tvl < 1_000_000) return "High"
		if (tvl < 10_000_000) return "Medium"

		return "Low"
	}

	/**
	 * Calculate health score (0-100)
	 */
	private calculateHealthScore(utilization: number): number {
		// Optimal utilization: 60-80%
		// Score drops if too low or too high

		if (utilization >= 60 && utilization <= 80) {
			return 100 // Perfect range
		}

		if (utilization > 90) {
			return Math.max(0, 100 - (utilization - 90) * 10) // Drops fast above 90%
		}

		if (utilization < 40) {
			return 70 + (utilization / 40) * 30 // Low utilization is okay but not ideal
		}

		return 85 // Decent range
	}

	/**
	 * Format APY for display (e.g., "6.50" for 6.5%)
	 */
	private formatAPY(apy: string | number): string {
		const apyNum = typeof apy === "string" ? parseFloat(apy) : apy
		return apyNum.toFixed(2)
	}

	/**
	 * Format currency for display (e.g., "$500M")
	 */
	private formatCurrency(value: string | number): string {
		const num = typeof value === "string" ? parseFloat(value) : value

		if (num >= 1_000_000_000) {
			return `$${(num / 1_000_000_000).toFixed(2)}B`
		}

		if (num >= 1_000_000) {
			return `$${(num / 1_000_000).toFixed(2)}M`
		}

		if (num >= 1_000) {
			return `$${(num / 1_000).toFixed(2)}K`
		}

		return `$${num.toFixed(2)}`
	}
}
