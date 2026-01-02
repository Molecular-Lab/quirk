/**
 * Yield Calculation Service
 * Handles weighted APY calculation across DeFi protocols and index updates
 */

import { Decimal } from "decimal.js"

// Scale factor for index (1e18)
const INDEX_SCALE = new Decimal("1000000000000000000")

export interface DeFiProtocolAPY {
	protocol: "AAVE" | "COMPOUND" | "MORPHO" | "CURVE"
	apy: number // Annual percentage yield (e.g., 5.2 for 5.2%)
	tvl?: number // Total value locked (optional)
}

export interface StrategyAllocation {
	protocol: string
	allocation: number // Percentage (e.g., 60 for 60%)
	targetAmount: number // Amount to allocate in USD
	currentAmount: number // Current amount allocated
}

export interface IndexUpdateResult {
	oldIndex: string
	newIndex: string
	growthRate: number // Daily growth rate as percentage
	yieldGenerated: string // Yield generated in USD
	timestamp: Date
}

export class YieldCalculationService {
	/**
	 * Calculate weighted average APY based on strategy allocation
	 *
	 * Example:
	 * - AAVE: 60% allocation, 5% APY
	 * - Compound: 40% allocation, 4% APY
	 * Weighted APY = (60% * 5%) + (40% * 4%) = 3% + 1.6% = 4.6%
	 */
	static calculateWeightedAPY(protocolAPYs: DeFiProtocolAPY[], strategies: StrategyAllocation[]): number {
		let weightedAPY = 0

		for (const strategy of strategies) {
			const protocolData = protocolAPYs.find((p) => p.protocol.toUpperCase() === strategy.protocol.toUpperCase())

			if (!protocolData) {
				console.warn(`[YieldCalc] Protocol ${strategy.protocol} not found in APY data, skipping`)
				continue
			}

			// Calculate contribution: (allocation % / 100) * protocol APY
			const contribution = (strategy.allocation / 100) * protocolData.apy
			weightedAPY += contribution

		}

		return weightedAPY
	}

	/**
	 * Calculate daily growth rate from annual APY
	 * Formula: (1 + APY/100)^(1/365) - 1
	 */
	static calculateDailyGrowthRate(annualAPY: number): number {
		const dailyRate = Math.pow(1 + annualAPY / 100, 1 / 365) - 1
		return dailyRate
	}

	/**
	 * Update growth index based on daily yield
	 *
	 * Example:
	 * - Current Index: 1.03 (scaled: 1030000000000000000)
	 * - Total Staked: $1,000,000
	 * - Daily APY: 0.0137% (5% annual / 365)
	 * - Daily Yield: $1,000,000 * 0.000137 = $137
	 * - New Index: 1.03 * (1 + 0.000137) = 1.030141
	 *
	 * If user withdraws $500,000:
	 * - Remaining Staked: $500,000
	 * - Next Day Yield: $500,000 * 0.000137 = $68.5
	 * - Index continues from 1.030141
	 */
	static calculateNewIndex(params: {
		currentIndex: string // BigInt as string (scaled by 1e18)
		totalStaked: string // Current total staked amount
		annualAPY: number // ✅ RENAMED: Annual APY percentage (e.g., 5.0 for 5%)
	}): IndexUpdateResult {
		const currentIndexDecimal = new Decimal(params.currentIndex)
		const totalStakedDecimal = new Decimal(params.totalStaked)
		const dailyGrowthRate = this.calculateDailyGrowthRate(params.annualAPY) // ✅ FIXED: No longer multiplying by 365

		// Calculate yield generated today
		const yieldGenerated = totalStakedDecimal.times(dailyGrowthRate)

		// Calculate new index: currentIndex * (1 + dailyGrowthRate)
		const growthMultiplier = new Decimal(1).plus(dailyGrowthRate)
		const newIndex = currentIndexDecimal.times(growthMultiplier)

		// Safety check: Index should never decrease
		if (newIndex.lessThan(currentIndexDecimal)) {
			throw new Error("[YieldCalc] Index cannot decrease! Something is wrong with the calculation.")
		}

		// Safety check: Index should not grow more than 2x in a single day (unrealistic)
		const maxDailyGrowth = currentIndexDecimal.times(2)
		if (newIndex.greaterThan(maxDailyGrowth)) {
			throw new Error(
				`[YieldCalc] Index growth too large! Old: ${currentIndexDecimal.toString()}, New: ${newIndex.toString()}`,
			)
		}

		const result: IndexUpdateResult = {
			oldIndex: currentIndexDecimal.toFixed(0),
			newIndex: newIndex.toFixed(0),
			growthRate: dailyGrowthRate * 100, // Convert to percentage
			yieldGenerated: yieldGenerated.toFixed(6),
			timestamp: new Date(),
		}

		return result
	}

	/**
	 * Calculate user's current value based on entry index
	 * Formula: (shares * currentIndex) / entryIndex
	 *
	 * Example:
	 * - User deposited $1,000 when index was 1.0
	 * - They received 1,000 shares
	 * - Current index is 1.05
	 * - User value: (1000 * 1.05) / 1.0 = $1,050
	 */
	static calculateUserValue(params: {
		shares: string // User's share balance
		entryIndex: string // Index when user deposited
		currentIndex: string // Current vault index
	}): string {
		const sharesDecimal = new Decimal(params.shares)
		const entryIndexDecimal = new Decimal(params.entryIndex)
		const currentIndexDecimal = new Decimal(params.currentIndex)

		// userValue = (shares * currentIndex) / entryIndex
		const userValue = sharesDecimal.times(currentIndexDecimal).dividedBy(entryIndexDecimal)

		return userValue.toFixed(6)
	}

	/**
	 * Calculate impact of withdrawal on total staked
	 * Used to adjust next day's yield calculation
	 */
	static calculateWithdrawalImpact(params: { totalStaked: string; withdrawAmount: string; currentIndex: string }): {
		newTotalStaked: string
		remainingValue: string
		percentageWithdrawn: number
	} {
		const totalStakedDecimal = new Decimal(params.totalStaked)
		const withdrawAmountDecimal = new Decimal(params.withdrawAmount)

		const newTotalStaked = totalStakedDecimal.minus(withdrawAmountDecimal)
		const percentageWithdrawn = withdrawAmountDecimal.dividedBy(totalStakedDecimal).times(100)

		// Ensure we don't go negative
		if (newTotalStaked.lessThan(0)) {
			throw new Error("[YieldCalc] Withdrawal amount exceeds total staked!")
		}

		return {
			newTotalStaked: newTotalStaked.toFixed(6),
			remainingValue: newTotalStaked.toFixed(6),
			percentageWithdrawn: percentageWithdrawn.toNumber(),
		}
	}

	/**
	 * Fetch current APYs from DeFi protocols
	 * TODO: Replace with actual API calls to AAVE, Compound, etc.
	 */
	static async fetchProtocolAPYs(): Promise<DeFiProtocolAPY[]> {
		// Mock data - replace with actual API calls
		return [
			{ protocol: "AAVE", apy: 5.2, tvl: 1000000000 },
			{ protocol: "COMPOUND", apy: 4.1, tvl: 800000000 },
			{ protocol: "MORPHO", apy: 6.5, tvl: 500000000 },
			{ protocol: "CURVE", apy: 3.8, tvl: 1200000000 },
		]
	}
}
