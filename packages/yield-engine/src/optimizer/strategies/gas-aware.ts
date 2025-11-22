import type { YieldOpportunity, Protocol } from '../../types/common.types'
import type { IOptimizationStrategy, OptimizationInput, GasEstimate, PartialRiskProfile } from '../optimizer.types'

/**
 * Estimated gas units for protocol operations
 * These are approximate values and may vary
 */
const PROTOCOL_GAS_ESTIMATES: Record<Protocol, { withdraw: number; deposit: number }> = {
	aave: { withdraw: 200_000, deposit: 250_000 },
	compound: { withdraw: 150_000, deposit: 200_000 },
	morpho: { withdraw: 180_000, deposit: 220_000 },
}

/**
 * Default ETH price if not provided
 */
const DEFAULT_ETH_PRICE_USD = 3000

/**
 * Default gas price in gwei if not provided
 */
const DEFAULT_GAS_PRICE_GWEI = 30

/**
 * Gas-Aware Strategy
 *
 * Considers gas costs when recommending rebalancing.
 * Calculates break-even period and only recommends if the
 * expected gain exceeds gas costs within a reasonable timeframe.
 *
 * Best for smaller positions where gas costs are significant.
 *
 * @example
 * ```typescript
 * const strategy = new GasAwareStrategy()
 *
 * // With explicit gas parameters
 * const result = strategy.shouldRebalance({
 *   currentPosition,
 *   opportunities,
 *   riskProfile,
 *   rebalanceConfig,
 *   gasPriceGwei: 25,
 *   ethPriceUSD: 3200
 * })
 * ```
 */
export class GasAwareStrategy implements IOptimizationStrategy {
	readonly name = 'gas-aware' as const

	/**
	 * Estimate gas cost for a rebalance operation
	 *
	 * A full rebalance involves:
	 * 1. Withdraw from current protocol
	 * 2. Approve tokens (if needed)
	 * 3. Deposit to new protocol
	 */
	estimateGasCost(
		currentProtocol: Protocol,
		newProtocol: Protocol,
		gasPriceGwei: number = DEFAULT_GAS_PRICE_GWEI,
		ethPriceUSD: number = DEFAULT_ETH_PRICE_USD,
	): GasEstimate {
		const currentGas = PROTOCOL_GAS_ESTIMATES[currentProtocol] ?? { withdraw: 200_000, deposit: 250_000 }
		const newGas = PROTOCOL_GAS_ESTIMATES[newProtocol] ?? { withdraw: 200_000, deposit: 250_000 }

		// Total gas: withdraw from current + approve (65k) + deposit to new
		const approvalGas = 65_000
		const totalGasUnits = currentGas.withdraw + approvalGas + newGas.deposit

		// Calculate cost
		const gasCostWei = BigInt(totalGasUnits) * BigInt(Math.floor(gasPriceGwei * 1e9))
		const gasCostETH = Number(gasCostWei) / 1e18
		const gasCostUSD = gasCostETH * ethPriceUSD

		return {
			gasUnits: totalGasUnits,
			gasPriceGwei,
			gasCostETH: gasCostETH.toFixed(6),
			gasCostUSD: gasCostUSD.toFixed(2),
			estimatedTimeMinutes: 5, // Approximate
		}
	}

	/**
	 * Calculate days until break-even after gas costs
	 *
	 * @param apyDelta - APY improvement in percentage points (e.g., 1.5 for 1.5%)
	 * @param positionValueUSD - Total position value in USD
	 * @param gasCostUSD - Gas cost in USD
	 * @returns Days until break-even, or Infinity if never
	 */
	calculateBreakEvenDays(
		apyDelta: number,
		positionValueUSD: number,
		gasCostUSD: number,
	): number {
		if (apyDelta <= 0 || positionValueUSD <= 0) {
			return Infinity
		}

		// Daily gain from APY improvement
		const dailyGainPercent = apyDelta / 365
		const dailyGainUSD = (dailyGainPercent / 100) * positionValueUSD

		if (dailyGainUSD <= 0) {
			return Infinity
		}

		return gasCostUSD / dailyGainUSD
	}

	/**
	 * Rank opportunities considering gas efficiency
	 *
	 * For each opportunity, calculates a "net score" that accounts for:
	 * - Raw APY
	 * - Estimated gas cost impact (amortized over expected hold period)
	 */
	rankOpportunities(
		opportunities: YieldOpportunity[],
		riskProfile: PartialRiskProfile,
	): YieldOpportunity[] {
		let filtered = [...opportunities]

		// Apply basic filters
		if (riskProfile.preferredProtocols && riskProfile.preferredProtocols.length > 0) {
			filtered = filtered.filter((opp) =>
				riskProfile.preferredProtocols!.includes(opp.protocol),
			)
		}

		if (riskProfile.excludedProtocols && riskProfile.excludedProtocols.length > 0) {
			filtered = filtered.filter(
				(opp) => !riskProfile.excludedProtocols!.includes(opp.protocol),
			)
		}

		if (riskProfile.minProtocolTVL) {
			const minTVL = parseFloat(riskProfile.minProtocolTVL)
			filtered = filtered.filter((opp) => parseFloat(opp.tvl) >= minTVL)
		}

		// For gas-aware ranking, we still primarily sort by APY
		// The gas consideration happens in shouldRebalance
		return filtered.sort((a, b) => parseFloat(b.supplyAPY) - parseFloat(a.supplyAPY))
	}

	/**
	 * Determine if rebalancing is worth it after gas costs
	 *
	 * Considers:
	 * - Gas cost of the operation
	 * - Expected gain from APY improvement
	 * - Break-even period
	 * - Maximum acceptable gas cost from config
	 */
	shouldRebalance(input: OptimizationInput): boolean {
		const { currentPosition, opportunities, riskProfile, rebalanceConfig, gasPriceGwei, ethPriceUSD } =
			input

		if (!rebalanceConfig.enabled) {
			return false
		}

		// If no current position, check if any opportunity is worth the deposit gas
		if (!currentPosition) {
			return opportunities.length > 0
		}

		const ranked = this.rankOpportunities(opportunities, riskProfile)
		if (ranked.length === 0) {
			return false
		}

		const bestOpportunity = ranked[0]

		// Already in best position
		if (currentPosition.protocol === bestOpportunity.protocol) {
			return false
		}

		const currentAPY = parseFloat(currentPosition.apy)
		const bestAPY = parseFloat(bestOpportunity.supplyAPY)
		const apyDelta = bestAPY - currentAPY

		// Must meet minimum APY threshold
		const minApyDelta = rebalanceConfig.minApyDelta ?? 1.0
		if (apyDelta < minApyDelta) {
			return false
		}

		// Estimate gas cost
		const gasEstimate = this.estimateGasCost(
			currentPosition.protocol as Protocol,
			bestOpportunity.protocol,
			gasPriceGwei,
			ethPriceUSD,
		)

		// Check if gas cost exceeds maximum
		const maxGasCost = parseFloat(rebalanceConfig.maxGasCostUSD ?? '50')
		if (parseFloat(gasEstimate.gasCostUSD) > maxGasCost) {
			return false
		}

		// Calculate break-even period
		const positionValue = parseFloat(currentPosition.valueUSD)
		const breakEvenDays = this.calculateBreakEvenDays(
			apyDelta,
			positionValue,
			parseFloat(gasEstimate.gasCostUSD),
		)

		// Don't recommend if break-even is too long (> 90 days)
		if (breakEvenDays > 90) {
			return false
		}

		// Calculate expected gain after minimum threshold period (30 days)
		const thirtyDayGain = (apyDelta / 100) * positionValue * (30 / 365)
		const netGain = thirtyDayGain - parseFloat(gasEstimate.gasCostUSD)

		// Check if net gain meets threshold
		const minGainThreshold = parseFloat(rebalanceConfig.minGainThreshold ?? '10')
		return netGain >= minGainThreshold
	}

	/**
	 * Calculate confidence considering gas efficiency
	 *
	 * Higher confidence when:
	 * - Break-even period is short
	 * - Net gain is substantial
	 * - Position size is large enough for gas to be negligible
	 */
	calculateConfidence(input: OptimizationInput, recommendedOpportunity: YieldOpportunity): number {
		const { currentPosition, gasPriceGwei, ethPriceUSD } = input
		let confidence = 50

		if (!currentPosition) {
			// New deposit - base confidence on APY level
			const apy = parseFloat(recommendedOpportunity.supplyAPY)
			if (apy >= 5) confidence += 20
			else if (apy >= 3) confidence += 10
			return Math.min(100, confidence)
		}

		// Calculate gas cost
		const gasEstimate = this.estimateGasCost(
			currentPosition.protocol as Protocol,
			recommendedOpportunity.protocol,
			gasPriceGwei,
			ethPriceUSD,
		)

		const currentAPY = parseFloat(currentPosition.apy)
		const bestAPY = parseFloat(recommendedOpportunity.supplyAPY)
		const apyDelta = bestAPY - currentAPY
		const positionValue = parseFloat(currentPosition.valueUSD)
		const gasCostUSD = parseFloat(gasEstimate.gasCostUSD)

		// Break-even analysis
		const breakEvenDays = this.calculateBreakEvenDays(apyDelta, positionValue, gasCostUSD)

		// Confidence based on break-even period
		if (breakEvenDays <= 7) confidence += 30 // Break even in a week
		else if (breakEvenDays <= 14) confidence += 20
		else if (breakEvenDays <= 30) confidence += 10
		else if (breakEvenDays <= 60) confidence += 0
		else confidence -= 15 // Long break-even reduces confidence

		// Confidence based on position size vs gas cost
		const gasCostPercentage = (gasCostUSD / positionValue) * 100
		if (gasCostPercentage < 0.1) confidence += 15 // Gas is negligible
		else if (gasCostPercentage < 0.5) confidence += 10
		else if (gasCostPercentage < 1) confidence += 5
		else confidence -= 10 // Gas is significant portion

		// APY improvement confidence
		if (apyDelta >= 2) confidence += 10
		else if (apyDelta >= 1) confidence += 5

		return Math.max(0, Math.min(100, Math.round(confidence)))
	}
}
