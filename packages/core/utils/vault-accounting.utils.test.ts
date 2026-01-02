/**
 * Vault Accounting Utilities - Unit Tests
 */

import { describe, it, expect } from "vitest"
import {
    PRECISION,
    calculateShares,
    calculateValueFromShares,
    calculateWeightedIndex,
    calculateYield,
    calculateEffectiveAPY,
    calculateNewIndex,
    calculateSharesToBurn,
} from "./vault-accounting.utils"

describe("Vault Accounting Utilities", () => {
    describe("calculateShares", () => {
        it("should calculate shares correctly at index = 1.0", () => {
            const amount = "100000000" // 100 USDC (6 decimals)
            const index = PRECISION.toFixed(0) // 1.0

            const shares = calculateShares(amount, index)

            // At index 1.0, shares = amount
            expect(shares).toBe("100000000000000000000000000") // 100 × 1e18
        })

        it("should calculate fewer shares at higher index", () => {
            const amount = "100000000" // 100 USDC
            const index = "1050000000000000000" // 1.05 (5% growth)

            const shares = calculateShares(amount, index)

            // At index 1.05, should get ~95.24 USDC worth of shares
            // shares = (100e6 × 1e18) / 1.05e18 = 95238095238095238095238095
            expect(shares).toBe("95238095238095238095238095")
        })

        it("should throw error for zero index", () => {
            expect(() => calculateShares("100", "0")).toThrow("Current index cannot be zero")
        })
    })

    describe("calculateValueFromShares", () => {
        it("should calculate value correctly at index = 1.0", () => {
            const shares = "100000000000000000000000000" // 100 × 1e18
            const index = PRECISION.toFixed(0)

            const value = calculateValueFromShares(shares, index)

            expect(value).toBe("100000000") // 100 USDC
        })

        it("should calculate more value at higher index", () => {
            const shares = "100000000000000000000000000" // 100 × 1e18
            const index = "1050000000000000000" // 1.05

            const value = calculateValueFromShares(shares, index)

            // value = 100 × 1.05 = 105 USDC
            expect(value).toBe("105000000")
        })
    })

    describe("calculateWeightedIndex", () => {
        it("should return current index for first deposit", () => {
            const currentIndex = "1050000000000000000" // 1.05

            const weighted = calculateWeightedIndex("0", "0", "100000000", currentIndex)

            expect(weighted).toBe(currentIndex)
        })

        it("should calculate weighted average for DCA", () => {
            // User deposited $100 at index 1.0
            // Now depositing $50 at index 1.1
            const oldDeposits = "100000000" // 100 USDC
            const oldIndex = "1000000000000000000" // 1.0
            const newDeposit = "50000000" // 50 USDC
            const currentIndex = "1100000000000000000" // 1.1

            const weighted = calculateWeightedIndex(oldDeposits, oldIndex, newDeposit, currentIndex)

            // Expected: (100 × 1.0 + 50 × 1.1) / 150 = 1.033...
            // = (100 × 1e18 + 50 × 1.1e18) / 150
            // = (100e18 + 55e18) / 150 = 1033333333333333333
            expect(weighted).toBe("1033333333333333333")
        })

        it("should weight larger deposits more heavily", () => {
            // $900 at 1.0, then $100 at 1.5
            const oldDeposits = "900000000"
            const oldIndex = "1000000000000000000"
            const newDeposit = "100000000"
            const currentIndex = "1500000000000000000"

            const weighted = calculateWeightedIndex(oldDeposits, oldIndex, newDeposit, currentIndex)

            // Expected: (900 × 1.0 + 100 × 1.5) / 1000 = 1.05
            expect(weighted).toBe("1050000000000000000")
        })
    })

    describe("calculateYield", () => {
        it("should return 0 yield at entry index", () => {
            const deposited = "100000000" // 100 USDC
            const currentIndex = "1000000000000000000"
            const entryIndex = "1000000000000000000"

            const yieldAmt = calculateYield(deposited, currentIndex, entryIndex)

            expect(yieldAmt).toBe("0")
        })

        it("should calculate positive yield correctly", () => {
            const deposited = "100000000" // 100 USDC
            const currentIndex = "1050000000000000000" // 1.05
            const entryIndex = "1000000000000000000" // 1.0

            const yieldAmt = calculateYield(deposited, currentIndex, entryIndex)

            // Yield = 100 × (1.05 / 1.0 - 1) = 5 USDC
            expect(yieldAmt).toBe("5000000")
        })

        it("should return 0 for negative yield (never negative)", () => {
            const deposited = "100000000"
            const currentIndex = "900000000000000000" // 0.9 (hypothetical loss)
            const entryIndex = "1000000000000000000"

            const yieldAmt = calculateYield(deposited, currentIndex, entryIndex)

            expect(yieldAmt).toBe("0")
        })
    })

    describe("calculateEffectiveAPY", () => {
        it("should return 0 for 0 days", () => {
            const apy = calculateEffectiveAPY("1050000000000000000", "1000000000000000000", 0)
            expect(apy).toBe("0")
        })

        it("should calculate annualized APY correctly", () => {
            const currentIndex = "1050000000000000000" // 1.05
            const entryIndex = "1000000000000000000" // 1.0
            const days = 365 // Full year

            const apy = calculateEffectiveAPY(currentIndex, entryIndex, days)

            // Growth = 5%, over 1 year = 5% APY
            expect(apy).toBe("5.00")
        })

        it("should annualize partial year correctly", () => {
            const currentIndex = "1010000000000000000" // 1.01 (1% growth)
            const entryIndex = "1000000000000000000"
            const days = 30 // 1 month

            const apy = calculateEffectiveAPY(currentIndex, entryIndex, days)

            // 1% in 30 days ≈ 12.17% APY
            expect(parseFloat(apy)).toBeCloseTo(12.17, 1)
        })
    })

    describe("calculateNewIndex", () => {
        it("should calculate new index after daily yield", () => {
            const currentIndex = "1000000000000000000" // 1.0
            const dailyYield = "0.0137" // ~5% APY / 365

            const newIndex = calculateNewIndex(currentIndex, dailyYield)

            // newIndex = 1.0 × (1 + 0.0137/100) = 1.000137e18
            expect(newIndex).toBe("1000137000000000000")
        })

        it("should compound correctly over time", () => {
            let index = "1000000000000000000"
            const dailyYield = "0.0137"

            // Simulate 365 days
            for (let i = 0; i < 365; i++) {
                index = calculateNewIndex(index, dailyYield)
            }

            // After 365 days at ~5% APY, should be ~1.05
            const finalValue = parseFloat(index) / 1e18
            expect(finalValue).toBeCloseTo(1.0512, 2)
        })
    })

    describe("calculateSharesToBurn", () => {
        it("should calculate shares to burn correctly", () => {
            const withdrawAmount = "100000000" // 100 USDC
            const currentIndex = "1050000000000000000" // 1.05

            const sharesToBurn = calculateSharesToBurn(withdrawAmount, currentIndex)

            // Same as calculateShares
            expect(sharesToBurn).toBe("95238095238095238095238095")
        })
    })
})
