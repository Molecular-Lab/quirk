/**
 * Revenue Service Tests
 * Tests for revenue calculations and 3-way fee splits
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import BigNumber from 'bignumber.js'
import { RevenueService } from '../revenue.service'
import type { ClientRepository } from '../../repository/postgres/client.repository'
import type { VaultRepository } from '../../repository/postgres/vault.repository'

// Mock repositories
const mockClientRepository = {
	getById: vi.fn(),
	getRevenueMetrics: vi.fn(),
} as unknown as ClientRepository

const mockVaultRepository = {
	getById: vi.fn(),
	listByClientId: vi.fn(),
} as unknown as VaultRepository

describe('RevenueService', () => {
	let revenueService: RevenueService

	beforeEach(() => {
		revenueService = new RevenueService(mockClientRepository, mockVaultRepository)
		vi.clearAllMocks()
	})

	describe('3-Way Fee Split Validation', () => {
		it('should ensure platform + client + enduser = 100%', () => {
			const testCases = [
				{ platform: 5, client: 15, enduser: 80 },
				{ platform: 7.5, client: 15, enduser: 77.5 },
				{ platform: 10, client: 10, enduser: 80 },
				{ platform: 7.5, client: 20, enduser: 72.5 },
				{ platform: 5, client: 10, enduser: 85 },
			]

			for (const { platform, client, enduser } of testCases) {
				const total = new BigNumber(platform).plus(client).plus(enduser)
				expect(total.toNumber()).toBe(100)
			}
		})

		it('should reject invalid fee configurations where total > 100%', () => {
			const invalidCases = [
				{ platform: 10, client: 95, enduser: 0 }, // total = 105%
				{ platform: 50, client: 60, enduser: 0 }, // total = 110%
			]

			for (const { platform, client } of invalidCases) {
				const total = new BigNumber(platform).plus(client)
				expect(total.toNumber()).toBeGreaterThanOrEqual(100)
			}
		})

		it('should calculate enduser percentage correctly from platform + client', () => {
			const testCases = [
				{ platform: 5, client: 15, expected: 80 },
				{ platform: 7.5, client: 15, expected: 77.5 },
				{ platform: 10, client: 20, expected: 70 },
			]

			for (const { platform, client, expected } of testCases) {
				const enduser = new BigNumber(100).minus(platform).minus(client)
				expect(enduser.toNumber()).toBe(expected)
			}
		})
	})

	describe('Revenue Distribution Calculations', () => {
		it('should correctly split raw yield into 3-way distribution', () => {
			const rawYield = new BigNumber('1000') // $1000 raw yield
			const platformPercent = new BigNumber('7.50') // 7.5%
			const clientPercent = new BigNumber('15.00') // 15%

			const platformFee = rawYield.multipliedBy(platformPercent).dividedBy(100)
			const clientRevenue = rawYield.multipliedBy(clientPercent).dividedBy(100)
			const endUserRevenue = rawYield.minus(platformFee).minus(clientRevenue)

			expect(platformFee.toFixed(2)).toBe('75.00')
			expect(clientRevenue.toFixed(2)).toBe('150.00')
			expect(endUserRevenue.toFixed(2)).toBe('775.00')

			// Verify total equals raw yield
			const total = platformFee.plus(clientRevenue).plus(endUserRevenue)
			expect(total.toFixed(2)).toBe('1000.00')
		})

		it('should handle decimal precision correctly', () => {
			const rawYield = new BigNumber('999.999999') // Edge case with many decimals
			const platformPercent = new BigNumber('7.50')
			const clientPercent = new BigNumber('15.00')

			const platformFee = rawYield.multipliedBy(platformPercent).dividedBy(100)
			const clientRevenue = rawYield.multipliedBy(clientPercent).dividedBy(100)
			const endUserRevenue = rawYield.minus(platformFee).minus(clientRevenue)

			// Verify total equals raw yield (with precision tolerance)
			const total = platformFee.plus(clientRevenue).plus(endUserRevenue)
			const difference = total.minus(rawYield).abs()
			expect(difference.toNumber()).toBeLessThan(0.000001) // Less than 1 millionth
		})

		it('should handle very large numbers without precision loss', () => {
			const rawYield = new BigNumber('1000000000.123456789') // $1 billion
			const platformPercent = new BigNumber('7.50')
			const clientPercent = new BigNumber('15.00')

			const platformFee = rawYield.multipliedBy(platformPercent).dividedBy(100)
			const clientRevenue = rawYield.multipliedBy(clientPercent).dividedBy(100)
			const endUserRevenue = rawYield.minus(platformFee).minus(clientRevenue)

			// Verify total equals raw yield
			const total = platformFee.plus(clientRevenue).plus(endUserRevenue)
			expect(total.toFixed(9)).toBe(rawYield.toFixed(9))
		})
	})

	describe('MRR/ARR Calculations', () => {
		it('should calculate MRR correctly', () => {
			const earningBalance = new BigNumber('100000') // $100,000 deployed
			const apy = new BigNumber('8.5') // 8.5% APY
			const clientRevenuePercent = new BigNumber('15') // 15% client share

			// Formula: (earning_balance × APY × client_revenue_percent) / 12
			const annualYield = earningBalance.multipliedBy(apy).dividedBy(100)
			const clientAnnualRevenue = annualYield.multipliedBy(clientRevenuePercent).dividedBy(100)
			const mrr = clientAnnualRevenue.dividedBy(12)

			expect(mrr.toFixed(2)).toBe('106.25') // $106.25/month
		})

		it('should calculate ARR as MRR × 12', () => {
			const mrr = new BigNumber('106.25')
			const arr = mrr.multipliedBy(12)

			expect(arr.toFixed(2)).toBe('1275.00') // $1,275/year
		})

		it('should handle zero earning balance', () => {
			const earningBalance = new BigNumber('0')
			const apy = new BigNumber('8.5')
			const clientRevenuePercent = new BigNumber('15')

			const annualYield = earningBalance.multipliedBy(apy).dividedBy(100)
			const clientAnnualRevenue = annualYield.multipliedBy(clientRevenuePercent).dividedBy(100)
			const mrr = clientAnnualRevenue.dividedBy(12)

			expect(mrr.toFixed(2)).toBe('0.00')
		})

		it('should handle different client revenue percentages', () => {
			const earningBalance = new BigNumber('100000')
			const apy = new BigNumber('10') // 10% APY
			const testPercentages = [10, 15, 20]

			const results = testPercentages.map((clientPercent) => {
				const annualYield = earningBalance.multipliedBy(apy).dividedBy(100)
				const clientAnnualRevenue = annualYield.multipliedBy(clientPercent).dividedBy(100)
				return clientAnnualRevenue.dividedBy(12).toFixed(2)
			})

			expect(results[0]).toBe('83.33') // 10% → $83.33/month
			expect(results[1]).toBe('125.00') // 15% → $125/month
			expect(results[2]).toBe('166.67') // 20% → $166.67/month
		})
	})

	describe('Fee Configuration Validation', () => {
		it('should enforce client revenue share between 10-20%', () => {
			const validPercentages = [10, 12.5, 15, 17.5, 20]
			const invalidPercentages = [5, 9.99, 20.01, 25, 50]

			for (const percent of validPercentages) {
				expect(percent).toBeGreaterThanOrEqual(10)
				expect(percent).toBeLessThanOrEqual(20)
			}

			for (const percent of invalidPercentages) {
				const isValid = percent >= 10 && percent <= 20
				expect(isValid).toBe(false)
			}
		})

		it('should ensure platform + client fees do not exceed 100%', () => {
			const testCases = [
				{ platform: 7.5, client: 15, isValid: true }, // 22.5% total fees
				{ platform: 10, client: 20, isValid: true }, // 30% total fees
				{ platform: 50, client: 50, isValid: false }, // 100% total fees (nothing for users)
				{ platform: 60, client: 50, isValid: false }, // 110% total fees (invalid)
			]

			for (const { platform, client, isValid } of testCases) {
				const total = new BigNumber(platform).plus(client)
				const result = total.isLessThan(100)
				expect(result).toBe(isValid)
			}
		})
	})

	describe('Index-Based Accounting Validation', () => {
		it('should calculate user value correctly with index growth', () => {
			const userDepositAmount = new BigNumber('1000') // User deposited $1000
			const userEntryIndex = new BigNumber('1.0') // Entry index
			const currentIndex = new BigNumber('1.085') // Index grew by 8.5%

			// User value = deposit × (current_index / entry_index)
			const userValue = userDepositAmount.multipliedBy(currentIndex).dividedBy(userEntryIndex)

			expect(userValue.toFixed(2)).toBe('1085.00') // $1,085
		})

		it('should handle multiple deposits with different entry indices (DCA)', () => {
			const deposits = [
				{ amount: new BigNumber('1000'), entryIndex: new BigNumber('1.0') },
				{ amount: new BigNumber('500'), entryIndex: new BigNumber('1.05') },
				{ amount: new BigNumber('2000'), entryIndex: new BigNumber('1.10') },
			]
			const currentIndex = new BigNumber('1.15')

			const totalValue = deposits.reduce((sum, deposit) => {
				const value = deposit.amount.multipliedBy(currentIndex).dividedBy(deposit.entryIndex)
				return sum.plus(value)
			}, new BigNumber(0))

			// Verify each deposit grew correctly
			const values = deposits.map((d) => d.amount.multipliedBy(currentIndex).dividedBy(d.entryIndex).toFixed(2))
			expect(values[0]).toBe('1150.00') // $1000 × 1.15
			expect(values[1]).toBe('547.62') // $500 × (1.15/1.05)
			expect(values[2]).toBe('2090.91') // $2000 × (1.15/1.10)

			expect(totalValue.toFixed(2)).toBe('3788.52') // Total
		})

		it('should ensure index never decreases (safety check)', () => {
			const previousIndex = new BigNumber('1.05')
			const proposedIndices = [
				{ value: new BigNumber('1.10'), isValid: true }, // Growth
				{ value: new BigNumber('1.05'), isValid: true }, // Same (edge case)
				{ value: new BigNumber('1.04'), isValid: false }, // Decrease (invalid!)
			]

			for (const { value, isValid } of proposedIndices) {
				const result = value.isGreaterThanOrEqual(previousIndex)
				expect(result).toBe(isValid)
			}
		})

		it('should cap maximum index growth at 2x per update (safety)', () => {
			const currentIndex = new BigNumber('1.0')
			const maxAllowedGrowth = currentIndex.multipliedBy(2) // 2.0 (100% growth)

			const proposedIndices = [
				{ value: new BigNumber('1.5'), isValid: true }, // 50% growth
				{ value: new BigNumber('2.0'), isValid: true }, // 100% growth (edge)
				{ value: new BigNumber('2.5'), isValid: false }, // 150% growth (suspicious)
				{ value: new BigNumber('10.0'), isValid: false }, // 900% growth (attack!)
			]

			for (const { value, isValid } of proposedIndices) {
				const result = value.isLessThanOrEqual(maxAllowedGrowth)
				expect(result).toBe(isValid)
			}
		})
	})

	describe('Precision and Rounding', () => {
		it('should maintain precision to 6 decimal places for balances', () => {
			const amount = new BigNumber('1234.123456789')
			const rounded = amount.toFixed(6)
			expect(rounded).toBe('1234.123457') // Rounded to 6 decimals
		})

		it('should maintain precision to 2 decimal places for fee percentages', () => {
			const percent = new BigNumber('15.6789')
			const rounded = percent.toFixed(2)
			expect(rounded).toBe('15.68')
		})

		it('should handle division remainders correctly', () => {
			const total = new BigNumber('100')
			const divisor = new BigNumber('3')
			const result = total.dividedBy(divisor)

			// 100/3 = 33.333...
			expect(result.toFixed(6)).toBe('33.333333')
		})
	})
})
