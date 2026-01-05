
import postgres from 'postgres'
import { createPublicClient, http, parseAbiItem } from 'viem'
import { base } from 'viem/chains'
import { DefiTransactionsRepository } from '@quirk/core'
import * as dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../../.env") })

// Configuration
const DATABASE_URL = process.env.DATABASE_URL
const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' // Base Mainnet USDC
const RPC_URL = process.env.BASE_MAINNET_RPC_URL || 'https://mainnet.base.org'

// Protocol Addresses (Spenders)
const PROTOCOLS = {
    AAVE_POOL: '0xA238Dd80C259a72e81d7e4664a9801593F98d1c5', // Base Pool
    COMPOUND_USDC: '0xb125E6687d4313864e53df431d5425969c15Eb2F',
    MORPHO_VAULT: '0x618495ccC4e751178C4914b1E939C0fe0FB07b9b', // Re7 USDC
}

async function main() {
    console.log('🚀 Starting DeFi Transaction Backfill...')

    if (!DATABASE_URL) {
        console.error('❌ DATABASE_URL is required')
        process.exit(1)
    }

    // Initialize Database
    const sql = postgres(DATABASE_URL)
    const repo = new DefiTransactionsRepository(sql)

    // Initialize Viem Client
    const client = createPublicClient({
        chain: base,
        transport: http(RPC_URL)
    })

    try {
        // 1. Get all Vaults with Custodial Wallets
        console.log('🔍 Fetching vaults...')
        const vaults = await sql`
            SELECT id, client_id, custodial_wallet_address, created_at 
            FROM vault 
            WHERE custodial_wallet_address IS NOT NULL
        `

        console.log(`found ${vaults.length} vaults with custodial wallets`)

        for (const vault of vaults) {
            console.log(`\nProcessing vault: ${vault.id} (${vault.custodial_wallet_address})`)

            // 2. Fetch USDC Transfers FROM the vault (Deposits)
            const depositLogs = await client.getLogs({
                address: USDC_ADDRESS,
                event: parseAbiItem('event Transfer(address indexed from, address indexed to, uint256 value)'),
                args: {
                    from: vault.custodial_wallet_address as `0x${string}`
                },
                fromBlock: 0n // Or a specific start block for Base
            })

            console.log(`Found ${depositLogs.length} outgoing USDC transfers`)

            for (const log of depositLogs) {
                // Determine Protocol
                let protocol: 'aave' | 'compound' | 'morpho' | null = null
                const to = log.args.to?.toLowerCase()

                if (to === PROTOCOLS.AAVE_POOL.toLowerCase()) protocol = 'aave'
                else if (to === PROTOCOLS.COMPOUND_USDC.toLowerCase()) protocol = 'compound'
                else if (to === PROTOCOLS.MORPHO_VAULT.toLowerCase()) protocol = 'morpho'

                if (protocol) {
                    // Check if exists
                    const exists = await repo.getByHash(log.transactionHash)
                    if (exists) {
                        console.log(`Skipping existing tx: ${log.transactionHash}`)
                        continue
                    }

                    console.log(`Backfilling DEPOSIT to ${protocol}: ${log.transactionHash}`)

                    const block = await client.getBlock({ blockHash: log.blockHash })

                    await repo.create({
                        clientId: vault.client_id,
                        vaultId: vault.id,
                        endUserId: null,
                        txHash: log.transactionHash,
                        blockNumber: log.blockNumber.toString(),
                        chain: '8453',
                        operationType: 'deposit',
                        protocol: protocol,
                        tokenSymbol: 'USDC',
                        tokenAddress: USDC_ADDRESS,
                        amount: log.args.value?.toString() || '0',
                        status: 'confirmed',
                        environment: 'production',
                        executedAt: new Date(Number(block.timestamp) * 1000),
                        confirmedAt: new Date(Number(block.timestamp) * 1000),
                        gasUsed: null, // Could fetch receipt if needed
                        gasPrice: null,
                        gasCostEth: null,
                        gasCostUsd: null,
                        errorMessage: null
                    })
                }
            }

            // 3. Fetch USDC Transfers TO the vault (Withdrawals)
            const withdrawalLogs = await client.getLogs({
                address: USDC_ADDRESS,
                event: parseAbiItem('event Transfer(address indexed from, address indexed to, uint256 value)'),
                args: {
                    to: vault.custodial_wallet_address as `0x${string}`
                },
                fromBlock: 0n
            })

            console.log(`Found ${withdrawalLogs.length} incoming USDC transfers`)

            for (const log of withdrawalLogs) {
                // Determine Protocol
                let protocol: 'aave' | 'compound' | 'morpho' | null = null
                const from = log.args.from?.toLowerCase()

                // Note: Withdrawals usually come from ATokens, Comet, or Vaults.
                // Aave withdrawal comes from AToken (aUSDC) burning? Or Pool transfer?
                // Actually for Aave V3, the Pool transfers the underlying asset to the user.
                if (from === PROTOCOLS.AAVE_POOL.toLowerCase()) protocol = 'aave'
                else if (from === PROTOCOLS.COMPOUND_USDC.toLowerCase()) protocol = 'compound'
                else if (from === PROTOCOLS.MORPHO_VAULT.toLowerCase()) protocol = 'morpho'

                if (protocol) {
                    const exists = await repo.getByHash(log.transactionHash)
                    if (exists) {
                        console.log(`Skipping existing tx: ${log.transactionHash}`)
                        continue
                    }

                    console.log(`Backfilling WITHDRAWAL from ${protocol}: ${log.transactionHash}`)

                    const block = await client.getBlock({ blockHash: log.blockHash })

                    await repo.create({
                        clientId: vault.client_id,
                        vaultId: vault.id,
                        endUserId: null,
                        txHash: log.transactionHash,
                        blockNumber: log.blockNumber.toString(),
                        chain: '8453',
                        operationType: 'withdrawal',
                        protocol: protocol,
                        tokenSymbol: 'USDC',
                        tokenAddress: USDC_ADDRESS,
                        amount: log.args.value?.toString() || '0',
                        status: 'confirmed',
                        environment: 'production',
                        executedAt: new Date(Number(block.timestamp) * 1000),
                        confirmedAt: new Date(Number(block.timestamp) * 1000),
                        gasUsed: null,
                        gasPrice: null,
                        gasCostEth: null,
                        gasCostUsd: null,
                        errorMessage: null
                    })
                }
            }

        }

        console.log('✅ Backfill complete')
    } catch (error) {
        console.error('❌ Backfill failed:', error)
    } finally {
        await sql.end()
    }
}

main()
