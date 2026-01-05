/**
 * Manual Balance Sync Script
 * Fetches real on-chain balances from DeFi protocols and updates the database
 */

import postgres from 'postgres'
import { createPublicClient, http } from 'viem'
import { base } from 'viem/chains'
import { AaveAdapter, CompoundAdapter, MorphoAdapter } from '@quirk/yield-engine'
import * as dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../../.env") })

const DATABASE_URL = process.env.DATABASE_URL
const BASE_RPC_URL = process.env.BASE_RPC_URL

async function main() {
	console.log('🔄 Starting manual balance sync...\n')

	if (!DATABASE_URL) {
		console.error('❌ DATABASE_URL is required')
		process.exit(1)
	}

	const sql = postgres(DATABASE_URL)

	try {
		// Get all production vaults with custodial wallets
		const vaults = await sql`
			SELECT id, client_id, custodial_wallet_address, token_symbol,
			       total_staked_balance, chain
			FROM client_vaults
			WHERE custodial_wallet_address IS NOT NULL
			  AND environment = 'production'
			  AND chain = '8453'
		`

		console.log(`Found ${vaults.length} production vaults on Base\n`)

		const chainId = 8453 // Base Mainnet

		for (const vault of vaults) {
			console.log(`📦 Vault: ${vault.id}`)
			console.log(`   Wallet: ${vault.custodial_wallet_address}`)
			console.log(`   Current DB Balance: ${parseFloat(vault.total_staked_balance) / 1e6} USDC`)

			// Fetch on-chain balances
			const aaveAdapter = new AaveAdapter(chainId)
			const compoundAdapter = new CompoundAdapter(chainId)
			const morphoAdapter = new MorphoAdapter(chainId)

			const [aaveResult, compoundResult, morphoResult] = await Promise.allSettled([
				aaveAdapter.getUserPosition(vault.custodial_wallet_address, 'USDC', chainId),
				compoundAdapter.getUserPosition(vault.custodial_wallet_address, 'USDC', chainId),
				morphoAdapter.getUserPosition(vault.custodial_wallet_address, 'USDC', chainId),
			])

			const aaveBalance = aaveResult.status === 'fulfilled' && aaveResult.value
				? parseFloat(aaveResult.value.amount)
				: 0
			const compoundBalance = compoundResult.status === 'fulfilled' && compoundResult.value
				? parseFloat(compoundResult.value.amount)
				: 0
			const morphoBalance = morphoResult.status === 'fulfilled' && morphoResult.value
				? parseFloat(morphoResult.value.amount)
				: 0

			const totalOnChain = aaveBalance + compoundBalance + morphoBalance

			console.log(`   On-Chain Balances:`)
			console.log(`     Aave:     ${(aaveBalance / 1e6).toFixed(6)} USDC`)
			console.log(`     Compound: ${(compoundBalance / 1e6).toFixed(6)} USDC`)
			console.log(`     Morpho:   ${(morphoBalance / 1e6).toFixed(6)} USDC`)
			console.log(`     Total:    ${(totalOnChain / 1e6).toFixed(6)} USDC`)

			if (totalOnChain === 0) {
				console.log(`   ⏭️  Skipping (no on-chain balance)\n`)
				continue
			}

			// Calculate yield
			const currentDbBalance = parseFloat(vault.total_staked_balance)
			const yieldAccrued = totalOnChain - currentDbBalance

			// Update database (balances already in smallest units)
			await sql`
				UPDATE client_vaults
				SET total_staked_balance = ${totalOnChain.toString()},
				    cumulative_yield = cumulative_yield + ${Math.max(0, yieldAccrued).toString()},
				    last_balance_sync_at = NOW(),
				    updated_at = NOW()
				WHERE id = ${vault.id}
			`

			console.log(`   ✅ Synced! Yield accrued: ${(yieldAccrued / 1e6).toFixed(6)} USDC\n`)
		}

		console.log('✅ Balance sync complete!')
	} catch (error) {
		console.error('❌ Sync failed:', error)
		process.exit(1)
	} finally {
		await sql.end()
	}
}

main()
