/**
 * Index Update Cron Service
 * Handles daily growth index updates for all client vaults
 */

import { Decimal } from "decimal.js"

import { type DeFiProtocolAPY, type StrategyAllocation, YieldCalculationService } from "./yield-calculation.service"

// Scale factor for index (1e18)
const INDEX_SCALE = new Decimal("1000000000000000000")

export interface VaultIndexUpdate {
	vaultId: string
	clientId: string
	oldIndex: string
	newIndex: string
	yieldGenerated: string
	dailyGrowthRate: number
	totalStaked: string
	timestamp: Date
}

export interface ClientVaultData {
	id: string
	clientId: string
	currentIndex: string // Scaled by 1e18
	totalStakedBalance: string
	strategies: StrategyAllocation[] // From JSONB field
	chain: string
	tokenSymbol: string
}

export class IndexUpdateCronService {
	/**
	 * Main cron job entry point - runs daily
	 * Updates all client vault indexes based on DeFi protocol yields
	 */
	static async runDailyIndexUpdate(): Promise<VaultIndexUpdate[]> {
		console.log("[IndexCron] ===== Starting Daily Index Update =====")
		console.log("[IndexCron] Timestamp:", new Date().toISOString())

		try {
			// Step 1: Fetch current APYs from all DeFi protocols
			const protocolAPYs = await YieldCalculationService.fetchProtocolAPYs()
			console.log("[IndexCron] Fetched protocol APYs:", protocolAPYs)

			// Step 2: Get all active client vaults from database
			const activeVaults = await this.fetchActiveClientVaults()
			console.log(`[IndexCron] Found ${activeVaults.length} active vaults to update`)

			if (activeVaults.length === 0) {
				console.log("[IndexCron] No active vaults found, skipping update")
				return []
			}

			// Step 3: Calculate and update index for each vault
			const updates: VaultIndexUpdate[] = []

			for (const vault of activeVaults) {
				try {
					const update = await this.updateVaultIndex(vault, protocolAPYs)
					updates.push(update)

					console.log(`[IndexCron] ✅ Updated vault ${vault.id}:`, {
						oldIndex: new Decimal(update.oldIndex).dividedBy(INDEX_SCALE).toFixed(6),
						newIndex: new Decimal(update.newIndex).dividedBy(INDEX_SCALE).toFixed(6),
						yieldGenerated: `$${update.yieldGenerated}`,
						growthRate: `${update.dailyGrowthRate.toFixed(6)}%`,
					})
				} catch (error) {
					console.error(`[IndexCron] ❌ Failed to update vault ${vault.id}:`, error)
					// Continue with other vaults even if one fails
				}
			}

			// Step 4: Update APY performance metrics (7d, 30d averages)
			await this.updateAPYMetrics(updates)

			console.log("[IndexCron] ===== Daily Index Update Complete =====")
			console.log(`[IndexCron] Successfully updated ${updates.length}/${activeVaults.length} vaults`)

			return updates
		} catch (error) {
			console.error("[IndexCron] ❌ Critical error in daily index update:", error)
			throw error
		}
	}

	/**
	 * Update index for a single vault
	 */
	private static async updateVaultIndex(
		vault: ClientVaultData,
		protocolAPYs: DeFiProtocolAPY[],
	): Promise<VaultIndexUpdate> {
		// Skip if no staked balance
		if (new Decimal(vault.totalStakedBalance).lessThanOrEqualTo(0)) {
			console.log(`[IndexCron] Skipping vault ${vault.id} - no staked balance`)
			return {
				vaultId: vault.id,
				clientId: vault.clientId,
				oldIndex: vault.currentIndex,
				newIndex: vault.currentIndex, // No change
				yieldGenerated: "0",
				dailyGrowthRate: 0,
				totalStaked: vault.totalStakedBalance,
				timestamp: new Date(),
			}
		}

		// Calculate weighted APY based on vault's DeFi strategy allocations
		const weightedAPY = YieldCalculationService.calculateWeightedAPY(protocolAPYs, vault.strategies)

		// Convert annual APY to daily APY
		const dailyAPY = weightedAPY / 365

		console.log(`[IndexCron] Vault ${vault.id} (${vault.tokenSymbol} on ${vault.chain}):`, {
			totalStaked: `$${vault.totalStakedBalance}`,
			weightedAPY: `${weightedAPY.toFixed(4)}%`,
			dailyAPY: `${dailyAPY.toFixed(6)}%`,
			strategies: vault.strategies.map((s) => `${s.protocol}: ${s.allocation}%`).join(", "),
		})

		// Calculate new index
		const indexUpdate = YieldCalculationService.calculateNewIndex({
			currentIndex: vault.currentIndex,
			totalStaked: vault.totalStakedBalance,
			annualAPY: weightedAPY, // ✅ Pass weighted annual APY, not daily
		})

		// Persist to database
		await this.saveIndexUpdate({
			vaultId: vault.id,
			newIndex: indexUpdate.newIndex,
			yieldGenerated: indexUpdate.yieldGenerated,
			growthRate: indexUpdate.growthRate,
		})

		return {
			vaultId: vault.id,
			clientId: vault.clientId,
			oldIndex: indexUpdate.oldIndex,
			newIndex: indexUpdate.newIndex,
			yieldGenerated: indexUpdate.yieldGenerated,
			dailyGrowthRate: indexUpdate.growthRate,
			totalStaked: vault.totalStakedBalance,
			timestamp: indexUpdate.timestamp,
		}
	}

	/**
	 * Fetch all active client vaults from database
	 * TODO: Replace with actual database query
	 */
	private static async fetchActiveClientVaults(): Promise<ClientVaultData[]> {
		// This will be replaced with actual PostgreSQL query using SQLC
		// Query: SELECT id, client_id, current_index, total_staked_balance, strategies, chain, token_symbol
		//        FROM client_vaults
		//        WHERE is_active = true AND total_staked_balance > 0

		console.log("[IndexCron] TODO: Implement fetchActiveClientVaults() with PostgreSQL")

		// Mock data for testing
		return [
			{
				id: "vault_001",
				clientId: "client_abc",
				currentIndex: "1030000000000000000", // 1.03
				totalStakedBalance: "1000000", // $1M
				strategies: [
					{
						protocol: "AAVE",
						allocation: 60,
						targetAmount: 600000,
						currentAmount: 600000,
					},
					{
						protocol: "COMPOUND",
						allocation: 40,
						targetAmount: 400000,
						currentAmount: 400000,
					},
				],
				chain: "base-sepolia",
				tokenSymbol: "USDC",
			},
		]
	}

	/**
	 * Save index update to database
	 * Updates: current_index, last_index_update, cumulative_yield
	 */
	private static async saveIndexUpdate(params: {
		vaultId: string
		newIndex: string
		yieldGenerated: string
		growthRate: number
	}): Promise<void> {
		// This will be replaced with actual PostgreSQL update using SQLC
		// Query: UPDATE client_vaults
		//        SET current_index = $1,
		//            last_index_update = now(),
		//            cumulative_yield = cumulative_yield + $2
		//        WHERE id = $3

		console.log("[IndexCron] TODO: Implement saveIndexUpdate() with PostgreSQL")
		console.log("[IndexCron] Would update vault:", {
			vaultId: params.vaultId,
			newIndex: params.newIndex,
			yieldGenerated: params.yieldGenerated,
			growthRate: params.growthRate,
		})

		// Mock implementation
		return Promise.resolve()
	}

	/**
	 * Update APY performance metrics (7d, 30d rolling averages)
	 * Calculates from historical index updates
	 */
	private static async updateAPYMetrics(updates: VaultIndexUpdate[]): Promise<void> {
		console.log("[IndexCron] Updating APY performance metrics...")

		for (const update of updates) {
			try {
				// Calculate 7-day APY (annualized from last 7 daily updates)
				const apy7d = await this.calculateRollingAPY(update.vaultId, 7)

				// Calculate 30-day APY (annualized from last 30 daily updates)
				const apy30d = await this.calculateRollingAPY(update.vaultId, 30)

				// Save to database
				await this.saveAPYMetrics(update.vaultId, apy7d, apy30d)

				console.log(`[IndexCron] APY metrics for vault ${update.vaultId}:`, {
					apy7d: `${apy7d.toFixed(2)}%`,
					apy30d: `${apy30d.toFixed(2)}%`,
				})
			} catch (error) {
				console.error(`[IndexCron] Failed to update APY metrics for vault ${update.vaultId}:`, error)
			}
		}
	}

	/**
	 * Calculate rolling APY from historical index updates
	 * Formula: ((current_index / index_N_days_ago) - 1) * (365 / N) * 100
	 */
	private static async calculateRollingAPY(vaultId: string, days: number): Promise<number> {
		// This will be replaced with actual query to fetch historical index
		// Query: SELECT current_index FROM client_vaults WHERE id = $1
		//        AND last_index_update >= NOW() - INTERVAL '$2 days'
		//        ORDER BY last_index_update ASC LIMIT 1

		console.log(`[IndexCron] TODO: Implement calculateRollingAPY() for ${days} days`)

		// Mock: Assume 5% annual APY
		return 5.0
	}

	/**
	 * Save APY metrics to database
	 */
	private static async saveAPYMetrics(vaultId: string, apy7d: number, apy30d: number): Promise<void> {
		// Query: UPDATE client_vaults SET apy_7d = $1, apy_30d = $2 WHERE id = $3
		console.log("[IndexCron] TODO: Implement saveAPYMetrics() with PostgreSQL")
	}

	/**
	 * Get current vault index (used during withdrawals)
	 */
	static async getCurrentIndex(vaultId: string): Promise<string> {
		// Query: SELECT current_index FROM client_vaults WHERE id = $1
		console.log("[IndexCron] TODO: Implement getCurrentIndex()")
		return "1030000000000000000" // Mock
	}

	/**
	 * Update total staked balance after deposit/withdrawal
	 * This affects the next day's yield calculation
	 */
	static async updateTotalStakedBalance(vaultId: string, newBalance: string): Promise<void> {
		// Query: UPDATE client_vaults SET total_staked_balance = $1 WHERE id = $2
		console.log("[IndexCron] TODO: Implement updateTotalStakedBalance()")
		console.log("[IndexCron] Vault", vaultId, "new balance:", newBalance)
	}
}
