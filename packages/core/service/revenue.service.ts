/**
 * Revenue Service
 * Handles MRR/ARR calculations and yield distribution logic
 */

import VError from "verror"

import type { ClientRepository } from "../repository/postgres/client.repository"
import type { VaultRepository } from "../repository/postgres/vault.repository"

// Simple logger for service layer
const Logger = {
	info: (msg: string, meta?: any) => {
		console.log(`[RevenueService] ${msg}`, meta || "")
	},
	error: (msg: string, meta?: any) => {
		console.error(`[RevenueService] ${msg}`, meta || "")
	},
}

export interface RevenueServiceDeps {
	clientRepository: ClientRepository
	vaultRepository: VaultRepository
}

export interface YieldDistribution {
	rawYield: string
	clientRevenue: string
	platformRevenue: string
	enduserRevenue: string
	clientRevenuePercent: string
	platformFeePercent: string
}

export interface MRRCalculationResult {
	clientId: string
	productId: string
	earningBalance: string
	avgApy30d: string
	clientRevenuePercent: string
	monthlyRecurringRevenue: string
	annualRunRate: string
}

export class RevenueService {
	constructor(private readonly deps: RevenueServiceDeps) {}

	/**
	 * Calculate MRR for a specific client
	 * Formula: MRR = (Earning Balance × APY × Client Revenue Share %) / 12
	 */
	async calculateMRR(clientId: string): Promise<MRRCalculationResult> {
		try {
			// Get client revenue summary (includes fee config)
			const revenueSummary = await this.deps.clientRepository.getRevenueSummary(clientId)
			if (!revenueSummary) {
				throw new Error(`Client not found: ${clientId}`)
			}

			// Get total balances (includes earning balance)
			const balances = await this.deps.clientRepository.getTotalBalances(clientId)
			if (!balances) {
				throw new Error(`No balances found for client: ${clientId}`)
			}

			const earningBalance = parseFloat(balances.totalEarningBalance || "0")
			const clientRevenuePercent = parseFloat(revenueSummary.clientRevenueSharePercent)

			// Get average APY from all active vaults
			// TODO: This should query actual vault APY metrics
			// For now, using a placeholder of 5% APY
			const avgApy30d = 5.0 // This should come from vault.apy_30d average

			// Calculate MRR using repository method
			const mrr = this.deps.clientRepository.calculateMRR(earningBalance, avgApy30d, clientRevenuePercent)

			// Update client's MRR in database
			await this.deps.clientRepository.updateMRR(clientId, mrr.toFixed(6))

			Logger.info("MRR calculated successfully", {
				clientId,
				productId: revenueSummary.productId,
				earningBalance: earningBalance.toFixed(6),
				avgApy30d: avgApy30d.toFixed(2),
				clientRevenuePercent: clientRevenuePercent.toFixed(2),
				mrr: mrr.toFixed(6),
				arr: (mrr * 12).toFixed(6),
			})

			return {
				clientId,
				productId: revenueSummary.productId,
				earningBalance: earningBalance.toFixed(6),
				avgApy30d: avgApy30d.toFixed(2),
				clientRevenuePercent: clientRevenuePercent.toFixed(2),
				monthlyRecurringRevenue: mrr.toFixed(6),
				annualRunRate: (mrr * 12).toFixed(6),
			}
		} catch (error) {
			Logger.error("Failed to calculate MRR", { err: error, clientId })
			throw new VError(error as Error, "Failed to calculate MRR")
		}
	}

	/**
	 * Calculate ARR (Annual Run Rate) for a client
	 * ARR = MRR × 12
	 */
	async calculateARR(clientId: string): Promise<string> {
		try {
			const result = await this.calculateMRR(clientId)
			return result.annualRunRate
		} catch (error) {
			Logger.error("Failed to calculate ARR", { err: error, clientId })
			throw new VError(error as Error, "Failed to calculate ARR")
		}
	}

	/**
	 * Get total cumulative revenue for a client
	 * Returns all revenue metrics including MRR, ARR, and cumulative earnings
	 */
	async getTotalRevenue(clientId: string): Promise<{
		monthlyRecurringRevenue: string
		annualRunRate: string
		totalClientRevenue: string
		totalPlatformRevenue: string
		totalEnduserRevenue: string
		totalEarningBalance: string
	}> {
		try {
			const [revenueSummary, balances] = await Promise.all([
				this.deps.clientRepository.getRevenueSummary(clientId),
				this.deps.clientRepository.getTotalBalances(clientId),
			])

			if (!revenueSummary || !balances) {
				throw new Error(`Client not found: ${clientId}`)
			}

			return {
				monthlyRecurringRevenue: revenueSummary.monthlyRecurringRevenue || "0",
				annualRunRate: revenueSummary.annualRunRate || "0",
				totalClientRevenue: "0", // TODO: Fix field name in database query
				totalPlatformRevenue: "0", // TODO: Fix field name in database query
				totalEnduserRevenue: "0", // TODO: Fix field name in database query
				totalEarningBalance: balances.totalEarningBalance || "0",
			}
		} catch (error) {
			Logger.error("Failed to get total revenue", { err: error, clientId })
			throw new VError(error as Error, "Failed to get total revenue")
		}
	}

	/**
	 * Distribute yield from DeFi harvest across 3 parties
	 * Split: Client Revenue + Platform Fee + End-user Revenue = 100%
	 *
	 * @param vaultId - Vault that harvested the yield
	 * @param rawYield - Total yield harvested from DeFi (before split)
	 * @returns Distribution breakdown
	 */
	async distributeYield(vaultId: string, rawYield: string): Promise<YieldDistribution> {
		try {
			const rawYieldNum = parseFloat(rawYield)
			if (rawYieldNum <= 0) {
				throw new Error("Raw yield must be positive")
			}

			// Get vault info to find client
			const vault = await this.deps.vaultRepository.getById(vaultId)
			if (!vault) {
				throw new Error(`Vault not found: ${vaultId}`)
			}

			// Get client fee configuration
			const client = await this.deps.clientRepository.getById(vault.clientId)
			if (!client) {
				throw new Error(`Client not found: ${vault.clientId}`)
			}

			const clientRevenuePercent = parseFloat(client.clientRevenueSharePercent)
			const platformFeePercent = parseFloat(client.platformFeePercent)
			const enduserRevenuePercent = 100 - clientRevenuePercent - platformFeePercent

			// Calculate splits
			const clientRevenue = (rawYieldNum * clientRevenuePercent) / 100
			const platformRevenue = (rawYieldNum * platformFeePercent) / 100
			const enduserRevenue = (rawYieldNum * enduserRevenuePercent) / 100

			// Verify splits sum to 100%
			const total = clientRevenue + platformRevenue + enduserRevenue
			const tolerance = 0.000001 // Allow small floating point errors
			if (Math.abs(total - rawYieldNum) > tolerance) {
				throw new Error(`Revenue split validation failed: ${total.toFixed(6)} !== ${rawYield}`)
			}

			// Record yield distribution in database
			await this.deps.vaultRepository.recordYieldDistributionToVault(vaultId, {
				clientRevenue: clientRevenue.toFixed(18),
				platformRevenue: platformRevenue.toFixed(18),
				enduserRevenue: enduserRevenue.toFixed(18),
				rawYield: rawYield,
			})

			Logger.info("Yield distributed successfully", {
				vaultId,
				clientId: vault.clientId,
				rawYield: rawYieldNum.toFixed(6),
				clientRevenue: clientRevenue.toFixed(6),
				platformRevenue: platformRevenue.toFixed(6),
				enduserRevenue: enduserRevenue.toFixed(6),
				clientPercent: clientRevenuePercent.toFixed(2),
				platformPercent: platformFeePercent.toFixed(2),
				enduserPercent: enduserRevenuePercent.toFixed(2),
			})

			return {
				rawYield: rawYieldNum.toFixed(18),
				clientRevenue: clientRevenue.toFixed(18),
				platformRevenue: platformRevenue.toFixed(18),
				enduserRevenue: enduserRevenue.toFixed(18),
				clientRevenuePercent: clientRevenuePercent.toFixed(2),
				platformFeePercent: platformFeePercent.toFixed(2),
			}
		} catch (error) {
			Logger.error("Failed to distribute yield", { err: error, vaultId, rawYield })
			throw new VError(error as Error, "Failed to distribute yield")
		}
	}

	/**
	 * Batch calculate MRR for all active clients
	 * Should be run periodically (e.g., daily cron job)
	 *
	 * @returns Array of MRR calculation results
	 */
	async batchCalculateMRR(): Promise<MRRCalculationResult[]> {
		try {
			Logger.info("Starting batch MRR calculation for all clients")

			// Get all clients eligible for MRR calculation
			const clients = await this.deps.clientRepository.listClientsForMRRCalculation()

			if (clients.length === 0) {
				Logger.info("No clients found for MRR calculation")
				return []
			}

			Logger.info(`Found ${clients.length} clients for MRR calculation`)

			const results: MRRCalculationResult[] = []
			const errors: { clientId: string; error: string }[] = []

			// Process each client sequentially to avoid DB contention
			for (const client of clients) {
				try {
					const result = await this.calculateMRR(client.id)
					results.push(result)
				} catch (error) {
					const errorMessage = error instanceof Error ? error.message : "Unknown error"
					Logger.error("Failed to calculate MRR for client", {
						clientId: client.id,
						productId: client.productId,
						error: errorMessage,
					})
					errors.push({
						clientId: client.id,
						error: errorMessage,
					})
				}
			}

			Logger.info("Batch MRR calculation completed", {
				total: clients.length,
				successful: results.length,
				failed: errors.length,
				errors: errors.length > 0 ? errors : undefined,
			})

			return results
		} catch (error) {
			Logger.error("Batch MRR calculation failed", { err: error })
			throw new VError(error as Error, "Batch MRR calculation failed")
		}
	}

	/**
	 * Get revenue metrics summary for dashboard
	 * Combines MRR, ARR, cumulative revenue, and earning balance
	 * @param environment - Optional environment filter (sandbox/production) - TODO: Add filtering
	 */
	async getDashboardRevenueSummary(clientId: string, environment?: "sandbox" | "production"): Promise<{
		monthlyRecurringRevenue: string
		annualRunRate: string
		totalClientRevenue: string
		totalPlatformRevenue: string
		totalEnduserRevenue: string
		totalEarningBalance: string
		clientRevenuePercent: string
		platformFeePercent: string
		enduserFeePercent: string
		lastCalculatedAt: string | null
	}> {
		try {
			// TODO: Update queries to filter by environment when provided
			console.log(`[RevenueService] getDashboardRevenueSummary - environment filter: ${environment || "all"}`)
			const [revenue, revenueSummary] = await Promise.all([
				this.getTotalRevenue(clientId),
				this.deps.clientRepository.getRevenueSummary(clientId),
			])

			if (!revenueSummary) {
				throw new Error(`Client not found: ${clientId}`)
			}

			const clientRevenuePercent = parseFloat(revenueSummary.clientRevenueSharePercent)
			const platformFeePercent = parseFloat(revenueSummary.platformFeePercent)
			const enduserFeePercent = 100 - clientRevenuePercent - platformFeePercent

			return {
				monthlyRecurringRevenue: revenue.monthlyRecurringRevenue,
				annualRunRate: revenue.annualRunRate,
				totalClientRevenue: revenue.totalClientRevenue,
				totalPlatformRevenue: revenue.totalPlatformRevenue,
				totalEnduserRevenue: revenue.totalEnduserRevenue,
				totalEarningBalance: revenue.totalEarningBalance,
				clientRevenuePercent: clientRevenuePercent.toFixed(2),
				platformFeePercent: platformFeePercent.toFixed(2),
				enduserFeePercent: enduserFeePercent.toFixed(2),
				lastCalculatedAt: revenueSummary.lastMrrCalculationAt?.toISOString() || null,
			}
		} catch (error) {
			Logger.error("Failed to get dashboard revenue summary", { err: error, clientId })
			throw new VError(error as Error, "Failed to get dashboard revenue summary")
		}
	}
}
