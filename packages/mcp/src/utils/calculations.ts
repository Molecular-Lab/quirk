/**
 * Calculate APY from APR
 * @param apr - Annual Percentage Rate
 * @param compoundingFrequency - Number of times compounded per year (daily)
 * @returns Annual Percentage Yield
 */
export function aprToApy(apr: number, compoundingFrequency: number = 365): number {
	return (Math.pow(1 + apr / compoundingFrequency, compoundingFrequency) - 1) * 100;
}

/**
 * Calculate impermanent loss for a liquidity pool
 * @param priceRatio - Price ratio of asset (final price / initial price)
 * @returns Impermanent loss as a percentage
 */
export function calculateImpermanentLoss(priceRatio: number): number {
	const ratio = Math.sqrt(priceRatio);
	const il = 2 * ratio / (1 + priceRatio) - 1;
	return il * 100;
}

/**
 * Calculate risk score based on protocol metrics
 * @param params - Risk assessment parameters
 * @returns Risk score (0-100, lower is safer)
 */
export function calculateRiskScore(params: {
	tvl?: number;
	age?: number;
	auditScore?: number;
}): number {
	// Placeholder implementation
	let score = 50;

	if (params.tvl) {
		// Higher TVL = lower risk
		score -= Math.min((params.tvl / 1000000000) * 10, 20);
	}

	if (params.age) {
		// Older protocols = lower risk
		score -= Math.min((params.age / 365) * 10, 15);
	}

	if (params.auditScore) {
		// Better audit = lower risk
		score -= (params.auditScore / 100) * 15;
	}

	return Math.max(0, Math.min(100, score));
}

/**
 * Compare yield opportunities and rank them
 * @param opportunities - Array of yield opportunities
 * @returns Ranked opportunities with scores
 */
export function rankOpportunities(
	opportunities: Array<{
		protocol: string;
		apy: number;
		tvl?: number;
		chain: string;
	}>
): Array<{ protocol: string; score: number; apy: number }> {
	return opportunities
		.map((opp) => {
			let score = opp.apy;

			// Adjust score based on TVL (more TVL = more reliable)
			if (opp.tvl && opp.tvl > 10000000) {
				score *= 1.1;
			}

			return {
				protocol: opp.protocol,
				apy: opp.apy,
				score,
			};
		})
		.sort((a, b) => b.score - a.score);
}
