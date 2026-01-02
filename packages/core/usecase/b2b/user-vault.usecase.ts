/**
 * B2B User Vault Service
 * Manages end-user balance queries with index-based calculation
 *
 * SIMPLIFIED ARCHITECTURE (Nov 2025):
 * - ONE vault per user per client (no chain/token)
 * - Fiat-based tracking with weightedEntryIndex
 * - FORMULA: effective_balance = totalDeposited × (clientGrowthIndex / weightedEntryIndex)
 * - FORMULA: yield_earned = effective_balance - total_deposited
 */

import BigNumber from "bignumber.js"

import { ClientGrowthIndexService } from "../../service/client-growth-index.service"

import type { UserBalanceResponse, UserPortfolioResponse } from "../../dto/b2b"
import type { AuditRepository, UserRepository, VaultRepository } from "../../repository"
import type { GetEndUserVaultByClientRow } from "@quirk/sqlcgen"

export class B2BUserVaultUseCase {
	constructor(
		private readonly vaultRepository: VaultRepository,
		private readonly userRepository: UserRepository,
		private readonly auditRepository: AuditRepository,
		private readonly clientGrowthIndexService: ClientGrowthIndexService,
	) {}

	/**
	 * Get user's balance (with environment support)
	 * Returns balance with index-based yield calculation
	 */
	async getUserBalance(userId: string, clientId: string, environment: "sandbox" | "production" = "sandbox"): Promise<UserBalanceResponse | null> {

		// Get end_user record - try by UUID first, then by client_user_id
		let endUser = null

		// Check if userId looks like a UUID (simple check)
		const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)

		if (isUuid) {
			try {
				endUser = await this.userRepository.getById(userId)

			} catch (error) {
				// UUID lookup failed (invalid UUID format), will try clientUserId lookup

			}
		}

		// If not found by UUID, try by client_user_id
		if (!endUser) {
			endUser = await this.userRepository.getByClientAndUserId(clientId, userId)

		}

		if (!endUser) {

			return null
		}

		// Verify user belongs to this client
		if (endUser.clientId !== clientId) {

			return null
		}

		// Get vault for specific environment
		const vault = await this.vaultRepository.getEndUserVaultByClient(endUser.id, clientId, environment)

		// ✅ Return zero balance for users with no deposits yet (user exists but no vault)
		if (!vault) {
			return {
				userId,
				clientId,
				environment,
				totalDeposited: "0",
				totalWithdrawn: "0",
				effectiveBalance: "0",
				yieldEarned: "0",
				weightedEntryIndex: "1.0",
				isActive: endUser.status === "active",
				lastDepositAt: null,
				lastWithdrawalAt: null,
			}
		}

		// Get current client growth index
		const clientGrowthIndex = await this.clientGrowthIndexService.calculateClientGrowthIndex(clientId)

		// Audit the balance query
		await this.auditRepository.create({
			clientId,
			userId,
			actorType: "end_user",
			action: "balance_query",
			resourceType: "end_user_vault",
			resourceId: vault.id,
			description: "User balance query",
			metadata: {
				totalDeposited: vault.totalDeposited,
				weightedEntryIndex: vault.weightedEntryIndex,
				clientGrowthIndex,
			},
			ipAddress: null,
			userAgent: null,
		})

		return this.mapToBalanceResponse(vault, userId, clientId, clientGrowthIndex, environment)
	}

	/**
	 * Get user's portfolio (single vault per client per environment)
	 */
	async getUserPortfolio(userId: string, clientId: string, environment: "sandbox" | "production" = "sandbox"): Promise<UserPortfolioResponse | null> {
		const balance = await this.getUserBalance(userId, clientId, environment)

		if (!balance) {
			return {
				userId,
				clientId,
				totalDeposited: "0",
				totalEffectiveBalance: "0",
				totalYieldEarned: "0",
				vault: null,
			}
		}

		return {
			userId,
			clientId,
			totalDeposited: balance.totalDeposited,
			totalEffectiveBalance: balance.effectiveBalance,
			totalYieldEarned: balance.yieldEarned,
			vault: balance,
		}
	}

	/**
	 * List all users with balances for a client (admin view, per environment)
	 */
	async listVaultUsers(clientId: string, environment: "sandbox" | "production" = "sandbox", limit = 100, offset = 0): Promise<UserBalanceResponse[]> {
		// Get all end users with balances
		const users = await this.userRepository.listByClient(clientId, limit, offset)

		// Get current client growth index
		const clientGrowthIndex = await this.clientGrowthIndexService.calculateClientGrowthIndex(clientId)

		const results: UserBalanceResponse[] = []

		for (const user of users) {
			const vault = await this.vaultRepository.getEndUserVaultByClient(user.id, clientId, environment)
			if (vault) {
				results.push(this.mapToBalanceResponse(vault, user.userId, clientId, clientGrowthIndex, environment))
			}
		}

		return results
	}

	/**
	 * Calculate effective balance
	 * FORMULA: effective_balance = totalDeposited × (clientGrowthIndex / weightedEntryIndex)
	 */
	calculateEffectiveBalance(totalDeposited: string, weightedEntryIndex: string, clientGrowthIndex: string): string {
		const deposited = new BigNumber(totalDeposited)
		const entryIndex = new BigNumber(weightedEntryIndex)
		const growthIndex = new BigNumber(clientGrowthIndex)

		if (entryIndex.isZero()) {
			return deposited.toString()
		}

		// effective_balance = totalDeposited × (clientGrowthIndex / weightedEntryIndex)
		const effectiveBalance = deposited
			.multipliedBy(growthIndex)
			.dividedBy(entryIndex)
			.integerValue(BigNumber.ROUND_DOWN)

		return effectiveBalance.toString()
	}

	/**
	 * Calculate yield earned
	 * FORMULA: yield_earned = effective_balance - total_deposited
	 */
	calculateYieldEarned(effectiveBalance: string, totalDeposited: string): string {
		const effective = new BigNumber(effectiveBalance)
		const deposited = new BigNumber(totalDeposited)

		const yieldEarned = effective.minus(deposited)
		return yieldEarned.isGreaterThan(0) ? yieldEarned.toString() : "0"
	}

	/**
	 * Map database row to response
	 */
	private mapToBalanceResponse(
		vault: GetEndUserVaultByClientRow,
		userId: string,
		clientId: string,
		clientGrowthIndex: string,
		environment?: "sandbox" | "production",
	): UserBalanceResponse {
		const effectiveBalance = this.calculateEffectiveBalance(
			vault.totalDeposited,
			vault.weightedEntryIndex,
			clientGrowthIndex,
		)
		const yieldEarned = this.calculateYieldEarned(effectiveBalance, vault.totalDeposited)

		return {
			userId,
			clientId,
			environment,
			totalDeposited: vault.totalDeposited,
			totalWithdrawn: vault.totalWithdrawn,
			effectiveBalance,
			yieldEarned,
			weightedEntryIndex: vault.weightedEntryIndex,
			isActive: vault.isActive,
			lastDepositAt: vault.lastDepositAt,
			lastWithdrawalAt: vault.lastWithdrawalAt,
		}
	}
}
