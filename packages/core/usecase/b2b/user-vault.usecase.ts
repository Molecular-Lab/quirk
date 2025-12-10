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
import type { GetEndUserVaultByClientRow } from "@proxify/sqlcgen"

export class B2BUserVaultUseCase {
	constructor(
		private readonly vaultRepository: VaultRepository,
		private readonly userRepository: UserRepository,
		private readonly auditRepository: AuditRepository,
		private readonly clientGrowthIndexService: ClientGrowthIndexService,
	) {}

	/**
	 * Get user's balance (SIMPLIFIED)
	 * Returns balance with index-based yield calculation
	 */
	async getUserBalance(userId: string, clientId: string): Promise<UserBalanceResponse | null> {
		// Get end_user record
		const endUser = await this.userRepository.getByClientAndUserId(clientId, userId)
		if (!endUser) {
			return null
		}

		// Get vault (simplified - one vault per user per client)
		const vault = await this.vaultRepository.getEndUserVaultByClient(endUser.id, clientId)

		if (!vault) {
			return null
		}

		// Get current client growth index
		const clientGrowthIndex = await this.clientGrowthIndexService.calculateClientGrowthIndex(clientId)

		// Audit the balance query
		await this.auditRepository.create({
			clientId,
			userId,
			actorType: "user",
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

		return this.mapToBalanceResponse(vault, userId, clientId, clientGrowthIndex)
	}

	/**
	 * Get user's portfolio (simplified - single vault per client)
	 */
	async getUserPortfolio(userId: string, clientId: string): Promise<UserPortfolioResponse | null> {
		const balance = await this.getUserBalance(userId, clientId)

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
	 * List all users with balances for a client (admin view)
	 */
	async listVaultUsers(clientId: string, limit = 100, offset = 0): Promise<UserBalanceResponse[]> {
		// Get all end users with balances
		const users = await this.userRepository.listByClient(clientId, limit, offset)

		// Get current client growth index
		const clientGrowthIndex = await this.clientGrowthIndexService.calculateClientGrowthIndex(clientId)

		const results: UserBalanceResponse[] = []

		for (const user of users) {
			const vault = await this.vaultRepository.getEndUserVaultByClient(user.id, clientId)
			if (vault) {
				results.push(this.mapToBalanceResponse(vault, user.userId, clientId, clientGrowthIndex))
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
