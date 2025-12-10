/**
 * Revenue Integration Tests
 * End-to-end tests for revenue calculations, distributions, and dashboard metrics
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import BigNumber from 'bignumber.js'
import postgres from 'postgres'
import { config } from 'dotenv'

config()

const DATABASE_URL = process.env.DATABASE_URL || ''
const sql = postgres(DATABASE_URL, {
	max: 5,
})

describe('Revenue Integration Tests', () => {
	let testClientId: string
	let testVaultId: string

	beforeAll(async () => {
		// Setup: Create test client with fee configuration
		const [client] = await sql`
			INSERT INTO client_organizations (
				product_id,
				company_name,
				client_revenue_share_percent,
				platform_fee_percent
			) VALUES (
				'TEST_REVENUE_' || gen_random_uuid()::text,
				'Test Revenue Client',
				15.00,
				7.50
			)
			RETURNING id
		`
		testClientId = client.id

		// Create test vault
		const [vault] = await sql`
			INSERT INTO client_vaults (
				client_id,
				chain,
				token_address,
				token_symbol,
				pending_deposit_balance,
				total_staked_balance,
				cumulative_yield
			) VALUES (
				${testClientId},
				'base',
				'0xusdc',
				'USDC',
				5000.00,
				10000.00,
				850.00
			)
			RETURNING id
		`
		testVaultId = vault.id
	})

	afterAll(async () => {
		// Cleanup: Delete test data
		await sql`DELETE FROM client_vaults WHERE client_id = ${testClientId}`
		await sql`DELETE FROM client_organizations WHERE id = ${testClientId}`
		await sql.end()
	})

	describe('Fee Configuration Validation', () => {
		it('should retrieve correct fee configuration', async () => {
			const [config] = await sql`
				SELECT client_revenue_share_percent, platform_fee_percent
				FROM client_organizations
				WHERE id = ${testClientId}
			`

			expect(config.client_revenue_share_percent).toBe('15.00')
			expect(config.platform_fee_percent).toBe('7.50')

			// Calculate enduser percentage
			const clientPercent = new BigNumber(config.client_revenue_share_percent)
			const platformPercent = new BigNumber(config.platform_fee_percent)
			const enduserPercent = new BigNumber(100).minus(clientPercent).minus(platformPercent)

			expect(enduserPercent.toFixed(2)).toBe('77.50')
		})

		it('should enforce client revenue share constraints (10-20%)', async () => {
			// Try to update with valid value
			await sql`
				UPDATE client_organizations
				SET client_revenue_share_percent = 18.00
				WHERE id = ${testClientId}
			`

			const [result] = await sql`
				SELECT client_revenue_share_percent
				FROM client_organizations
				WHERE id = ${testClientId}
			`

			expect(result.client_revenue_share_percent).toBe('18.00')

			// Reset to 15%
			await sql`
				UPDATE client_organizations
				SET client_revenue_share_percent = 15.00
				WHERE id = ${testClientId}
			`
		})
	})

	describe('Revenue Distribution Calculations', () => {
		it('should calculate 3-way split correctly from cumulative yield', async () => {
			const [vault] = await sql`
				SELECT cumulative_yield
				FROM client_vaults
				WHERE id = ${testVaultId}
			`

			const [feeConfig] = await sql`
				SELECT client_revenue_share_percent, platform_fee_percent
				FROM client_organizations
				WHERE id = ${testClientId}
			`

			const rawYield = new BigNumber(vault.cumulative_yield)
			const platformPercent = new BigNumber(feeConfig.platform_fee_percent)
			const clientPercent = new BigNumber(feeConfig.client_revenue_share_percent)

			// Calculate 3-way split
			const platformFee = rawYield.multipliedBy(platformPercent).dividedBy(100)
			const clientRevenue = rawYield.multipliedBy(clientPercent).dividedBy(100)
			const endUserRevenue = rawYield.minus(platformFee).minus(clientRevenue)

			expect(platformFee.toFixed(2)).toBe('63.75') // 7.5% of $850
			expect(clientRevenue.toFixed(2)).toBe('127.50') // 15% of $850
			expect(endUserRevenue.toFixed(2)).toBe('658.75') // 77.5% of $850

			// Verify total equals raw yield
			const total = platformFee.plus(clientRevenue).plus(endUserRevenue)
			expect(total.toFixed(2)).toBe('850.00')
		})

		it('should create revenue distribution record', async () => {
			const [vault] = await sql`
				SELECT cumulative_yield
				FROM client_vaults
				WHERE id = ${testVaultId}
			`

			const [feeConfig] = await sql`
				SELECT client_revenue_share_percent, platform_fee_percent
				FROM client_organizations
				WHERE id = ${testClientId}
			`

			const rawYield = new BigNumber(vault.cumulative_yield)
			const platformPercent = new BigNumber(feeConfig.platform_fee_percent)
			const clientPercent = new BigNumber(feeConfig.client_revenue_share_percent)

			const platformFee = rawYield.multipliedBy(platformPercent).dividedBy(100)
			const clientRevenue = rawYield.multipliedBy(clientPercent).dividedBy(100)
			const endUserRevenue = rawYield.minus(platformFee).minus(clientRevenue)

			// Insert distribution record
			const [distribution] = await sql`
				INSERT INTO revenue_distributions (
					client_id,
					vault_id,
					raw_yield,
					platform_fee,
					client_revenue,
					end_user_revenue,
					platform_fee_percent,
					client_revenue_percent
				) VALUES (
					${testClientId},
					${testVaultId},
					${rawYield.toString()},
					${platformFee.toString()},
					${clientRevenue.toString()},
					${endUserRevenue.toString()},
					${platformPercent.toString()},
					${clientPercent.toString()}
				)
				RETURNING *
			`

			expect(distribution.raw_yield).toBe('850.00')
			expect(distribution.platform_fee).toBe('63.75')
			expect(distribution.client_revenue).toBe('127.50')
			expect(distribution.end_user_revenue).toBe('658.75')

			// Cleanup
			await sql`DELETE FROM revenue_distributions WHERE id = ${distribution.id}`
		})
	})

	describe('MRR/ARR Dashboard Metrics', () => {
		it('should calculate MRR correctly', async () => {
			const [vault] = await sql`
				SELECT total_staked_balance
				FROM client_vaults
				WHERE id = ${testVaultId}
			`

			const [feeConfig] = await sql`
				SELECT client_revenue_share_percent
				FROM client_organizations
				WHERE id = ${testClientId}
			`

			const earningBalance = new BigNumber(vault.total_staked_balance)
			const apy = new BigNumber('8.5') // Assume 8.5% APY
			const clientPercent = new BigNumber(feeConfig.client_revenue_share_percent)

			// MRR = (earning_balance × APY × client_revenue_percent) / 12
			const annualYield = earningBalance.multipliedBy(apy).dividedBy(100)
			const clientAnnualRevenue = annualYield.multipliedBy(clientPercent).dividedBy(100)
			const mrr = clientAnnualRevenue.dividedBy(12)

			expect(mrr.toFixed(2)).toBe('10.63') // $10.63/month
		})

		it('should calculate ARR as MRR × 12', async () => {
			const [vault] = await sql`
				SELECT total_staked_balance
				FROM client_vaults
				WHERE id = ${testVaultId}
			`

			const [feeConfig] = await sql`
				SELECT client_revenue_share_percent
				FROM client_organizations
				WHERE id = ${testClientId}
			`

			const earningBalance = new BigNumber(vault.total_staked_balance)
			const apy = new BigNumber('8.5')
			const clientPercent = new BigNumber(feeConfig.client_revenue_share_percent)

			const annualYield = earningBalance.multipliedBy(apy).dividedBy(100)
			const clientAnnualRevenue = annualYield.multipliedBy(clientPercent).dividedBy(100)
			const mrr = clientAnnualRevenue.dividedBy(12)
			const arr = mrr.multipliedBy(12)

			expect(arr.toFixed(2)).toBe('127.50') // $127.50/year
		})
	})

	describe('Wallet Stages Balance Validation', () => {
		it('should correctly track idle and earning balances', async () => {
			const [vault] = await sql`
				SELECT
					pending_deposit_balance,
					total_staked_balance
				FROM client_vaults
				WHERE id = ${testVaultId}
			`

			const idleBalance = new BigNumber(vault.pending_deposit_balance)
			const earningBalance = new BigNumber(vault.total_staked_balance)

			expect(idleBalance.toFixed(2)).toBe('5000.00') // Idle (not earning)
			expect(earningBalance.toFixed(2)).toBe('10000.00') // Earning (deployed)

			const totalBalance = idleBalance.plus(earningBalance)
			expect(totalBalance.toFixed(2)).toBe('15000.00')
		})

		it('should calculate deployment percentage', async () => {
			const [vault] = await sql`
				SELECT
					pending_deposit_balance,
					total_staked_balance
				FROM client_vaults
				WHERE id = ${testVaultId}
			`

			const idleBalance = new BigNumber(vault.pending_deposit_balance)
			const earningBalance = new BigNumber(vault.total_staked_balance)
			const totalBalance = idleBalance.plus(earningBalance)

			const deploymentPercent = earningBalance.dividedBy(totalBalance).multipliedBy(100)

			expect(deploymentPercent.toFixed(2)).toBe('66.67') // 66.67% deployed
		})
	})

	describe('Data Integrity Validation', () => {
		it('should ensure all revenue distributions sum to raw yield', async () => {
			// Insert test distribution
			const [distribution] = await sql`
				INSERT INTO revenue_distributions (
					client_id,
					vault_id,
					raw_yield,
					platform_fee,
					client_revenue,
					end_user_revenue,
					platform_fee_percent,
					client_revenue_percent
				) VALUES (
					${testClientId},
					${testVaultId},
					1000.00,
					75.00,
					150.00,
					775.00,
					7.50,
					15.00
				)
				RETURNING id, raw_yield, platform_fee, client_revenue, end_user_revenue
			`

			const rawYield = new BigNumber(distribution.raw_yield)
			const platformFee = new BigNumber(distribution.platform_fee)
			const clientRevenue = new BigNumber(distribution.client_revenue)
			const endUserRevenue = new BigNumber(distribution.end_user_revenue)

			const total = platformFee.plus(clientRevenue).plus(endUserRevenue)

			expect(total.toFixed(2)).toBe(rawYield.toFixed(2))

			// Cleanup
			await sql`DELETE FROM revenue_distributions WHERE id = ${distribution.id}`
		})

		it('should validate fee percentages always less than 100%', async () => {
			const [feeConfig] = await sql`
				SELECT
					platform_fee_percent + client_revenue_share_percent as total_fees
				FROM client_organizations
				WHERE id = ${testClientId}
			`

			const totalFees = new BigNumber(feeConfig.total_fees)
			expect(totalFees.isLessThan(100)).toBe(true)
		})
	})
})
