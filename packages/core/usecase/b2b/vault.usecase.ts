/**
 * B2B Vault UseCase
 * Manages client vaults and strategy configuration (FLOW 2)
 */

import type { CreateVaultRequest } from "../../dto/b2b"
import type { AuditRepository } from "../../repository/postgres/audit.repository"
import type { VaultRepository } from "../../repository/postgres/vault.repository"
import type {
	GetClientVaultByTokenRow,
	GetClientVaultRow,
	ListClientVaultsPendingStakeRow,
	ListClientVaultsRow,
} from "@proxify/sqlcgen"

/**
 * B2B Vault UseCase
 * Manages client vaults with index-based accounting
 */
export class B2BVaultUseCase {
	constructor(
		private readonly vaultRepository: VaultRepository,
		private readonly auditRepository: AuditRepository,
	) {}

	/**
	 * Get or create client vault for a specific chain/token
	 * Returns existing vault or creates new one with index = 1.0e18
	 */
	async getOrCreateVault(request: CreateVaultRequest): Promise<GetClientVaultByTokenRow> {
		// Check if vault exists
		const existing = await this.vaultRepository.getClientVault(request.clientId, request.chain, request.tokenAddress)

		if (existing) {
			return existing
		}

		// Create new vault with initial index = 1.0e18
		const vault = await this.vaultRepository.createClientVault({
			clientId: request.clientId,
			chain: request.chain,
			tokenAddress: request.tokenAddress,
			tokenSymbol: request.tokenSymbol,
			totalShares: "0",
			currentIndex: "1000000000000000000", // 1.0e18
			pendingDepositBalance: "0",
			totalStakedBalance: "0",
			cumulativeYield: "0",
		})

		if (!vault) {
			throw new Error("Failed to create vault")
		}

		// Audit log
		await this.auditRepository.create({
			clientId: request.clientId,
			userId: null,
			actorType: "system",
			action: "vault_created",
			resourceType: "client_vault",
			resourceId: vault.id,
			description: `Vault created: ${request.chain}/${request.tokenSymbol}`,
			metadata: {
				chain: request.chain,
				tokenAddress: request.tokenAddress,
				tokenSymbol: request.tokenSymbol,
				currentIndex: "1.0e18",
			},
			ipAddress: null,
			userAgent: null,
		})

		return vault
	}

	/**
	 * Get vault by ID
	 */
	async getVaultById(vaultId: string): Promise<GetClientVaultRow | null> {
		return await this.vaultRepository.getClientVaultById(vaultId)
	}

	/**
	 * Get vault by client, chain, and token
	 */
	async getVaultByToken(
		clientId: string,
		chain: string,
		tokenAddress: string,
	): Promise<GetClientVaultByTokenRow | null> {
		return await this.vaultRepository.getClientVault(clientId, chain, tokenAddress)
	}

	/**
	 * List all vaults for a client
	 */
	async listClientVaults(clientId: string): Promise<ListClientVaultsRow[]> {
		return await this.vaultRepository.listClientVaults(clientId)
	}

	/**
	 * Update vault index after yield accrual (FLOW 7)
	 * Formula: new_index = old_index * (1 + yield_earned / total_staked)
	 */
	async updateIndexWithYield(vaultId: string, yieldEarned: string): Promise<void> {
		const vault = await this.vaultRepository.getClientVaultById(vaultId)

		if (!vault) {
			throw new Error("Vault not found")
		}

		// Calculate new index
		const oldIndex = BigInt(vault.currentIndex)
		const totalStaked = parseFloat(vault.totalStakedBalance)
		const yieldAmount = parseFloat(yieldEarned)

		if (totalStaked === 0) {
			throw new Error("Cannot update index: no staked balance")
		}

		// growth_rate = yield / total_staked
		const growthRate = yieldAmount / totalStaked

		// new_index = old_index * (1 + growth_rate)
		const newIndex = (oldIndex * BigInt(Math.floor((1 + growthRate) * 1e18))) / BigInt(1e18)

		// Calculate new cumulative yield and total staked
		const newCumulativeYield = (parseFloat(vault.cumulativeYield) + yieldAmount).toString()
		const newTotalStaked = (totalStaked + yieldAmount).toString()

		await this.vaultRepository.updateVaultIndex(vaultId, newIndex.toString(), newCumulativeYield, newTotalStaked)

		// Audit log
		await this.auditRepository.create({
			clientId: vault.clientId,
			userId: null,
			actorType: "system",
			action: "vault_index_updated",
			resourceType: "client_vault",
			resourceId: vaultId,
			description: `Index updated: ${vault.currentIndex} → ${newIndex.toString()}`,
			metadata: {
				oldIndex: vault.currentIndex,
				newIndex: newIndex.toString(),
				yieldEarned,
				totalStaked: vault.totalStakedBalance,
				growthRate: growthRate.toString(),
			},
			ipAddress: null,
			userAgent: null,
		})
	}

	/**
	 * Get vaults ready for staking (pending balance >= threshold)
	 */
	async getVaultsReadyForStaking(minAmount = "10000"): Promise<ListClientVaultsPendingStakeRow[]> {
		return await this.vaultRepository.listVaultsPendingStake(minAmount)
	}

	/**
	 * Move funds from pending to staked (after DeFi deployment)
	 */
	async markFundsAsStaked(vaultId: string, amount: string): Promise<void> {
		await this.vaultRepository.movePendingToStakedBalance(vaultId, amount)

		const vault = await this.vaultRepository.getClientVaultById(vaultId)
		if (!vault) return

		// Audit log
		await this.auditRepository.create({
			clientId: vault.clientId,
			userId: null,
			actorType: "system",
			action: "funds_staked",
			resourceType: "client_vault",
			resourceId: vaultId,
			description: `Funds staked: ${amount}`,
			metadata: { amount },
			ipAddress: null,
			userAgent: null,
		})
	}

	/**
	 * Get total value locked (TVL) across all vaults
	 */
	async getTotalValueLocked(): Promise<{ chain: string; token: string; tvl: string }[]> {
		// This would aggregate across all vaults
		// Implementation depends on your aggregation needs
		return []
	}

	/**
	 * Get or create end-user vault (SIMPLIFIED)
	 * Called when user makes first deposit
	 *
	 * SIMPLIFIED ARCHITECTURE: ONE vault per user per client
	 * - No chain/token fields
	 * - Uses weightedEntryIndex for DCA tracking
	 */
	async getOrCreateEndUserVault(
		endUserId: string,
		clientId: string,
	): Promise<{ id: string; weightedEntryIndex: string; totalDeposited: string }> {
		// Check if end-user vault exists
		const existing = await this.vaultRepository.getEndUserVaultByClient(endUserId, clientId)

		if (existing) {
			return {
				id: existing.id,
				weightedEntryIndex: existing.weightedEntryIndex,
				totalDeposited: existing.totalDeposited,
			}
		}

		// Create new end-user vault
		const vault = await this.vaultRepository.createEndUserVault({
			endUserId,
			clientId,
			totalDeposited: "0",
			weightedEntryIndex: "0",
		})

		if (!vault) {
			throw new Error("Failed to create end-user vault")
		}

		// Audit log
		await this.auditRepository.create({
			clientId,
			userId: endUserId,
			actorType: "system",
			action: "end_user_vault_created",
			resourceType: "end_user_vault",
			resourceId: vault.id,
			description: `End-user vault created for client: ${clientId}`,
			metadata: {
				endUserId,
				clientId,
			},
			ipAddress: null,
			userAgent: null,
		})

		return {
			id: vault.id,
			weightedEntryIndex: vault.weightedEntryIndex,
			totalDeposited: vault.totalDeposited,
		}
	}
}
