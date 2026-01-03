/**
 * Backfill Privy Wallets for Existing Production Vaults
 *
 * This script creates Privy server wallets for production vaults that don't have one yet.
 *
 * Usage:
 *   pnpm tsx scripts/backfill-privy-wallets.ts
 *
 * Requirements:
 *   - PRIVY_APP_ID and PRIVY_APP_SECRET must be set in .env
 *   - Database must be accessible via DATABASE_URL
 */

import "dotenv/config"
import postgres from "postgres"
import { PrivyWalletService } from "@quirk/core"

// Simple console logger
const logger = {
	info: (message: string, meta?: any) => console.log(`ℹ️  ${message}`, meta || ''),
	error: (message: string, meta?: any) => console.error(`❌ ${message}`, meta || ''),
	warn: (message: string, meta?: any) => console.warn(`⚠️  ${message}`, meta || ''),
	debug: (message: string, meta?: any) => console.debug(`🔍 ${message}`, meta || ''),
}

interface ProductionVault {
	id: string
	client_id: string
	chain: string
	token_symbol: string
	environment: string
	custodial_wallet_address: string | null
	privy_wallet_id: string | null
}

async function main() {
	console.log('\n╔═══════════════════════════════════════════════════════════════╗')
	console.log('║   Backfill Privy Wallets for Production Vaults               ║')
	console.log('╚═══════════════════════════════════════════════════════════════╝\n')

	// 1. Check environment variables
	const databaseUrl = process.env.DATABASE_URL
	const privyAppId = process.env.PRIVY_APP_ID
	const privyAppSecret = process.env.PRIVY_APP_SECRET

	if (!databaseUrl) {
		logger.error('DATABASE_URL not set in environment')
		logger.info('Please set DATABASE_URL in .env file')
		process.exit(1)
	}

	if (!privyAppId || !privyAppSecret) {
		logger.error('Privy credentials not configured')
		logger.info('Please set PRIVY_APP_ID and PRIVY_APP_SECRET in .env file')
		process.exit(1)
	}

	// 2. Initialize database connection
	const sql = postgres(databaseUrl)
	logger.info('Database connection initialized')

	try {
		await sql`SELECT 1`
		logger.info('Database connection verified ✅\n')
	} catch (error: any) {
		logger.error('Database connection failed!', error.message)
		process.exit(1)
	}

	// 3. Initialize Privy Wallet Service
	const privyWalletService = new PrivyWalletService(
		{
			appId: privyAppId,
			appSecret: privyAppSecret,
		},
		logger
	)
	logger.info('PrivyWalletService initialized ✅\n')

	// 4. Find production vaults without Privy wallet IDs
	logger.info('🔍 Searching for production vaults without Privy wallet IDs...\n')

	const vaults = await sql<ProductionVault[]>`
		SELECT
			id,
			client_id,
			chain,
			token_symbol,
			environment,
			custodial_wallet_address,
			privy_wallet_id
		FROM client_vaults
		WHERE environment = 'production'
		  AND privy_wallet_id IS NULL
		ORDER BY created_at ASC
	`

	if (vaults.length === 0) {
		logger.info('✅ No production vaults found without Privy wallet IDs')
		logger.info('All production vaults are already configured!\n')
		await sql.end()
		process.exit(0)
	}

	logger.info(`Found ${vaults.length} production vault(s) needing Privy wallets:\n`)

	for (const vault of vaults) {
		console.log(`  • Vault ${vault.id}`)
		console.log(`    Token: ${vault.token_symbol} on chain ${vault.chain}`)
		console.log(`    Current address: ${vault.custodial_wallet_address || 'NULL'}\n`)
	}

	// 5. Ask for confirmation
	console.log('─────────────────────────────────────────────────────────────\n')
	logger.warn(`This will create ${vaults.length} Privy server wallet(s)`)
	logger.warn('This action cannot be undone!\n')

	// Auto-proceed for now (can add readline prompt if needed)
	console.log('Proceeding with wallet creation...\n')

	// 6. Create Privy wallets for each vault
	let successCount = 0
	let failureCount = 0

	for (let i = 0; i < vaults.length; i++) {
		const vault = vaults[i]
		const vaultNum = i + 1

		console.log(`\n[${vaultNum}/${vaults.length}] Processing vault ${vault.id}`)
		console.log(`  Token: ${vault.token_symbol} on chain ${vault.chain}`)

		try {
			// Create Privy server wallet
			logger.info('  Creating Privy server wallet...')
			const { walletId, address } = await privyWalletService.createServerWallet()

			logger.info(`  ✅ Wallet created!`)
			console.log(`     Wallet ID: ${walletId}`)
			console.log(`     Address: ${address}`)

			// Update vault with wallet ID and address
			logger.info('  Updating vault in database...')
			await sql`
				UPDATE client_vaults
				SET privy_wallet_id = ${walletId},
				    custodial_wallet_address = ${address},
				    updated_at = now()
				WHERE id = ${vault.id}
			`

			logger.info('  ✅ Vault updated successfully!')
			successCount++

		} catch (error: any) {
			logger.error(`  ❌ Failed to create wallet for vault ${vault.id}`)
			logger.error(`     Error: ${error.message}`)
			failureCount++
		}
	}

	// 7. Summary
	console.log('\n╔═══════════════════════════════════════════════════════════════╗')
	console.log('║                        SUMMARY                                ║')
	console.log('╚═══════════════════════════════════════════════════════════════╝\n')

	logger.info(`Total vaults processed: ${vaults.length}`)
	logger.info(`✅ Success: ${successCount}`)
	if (failureCount > 0) {
		logger.error(`❌ Failed: ${failureCount}`)
	}

	// 8. Verify results
	console.log('\n📊 Verifying final state...\n')

	const finalCheck = await sql`
		SELECT
			environment,
			COUNT(*) as count,
			COUNT(privy_wallet_id) as with_wallet,
			COUNT(*) - COUNT(privy_wallet_id) as without_wallet
		FROM client_vaults
		GROUP BY environment
		ORDER BY environment
	`

	console.table(finalCheck.map(row => ({
		Environment: row.environment,
		'Total Vaults': row.count,
		'With Wallet': row.with_wallet,
		'Without Wallet': row.without_wallet,
	})))

	// Close database connection
	await sql.end()
	logger.info('\n✅ Backfill complete!\n')

	process.exit(failureCount > 0 ? 1 : 0)
}

main().catch((error) => {
	console.error('\n💥 Fatal error:', error)
	process.exit(1)
})
