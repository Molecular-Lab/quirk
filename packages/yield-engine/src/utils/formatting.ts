import BigNumber from 'bignumber.js'

/**
 * Format a BigInt/wei amount to human-readable decimal string
 * @param amount - Amount in wei (as string or bigint)
 * @param decimals - Token decimals (default 18)
 * @param precision - Number of decimal places to show (default 2)
 * @returns Formatted string (e.g., "1000.50")
 */
export function formatAmount(
	amount: string | bigint,
	decimals: number = 18,
	precision: number = 2,
): string {
	const bn = new BigNumber(amount.toString())
	const divisor = new BigNumber(10).pow(decimals)
	const formatted = bn.dividedBy(divisor)
	return formatted.toFixed(precision)
}

/**
 * Parse a human-readable amount to wei string
 * @param amount - Human-readable amount (e.g., "1000.50")
 * @param decimals - Token decimals (default 18)
 * @returns Wei amount as string
 */
export function parseAmount(amount: string, decimals: number = 18): string {
	const bn = new BigNumber(amount)
	const multiplier = new BigNumber(10).pow(decimals)
	return bn.multipliedBy(multiplier).toFixed(0)
}

/**
 * Format APY from protocol-specific format to percentage string
 * @param rate - Rate from protocol (can be in Ray, per-second, etc.)
 * @param format - Format of the input rate
 * @returns APY as percentage string (e.g., "5.25")
 */
export function formatAPY(
	rate: string | bigint,
	format: 'ray' | 'percent' | 'perSecond' | 'perBlock' = 'ray',
): string {
	const bn = new BigNumber(rate.toString())

	switch (format) {
		case 'ray': // AAVE uses Ray (1e27)
			return bn.dividedBy(new BigNumber(10).pow(25)).toFixed(2)

		case 'percent': // Already a percentage
			return new BigNumber(rate.toString()).toFixed(2)

		case 'perSecond': // Convert per-second rate to APY
			// APY = (1 + rate)^31536000 - 1
			const secondsPerYear = 31536000
			const ratePerSecond = bn.dividedBy(new BigNumber(10).pow(18))
			const apy = ratePerSecond
				.plus(1)
				.pow(secondsPerYear)
				.minus(1)
				.multipliedBy(100)
			return apy.toFixed(2)

		case 'perBlock': // Convert per-block rate to APY (Ethereum ~12s blocks)
			const blocksPerYear = 2628000 // (365 * 24 * 60 * 60) / 12
			const ratePerBlock = bn.dividedBy(new BigNumber(10).pow(18))
			const apyFromBlocks = ratePerBlock
				.plus(1)
				.pow(blocksPerYear)
				.minus(1)
				.multipliedBy(100)
			return apyFromBlocks.toFixed(2)

		default:
			return bn.toFixed(2)
	}
}

/**
 * Format USD value with proper decimals and separators
 * @param valueUSD - USD value as string
 * @param includeSymbol - Whether to include $ symbol (default true)
 * @returns Formatted USD string (e.g., "$1,000.50")
 */
export function formatUSD(valueUSD: string, includeSymbol: boolean = true): string {
	const bn = new BigNumber(valueUSD)
	const formatted = bn.toFormat(2) // Adds thousand separators
	return includeSymbol ? `$${formatted}` : formatted
}

/**
 * Calculate percentage difference between two values
 * @param oldValue - Original value
 * @param newValue - New value
 * @returns Percentage difference (e.g., "15.5" for 15.5% increase)
 */
export function calculatePercentageDiff(oldValue: string, newValue: string): string {
	const oldBN = new BigNumber(oldValue)
	const newBN = new BigNumber(newValue)

	if (oldBN.isZero()) {
		return '0'
	}

	const diff = newBN.minus(oldBN)
	const percentageDiff = diff.dividedBy(oldBN).multipliedBy(100)
	return percentageDiff.toFixed(2)
}

/**
 * Calculate estimated gain based on APY and amount
 * @param amount - Amount in USD
 * @param apyPercent - APY as percentage string (e.g., "5.25")
 * @param durationDays - Duration in days (default 30)
 * @returns Estimated gain in USD
 */
export function calculateEstimatedGain(
	amount: string | number,
	apyPercent: string | number,
	durationDays: number = 30,
): string {
	const amountBN = new BigNumber(amount)
	const apyBN = new BigNumber(apyPercent)

	// Daily rate = APY / 365
	const dailyRate = apyBN.dividedBy(100).dividedBy(365)

	// Gain = amount * daily rate * days
	const gain = amountBN.multipliedBy(dailyRate).multipliedBy(durationDays)

	return gain.toFixed(2)
}

/**
 * Check if a string is a valid number
 */
export function isValidNumber(value: string): boolean {
	try {
		const bn = new BigNumber(value)
		return bn.isFinite() && !bn.isNaN()
	} catch {
		return false
	}
}

/**
 * Safely compare two numeric strings
 * @returns -1 if a < b, 0 if a === b, 1 if a > b
 */
export function compareNumbers(a: string, b: string): -1 | 0 | 1 {
	const aBN = new BigNumber(a)
	const bBN = new BigNumber(b)
	return aBN.comparedTo(bBN) as -1 | 0 | 1
}

/**
 * Get the maximum value from an array of numeric strings
 */
export function getMaxValue(values: string[]): string {
	if (values.length === 0) return '0'
	return values.reduce((max, current) =>
		compareNumbers(current, max) > 0 ? current : max,
	)
}

/**
 * Get the minimum value from an array of numeric strings
 */
export function getMinValue(values: string[]): string {
	if (values.length === 0) return '0'
	return values.reduce((min, current) =>
		compareNumbers(current, min) < 0 ? current : min,
	)
}
