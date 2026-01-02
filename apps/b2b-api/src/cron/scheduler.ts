/**
 * Cron Scheduler
 *
 * Runs scheduled background jobs:
 * - Index Update: Daily at midnight UTC
 *
 * Usage:
 *   npx tsx apps/b2b-api/src/cron/scheduler.ts
 */

// Note: node-cron needs to be installed: npm install node-cron @types/node-cron
// Using require() for ESM compatibility
// eslint-disable-next-line @typescript-eslint/no-require-imports
const cron = require('node-cron')
// eslint-disable-next-line @typescript-eslint/no-require-imports
const postgres = require('postgres')

import type { Sql } from 'postgres'
import { updateAllVaultIndexes } from './index-update.cron'
import { DeFiProtocolService } from '../service/defi-protocol.service'
import { logger } from '../logger'

async function startScheduler() {
    logger.info('🚀 Starting cron scheduler...')

    // Connect to database
    const databaseUrl = process.env.DATABASE_URL || 'postgresql://proxify_user:proxify_password@localhost:5432/proxify_dev'
    const sql: Sql = postgres(databaseUrl)
    const defiService = new DeFiProtocolService()

    // ==========================================
    // VAULT INDEX UPDATE - Daily at midnight UTC
    // ==========================================
    // Cron expression: '0 0 * * *' = At 00:00 every day
    cron.schedule('0 0 * * *', async () => {
        logger.info('[Scheduler] Running daily vault index update...')
        try {
            const updates = await updateAllVaultIndexes(sql, defiService)
            logger.info(`[Scheduler] Index update complete: ${updates.length} vaults updated`)
        } catch (error) {
            logger.error('[Scheduler] Index update failed', { error })
        }
    }, {
        timezone: 'UTC'
    })

    logger.info('✅ Cron scheduler started')
    logger.info('   - Vault index update: Daily at 00:00 UTC')

    // Keep process alive
    process.on('SIGINT', async () => {
        logger.info('Shutting down scheduler...')
        await sql.end()
        process.exit(0)
    })
}

// Run if executed directly
if (require.main === module) {
    startScheduler()
}

export { startScheduler }
