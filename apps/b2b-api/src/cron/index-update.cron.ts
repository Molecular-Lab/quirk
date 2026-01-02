/**
 * Index Update Cron Job
 *
 * Daily job to update vault current_index based on protocol yields.
 * This accrues yield to all vaults by increasing their growth index.
 *
 * Formula: newIndex = currentIndex × (1 + dailyYieldPercent / 100)
 *
 * Usage:
 *   npx tsx apps/b2b-api/src/cron/index-update.cron.ts
 *   OR
 *   node-cron: cron.schedule('0 0 * * *', () => updateAllVaultIndexes())
 */

import type { Sql } from 'postgres'
import { VaultRepository } from '@quirk/core/repository/postgres/vault.repository'
import { DeFiProtocolService } from '../service/defi-protocol.service'
import { logger } from '../logger'

// Runtime require for postgres (ESM compatibility)
// eslint-disable-next-line @typescript-eslint/no-require-imports
const postgres = require('postgres')

interface VaultIndexUpdate {
    vaultId: string
    clientId: string
    chain: string
    tokenSymbol: string
    oldIndex: string
    newIndex: string
    dailyYieldPercent: string
    protocol: string
}

/**
 * Calculate weighted daily yield from protocol APYs and strategy allocations
 */
function calculateWeightedDailyYield(
    protocolAPYs: { aave: string; compound: string; morpho: string },
    strategies: { category: string; target: number }[] | null
): { dailyYield: string; dominantProtocol: string } {
    const aaveAPY = parseFloat(protocolAPYs.aave) || 0
    const compoundAPY = parseFloat(protocolAPYs.compound) || 0
    const morphoAPY = parseFloat(protocolAPYs.morpho) || 0

    // Default equal allocation if no strategy
    let aaveWeight = 33.33
    let compoundWeight = 33.33
    let morphoWeight = 33.34

    if (strategies && strategies.length > 0) {
        aaveWeight = strategies.find(s => s.category === 'aave')?.target || 0
        compoundWeight = strategies.find(s => s.category === 'compound')?.target || 0
        morphoWeight = strategies.find(s => s.category === 'morpho')?.target || 0
    }

    // Weighted APY
    const weightedAPY = (
        (aaveAPY * aaveWeight / 100) +
        (compoundAPY * compoundWeight / 100) +
        (morphoAPY * morphoWeight / 100)
    )

    // Convert annual APY to daily yield
    // Daily = (1 + APY/100)^(1/365) - 1
    // Simplified: APY / 365 for small values
    const dailyYield = weightedAPY / 365

    // Find dominant protocol
    const protocols = [
        { name: 'aave', weight: aaveWeight, apy: aaveAPY },
        { name: 'compound', weight: compoundWeight, apy: compoundAPY },
        { name: 'morpho', weight: morphoWeight, apy: morphoAPY },
    ]
    const dominant = protocols.reduce((a, b) => a.weight > b.weight ? a : b)

    return {
        dailyYield: dailyYield.toFixed(6),
        dominantProtocol: dominant.name,
    }
}

/**
 * Update all active vault indexes
 */
export async function updateAllVaultIndexes(
    sql: Sql,
    defiService: DeFiProtocolService
): Promise<VaultIndexUpdate[]> {
    const vaultRepo = new VaultRepository(sql)
    const updates: VaultIndexUpdate[] = []

    try {
        // Get all active vaults
        const vaults = await vaultRepo.listAllVaults()
        logger.info(`[IndexUpdate] Found ${vaults.length} active vaults to update`)

        for (const vault of vaults) {
            try {
                // Get protocol APYs for this vault's chain/token
                const chainId = getChainId(vault.chain)
                const apys = await defiService.getAPYsSummary(vault.token_symbol, chainId)

                // Get vault strategies (JSONB column)
                const vaultWithStrategies = await vaultRepo.getVaultWithStrategies(vault.id)
                const strategies = vaultWithStrategies?.strategies || null

                // Calculate weighted daily yield
                const { dailyYield, dominantProtocol } = calculateWeightedDailyYield(apys, strategies)

                // Calculate new index
                const newIndex = vaultRepo.calculateNewIndexFromDailyYield(
                    vault.current_index,
                    dailyYield
                )

                // Update vault index
                const oldStaked = vault.total_staked_balance || '0'
                const yieldAmount = calculateYieldAmount(oldStaked, dailyYield)

                await vaultRepo.updateVaultIndex(
                    vault.id,
                    newIndex,
                    yieldAmount, // cumulative yield increment
                    oldStaked    // total staked (unchanged for now)
                )

                const update: VaultIndexUpdate = {
                    vaultId: vault.id,
                    clientId: vault.client_id,
                    chain: vault.chain,
                    tokenSymbol: vault.token_symbol,
                    oldIndex: vault.current_index,
                    newIndex,
                    dailyYieldPercent: dailyYield,
                    protocol: dominantProtocol,
                }
                updates.push(update)

                logger.info(`[IndexUpdate] Updated vault ${vault.id}`, {
                    chain: vault.chain,
                    oldIndex: vault.current_index,
                    newIndex,
                    dailyYield: `${dailyYield}%`,
                })

            } catch (error) {
                logger.error(`[IndexUpdate] Failed to update vault ${vault.id}`, { error })
                // Continue with other vaults
            }
        }

        logger.info(`[IndexUpdate] Completed ${updates.length}/${vaults.length} vault updates`)
        return updates

    } catch (error) {
        logger.error('[IndexUpdate] Fatal error during index update', { error })
        throw error
    }
}

/**
 * Convert chain name to chain ID
 */
function getChainId(chain: string): number {
    const chainMap: Record<string, number> = {
        'ethereum': 1,
        'base': 8453,
        'base-sepolia': 84532,
        'arbitrum': 42161,
        'polygon': 137,
        'sepolia': 11155111,
    }
    return chainMap[chain.toLowerCase()] || 1
}

/**
 * Calculate yield amount in token units
 */
function calculateYieldAmount(totalStaked: string, dailyYieldPercent: string): string {
    const staked = parseFloat(totalStaked)
    const yield_ = parseFloat(dailyYieldPercent)
    if (isNaN(staked) || isNaN(yield_)) return '0'
    return Math.floor(staked * yield_ / 100).toString()
}

// ==========================================
// CLI execution (for manual runs or cron)
// ==========================================
async function main() {
    console.log('🔄 Starting vault index update...')

    // Connect to database
    const databaseUrl = process.env.DATABASE_URL || 'postgresql://proxify_user:proxify_password@localhost:5432/proxify_dev'
    const sql: Sql = postgres(databaseUrl)

    try {
        const defiService = new DeFiProtocolService()
        const updates = await updateAllVaultIndexes(sql, defiService)

        console.log(`\n✅ Updated ${updates.length} vaults:`)
        for (const update of updates) {
            console.log(`  - ${update.vaultId.slice(0, 8)}... (${update.chain}/${update.tokenSymbol}): ${update.oldIndex} → ${update.newIndex} (+${update.dailyYieldPercent}%)`)
        }

    } catch (error) {
        console.error('❌ Index update failed:', error)
        process.exit(1)
    } finally {
        await sql.end()
    }
}

// Run if executed directly
if (require.main === module) {
    main()
}
