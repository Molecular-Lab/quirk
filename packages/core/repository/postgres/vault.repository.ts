/**
 * Vault Repository - Quirk Pattern
 *
 * ✅ Wraps SQLC-generated queries
 * ✅ BigNumber for precision
 * ✅ Index-based accounting
 */

import {
	// Client Vault Queries
	getClientVault,
	getClientVaultByToken,
	getClientVaultByTokenForUpdate,
	listClientVaults,
	listClientVaultsPendingStake,
	createClientVault,
	updateClientVaultIndex,
	updateClientVaultAPY,
	addPendingDepositToVault,
	movePendingToStaked,
	reduceStakedBalance,
	// Revenue Tracking (NEW)
	recordYieldDistribution,
	// End User Vault Queries (✅ SIMPLIFIED - no multi-chain)
	getEndUserVault,
	getEndUserVaultByClient,
	getEndUserVaultByClientForUpdate,
	listEndUserVaults,
	createEndUserVault,
	updateEndUserVaultDeposit,
	updateEndUserVaultWithdrawal,
	// Analytics (✅ SIMPLIFIED)
	getClientSummary,
	listTopUsersByDeposit,
	// Vault Strategies
	upsertVaultStrategy,
	getVaultStrategies,
	deleteAllVaultStrategies,
	// Types
	type GetClientVaultRow,
	type GetClientVaultByTokenRow,
	type GetClientVaultByTokenForUpdateRow,
	type ListClientVaultsRow,
	type ListClientVaultsPendingStakeRow,
	type CreateClientVaultArgs,
	type CreateClientVaultRow,
	type GetEndUserVaultRow,
	type GetEndUserVaultByClientRow,
	type GetEndUserVaultByClientForUpdateRow,
	type ListEndUserVaultsRow,
	type CreateEndUserVaultArgs,
	type CreateEndUserVaultRow,
	type GetClientSummaryRow,
	type ListTopUsersByDepositRow,
} from "@quirk/sqlcgen"
import BigNumber from "bignumber.js"
import { Sql } from "postgres"

// Import pure calculation utilities for share-based accounting
import {
	calculateShares,
	calculateValueFromShares,
	calculateWeightedIndex,
	calculateYield,
	calculateNewIndex as calculateNewIndexUtil,
	calculateSharesToBurn,
} from "../../utils/vault-accounting.utils"

export class VaultRepository {
	constructor(private readonly sql: Sql) { }

	// Client Vaults
	async getClientVaultById(id: string): Promise<GetClientVaultRow | null> {
		return await getClientVault(this.sql, { id })
	}

	/**
	 * Alias for getClientVaultById (for consistency with other repositories)
	 */
	async getById(id: string): Promise<GetClientVaultRow | null> {
		return await this.getClientVaultById(id)
	}

	async getClientVault(
		clientId: string,
		chain: string,
		tokenAddress: string,
		environment: "sandbox" | "production",
	): Promise<GetClientVaultByTokenRow | null> {
		return await getClientVaultByToken(this.sql, { clientId, chain, tokenAddress, environment })
	}

	async getClientVaultForUpdate(
		clientId: string,
		chain: string,
		tokenAddress: string,
		environment: "sandbox" | "production",
	): Promise<GetClientVaultByTokenForUpdateRow | null> {
		return await getClientVaultByTokenForUpdate(this.sql, { clientId, chain, tokenAddress, environment })
	}

	async listClientVaults(clientId: string): Promise<ListClientVaultsRow[]> {
		return await listClientVaults(this.sql, { clientId })
	}

	async listAllVaults(): Promise<any[]> {
		// Query all vaults for index update cron job
		return await this.sql`
			SELECT id, client_id, chain, token_address, token_symbol,
			       current_index, total_staked_balance, custodial_wallet_address,
			       environment, last_index_update, created_at
			FROM client_vaults
			WHERE is_active = true
			ORDER BY last_index_update ASC NULLS FIRST
		`
	}

	async listVaultsPendingStake(pendingDepositBalance = "0"): Promise<ListClientVaultsPendingStakeRow[]> {
		return await listClientVaultsPendingStake(this.sql, { pendingDepositBalance })
	}

	async createClientVault(params: CreateClientVaultArgs): Promise<CreateClientVaultRow | null> {
		return await createClientVault(this.sql, params)
	}

	async updateVaultIndex(
		id: string,
		currentIndex: string,
		cumulativeYield: string,
		totalStakedBalance: string,
	): Promise<void> {
		await updateClientVaultIndex(this.sql, {
			id,
			currentIndex,
			cumulativeYield,
			totalStakedBalance,
		})
	}

	async updateVaultAPY(id: string, apy7d: string | null, apy30d: string | null): Promise<void> {
		await updateClientVaultAPY(this.sql, { id, apy_7d: apy7d, apy_30d: apy30d })
	}

	async addPendingDeposit(id: string, pendingDepositBalance: string, totalShares: string): Promise<void> {
		await addPendingDepositToVault(this.sql, { id, pendingDepositBalance, totalShares })
	}

	async movePendingToStakedBalance(id: string, pendingDepositBalance: string): Promise<void> {
		await movePendingToStaked(this.sql, { id, pendingDepositBalance })
	}

	async reduceStaked(id: string, totalStakedBalance: string, totalShares: string): Promise<void> {
		await reduceStakedBalance(this.sql, { id, totalStakedBalance, totalShares })
	}

	// ==========================================
	// REVENUE TRACKING (NEW)
	// ==========================================

	/**
	 * Record yield distribution to vault revenue columns
	 * Updates: cumulative_yield and total_staked_balance
	 */
	async recordYieldDistributionToVault(
		vaultId: string,
		distribution: {
			clientRevenue: string
			platformRevenue: string
			enduserRevenue: string
			rawYield: string
		},
	): Promise<void> {
		// For now, we only update cumulative yield and staked balance
		// The revenue distribution logic would need a different SQLC function
		const totalRevenue = parseFloat(distribution.clientRevenue) +
			parseFloat(distribution.platformRevenue) +
			parseFloat(distribution.enduserRevenue);

		await recordYieldDistribution(this.sql, {
			id: vaultId,
			cumulativeYield: totalRevenue.toString(),
			totalStakedBalance: "0", // This should come from the vault's current staked balance
		})
	}

	// End User Vaults (✅ SIMPLIFIED - no multi-chain)
	async getEndUserVaultById(id: string): Promise<GetEndUserVaultRow | null> {
		return await getEndUserVault(this.sql, { id })
	}

	/**
	 * Get user vault for a specific client and environment
	 * User can have TWO vaults per client: one for sandbox, one for production
	 */
	async getEndUserVaultByClient(
		endUserId: string,
		clientId: string,
		environment: "sandbox" | "production",
	): Promise<GetEndUserVaultByClientRow | null> {
		return await getEndUserVaultByClient(this.sql, { endUserId, clientId, environment })
	}

	/**
	 * Get user vault for update (with row lock)
	 */
	async getEndUserVaultByClientForUpdate(
		endUserId: string,
		clientId: string,
		environment: "sandbox" | "production",
	): Promise<GetEndUserVaultByClientForUpdateRow | null> {
		return await getEndUserVaultByClientForUpdate(this.sql, { endUserId, clientId, environment })
	}

	/**
	 * List all vaults for a user
	 */
	async listEndUserVaults(endUserId: string): Promise<ListEndUserVaultsRow[]> {
		return await listEndUserVaults(this.sql, { endUserId })
	}

	/**
	 * Create user vault (lazy creation on first deposit)
	 */
	async createEndUserVault(params: CreateEndUserVaultArgs): Promise<CreateEndUserVaultRow | null> {
		return await createEndUserVault(this.sql, params)
	}

	/**
	 * Update vault on deposit (DCA support with weighted entry index)
	 */
	async updateVaultDeposit(id: string, depositAmount: string, newWeightedEntryIndex: string): Promise<void> {
		await updateEndUserVaultDeposit(this.sql, {
			id,
			totalDeposited: depositAmount,
			weightedEntryIndex: newWeightedEntryIndex,
		})
	}

	/**
	 * Update vault on withdrawal
	 */
	async updateVaultWithdrawal(id: string, withdrawalAmount: string): Promise<void> {
		await updateEndUserVaultWithdrawal(this.sql, {
			id,
			totalWithdrawn: withdrawalAmount,
		})
	}

	// Analytics (✅ SIMPLIFIED)
	async getClientSummary(clientId: string): Promise<GetClientSummaryRow | null> {
		return await getClientSummary(this.sql, { id: clientId })
	}

	async listTopUsersByDeposit(clientId: string, limit: string): Promise<ListTopUsersByDepositRow[]> {
		return await listTopUsersByDeposit(this.sql, { clientId, limit })
	}

	// ==========================================
	// SHARE ACCOUNTING (uses pure utility functions)
	// ==========================================

	/**
	 * Calculate shares to issue for a deposit
	 * Uses pure utility function for precision
	 */
	calculateSharesForDeposit(amount: string, currentIndex: string): string {
		return calculateShares(amount, currentIndex)
	}

	/**
	 * Calculate shares to burn for a withdrawal
	 */
	calculateSharesForWithdrawal(amount: string, currentIndex: string): string {
		return calculateSharesToBurn(amount, currentIndex)
	}

	/**
	 * Calculate current value of user's shares
	 */
	calculateValueFromUserShares(shares: string, currentIndex: string): string {
		return calculateValueFromShares(shares, currentIndex)
	}

	/**
	 * Calculate user's current value based on client growth index
	 * Formula: current_value = total_deposited × (client_growth_index / entry_index)
	 */
	calculateUserCurrentValue(totalDeposited: string, entryIndex: string, clientGrowthIndex: string): string {
		const deposited = new BigNumber(totalDeposited)
		const entry = new BigNumber(entryIndex)
		const current = new BigNumber(clientGrowthIndex)

		if (entry.isZero()) return "0"

		return deposited.multipliedBy(current).dividedBy(entry).decimalPlaces(18, BigNumber.ROUND_DOWN).toString()
	}

	/**
	 * Calculate user's yield earned
	 * Uses pure utility function
	 */
	calculateUserYield(totalDeposited: string, currentIndex: string, entryIndex: string): string {
		return calculateYield(totalDeposited, currentIndex, entryIndex)
	}

	/**
	 * Calculate weighted entry index for DCA deposits
	 * Uses pure utility function
	 */
	calculateWeightedEntryIndex(
		oldTotalDeposited: string,
		oldWeightedIndex: string,
		newDepositAmount: string,
		clientGrowthIndex: string,
	): string {
		return calculateWeightedIndex(oldTotalDeposited, oldWeightedIndex, newDepositAmount, clientGrowthIndex)
	}

	/**
	 * Calculate new vault index after yield accrual
	 * Formula: new_index = old_index × (staked + yield) / staked
	 */
	calculateNewIndex(oldIndex: string, totalStaked: string, yieldAmount: string): string {
		const index = new BigNumber(oldIndex)
		const staked = new BigNumber(totalStaked)
		const yield_ = new BigNumber(yieldAmount)
		if (staked.isZero()) return oldIndex
		return index.multipliedBy(staked.plus(yield_)).dividedBy(staked).integerValue(BigNumber.ROUND_DOWN).toString()
	}

	/**
	 * Calculate new index from daily yield percentage
	 * Used by cron job for daily index updates
	 */
	calculateNewIndexFromDailyYield(currentIndex: string, dailyYieldPercent: string): string {
		return calculateNewIndexUtil(currentIndex, dailyYieldPercent)
	}

	// Vault Strategies (JSONB)
	async updateVaultStrategies(
		clientVaultId: string,
		strategies: { category: string; target: number; isActive?: boolean }[],
	) {
		// Convert strategies to JSONB format
		const strategiesJson = JSON.stringify(strategies)

		await this.sql`
      UPDATE client_vaults
      SET strategies = ${strategiesJson}::jsonb,
          updated_at = now()
      WHERE id = ${clientVaultId}
    `
	}

	async getVaultWithStrategies(clientVaultId: string) {
		const [vault] = await this.sql<(GetClientVaultRow & { strategies: any })[]>`
      SELECT * FROM client_vaults
      WHERE id = ${clientVaultId}
    `
		return vault || null
	}

	// Legacy methods (deprecated after migration to JSONB)
	async upsertVaultStrategy(clientVaultId: string, category: string, targetPercent: number) {
		return await upsertVaultStrategy(this.sql, {
			clientVaultId,
			category,
			targetPercent: targetPercent.toString(),
		})
	}

	async getVaultStrategies(clientVaultId: string) {
		return await getVaultStrategies(this.sql, { clientVaultId })
	}

	async deleteAllVaultStrategies(clientVaultId: string) {
		await deleteAllVaultStrategies(this.sql, { clientVaultId })
	}
}
