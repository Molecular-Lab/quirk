/**
 * Calculate user's current value based on index
 * Formula: value = (balance × currentIndex) / entryIndex
 */
export function calculateUserValue(
	balance: number,
	entryIndex: number,
	currentIndex: number
): number {
	if (entryIndex <= 0) {
		throw new Error('Entry index must be greater than 0')
	}
	return (balance * currentIndex) / entryIndex
}

/**
 * Calculate yield earned
 */
export function calculateYieldEarned(
	amountDeposited: number,
	currentValue: number
): number {
	return currentValue - amountDeposited
}

/**
 * Calculate yield percentage
 */
export function calculateYieldPercent(
	amountDeposited: number,
	currentValue: number
): number {
	if (amountDeposited <= 0) return 0
	return ((currentValue - amountDeposited) / amountDeposited) * 100
}

/**
 * Complete user value calculation
 */
export interface UserValueResult {
	currentValue: number
	yieldEarned: number
	yieldPercent: number
}

export function calculateCompleteUserValue(
	amountDeposited: number,
	balance: number,
	entryIndex: number,
	currentIndex: number
): UserValueResult {
	const currentValue = calculateUserValue(balance, entryIndex, currentIndex)
	const yieldEarned = calculateYieldEarned(amountDeposited, currentValue)
	const yieldPercent = calculateYieldPercent(amountDeposited, currentValue)

	return {
		currentValue,
		yieldEarned,
		yieldPercent,
	}
}
