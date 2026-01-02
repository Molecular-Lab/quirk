/**
 * Vault Accounting Utilities
 *
 * Pure calculation functions for share-based accounting.
 * These are used to track yield fairly across multiple deposits (DCA support).
 *
 * Key Concepts:
 * - `current_index`: Growth multiplier for vault, starts at 1.0 (1e18), grows with yield
 * - `shares`: User's share of the vault, calculated as amount / current_index
 * - `weighted_entry_index`: DCA-adjusted index for fair yield calculation
 *
 * All values use 18 decimal precision (1e18 = 1.0)
 */

import BigNumber from "bignumber.js"

// Configure BigNumber for precision
BigNumber.config({
    DECIMAL_PLACES: 36,
    ROUNDING_MODE: BigNumber.ROUND_DOWN,
})

/**
 * Precision constant: 1e18 (same as Ethereum's wei)
 */
export const PRECISION = new BigNumber("1000000000000000000") // 1e18

/**
 * Calculate shares to issue for a deposit
 *
 * Formula: shares = (amount × PRECISION) / current_index
 *
 * Example:
 *   - User deposits $100, current_index = 1.05 (1050000000000000000)
 *   - Shares = (100e6 × 1e18) / 1.05e18 = 95.238e6 shares
 *
 * @param amount - Deposit amount in token's smallest unit (e.g., USDC 6 decimals)
 * @param currentIndex - Vault's current growth index (18 decimals)
 * @returns Shares to issue (as string for DB storage)
 */
export function calculateShares(amount: string, currentIndex: string): string {
    const amountBN = new BigNumber(amount)
    const indexBN = new BigNumber(currentIndex)

    if (indexBN.isZero()) {
        throw new Error("Current index cannot be zero")
    }

    // shares = (amount × PRECISION) / currentIndex
    const shares = amountBN.times(PRECISION).dividedToIntegerBy(indexBN)

    return shares.toFixed(0)
}

/**
 * Calculate current value of shares
 *
 * Formula: value = (shares × current_index) / PRECISION
 *
 * @param shares - User's share balance
 * @param currentIndex - Vault's current growth index (18 decimals)
 * @returns Current value in token's smallest unit
 */
export function calculateValueFromShares(shares: string, currentIndex: string): string {
    const sharesBN = new BigNumber(shares)
    const indexBN = new BigNumber(currentIndex)

    // value = (shares × currentIndex) / PRECISION
    const value = sharesBN.times(indexBN).dividedToIntegerBy(PRECISION)

    return value.toFixed(0)
}

/**
 * Calculate weighted entry index for DCA support
 *
 * When a user makes multiple deposits at different index values,
 * we calculate a weighted average index to fairly track their yield.
 *
 * Formula:
 *   newWeightedIndex = (oldDeposits × oldIndex + newDeposit × currentIndex) / (oldDeposits + newDeposit)
 *
 * Example:
 *   - User deposited $100 when index was 1.0
 *   - User deposits $50 more when index is 1.1
 *   - Weighted index = (100 × 1.0 + 50 × 1.1) / 150 = 1.033
 *
 * @param oldTotalDeposited - Previous total deposits (token's smallest unit)
 * @param oldWeightedIndex - Previous weighted entry index (18 decimals)
 * @param newDeposit - New deposit amount (token's smallest unit)
 * @param currentIndex - Vault's current growth index (18 decimals)
 * @returns New weighted entry index (18 decimals, as string)
 */
export function calculateWeightedIndex(
    oldTotalDeposited: string,
    oldWeightedIndex: string,
    newDeposit: string,
    currentIndex: string,
): string {
    const oldDepositsBN = new BigNumber(oldTotalDeposited)
    const oldIndexBN = new BigNumber(oldWeightedIndex)
    const newDepositBN = new BigNumber(newDeposit)
    const currentIndexBN = new BigNumber(currentIndex)

    const totalDeposits = oldDepositsBN.plus(newDepositBN)

    if (totalDeposits.isZero()) {
        return currentIndex // First deposit, use current index
    }

    // weighted = (old × oldIndex + new × currentIndex) / total
    const weightedSum = oldDepositsBN.times(oldIndexBN).plus(newDepositBN.times(currentIndexBN))

    const newWeightedIndex = weightedSum.dividedToIntegerBy(totalDeposits)

    return newWeightedIndex.toFixed(0)
}

/**
 * Calculate yield earned by a user
 *
 * Formula: yield = totalDeposited × (currentIndex / entryIndex - 1)
 *
 * Or equivalently: yield = currentValue - totalDeposited
 *
 * @param totalDeposited - User's total deposits (token's smallest unit)
 * @param currentIndex - Vault's current growth index (18 decimals)
 * @param weightedEntryIndex - User's weighted entry index (18 decimals)
 * @returns Yield earned (token's smallest unit, as string)
 */
export function calculateYield(
    totalDeposited: string,
    currentIndex: string,
    weightedEntryIndex: string,
): string {
    const depositedBN = new BigNumber(totalDeposited)
    const currentIndexBN = new BigNumber(currentIndex)
    const entryIndexBN = new BigNumber(weightedEntryIndex)

    if (entryIndexBN.isZero()) {
        return "0"
    }

    // currentValue = deposited × (currentIndex / entryIndex)
    const currentValue = depositedBN.times(currentIndexBN).dividedToIntegerBy(entryIndexBN)

    // yield = currentValue - deposited
    const yieldAmount = currentValue.minus(depositedBN)

    // Yield should not be negative
    return yieldAmount.isNegative() ? "0" : yieldAmount.toFixed(0)
}

/**
 * Calculate effective APY for a user
 *
 * Formula: APY = (currentIndex / entryIndex - 1) × (365 / daysSinceEntry) × 100
 *
 * @param currentIndex - Vault's current growth index (18 decimals)
 * @param entryIndex - User's entry index (18 decimals)
 * @param daysSinceEntry - Days since user's first deposit
 * @returns APY as percentage (e.g., "5.25" for 5.25%)
 */
export function calculateEffectiveAPY(
    currentIndex: string,
    entryIndex: string,
    daysSinceEntry: number,
): string {
    if (daysSinceEntry <= 0) {
        return "0"
    }

    const currentIndexBN = new BigNumber(currentIndex)
    const entryIndexBN = new BigNumber(entryIndex)

    if (entryIndexBN.isZero()) {
        return "0"
    }

    // growth = currentIndex / entryIndex - 1
    const growth = currentIndexBN.dividedBy(entryIndexBN).minus(1)

    // annualized = growth × (365 / days) × 100
    const annualized = growth.times(365).dividedBy(daysSinceEntry).times(100)

    return annualized.toFixed(2)
}

/**
 * Calculate new vault index after yield accrual
 *
 * Called by cron job to update vault's current_index.
 *
 * Formula: newIndex = currentIndex × (1 + dailyYieldPercent / 100)
 *
 * @param currentIndex - Current growth index (18 decimals)
 * @param dailyYieldPercent - Daily yield percentage (e.g., "0.0137" for 5% APY / 365)
 * @returns New index (18 decimals, as string)
 */
export function calculateNewIndex(currentIndex: string, dailyYieldPercent: string): string {
    const indexBN = new BigNumber(currentIndex)
    const yieldBN = new BigNumber(dailyYieldPercent)

    // newIndex = index × (1 + yield/100)
    const multiplier = yieldBN.dividedBy(100).plus(1)
    const newIndex = indexBN.times(multiplier).integerValue(BigNumber.ROUND_DOWN)

    return newIndex.toFixed(0)
}

/**
 * Calculate shares to burn for withdrawal
 *
 * Formula: sharesToBurn = (withdrawAmount × PRECISION) / currentIndex
 *
 * @param withdrawAmount - Amount to withdraw (token's smallest unit)
 * @param currentIndex - Vault's current growth index (18 decimals)
 * @returns Shares to burn (as string)
 */
export function calculateSharesToBurn(withdrawAmount: string, currentIndex: string): string {
    // Same formula as calculating shares for deposit
    return calculateShares(withdrawAmount, currentIndex)
}
