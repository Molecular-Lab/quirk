/**
 * Client Growth Index Service
 *
 * Calculates weighted average growth index across ALL client vaults
 * (multi-chain, multi-token, multi-protocol)
 *
 * Formula:
 * client_growth_index = Σ(vaultAUM × vaultIndex) / Σ(vaultAUM)
 *
 * Example:
 * - USDC on Base: $10M AUM, index: 1.04
 * - USDC on Ethereum: $5M AUM, index: 1.05
 * - USDT on Polygon: $3M AUM, index: 1.03
 * - USDC on Arbitrum: $2M AUM, index: 1.06
 *
 * Total AUM: $20M
 * Weighted sum: (10M × 1.04) + (5M × 1.05) + (3M × 1.03) + (2M × 1.06)
 *             = 10.4M + 5.25M + 3.09M + 2.12M
 *             = 20.86M
 *
 * client_growth_index = 20.86M / 20M = 1.043
 */

import BigNumber from "bignumber.js"

import type { VaultRepository } from "../repository/postgres/vault.repository"
import type { RevenueRepository } from "../repository/postgres/revenue.repository"

export class ClientGrowthIndexService {
	constructor(
		private readonly vaultRepository: VaultRepository,
		private readonly revenueRepository?: RevenueRepository, // Optional for backward compatibility
	) {}

	/**
	 * Calculate client's weighted average growth index
	 * Aggregates ALL client vaults (multi-chain, multi-token)
	 */
	async calculateClientGrowthIndex(clientId: string): Promise<string> {
		// Get all client vaults
		const vaults = await this.vaultRepository.listClientVaults(clientId)

		if (vaults.length === 0) {
			// No vaults yet, return default index (1.0)
			return "1000000000000000000" // 1e18
		}

		let totalAUM = new BigNumber(0)
		let weightedIndexSum = new BigNumber(0)

		for (const vault of vaults) {
			// Calculate vault AUM (Assets Under Management)
			// AUM = total_staked_balance + pending_deposit_balance
			const stakedBalance = new BigNumber(vault.totalStakedBalance || "0")
			const pendingBalance = new BigNumber(vault.pendingDepositBalance || "0")
			const vaultAUM = stakedBalance.plus(pendingBalance)

			// Skip vaults with zero AUM
			if (vaultAUM.isZero()) {
				continue
			}

			const vaultIndex = new BigNumber(vault.currentIndex)

			// Accumulate weighted sum
			totalAUM = totalAUM.plus(vaultAUM)
			weightedIndexSum = weightedIndexSum.plus(vaultAUM.multipliedBy(vaultIndex))
		}

		// If no AUM across all vaults, return default index
		if (totalAUM.isZero()) {
			return "1000000000000000000" // 1e18
		}

		// Calculate weighted average
		// client_growth_index = Σ(AUM × index) / Σ(AUM)
		const clientGrowthIndex = weightedIndexSum.dividedBy(totalAUM).integerValue(BigNumber.ROUND_DOWN)

		console.log("[ClientGrowthIndex] Calculated:", {
			clientId,
			vaultCount: vaults.length,
			totalAUM: totalAUM.toString(),
			clientGrowthIndex: clientGrowthIndex.toString(),
		})

		return clientGrowthIndex.toString()
	}

	/**
	 * Calculate client growth index as a decimal (for display)
	 * Example: "1043000000000000000" → "1.043"
	 */
	async calculateClientGrowthIndexDecimal(clientId: string): Promise<string> {
		const index = await this.calculateClientGrowthIndex(clientId)
		return new BigNumber(index).dividedBy("1000000000000000000").decimalPlaces(6, BigNumber.ROUND_DOWN).toString()
	}

	/**
	 * Get detailed breakdown of client growth index
	 * Useful for debugging and analytics
	 */
	async getClientGrowthIndexBreakdown(clientId: string) {
		const vaults = await this.vaultRepository.listClientVaults(clientId)

		const breakdown = vaults.map((vault) => {
			const stakedBalance = new BigNumber(vault.totalStakedBalance || "0")
			const pendingBalance = new BigNumber(vault.pendingDepositBalance || "0")
			const vaultAUM = stakedBalance.plus(pendingBalance)
			const vaultIndex = new BigNumber(vault.currentIndex)

			return {
				chain: vault.chain,
				tokenSymbol: vault.tokenSymbol,
				aum: vaultAUM.toString(),
				index: vaultIndex.toString(),
				indexDecimal: vaultIndex.dividedBy("1000000000000000000").toString(),
				stakedBalance: vault.totalStakedBalance,
				pendingBalance: vault.pendingDepositBalance,
			}
		})

		const clientGrowthIndex = await this.calculateClientGrowthIndex(clientId)
		const clientGrowthIndexDecimal = new BigNumber(clientGrowthIndex).dividedBy("1000000000000000000").toString()

		const totalAUM = breakdown.reduce((sum, v) => sum.plus(v.aum), new BigNumber(0))

		return {
			clientId,
			clientGrowthIndex,
			clientGrowthIndexDecimal,
			totalAUM: totalAUM.toString(),
			vaultCount: vaults.length,
			vaults: breakdown,
		}
	}

	/**
	 * Calculate client-wide historical APY based on weighted vault performance
	 *
	 * Formula:
	 * 1. For each vault, calculate rolling APY over lookbackDays
	 * 2. Weight each vault's APY by its current AUM
	 * 3. Return weighted average: Σ(vault_APY × vault_AUM) / Σ(vault_AUM)
	 *
	 * @param clientId - Client ID
	 * @param lookbackDays - Number of days to look back (default: 30)
	 * @returns APY as percentage string (e.g., "5.25" for 5.25% APY)
	 */
	async calculateHistoricalAPY(clientId: string, lookbackDays: number = 30): Promise<string> {
		// If revenue repository not injected, cannot calculate APY
		if (!this.revenueRepository) {
			return "0"
		}

		const vaults = await this.vaultRepository.listClientVaults(clientId)

		if (vaults.length === 0) {
			return "0"
		}

		let totalAUM = new BigNumber(0)
		let weightedAPYSum = new BigNumber(0)

		for (const vault of vaults) {
			// Calculate vault AUM
			const stakedBalance = new BigNumber(vault.totalStakedBalance || "0")
			const pendingBalance = new BigNumber(vault.pendingDepositBalance || "0")
			const vaultAUM = stakedBalance.plus(pendingBalance)

			// Skip vaults with zero AUM
			if (vaultAUM.isZero()) {
				continue
			}

			// Get vault's rolling APY from index history
			// Note: If no history exists (new vault), APY will be null
			const apyData = await this.revenueRepository.calculateRollingAPY(vault.id, lookbackDays)

			if (apyData && apyData.annualizedApy) {
				const vaultAPY = new BigNumber(apyData.annualizedApy)

				// Weight APY by vault AUM
				totalAUM = totalAUM.plus(vaultAUM)
				weightedAPYSum = weightedAPYSum.plus(vaultAUM.multipliedBy(vaultAPY))
			}
		}

		// If no vaults have historical data, return 0
		if (totalAUM.isZero()) {
			return "0"
		}

		// Calculate weighted average APY
		const clientAPY = weightedAPYSum.dividedBy(totalAUM).decimalPlaces(2, BigNumber.ROUND_DOWN)

		return clientAPY.toString()
	}
}
