import type { YieldOpportunity, Protocol, RiskProfile } from '../../types/common.types'
import type { IOptimizationStrategy, OptimizationInput, PartialRiskProfile } from '../optimizer.types'

/**
 * Risk weight factors for each risk level
 */
const RISK_WEIGHTS = {
	conservative: {
		tvlWeight: 0.5, // Heavily weight TVL
		apyWeight: 0.3, // Lower weight on APY
		healthWeight: 0.2, // Protocol health
	},
	moderate: {
		tvlWeight: 0.35,
		apyWeight: 0.45,
		healthWeight: 0.2,
	},
	aggressive: {
		tvlWeight: 0.2,
		apyWeight: 0.6, // Prioritize APY
		healthWeight: 0.2,
	},
}

/**
 * Protocol trust scores based on track record and security
 * Higher = more trusted (0-100)
 */
const PROTOCOL_TRUST_SCORES: Record<Protocol, number> = {
	aave: 95, // Longest track record, multiple audits
	compound: 90, // Well established, audited
	morpho: 85, // Newer but audited, optimizes on top of AAVE/Compound
}

/**
 * Risk-Adjusted Strategy
 *
 * Balances yield with risk factors including:
 * - Protocol TVL (higher = more trusted)
 * - Protocol track record and trust score
 * - Risk level preference (conservative/moderate/aggressive)
 *
 * Best for users who want solid returns while considering safety.
 *
 * @example
 * ```typescript
 * const strategy = new RiskAdjustedStrategy()
 * const ranked = strategy.rankOpportunities(opportunities, {
 *   level: 'moderate',
 *   minProtocolTVL: '100000000'
 * })
 * ```
 */
export class RiskAdjustedStrategy implements IOptimizationStrategy {
	readonly name = 'risk-adjusted' as const

	/**
	 * Calculate a risk-adjusted score for an opportunity
	 *
	 * Higher score = better opportunity considering risk
	 */
	private calculateScore(opportunity: YieldOpportunity, riskProfile: PartialRiskProfile): number {
		const weights = RISK_WEIGHTS[riskProfile.level]

		// Normalize APY score (0-100, assuming max APY of 20%)
		const apy = parseFloat(opportunity.supplyAPY)
		const apyScore = Math.min(apy / 20, 1) * 100

		// Normalize TVL score (0-100)
		// $1B+ = 100, $500M = 75, $100M = 50, $10M = 25
		const tvl = parseFloat(opportunity.tvl)
		let tvlScore: number
		if (tvl >= 1_000_000_000) tvlScore = 100
		else if (tvl >= 500_000_000) tvlScore = 75
		else if (tvl >= 100_000_000) tvlScore = 50
		else if (tvl >= 10_000_000) tvlScore = 25
		else tvlScore = 10

		// Protocol trust score
		const trustScore = PROTOCOL_TRUST_SCORES[opportunity.protocol] ?? 50

		// Calculate weighted score
		const score =
			apyScore * weights.apyWeight + tvlScore * weights.tvlWeight + trustScore * weights.healthWeight

		return score
	}

	/**
	 * Rank opportunities by risk-adjusted score
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

		// Apply minimum TVL filter (more strict for conservative)
		const minTVL = this.getMinTVLForRiskLevel(riskProfile)
		filtered = filtered.filter((opp) => parseFloat(opp.tvl) >= minTVL)

		// For conservative profiles, also filter out high-risk APYs
		if (riskProfile.level === 'conservative') {
			filtered = filtered.filter((opp) => parseFloat(opp.supplyAPY) <= 15)
		}

		// Sort by risk-adjusted score (highest first)
		return filtered.sort(
			(a, b) =>
				this.calculateScore(b, riskProfile) - this.calculateScore(a, riskProfile),
		)
	}

	/**
	 * Get minimum TVL based on risk level
	 */
	private getMinTVLForRiskLevel(riskProfile: PartialRiskProfile): number {
		const configMinTVL = riskProfile.minProtocolTVL
			? parseFloat(riskProfile.minProtocolTVL)
			: 0

		// Override with stricter minimums based on risk level
		switch (riskProfile.level) {
			case 'conservative':
				return Math.max(configMinTVL, 200_000_000) // $200M minimum
			case 'moderate':
				return Math.max(configMinTVL, 50_000_000) // $50M minimum
			case 'aggressive':
				return Math.max(configMinTVL, 10_000_000) // $10M minimum
			default:
				return configMinTVL
		}
	}

	/**
	 * Determine if rebalancing should be recommended
	 *
	 * Risk-adjusted strategy is more conservative about rebalancing:
	 * - Higher APY delta required for conservative profiles
	 * - Also considers if moving to a lower-trust protocol
	 */
	shouldRebalance(input: OptimizationInput): boolean {
		const { currentPosition, opportunities, riskProfile, rebalanceConfig } = input

		if (!rebalanceConfig.enabled) {
			return false
		}

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

		// Adjust minimum APY delta based on risk level
		let adjustedMinDelta = rebalanceConfig.minApyDelta ?? 1.0
		if (riskProfile.level === 'conservative') {
			adjustedMinDelta = Math.max(adjustedMinDelta, 1.5) // Need 1.5% improvement
		} else if (riskProfile.level === 'moderate') {
			adjustedMinDelta = Math.max(adjustedMinDelta, 1.0)
		}

		// Check if moving to a less trusted protocol
		const currentTrust = PROTOCOL_TRUST_SCORES[currentPosition.protocol as Protocol] ?? 50
		const newTrust = PROTOCOL_TRUST_SCORES[bestOpportunity.protocol] ?? 50

		// If moving to a less trusted protocol, require higher APY improvement
		if (newTrust < currentTrust) {
			adjustedMinDelta = adjustedMinDelta + 0.5 // Require extra 0.5% for lower trust
		}

		return apyDelta >= adjustedMinDelta
	}

	/**
	 * Calculate confidence in the recommendation
	 *
	 * Risk-adjusted confidence considers:
	 * - Risk-adjusted score improvement
	 * - Protocol trust differential
	 * - TVL of recommended protocol
	 */
	calculateConfidence(input: OptimizationInput, recommendedOpportunity: YieldOpportunity): number {
		const { currentPosition, riskProfile } = input
		let confidence = 50

		// Score-based confidence
		const recommendedScore = this.calculateScore(recommendedOpportunity, riskProfile)
		if (currentPosition) {
			const currentOpp: YieldOpportunity = {
				protocol: currentPosition.protocol as Protocol,
				token: currentPosition.token,
				tokenAddress: currentPosition.tokenAddress,
				chainId: currentPosition.chainId,
				supplyAPY: currentPosition.apy,
				tvl: '0', // Unknown for current position
				liquidity: '0',
				timestamp: Date.now(),
			}
			const currentScore = this.calculateScore(currentOpp, riskProfile)
			const scoreDelta = recommendedScore - currentScore

			// Add confidence based on score improvement
			confidence += Math.min(scoreDelta, 25)
		}

		// Trust-based confidence
		const trustScore = PROTOCOL_TRUST_SCORES[recommendedOpportunity.protocol]
		if (trustScore >= 90) confidence += 15
		else if (trustScore >= 80) confidence += 10
		else confidence += 5

		// TVL-based confidence
		const tvl = parseFloat(recommendedOpportunity.tvl)
		if (tvl >= 500_000_000) confidence += 10
		else if (tvl >= 100_000_000) confidence += 5

		// Risk level adjustment
		if (riskProfile.level === 'conservative' && parseFloat(recommendedOpportunity.supplyAPY) > 10) {
			confidence -= 15 // Lower confidence for high APY in conservative mode
		}

		return Math.max(0, Math.min(100, Math.round(confidence)))
	}
}
