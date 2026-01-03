/**
 * Vault Index Updater Service
 *
 * Cron job to update vault indexes based on:
 * - Production: On-chain balance from DeFi protocols
 * - Sandbox: Time-based APY simulation
 *
 * Runs periodically (e.g., every 6 hours) to:
 * 1. Query vault balances (on-chain or simulated)
 * 2. Calculate new vault index based on growth
 * 3. Update client_vaults.current_index
 * 4. Insert snapshot into vault_index_history
 */

import BigNumber from "bignumber.js"
import type { Address } from "viem"

import type { VaultRepository } from "../repository/postgres/vault.repository"
import type { RevenueRepository } from "../repository/postgres/revenue.repository"
import type { VaultBalanceVerifierService } from "./vault-balance-verifier.service"

export interface VaultIndexUpdateConfig {
	/**
	 * How often to run the update (in milliseconds)
	 * Default: 6 hours
	 */
	updateIntervalMs?: number

	/**
	 * Sandbox APY rate for time-based simulation
	 * Default: 5.0 (5% APY)
	 */
	sandboxApyRate?: number
}

export class VaultIndexUpdaterService {
	private readonly updateIntervalMs: number
	private readonly sandboxApyRate: number
	private isRunning: boolean = false
	private intervalHandle?: NodeJS.Timeout

	constructor(
		private readonly vaultRepository: VaultRepository,
		private readonly revenueRepository: RevenueRepository,
		private readonly balanceVerifier: VaultBalanceVerifierService,
		config?: VaultIndexUpdateConfig,
	) {
		this.updateIntervalMs = config?.updateIntervalMs ?? 6 * 60 * 60 * 1000 // 6 hours
		this.sandboxApyRate = config?.sandboxApyRate ?? 5.0 // 5% APY
	}

	/**
	 * Start the cron job
	 */
	start() {
		if (this.isRunning) {

			return
		}

		this.isRunning = true

		// Run immediately on start
		this.updateAllVaultIndexes().catch((error) => {
			console.error("[VaultIndexUpdater] Initial update failed:", error)
		})

		// Then run periodically
		this.intervalHandle = setInterval(() => {
			this.updateAllVaultIndexes().catch((error) => {
				console.error("[VaultIndexUpdater] Periodic update failed:", error)
			})
		}, this.updateIntervalMs)
	}

	/**
	 * Stop the cron job
	 */
	stop() {
		if (!this.isRunning) {
			return
		}

		this.isRunning = false
		if (this.intervalHandle) {
			clearInterval(this.intervalHandle)
			this.intervalHandle = undefined
		}

	}

	/**
	 * Update all vault indexes
	 */
	async updateAllVaultIndexes(): Promise<void> {

		try {
			// Get all vaults
			// TODO: Add pagination for large datasets
			const vaults = await this.vaultRepository.listAllVaults()

			for (const vault of vaults) {
				try {
					await this.updateVaultIndex(vault.id, vault.environment || "sandbox")
				} catch (error) {
					console.error(`[VaultIndexUpdater] Failed to update vault ${vault.id}:`, error)
					// Continue with other vaults
				}
			}

		} catch (error) {
			console.error("[VaultIndexUpdater] Failed to update vault indexes:", error)
			throw error
		}
	}

	/**
	 * Update a single vault's index
	 */
	private async updateVaultIndex(vaultId: string, environment: string): Promise<void> {
		const vault = await this.vaultRepository.getById(vaultId)
		if (!vault) {
			console.error(`[VaultIndexUpdater] Vault not found: ${vaultId}`)
			return
		}

		let newBalance: string
		let newIndex: string

		if (environment === "production") {
			// Production: Query on-chain balance
			newBalance = await this.getOnChainBalance(vault)
			newIndex = this.calculateIndexFromBalance(
				newBalance,
				vault.totalStakedBalance,
				vault.currentIndex,
			)
		} else {
			// Sandbox: Time-based APY simulation
			newIndex = this.calculateIndexFromTimeBasedGrowth(
				vault.currentIndex,
				vault.lastIndexUpdate || vault.createdAt,
				this.sandboxApyRate,
			)
			newBalance = vault.totalStakedBalance // No change in sandbox
		}

		// Calculate daily yield (approximate)
		const indexGrowth = new BigNumber(newIndex).minus(vault.currentIndex)
		const dailyYield = new BigNumber(vault.totalStakedBalance)
			.multipliedBy(indexGrowth)
			.dividedBy(vault.currentIndex)
			.dividedBy(1e18) // Convert from wei
			.toFixed(6)

		// Calculate daily APY
		const dailyAPY = this.calculateDailyAPY(vault.currentIndex, newIndex)

		// Calculate cumulative yield (approximate - can be refined)
		const cumulativeYield = new BigNumber(vault.cumulativeYield || "0")
			.plus(dailyYield)
			.toFixed(6)

		// Update vault index
		await this.vaultRepository.updateVaultIndex(
			vaultId,
			newIndex,
			cumulativeYield,
			newBalance, // Update total staked balance with latest value
		)

		// Insert snapshot into history
		await this.revenueRepository.createIndexSnapshot({
			vaultId,
			indexValue: newIndex,
			dailyYield,
			dailyApy: dailyAPY,
		})

	}

	/**
	 * Get on-chain balance for a vault (production only)
	 */
	private async getOnChainBalance(vault: any): Promise<string> {
		// Parse vault configuration to get protocol allocations
		// Map chain names to chain IDs
		let chainId: "1" | "8453"

		if (vault.chain === "ethereum" || vault.chain === "mainnet" || vault.chain === "eth") {
			chainId = "1" // Ethereum Mainnet
		} else if (vault.chain === "base") {
			chainId = "8453" // Base Mainnet
		} else {
			console.warn(`[VaultIndexUpdater] Unsupported chain for vault ${vault.id}: ${vault.chain}`)
			return vault.totalStakedBalance
		}

		const custodialWallet = vault.custodialWalletAddress as Address

		if (!custodialWallet) {
			console.warn(`[VaultIndexUpdater] No custodial wallet for vault ${vault.id}`)
			return vault.totalStakedBalance
		}

		// Get protocol allocations from vault config
		// TODO: These should be stored in client_vaults table columns
		const protocolAllocations = {
			aave: vault.aaveATokenAddress as Address | undefined,
			compound: vault.compoundCometAddress as Address | undefined,
		}

		// Skip if no protocol allocations configured
		if (!protocolAllocations.aave && !protocolAllocations.compound) {
			console.warn(`[VaultIndexUpdater] No protocol allocations for vault ${vault.id}, using database balance`)
			return vault.totalStakedBalance
		}

		try {
			const result = await this.balanceVerifier.getTotalStakedBalance(
				chainId,
				custodialWallet,
				protocolAllocations,
			)

			return result.totalBalance
		} catch (error) {
			console.error(`[VaultIndexUpdater] Failed to get on-chain balance for vault ${vault.id}:`, error)
			// Fall back to database balance
			return vault.totalStakedBalance
		}
	}

	/**
	 * Calculate new index based on balance growth
	 *
	 * Formula: newIndex = oldIndex × (currentBalance / previousBalance)
	 */
	private calculateIndexFromBalance(
		currentBalance: string,
		previousBalance: string,
		currentIndex: string,
	): string {
		const current = new BigNumber(currentBalance)
		const previous = new BigNumber(previousBalance)
		const index = new BigNumber(currentIndex)

		if (previous.isZero() || current.isZero()) {
			return currentIndex // No growth if no balance
		}

		const growthFactor = current.dividedBy(previous)
		const newIndex = index.multipliedBy(growthFactor).integerValue(BigNumber.ROUND_DOWN)

		return newIndex.toString()
	}

	/**
	 * Calculate new index based on time-based APY simulation (sandbox only)
	 *
	 * Formula:
	 * growthFactor = (1 + APY/365)^days
	 * newIndex = oldIndex × growthFactor
	 */
	private calculateIndexFromTimeBasedGrowth(
		currentIndex: string,
		lastUpdate: Date,
		apyRate: number,
	): string {
		const index = new BigNumber(currentIndex)
		const now = new Date()
		const daysSinceUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24)

		if (daysSinceUpdate < 0.01) {
			// Less than ~15 minutes since last update
			return currentIndex
		}

		// Daily growth rate = (1 + APY/100)^(1/365)
		const dailyRate = Math.pow(1 + apyRate / 100, 1 / 365)

		// Growth factor = dailyRate^days
		const growthFactor = new BigNumber(dailyRate).pow(daysSinceUpdate)

		// New index = current index × growth factor
		const newIndex = index.multipliedBy(growthFactor).integerValue(BigNumber.ROUND_DOWN)

		return newIndex.toString()
	}

	/**
	 * Calculate daily APY from index growth
	 *
	 * Formula: dailyAPY = ((newIndex / oldIndex) - 1) × 365 × 100
	 */
	private calculateDailyAPY(oldIndex: string, newIndex: string): string {
		const old = new BigNumber(oldIndex)
		const current = new BigNumber(newIndex)

		if (old.isZero()) {
			return "0"
		}

		const growth = current.dividedBy(old).minus(1)
		const annualizedAPY = growth.multipliedBy(365).multipliedBy(100)

		return annualizedAPY.decimalPlaces(4, BigNumber.ROUND_DOWN).toString()
	}
}
