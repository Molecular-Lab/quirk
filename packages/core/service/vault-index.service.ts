/**
 * Vault Index Calculation Service
 * Handles index updates based on actual wrapped token balances from DeFi protocols
 */

import { Decimal } from "decimal.js"

import type { ProtocolClientRegistry, ProtocolName } from "./defi-protocol.interface"
import type { VaultRepository } from "../repository/postgres/vault.repository"
import type { WrappedTokenRepository } from "../repository/postgres/wrapped-token.repository"

const INDEX_SCALE = new Decimal("1000000000000000000") // 1e18

export interface VaultStrategy {
	protocol: ProtocolName
	allocation: number // Percentage (60 for 60%)
	targetAmount: number
	currentAmount: number
}

export interface IndexUpdateResult {
	vaultId: string
	oldIndex: string
	newIndex: string
	previousValue: string
	currentValue: string
	yieldGenerated: string
	dailyGrowthRate: number
	timestamp: Date
}

export interface WrappedTokenSyncResult {
	vaultId: string
	protocol: ProtocolName
	wrappedBalance: string
	exchangeRate: string
	realValue: string
	syncedAt: Date
}

/**
 * Vault Index Service
 * Core service for calculating vault index based on real DeFi protocol balances
 */
export class VaultIndexService {
	constructor(
		private readonly vaultRepository: VaultRepository,
		private readonly wrappedTokenRepository: WrappedTokenRepository,
		private readonly protocolRegistry: ProtocolClientRegistry,
	) {}

	/**
	 * Sync wrapped token balances for a vault from all DeFi protocols
	 * This is the main entry point for fetching real-time data
	 *
	 * @param vaultId - Client vault ID
	 * @returns Array of sync results per protocol
	 */
	async syncWrappedTokenBalances(vaultId: string): Promise<WrappedTokenSyncResult[]> {
		console.log(`[VaultIndex] Syncing wrapped token balances for vault: ${vaultId}`)

		// Get vault info
		const vault = await this.vaultRepository.getClientVaultById(vaultId)
		if (!vault) {
			throw new Error(`Vault not found: ${vaultId}`)
		}

		// Get custodial wallet address
		const custodialWallet = vault.custodialWalletAddress // From JOIN with privy_accounts
		if (!custodialWallet) {
			throw new Error(`No custodial wallet found for vault: ${vaultId}`)
		}

		// Parse strategies from JSONB
		const strategies: VaultStrategy[] = vault.strategies ? JSON.parse(vault.strategies) : []

		if (strategies.length === 0) {
			console.log(`[VaultIndex] No strategies configured for vault: ${vaultId}`)
			return []
		}

		const syncResults: WrappedTokenSyncResult[] = []

		// Sync each protocol
		for (const strategy of strategies) {
			try {
				const result = await this.syncProtocolBalance(
					vaultId,
					vault.clientId,
					custodialWallet,
					vault.tokenAddress,
					strategy,
				)
				syncResults.push(result)

				console.log(`[VaultIndex] ✓ Synced ${strategy.protocol}:`, {
					wrappedBalance: result.wrappedBalance,
					exchangeRate: result.exchangeRate,
					realValue: result.realValue,
				})
			} catch (error) {
				console.error(`[VaultIndex] ✗ Failed to sync ${strategy.protocol}:`, error)
				// Continue with other protocols even if one fails
			}
		}

		return syncResults
	}

	/**
	 * Sync wrapped token balance for a single protocol
	 */
	private async syncProtocolBalance(
		vaultId: string,
		clientId: string,
		custodialWallet: string,
		tokenAddress: string,
		strategy: VaultStrategy,
	): Promise<WrappedTokenSyncResult> {
		// Get protocol client from registry
		const protocolClient = this.protocolRegistry.get(strategy.protocol)

		// Fetch wrapped token balance from blockchain
		const wrappedData = await protocolClient.getWrappedBalance(custodialWallet, tokenAddress)

		// Save to database
		await this.wrappedTokenRepository.upsert({
			vaultId,
			clientId,
			protocol: strategy.protocol,
			wrappedTokenAddress: wrappedData.wrappedTokenAddress,
			wrappedTokenSymbol: wrappedData.wrappedTokenSymbol,
			wrappedBalance: wrappedData.wrappedBalance,
			exchangeRate: wrappedData.exchangeRate,
			realValue: wrappedData.realValue,
			originalDeposit: strategy.currentAmount.toString(), // Track original deposit for growth calc
		})

		return {
			vaultId,
			protocol: strategy.protocol,
			wrappedBalance: wrappedData.wrappedBalance,
			exchangeRate: wrappedData.exchangeRate,
			realValue: wrappedData.realValue,
			syncedAt: new Date(),
		}
	}

	/**
	 * Calculate and update vault index based on wrapped token values
	 * This is called daily after syncing wrapped tokens
	 *
	 * @param vaultId - Client vault ID
	 * @returns Index update result
	 */
	async updateVaultIndex(vaultId: string): Promise<IndexUpdateResult> {
		console.log(`[VaultIndex] Updating index for vault: ${vaultId}`)

		// Get vault info
		const vault = await this.vaultRepository.getClientVaultById(vaultId)
		if (!vault) {
			throw new Error(`Vault not found: ${vaultId}`)
		}

		// Get current total real value from wrapped tokens
		const currentTotalValue = await this.wrappedTokenRepository.getTotalRealValue(vaultId)

		// Get previous day's value (stored in vault)
		const previousValue = vault.totalStakedBalance || "0"

		// Calculate yield generated
		const currentValueDecimal = new Decimal(currentTotalValue)
		const previousValueDecimal = new Decimal(previousValue)

		if (previousValueDecimal.isZero()) {
			console.log(`[VaultIndex] Skipping index update: no previous value`)
			throw new Error("Cannot update index: no previous staked balance")
		}

		const yieldGenerated = currentValueDecimal.minus(previousValueDecimal)

		// Calculate growth multiplier
		const growthMultiplier = currentValueDecimal.dividedBy(previousValueDecimal)

		// Calculate new index
		const currentIndex = new Decimal(vault.currentIndex)
		const newIndex = currentIndex.times(growthMultiplier)

		// Safety checks
		if (newIndex.lessThan(currentIndex)) {
			throw new Error(
				`[VaultIndex] Index cannot decrease! Old: ${currentIndex.toString()}, New: ${newIndex.toString()}`,
			)
		}

		const maxDailyGrowth = currentIndex.times(2)
		if (newIndex.greaterThan(maxDailyGrowth)) {
			throw new Error(
				`[VaultIndex] Index growth too large! Old: ${currentIndex.toString()}, New: ${newIndex.toString()}`,
			)
		}

		// Calculate daily growth rate percentage
		const dailyGrowthRate = growthMultiplier.minus(1).times(100).toNumber()

		// Update vault in database
		await this.vaultRepository.updateVaultIndex(
			vaultId,
			newIndex.toFixed(0),
			yieldGenerated.toFixed(6),
			currentTotalValue,
		)

		const result: IndexUpdateResult = {
			vaultId,
			oldIndex: currentIndex.toFixed(0),
			newIndex: newIndex.toFixed(0),
			previousValue: previousValue,
			currentValue: currentTotalValue,
			yieldGenerated: yieldGenerated.toFixed(6),
			dailyGrowthRate,
			timestamp: new Date(),
		}

		console.log("[VaultIndex] Index updated:", {
			oldIndex: currentIndex.dividedBy(INDEX_SCALE).toFixed(6),
			newIndex: newIndex.dividedBy(INDEX_SCALE).toFixed(6),
			previousValue: `$${previousValue}`,
			currentValue: `$${currentTotalValue}`,
			yieldGenerated: `$${yieldGenerated.toFixed(2)}`,
			growthRate: `${dailyGrowthRate.toFixed(6)}%`,
		})

		return result
	}

	/**
	 * Full daily update process:
	 * 1. Sync wrapped token balances from blockchain
	 * 2. Calculate new index based on real values
	 * 3. Update APY metrics
	 *
	 * @param vaultId - Client vault ID
	 */
	async runDailyUpdate(vaultId: string): Promise<IndexUpdateResult> {
		console.log(`[VaultIndex] ===== Running daily update for vault: ${vaultId} =====`)

		try {
			// Step 1: Sync wrapped token balances
			const syncResults = await this.syncWrappedTokenBalances(vaultId)
			console.log(`[VaultIndex] Synced ${syncResults.length} protocols`)

			// Step 2: Update index based on real values
			const indexUpdate = await this.updateVaultIndex(vaultId)

			// Step 3: Update APY metrics (7d, 30d)
			await this.updateAPYMetrics(vaultId, indexUpdate.dailyGrowthRate)

			console.log(`[VaultIndex] ===== Daily update complete for vault: ${vaultId} =====`)

			return indexUpdate
		} catch (error) {
			console.error(`[VaultIndex] ===== Daily update failed for vault: ${vaultId} =====`, error)
			throw error
		}
	}

	/**
	 * Update APY performance metrics (7d, 30d rolling averages)
	 */
	private async updateAPYMetrics(vaultId: string, dailyGrowthRate: number): Promise<void> {
		// Calculate annualized APY from daily growth rate
		// Formula: APY = ((1 + daily_rate)^365 - 1) × 100

		const dailyRate = dailyGrowthRate / 100
		const annualizedAPY = (Math.pow(1 + dailyRate, 365) - 1) * 100

		// For now, use the annualized rate for both 7d and 30d
		// TODO: Implement proper rolling average from historical data
		const apy7d = annualizedAPY
		const apy30d = annualizedAPY

		await this.vaultRepository.updateVaultAPY(vaultId, apy7d.toFixed(4), apy30d.toFixed(4))

		console.log(`[VaultIndex] APY metrics updated:`, {
			dailyRate: `${dailyGrowthRate.toFixed(6)}%`,
			annualizedAPY: `${annualizedAPY.toFixed(2)}%`,
			apy7d: `${apy7d.toFixed(2)}%`,
			apy30d: `${apy30d.toFixed(2)}%`,
		})
	}

	/**
	 * Get current vault value from wrapped tokens
	 * Used for real-time balance queries
	 */
	async getCurrentVaultValue(vaultId: string): Promise<string> {
		return await this.wrappedTokenRepository.getTotalRealValue(vaultId)
	}

	/**
	 * Calculate user's current value based on entry index
	 * Formula: current_value = deposited × (current_index / entry_index)
	 */
	calculateUserValue(params: { totalDeposited: string; entryIndex: string; currentIndex: string }): string {
		const deposited = new Decimal(params.totalDeposited)
		const entryIndex = new Decimal(params.entryIndex)
		const currentIndex = new Decimal(params.currentIndex)

		if (entryIndex.isZero()) {
			return "0"
		}

		const currentValue = deposited.times(currentIndex).dividedBy(entryIndex)
		return currentValue.toFixed(6)
	}

	/**
	 * Calculate weighted entry index for DCA deposits
	 * Formula: new_weighted = (old_deposited × old_index + new_deposit × current_index) / (old_deposited + new_deposit)
	 */
	calculateWeightedEntryIndex(params: {
		previousDeposited: string
		previousEntryIndex: string
		newDeposit: string
		currentIndex: string
	}): string {
		const prevDeposited = new Decimal(params.previousDeposited)
		const prevIndex = new Decimal(params.previousEntryIndex)
		const newDeposit = new Decimal(params.newDeposit)
		const currentIndex = new Decimal(params.currentIndex)

		const numerator = prevDeposited.times(prevIndex).plus(newDeposit.times(currentIndex))
		const denominator = prevDeposited.plus(newDeposit)

		if (denominator.isZero()) {
			return currentIndex.toFixed(0)
		}

		const weightedIndex = numerator.dividedBy(denominator)
		return weightedIndex.toFixed(0)
	}

	/**
	 * Handle withdrawal impact on vault balance
	 * Updates total_staked_balance which affects next day's yield calculation
	 */
	async handleWithdrawal(vaultId: string, withdrawAmount: string): Promise<void> {
		const vault = await this.vaultRepository.getClientVaultById(vaultId)
		if (!vault) {
			throw new Error(`Vault not found: ${vaultId}`)
		}

		const currentStaked = new Decimal(vault.totalStakedBalance)
		const withdrawal = new Decimal(withdrawAmount)

		const newStaked = currentStaked.minus(withdrawal)

		if (newStaked.lessThan(0)) {
			throw new Error("[VaultIndex] Withdrawal amount exceeds total staked!")
		}

		// Update total staked balance
		await this.vaultRepository.updateTotalStakedBalance(vaultId, newStaked.toFixed(6))

		console.log(`[VaultIndex] Withdrawal processed:`, {
			vaultId,
			withdrawAmount: `$${withdrawAmount}`,
			previousStaked: `$${currentStaked.toFixed(2)}`,
			newStaked: `$${newStaked.toFixed(2)}`,
			percentageWithdrawn: withdrawal.dividedBy(currentStaked).times(100).toFixed(2) + "%",
		})
	}
}
