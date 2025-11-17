/**
 * Calculate APY from growth rate
 * Formula: APY = (1 + rate)^365 - 1
 */
export function calculateAPY(dailyRate: number): number {
	return (Math.pow(1 + dailyRate, 365) - 1) * 100
}

/**
 * Calculate daily rate from APY
 * Formula: dailyRate = (1 + APY/100)^(1/365) - 1
 */
export function calculateDailyRate(apy: number): number {
	return Math.pow(1 + apy / 100, 1 / 365) - 1
}

/**
 * Calculate expected yield over time
 */
export function calculateExpectedYield(
	principal: number,
	apy: number,
	days: number
): number {
	const dailyRate = calculateDailyRate(apy)
	return principal * Math.pow(1 + dailyRate, days) - principal
}

/**
 * Annualize a return period
 */
export function annualizeReturn(returnPercent: number, days: number): number {
	const periodsPerYear = 365 / days
	return (Math.pow(1 + returnPercent / 100, periodsPerYear) - 1) * 100
}
