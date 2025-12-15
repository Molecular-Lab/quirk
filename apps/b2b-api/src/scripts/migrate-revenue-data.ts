/**
 * Data Migration Script: Revenue Tracking & Fee Configuration
 *
 * Purpose:
 * 1. Backfill fee configuration for existing clients (default: 15% client, 7.5% platform)
 * 2. Calculate and record historical revenue distributions
 * 3. Validate data integrity (ensure client + platform + enduser = 100%)
 *
 * Usage:
 * pnpm tsx apps/b2b-api/src/scripts/migrate-revenue-data.ts
 */

import postgres from 'postgres'
import { config } from 'dotenv'
import BigNumber from 'bignumber.js'

// Load environment variables
config()

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
	console.error('❌ DATABASE_URL not found in environment')
	process.exit(1)
}

const sql = postgres(DATABASE_URL, {
	max: 5,
	idle_timeout: 20,
	connect_timeout: 10,
})

interface Client {
	id: string
	product_id: string
	company_name: string
	client_revenue_share_percent: string | null
	platform_fee_percent: string | null
}

interface Vault {
	id: string
	client_id: string
	total_staked_balance: string
	cumulative_yield: string
}

async function main() {
	console.log('🚀 Starting revenue data migration...\n')

	try {
		// ============================================
		// Step 1: Backfill Fee Configuration
		// ============================================
		console.log('📋 Step 1: Backfilling fee configuration...')

		const clientsWithoutFeeConfig = await sql<Client[]>`
			SELECT id, product_id, company_name, client_revenue_share_percent, platform_fee_percent
			FROM client_organizations
			WHERE client_revenue_share_percent IS NULL
			   OR platform_fee_percent IS NULL
		`

		if (clientsWithoutFeeConfig.length === 0) {
			console.log('✅ All clients have fee configuration\n')
		} else {
			console.log(`Found ${clientsWithoutFeeConfig.length} clients without fee configuration`)

			for (const client of clientsWithoutFeeConfig) {
				const clientRevenuePercent = client.client_revenue_share_percent || '15.00'
				const platformFeePercent = client.platform_fee_percent || '7.50'

				await sql`
					UPDATE client_organizations
					SET
						client_revenue_share_percent = ${clientRevenuePercent},
						platform_fee_percent = ${platformFeePercent}
					WHERE id = ${client.id}
				`

				console.log(`  ✅ Updated ${client.company_name} (${client.product_id})`)
				console.log(`     - Client: ${clientRevenuePercent}%, Platform: ${platformFeePercent}%`)
			}

			console.log(`✅ Backfilled fee configuration for ${clientsWithoutFeeConfig.length} clients\n`)
		}

		// ============================================
		// Step 2: Calculate Historical Revenue
		// ============================================
		console.log('📊 Step 2: Calculating historical revenue distributions...')

		// Get all vaults with cumulative yield
		const vaultsWithYield = await sql<Vault[]>`
			SELECT id, client_id, total_staked_balance, cumulative_yield
			FROM client_vaults
			WHERE cumulative_yield > 0
		`

		if (vaultsWithYield.length === 0) {
			console.log('✅ No vaults with yield to process\n')
		} else {
			console.log(`Found ${vaultsWithYield.length} vaults with cumulative yield`)

			let totalProcessed = 0
			let totalRevenue = new BigNumber(0)

			for (const vault of vaultsWithYield) {
				// Get client fee configuration
				const [client] = await sql<Client[]>`
					SELECT client_revenue_share_percent, platform_fee_percent
					FROM client_organizations
					WHERE id = ${vault.client_id}
				`

				if (!client) {
					console.warn(`  ⚠️  Skipping vault ${vault.id} - client not found`)
					continue
				}

				const rawYield = new BigNumber(vault.cumulative_yield)
				const clientPercent = new BigNumber(client.client_revenue_share_percent || '15.00')
				const platformPercent = new BigNumber(client.platform_fee_percent || '7.50')

				// Calculate 3-way split
				const platformFee = rawYield.multipliedBy(platformPercent).dividedBy(100)
				const clientRevenue = rawYield.multipliedBy(clientPercent).dividedBy(100)
				const endUserRevenue = rawYield.minus(platformFee).minus(clientRevenue)

				// Validation: Ensure split adds up to raw yield
				const total = platformFee.plus(clientRevenue).plus(endUserRevenue)
				if (!total.isEqualTo(rawYield)) {
					console.error(`  ❌ Revenue split mismatch for vault ${vault.id}`)
					console.error(`     Raw: ${rawYield.toString()}, Total: ${total.toString()}`)
					continue
				}

				// Check if distribution already exists
				const [existing] = await sql`
					SELECT id FROM revenue_distributions
					WHERE vault_id = ${vault.id}
					AND raw_yield = ${rawYield.toString()}
				`

				if (existing) {
					console.log(`  ⏭️  Skipping vault ${vault.id} - distribution already recorded`)
					continue
				}

				// Record revenue distribution
				await sql`
					INSERT INTO revenue_distributions (
						client_id,
						vault_id,
						raw_yield,
						platform_fee,
						client_revenue,
						end_user_revenue,
						platform_fee_percent,
						client_revenue_percent,
						distributed_at
					) VALUES (
						${vault.client_id},
						${vault.id},
						${rawYield.toString()},
						${platformFee.toString()},
						${clientRevenue.toString()},
						${endUserRevenue.toString()},
						${platformPercent.toString()},
						${clientPercent.toString()},
						NOW()
					)
				`

				totalProcessed++
				totalRevenue = totalRevenue.plus(rawYield)

				console.log(`  ✅ Recorded distribution for vault ${vault.id}`)
				console.log(`     Raw Yield: ${rawYield.toFixed(6)}`)
				console.log(`     Platform: ${platformFee.toFixed(6)} (${platformPercent}%)`)
				console.log(`     Client: ${clientRevenue.toFixed(6)} (${clientPercent}%)`)
				console.log(`     End-User: ${endUserRevenue.toFixed(6)}`)
			}

			console.log(`\n✅ Processed ${totalProcessed} revenue distributions`)
			console.log(`📈 Total Revenue Distributed: ${totalRevenue.toFixed(6)}\n`)
		}

		// ============================================
		// Step 3: Validate Data Integrity
		// ============================================
		console.log('🔍 Step 3: Validating data integrity...')

		// Check fee percentages add up correctly
		const [feeCheck] = await sql`
			SELECT
				COUNT(*) as total_clients,
				COUNT(*) FILTER (
					WHERE client_revenue_share_percent + platform_fee_percent < 100
				) as valid_clients
			FROM client_organizations
		`

		console.log(`  Total Clients: ${feeCheck.total_clients}`)
		console.log(`  Valid Fee Config: ${feeCheck.valid_clients}`)

		if (feeCheck.total_clients !== feeCheck.valid_clients) {
			console.error(`  ❌ ${feeCheck.total_clients - feeCheck.valid_clients} clients have invalid fee configuration!`)
		} else {
			console.log(`  ✅ All clients have valid fee configuration`)
		}

		// Check revenue distributions sum correctly
		const [revenueCheck] = await sql`
			SELECT
				COUNT(*) as total_distributions,
				COUNT(*) FILTER (
					WHERE ABS(raw_yield - (platform_fee + client_revenue + end_user_revenue)) < 0.000001
				) as valid_distributions
			FROM revenue_distributions
		`

		console.log(`  Total Distributions: ${revenueCheck.total_distributions}`)
		console.log(`  Valid Distributions: ${revenueCheck.valid_distributions}`)

		if (revenueCheck.total_distributions !== revenueCheck.valid_distributions) {
			console.error(
				`  ❌ ${revenueCheck.total_distributions - revenueCheck.valid_distributions} distributions have mismatched totals!`
			)
		} else {
			console.log(`  ✅ All revenue distributions are mathematically correct`)
		}

		// ============================================
		// Step 4: Summary
		// ============================================
		console.log('\n📊 Migration Summary:')
		console.log('==========================================')

		const [summary] = await sql`
			SELECT
				(SELECT COUNT(*) FROM client_organizations) as total_clients,
				(SELECT COUNT(*) FROM client_vaults WHERE cumulative_yield > 0) as vaults_with_yield,
				(SELECT COUNT(*) FROM revenue_distributions) as total_distributions,
				(SELECT COALESCE(SUM(raw_yield), 0) FROM revenue_distributions) as total_raw_yield,
				(SELECT COALESCE(SUM(platform_fee), 0) FROM revenue_distributions) as total_platform_fee,
				(SELECT COALESCE(SUM(client_revenue), 0) FROM revenue_distributions) as total_client_revenue,
				(SELECT COALESCE(SUM(end_user_revenue), 0) FROM revenue_distributions) as total_enduser_revenue
		`

		console.log(`Total Clients: ${summary.total_clients}`)
		console.log(`Vaults with Yield: ${summary.vaults_with_yield}`)
		console.log(`Revenue Distributions: ${summary.total_distributions}`)
		console.log(`\nRevenue Breakdown:`)
		console.log(`  Raw Yield: ${new BigNumber(summary.total_raw_yield).toFixed(6)}`)
		console.log(`  Platform Fee: ${new BigNumber(summary.total_platform_fee).toFixed(6)}`)
		console.log(`  Client Revenue: ${new BigNumber(summary.total_client_revenue).toFixed(6)}`)
		console.log(`  End-User Revenue: ${new BigNumber(summary.total_enduser_revenue).toFixed(6)}`)

		// Calculate percentages
		const totalYield = new BigNumber(summary.total_raw_yield)
		if (totalYield.isGreaterThan(0)) {
			const platformPercent = new BigNumber(summary.total_platform_fee).dividedBy(totalYield).multipliedBy(100)
			const clientPercent = new BigNumber(summary.total_client_revenue).dividedBy(totalYield).multipliedBy(100)
			const enduserPercent = new BigNumber(summary.total_enduser_revenue).dividedBy(totalYield).multipliedBy(100)

			console.log(`\nPercentage Breakdown:`)
			console.log(`  Platform: ${platformPercent.toFixed(2)}%`)
			console.log(`  Client: ${clientPercent.toFixed(2)}%`)
			console.log(`  End-User: ${enduserPercent.toFixed(2)}%`)
			console.log(`  Total: ${platformPercent.plus(clientPercent).plus(enduserPercent).toFixed(2)}%`)
		}

		console.log('\n✅ Migration completed successfully!')
	} catch (error) {
		console.error('\n❌ Migration failed:', error)
		throw error
	} finally {
		await sql.end()
	}
}

// Run migration
main().catch((error) => {
	console.error('Fatal error:', error)
	process.exit(1)
})
