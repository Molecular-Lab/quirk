import type { YieldOpportunity } from '../../types/common.types'
import type { IOptimizationStrategy, OptimizationInput, PartialRiskProfile } from '../optimizer.types'

/**
 * Highest Yield Strategy
 *
 * Simple strategy that prioritizes the highest APY without
 * additional risk weighting. Best for users who want maximum
 * returns and are comfortable with any supported protocol.
 *
 * @example
 * ```typescript
 * const strategy = new HighestYieldStrategy()
 * const ranked = strategy.rankOpportunities(opportunities, riskProfile)
 * // ranked[0] is the highest APY opportunity
 * ```
 */
export class HighestYieldStrategy implements IOptimizationStrategy {
	readonly name = 'highest-yield' as const

	/**
	 * Rank opportunities by APY (highest first)
	 *
	 * Applies basic filtering based on risk profile:
	 * - Excludes protocols in excludedProtocols list
	 * - Only includes protocols in preferredProtocols (if set)
	 * - Filters by minimum TVL threshold
	 */
	rankOpportunities(
		opportunities: YieldOpportunity[],
		riskProfile: PartialRiskProfile,
	): YieldOpportunity[] {
		let filtered = [...opportunities]

		// Apply preferred protocols filter
		if (riskProfile.preferredProtocols && riskProfile.preferredProtocols.length > 0) {
			filtered = filtered.filter((opp) =>
				riskProfile.preferredProtocols!.includes(opp.protocol),
			)
		}

		// Apply excluded protocols filter
		if (riskProfile.excludedProtocols && riskProfile.excludedProtocols.length > 0) {
			filtered = filtered.filter(
				(opp) => !riskProfile.excludedProtocols!.includes(opp.protocol),
			)
		}

		// Apply minimum TVL filter
		if (riskProfile.minProtocolTVL) {
			const minTVL = parseFloat(riskProfile.minProtocolTVL)
			filtered = filtered.filter((opp) => parseFloat(opp.tvl) >= minTVL)
		}

		// Sort by APY descending
		return filtered.sort((a, b) => parseFloat(b.supplyAPY) - parseFloat(a.supplyAPY))
	}

	/**
	 * Determine if rebalancing should be recommended
	 *
	 * For highest-yield strategy, rebalance if:
	 * 1. There's a better APY available
	 * 2. The APY delta exceeds the minimum threshold
	 * 3. Rebalancing is enabled in config
	 */
	shouldRebalance(input: OptimizationInput): boolean {
		const { currentPosition, opportunities, rebalanceConfig } = input

		// If rebalancing is disabled, never recommend
		if (!rebalanceConfig.enabled) {
			return false
		}

		// If no current position, recommend the best opportunity
		if (!currentPosition) {
			return opportunities.length > 0
		}

		// Get ranked opportunities
		const ranked = this.rankOpportunities(opportunities, input.riskProfile)
		if (ranked.length === 0) {
			return false
		}

		const bestOpportunity = ranked[0]
		const currentAPY = parseFloat(currentPosition.apy)
		const bestAPY = parseFloat(bestOpportunity.supplyAPY)

		// Check if we're already in the best protocol
		if (currentPosition.protocol === bestOpportunity.protocol) {
			return false
		}

		// Check if APY improvement exceeds threshold
		const apyDelta = bestAPY - currentAPY
		const minApyDelta = rebalanceConfig.minApyDelta ?? 1.0
		return apyDelta >= minApyDelta
	}

	/**
	 * Calculate confidence in the recommendation
	 *
	 * For highest-yield, confidence is based on:
	 * - How much better the APY is (higher delta = higher confidence)
	 * - How reliable the APY data appears (not extremely high)
	 */
	calculateConfidence(input: OptimizationInput, recommendedOpportunity: YieldOpportunity): number {
		const { currentPosition } = input
		const recommendedAPY = parseFloat(recommendedOpportunity.supplyAPY)

		let confidence = 50 // Base confidence

		// Increase confidence based on APY delta
		if (currentPosition) {
			const currentAPY = parseFloat(currentPosition.apy)
			const apyDelta = recommendedAPY - currentAPY

			// +20 confidence for each 1% APY improvement (up to 30)
			confidence += Math.min(apyDelta * 20, 30)
		} else {
			// No current position, increase confidence based on APY level
			if (recommendedAPY >= 3) confidence += 10
			if (recommendedAPY >= 5) confidence += 10
		}

		// Decrease confidence if APY seems unusually high (potential risk)
		if (recommendedAPY > 20) {
			confidence -= 20
		} else if (recommendedAPY > 15) {
			confidence -= 10
		}

		// Increase confidence based on TVL (more TVL = more trust)
		const tvl = parseFloat(recommendedOpportunity.tvl)
		if (tvl >= 500_000_000) confidence += 10 // $500M+
		if (tvl >= 100_000_000) confidence += 5 // $100M+

		// Clamp to 0-100
		return Math.max(0, Math.min(100, Math.round(confidence)))
	}
}
