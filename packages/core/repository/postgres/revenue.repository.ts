/**
 * Revenue Distribution Repository
 * Handles revenue split tracking and fee distribution operations
 */

import type { Sql } from "postgres"
import { VError } from "verror"
import {
	createRevenueDistribution,
	getRevenueDistributionById,
	getRevenueDistributionByWithdrawal,
	listRevenueDistributionsByVault,
	listDeferredFees,
	listDeferredFeesByClient,
	markFeesAsDeducted,
	getClientRevenueStats,
	getPlatformRevenueStats,
	createVaultIndexSnapshot,
	getLatestVaultIndex,
	getVaultIndexHistory,
	getVaultIndexAtTimestamp,
	calculateRollingAPY,
	deleteOldIndexHistory,
	type CreateRevenueDistributionRow,
	type GetRevenueDistributionByIdRow,
	type GetRevenueDistributionByWithdrawalRow,
	type ListRevenueDistributionsByVaultRow,
	type ListDeferredFeesRow,
	type ListDeferredFeesByClientRow,
	type GetClientRevenueStatsRow,
	type GetPlatformRevenueStatsRow,
	type CreateVaultIndexSnapshotRow,
	type GetLatestVaultIndexRow,
	type GetVaultIndexHistoryRow,
	type GetVaultIndexAtTimestampRow,
	type CalculateRollingAPYRow,
} from "@proxify/sqlcgen"

export interface CreateRevenueDistributionParams {
	withdrawalTransactionId: string | null
	vaultId: string
	rawYield: string
	enduserRevenue: string
	clientRevenue: string
	platformRevenue: string
	clientRevenuePercent: string
	platformFeePercent: string
	isDeducted: boolean
}

export interface RevenueStatsParams {
	clientId: string
	startDate: Date
	endDate: Date
}

export interface PlatformRevenueStatsParams {
	startDate: Date
	endDate: Date
}

export interface CreateIndexSnapshotParams {
	vaultId: string
	indexValue: string
	dailyYield: string | null
	dailyApy: string | null
}

export class RevenueRepository {
	constructor(private readonly sql: Sql) {}

	// ==========================================
	// REVENUE DISTRIBUTION OPERATIONS
	// ==========================================

	/**
	 * Record a revenue distribution (fee split)
	 */
	async createDistribution(params: CreateRevenueDistributionParams): Promise<CreateRevenueDistributionRow | null> {
		try {
			return await createRevenueDistribution(this.sql, {
				withdrawalTransactionId: params.withdrawalTransactionId,
				vaultId: params.vaultId,
				rawYield: params.rawYield,
				enduserRevenue: params.enduserRevenue,
				clientRevenue: params.clientRevenue,
				platformRevenue: params.platformRevenue,
				clientRevenuePercent: params.clientRevenuePercent,
				platformFeePercent: params.platformFeePercent,
				isDeducted: params.isDeducted,
			})
		} catch (error) {
			throw new VError(error as Error, "Failed to create revenue distribution")
		}
	}

	/**
	 * Get revenue distribution by ID
	 */
	async getById(id: string): Promise<GetRevenueDistributionByIdRow | null> {
		try {
			return await getRevenueDistributionById(this.sql, { id })
		} catch (error) {
			throw new VError(error as Error, `Failed to get revenue distribution: ${id}`)
		}
	}

	/**
	 * Get revenue distribution by withdrawal transaction ID
	 */
	async getByWithdrawal(withdrawalTransactionId: string): Promise<GetRevenueDistributionByWithdrawalRow | null> {
		try {
			return await getRevenueDistributionByWithdrawal(this.sql, { withdrawalTransactionId })
		} catch (error) {
			throw new VError(error as Error, `Failed to get revenue distribution for withdrawal: ${withdrawalTransactionId}`)
		}
	}

	/**
	 * List revenue distributions for a vault
	 */
	async listByVault(vaultId: string, limit = 100, offset = 0): Promise<ListRevenueDistributionsByVaultRow[]> {
		try {
			return await listRevenueDistributionsByVault(this.sql, {
				vaultId,
				limit: limit.toString(),
				offset: offset.toString(),
			})
		} catch (error) {
			throw new VError(error as Error, `Failed to list revenue distributions for vault: ${vaultId}`)
		}
	}

	/**
	 * List all deferred fees (not yet deducted)
	 */
	async listDeferredFees(limit = 100, offset = 0): Promise<ListDeferredFeesRow[]> {
		try {
			return await listDeferredFees(this.sql, { limit: limit.toString(), offset: offset.toString() })
		} catch (error) {
			throw new VError(error as Error, "Failed to list deferred fees")
		}
	}

	/**
	 * List deferred fees for a specific client
	 */
	async listDeferredFeesByClient(clientId: string): Promise<ListDeferredFeesByClientRow[]> {
		try {
			return await listDeferredFeesByClient(this.sql, { clientId })
		} catch (error) {
			throw new VError(error as Error, `Failed to list deferred fees for client: ${clientId}`)
		}
	}

	/**
	 * Mark fees as deducted (for batch settlement)
	 */
	async markAsDeducted(id: string): Promise<void> {
		try {
			await markFeesAsDeducted(this.sql, { id })
		} catch (error) {
			throw new VError(error as Error, `Failed to mark fees as deducted: ${id}`)
		}
	}

	/**
	 * Get client revenue statistics
	 */
	async getClientStats(params: RevenueStatsParams): Promise<GetClientRevenueStatsRow | null> {
		try {
			return await getClientRevenueStats(this.sql, {
				clientId: params.clientId,
				startDate: params.startDate,
				endDate: params.endDate,
			})
		} catch (error) {
			throw new VError(error as Error, `Failed to get client revenue stats: ${params.clientId}`)
		}
	}

	/**
	 * Get platform-wide revenue statistics
	 */
	async getPlatformStats(params: PlatformRevenueStatsParams): Promise<GetPlatformRevenueStatsRow | null> {
		try {
			return await getPlatformRevenueStats(this.sql, {
				startDate: params.startDate,
				endDate: params.endDate,
			})
		} catch (error) {
			throw new VError(error as Error, "Failed to get platform revenue stats")
		}
	}

	// ==========================================
	// VAULT INDEX HISTORY OPERATIONS
	// ==========================================

	/**
	 * Create a vault index snapshot
	 */
	async createIndexSnapshot(params: CreateIndexSnapshotParams): Promise<CreateVaultIndexSnapshotRow | null> {
		try {
			return await createVaultIndexSnapshot(this.sql, {
				vaultId: params.vaultId,
				indexValue: params.indexValue,
				dailyYield: params.dailyYield,
				dailyApy: params.dailyApy,
			})
		} catch (error) {
			throw new VError(error as Error, `Failed to create index snapshot for vault: ${params.vaultId}`)
		}
	}

	/**
	 * Get latest vault index snapshot
	 */
	async getLatestIndex(vaultId: string): Promise<GetLatestVaultIndexRow | null> {
		try {
			return await getLatestVaultIndex(this.sql, { vaultId })
		} catch (error) {
			throw new VError(error as Error, `Failed to get latest index for vault: ${vaultId}`)
		}
	}

	/**
	 * Get vault index history in date range
	 */
	async getIndexHistory(vaultId: string, startDate: Date, endDate: Date): Promise<GetVaultIndexHistoryRow[]> {
		try {
			return await getVaultIndexHistory(this.sql, {
				vaultId,
				startDate,
				endDate,
			})
		} catch (error) {
			throw new VError(error as Error, `Failed to get index history for vault: ${vaultId}`)
		}
	}

	/**
	 * Get vault index at specific timestamp
	 */
	async getIndexAtTimestamp(vaultId: string, timestamp: Date): Promise<GetVaultIndexAtTimestampRow | null> {
		try {
			return await getVaultIndexAtTimestamp(this.sql, {
				vaultId,
				timestamp,
			})
		} catch (error) {
			throw new VError(error as Error, `Failed to get index at timestamp for vault: ${vaultId}`)
		}
	}

	/**
	 * Calculate rolling APY for vault (7 days or 30 days)
	 */
	async calculateRollingAPY(vaultId: string, days: number): Promise<CalculateRollingAPYRow | null> {
		try {
			return await calculateRollingAPY(this.sql, {
				vaultId,
				days: days.toString(),
			})
		} catch (error) {
			throw new VError(error as Error, `Failed to calculate ${days}d APY for vault: ${vaultId}`)
		}
	}

	/**
	 * Delete old index history (cleanup/retention)
	 */
	async deleteOldHistory(): Promise<void> {
		try {
			await deleteOldIndexHistory(this.sql)
		} catch (error) {
			throw new VError(error as Error, "Failed to delete old index history")
		}
	}
}
