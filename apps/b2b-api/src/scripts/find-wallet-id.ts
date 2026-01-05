/**
 * Find Privy Wallet ID by Address
 * Queries Privy API to find the wallet ID for a given address
 */

import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '../../.env') })

async function main() {
    const targetAddress = '0x0F9E9f4D035BE8bC5756920E6E2A6Bd0e2278C90'

    console.log(`\n🔍 Searching for Privy wallet with address: ${targetAddress}\n`)

    const privyAppId = process.env.PRIVY_APP_ID
    const privyAppSecret = process.env.PRIVY_APP_SECRET

    if (!privyAppId || !privyAppSecret) {
        console.error('❌ PRIVY_APP_ID and PRIVY_APP_SECRET must be set in .env')
        process.exit(1)
    }

    try {
        // Use Privy REST API to list wallets
        console.log('📋 Querying Privy API for wallets...\n')

        const authHeader = 'Basic ' + Buffer.from(`${privyAppId}:${privyAppSecret}`).toString('base64')

        const response = await fetch('https://auth.privy.io/api/v1/wallets', {
            method: 'GET',
            headers: {
                'Authorization': authHeader,
                'privy-app-id': privyAppId,
            },
        })

        if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`Privy API error: ${response.status} ${response.statusText}\n${errorText}`)
        }

        const data = await response.json() as { wallets: Array<{ id: string; address: string; chain_type: string; created_at: number }> }

        console.log(`Found ${data.wallets?.length || 0} total wallets\n`)

        if (!data.wallets || data.wallets.length === 0) {
            console.log('❌ No wallets found in this Privy app')
            process.exit(1)
        }

        // Find the wallet with matching address (case-insensitive)
        const matchingWallet = data.wallets.find(w =>
            w.address.toLowerCase() === targetAddress.toLowerCase()
        )

        if (matchingWallet) {
            console.log('✅ Found matching wallet!\n')
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
            console.log(`Wallet ID: ${matchingWallet.id}`)
            console.log(`Address:   ${matchingWallet.address}`)
            console.log(`Chain:     ${matchingWallet.chain_type}`)
            console.log(`Created:   ${new Date(matchingWallet.created_at).toISOString()}`)
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
            console.log(`\n📝 Run this SQL to update your database:\n`)
            console.log(`UPDATE client_vaults`)
            console.log(`SET privy_wallet_id = '${matchingWallet.id}',`)
            console.log(`    updated_at = now()`)
            console.log(`WHERE custodial_wallet_address = '${targetAddress}';\n`)
        } else {
            console.log(`❌ No wallet found with address ${targetAddress}`)
            console.log('\n📋 Available wallets:\n')
            data.wallets.forEach(w => {
                console.log(`  • ${w.id.padEnd(30)} → ${w.address}`)
            })
            console.log('\n💡 Tip: Check if you\'re using the correct PRIVY_APP_ID\n')
        }
    } catch (error) {
        console.error('❌ Error:', error)
        process.exit(1)
    }
}

main()
