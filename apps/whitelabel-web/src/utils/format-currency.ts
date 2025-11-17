/**
 * Format currency values
 */
export function formatCurrency(
	value: number,
	options?: {
		currency?: string
		decimals?: number
		compact?: boolean
	}
): string {
	const { currency = 'USD', decimals = 2, compact = false } = options || {}

	if (compact && Math.abs(value) >= 1000) {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency,
			notation: 'compact',
			minimumFractionDigits: 0,
			maximumFractionDigits: 1,
		}).format(value)
	}

	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency,
		minimumFractionDigits: decimals,
		maximumFractionDigits: decimals,
	}).format(value)
}

/**
 * Format percentage values
 */
export function formatPercent(value: number, decimals: number = 2): string {
	return new Intl.NumberFormat('en-US', {
		style: 'percent',
		minimumFractionDigits: decimals,
		maximumFractionDigits: decimals,
	}).format(value / 100)
}

/**
 * Format large numbers
 */
export function formatNumber(value: number, decimals: number = 0): string {
	return new Intl.NumberFormat('en-US', {
		minimumFractionDigits: decimals,
		maximumFractionDigits: decimals,
	}).format(value)
}
