/**
 * B2B Withdrawal UseCase
 * Manages withdrawal requests and processing (FLOW 8)
 *
 * ✅ SIMPLIFIED ARCHITECTURE:
 * - withdrawal_transactions: FIAT withdrawal (to bank/card) - tracked by payment gateway
 * - withdrawal_queue: CRYPTO unstaking (from DeFi protocols) - executed by DeFi layer
 * - end_user_vaults: Track total_withdrawn (NO SHARES - fiat-based tracking)
 *
 * ✅ SIMPLIFIED FLOW:
 * 1. Calculate client growth index (weighted average across all vaults)
 * 2. Calculate user current value (total_deposited × client_growth_index / entry_index)
 * 3. Validate withdrawal amount against current value
 * 4. Create withdrawal_transaction (FIAT)
 * 5. Create withdrawal_queue (CRYPTO unstaking plan)
 * 6. Update end_user_vault.total_withdrawn
 */

import BigNumber from "bignumber.js"

import { ClientGrowthIndexService } from "../../service/client-growth-index.service"
import { RevenueService } from "../../service/revenue.service"
import { TokenTransferService, type TransferResult } from "../../service/token-transfer.service"

import type { CreateWithdrawalRequest, WithdrawalResponse } from "../../dto/b2b"
import type { AuditRepository } from "../../repository/postgres/audit.repository"
import type { UserRepository } from "../../repository/postgres/end_user.repository"
import type { VaultRepository } from "../../repository/postgres/vault.repository"
import type { WithdrawalRepository } from "../../repository/postgres/withdrawal.repository"
import type { RevenueRepository } from "../../repository/postgres/revenue.repository"
import type {
	CreateWithdrawalRow,
	GetWithdrawalByOrderIDRow,
	GetWithdrawalStatsRow,
	ListWithdrawalsByUserRow,
	ListWithdrawalsRow,
} from "@quirk/sqlcgen"

export class B2BWithdrawalUseCase {
	private tokenTransferService: TokenTransferService

	constructor(
		private readonly withdrawalRepository: WithdrawalRepository,
		private readonly vaultRepository: VaultRepository,
		private readonly userRepository: UserRepository,
		private readonly auditRepository: AuditRepository,
		private readonly revenueRepository: RevenueRepository,
		private readonly clientGrowthIndexService: ClientGrowthIndexService,
		private readonly revenueService: RevenueService,
	) {
		this.tokenTransferService = new TokenTransferService()
	}

	/**
	 * Request withdrawal (FLOW 8 - SIMPLIFIED with environment support)
	 *
	 * ✅ NEW FLOW:
	 * 1. Calculate client growth index (weighted average across all vaults)
	 * 2. Calculate user current value (total_deposited × client_growth_index / entry_index)
	 * 3. Validate withdrawal amount against current value
	 * 4. Create withdrawal_transaction (FIAT) with environment tracking
	 * 5. Create withdrawal_queue (CRYPTO unstaking plan)
	 * 6. Update end_user_vault.total_withdrawn
	 */
	async requestWithdrawal(request: CreateWithdrawalRequest): Promise<WithdrawalResponse> {
		const { clientId, userId, amount, orderId, destinationType, destinationDetails, environment, network, oracleAddress, deductFees } = request

		// Determine environment and network
		// Default to sandbox if not specified
		const withdrawalEnvironment = environment || "sandbox"
		const withdrawalNetwork = network || (withdrawalEnvironment === "sandbox" ? "sepolia" : "mainnet")

		// Default to deducting fees (true) unless explicitly set to false
		const shouldDeductFees = deductFees !== false

		// Get end_user
		const endUser = await this.userRepository.getByClientAndUserId(clientId, userId)
		if (!endUser) {
			throw new Error(`User not found: ${userId}`)
		}

		// ✅ STEP 1: Calculate client growth index (weighted average across all client vaults)
		const clientGrowthIndex = await this.clientGrowthIndexService.calculateClientGrowthIndex(clientId)

		// ✅ STEP 2: Get end_user_vault for this environment (with row lock)
		const userVault = await this.vaultRepository.getEndUserVaultByClientForUpdate(endUser.id, clientId, withdrawalEnvironment)
		if (!userVault) {
			throw new Error(`User has no vault for client ${clientId} in ${withdrawalEnvironment} environment`)
		}

		// ✅ STEP 3: Calculate user current value
		const currentValue = new BigNumber(
			this.vaultRepository.calculateUserCurrentValue(
				userVault.totalDeposited,
				userVault.weightedEntryIndex,
				clientGrowthIndex,
			),
		)

		const withdrawalAmount = new BigNumber(amount)
		const totalDeposited = new BigNumber(userVault.totalDeposited)

		// ✅ STEP 4: Validate balance
		if (withdrawalAmount.isGreaterThan(currentValue)) {
			throw new Error(`Insufficient balance. Requested: ${amount}, Available: ${currentValue.toString()}`)
		}

		// ✅ STEP 4.5: Calculate yield and revenue split
		const totalYield = currentValue.minus(totalDeposited)
		let actualWithdrawalAmount = withdrawalAmount
		let feeBreakdown: WithdrawalResponse["feeBreakdown"] | undefined

		if (totalYield.isGreaterThan(0)) {
			// User has earned yield, calculate revenue split
			// Get the vault for the client (to find vaultId for revenue service)
			const clientVaults = await this.vaultRepository.listClientVaults(clientId)
			if (clientVaults.length === 0) {
				throw new Error(`No client vault found for ${clientId}`)
			}
			const clientVault = clientVaults[0]

			// Calculate yield distribution
			const distribution = await this.revenueService.distributeYield(
				clientVault.id,
				totalYield.toString()
			)

			// Record revenue distribution
			await this.revenueRepository.createDistribution({
				withdrawalTransactionId: null, // Will update after withdrawal is created
				vaultId: clientVault.id,
				rawYield: distribution.rawYield,
				enduserRevenue: distribution.enduserRevenue,
				clientRevenue: distribution.clientRevenue,
				platformRevenue: distribution.platformRevenue,
				clientRevenuePercent: distribution.clientRevenuePercent,
				platformFeePercent: distribution.platformFeePercent,
				isDeducted: shouldDeductFees,
			})

			// Calculate actual withdrawal amount based on fee deduction
			if (shouldDeductFees) {
				// Deduct fees: user gets principal + their share of yield
				const userNetYield = new BigNumber(distribution.enduserRevenue)
				actualWithdrawalAmount = totalDeposited.plus(userNetYield)

			}

			// Build fee breakdown for response
			feeBreakdown = {
				totalYield: totalYield.toString(),
				platformFee: distribution.platformRevenue,
				clientFee: distribution.clientRevenue,
				userNetYield: distribution.enduserRevenue,
				feesDeducted: shouldDeductFees,
				platformFeePercent: distribution.platformFeePercent,
				clientFeePercent: distribution.clientRevenuePercent,
			}
		}

		// ✅ STEP 5: Create FIAT withdrawal transaction with environment support
		const withdrawal = await this.withdrawalRepository.create({
			orderId,
			clientId,
			userId: endUser.id,
			requestedAmount: amount,
			currency: "USD",
			destinationType,
			destinationDetails: destinationDetails || null,
			status: "pending",
			// ✅ Environment support
			environment: withdrawalEnvironment,
			network: withdrawalNetwork,
			oracleAddress: oracleAddress || null,
		})

		if (!withdrawal) {
			throw new Error("Failed to create withdrawal")
		}

		// ✅ STEP 6: Create CRYPTO withdrawal queue (DeFi unstaking)
		await this.createWithdrawalQueue(
			clientId,
			withdrawal.id,
			userVault.id,
			actualWithdrawalAmount.toString(), // Use actual amount after fee deduction
			clientGrowthIndex, // Pass growth index to calculate shares
		)

		// ✅ STEP 7: Update end_user_vault.total_withdrawn
		await this.vaultRepository.updateVaultWithdrawal(userVault.id, actualWithdrawalAmount.toString())

		// ✅ STEP 8: Update user timestamp
		await this.userRepository.updateWithdrawalTimestamp(endUser.id)

		// Audit
		await this.auditRepository.create({
			clientId,
			userId: endUser.id,
			actorType: "end_user",
			action: "withdrawal_request",
			resourceType: "withdrawal_transaction",
			resourceId: withdrawal.id,
			description: `Withdrawal: ${amount} USD (${withdrawalEnvironment})${shouldDeductFees ? " with fees deducted" : " fees deferred"}`,
			metadata: {
				requestedAmount: amount,
				actualAmount: actualWithdrawalAmount.toString(),
				currentValue: currentValue.toString(),
				totalDeposited: totalDeposited.toString(),
				totalYield: totalYield.toString(),
				clientGrowthIndex,
				clientGrowthIndexDecimal: new BigNumber(clientGrowthIndex).dividedBy("1e18").toString(),
				environment: withdrawalEnvironment,
				network: withdrawalNetwork,
				oracleAddress,
				feesDeducted: shouldDeductFees,
				feeBreakdown,
			},
			ipAddress: null,
			userAgent: null,
		})

		return this.mapToResponse(withdrawal, feeBreakdown)
	}

	/**
	 * Get withdrawal by order ID
	 */
	async getWithdrawalByOrderId(orderId: string): Promise<WithdrawalResponse | null> {
		const withdrawal = await this.withdrawalRepository.getByOrderId(orderId)
		return withdrawal ? this.mapToResponse(withdrawal) : null
	}

	/**
	 * List withdrawals by client
	 */
	async listWithdrawalsByClient(clientId: string, limit = 100, offset = 0): Promise<WithdrawalResponse[]> {
		const withdrawals = await this.withdrawalRepository.listByClient(clientId, limit, offset)
		return withdrawals.map((w: any) => this.mapToResponse(w))
	}

	/**
	 * List withdrawals by user
	 */
	async listWithdrawalsByUser(clientId: string, userId: string, limit = 100): Promise<WithdrawalResponse[]> {
		const withdrawals = await this.withdrawalRepository.listByUser(clientId, userId, limit)
		return withdrawals.map((w: any) => this.mapToResponse(w))
	}

	/**
	 * List pending withdrawals by environment (for Operations Dashboard)
	 */
	async listPendingWithdrawalsByEnvironment(environment: "sandbox" | "production"): Promise<WithdrawalResponse[]> {
		const withdrawals = await this.withdrawalRepository.listPendingByEnvironment(environment)
		return withdrawals.map((w: any) => this.mapToResponse(w))
	}

	/**
	 * List pending withdrawals by client and environment
	 */
	async listPendingWithdrawalsByClientAndEnvironment(
		clientId: string,
		environment: "sandbox" | "production",
	): Promise<WithdrawalResponse[]> {
		const withdrawals = await this.withdrawalRepository.listPendingByClientAndEnvironment(clientId, environment)
		return withdrawals.map((w: any) => this.mapToResponse(w))
	}

	/**
	 * Complete withdrawal (payment gateway callback)
	 */
	async completeWithdrawal(orderId: string, actualAmount?: string): Promise<void> {
		const withdrawal = await this.withdrawalRepository.getByOrderId(orderId)
		if (!withdrawal) {
			throw new Error(`Withdrawal not found: ${orderId}`)
		}

		await this.withdrawalRepository.markCompleted(withdrawal.id, actualAmount || withdrawal.requestedAmount)

		await this.auditRepository.create({
			clientId: withdrawal.clientId,
			userId: withdrawal.userId,
			actorType: "system",
			action: "withdrawal_complete",
			resourceType: "withdrawal_transaction",
			resourceId: withdrawal.id,
			description: "Withdrawal completed",
			metadata: { actualAmount: actualAmount || withdrawal.requestedAmount },
			ipAddress: null,
			userAgent: null,
		})
	}

	/**
	 * Fail withdrawal
	 */
	async failWithdrawal(orderId: string, errorMessage: string, errorCode?: string): Promise<void> {
		const withdrawal = await this.withdrawalRepository.getByOrderId(orderId)
		if (!withdrawal) {
			throw new Error(`Withdrawal not found: ${orderId}`)
		}

		await this.withdrawalRepository.markFailed(withdrawal.id, errorMessage, errorCode)

		await this.auditRepository.create({
			clientId: withdrawal.clientId,
			userId: withdrawal.userId,
			actorType: "system",
			action: "withdrawal_failed",
			resourceType: "withdrawal_transaction",
			resourceId: withdrawal.id,
			description: `Withdrawal failed: ${errorMessage}`,
			metadata: { errorMessage, errorCode },
			ipAddress: null,
			userAgent: null,
		})
	}

	/**
	 * Get statistics
	 */
	async getWithdrawalStats(clientId: string, startDate: Date, endDate: Date): Promise<GetWithdrawalStatsRow | null> {
		return await this.withdrawalRepository.getStats(clientId, startDate, endDate)
	}

	/**
	 * Create withdrawal queue (crypto unstaking plan)
	 * Calculates shares to burn based on withdrawal amount and client growth index
	 */
	private async createWithdrawalQueue(
		clientId: string,
		withdrawalTransactionId: string,
		endUserVaultId: string,
		estimatedAmount: string,
		clientGrowthIndex: string,
	): Promise<void> {
		// Convert USD amount to USDC units (6 decimals)
		// e.g., "10" USD → "10000000" USDC units
		const amountInUSDCUnits = new BigNumber(estimatedAmount)
			.multipliedBy(1e6)
			.toFixed(0)

		// Calculate shares to burn using the client growth index
		const sharesToBurn = this.vaultRepository.calculateSharesForWithdrawal(
			amountInUSDCUnits,
			clientGrowthIndex
		)

		// TODO: Query vault_protocol_balances to determine optimal unstaking
		await this.withdrawalRepository.createQueueItem({
			clientId,
			withdrawalTransactionId,
			endUserVaultId,
			sharesToBurn, // ✅ Calculated shares based on growth index
			estimatedAmount,
			protocolsToUnstake: null,
			priority: 1,
			status: "queued", // ✅ Must be 'queued' not 'pending' per DB constraint
		})
	}

	/**
	 * Transfer tokens from custodial wallet back to oracle (for off-ramp)
	 *
	 * This is the REVERSE of deposit flow:
	 * - Deposit: Oracle/Minter → Custodial
	 * - Withdrawal: Custodial → Oracle
	 *
	 * @param chainId - Chain ID (Sepolia: 11155111, Base Mainnet: 8453)
	 * @param tokenAddress - Token contract address
	 * @param oracleAddress - Oracle wallet address (destination)
	 * @param amount - Amount to transfer (in USDC, e.g., "1000.50")
	 * @param custodialPrivateKey - Custodial wallet private key (to sign the transfer)
	 * @param rpcUrl - Optional custom RPC URL
	 * @returns Transfer result with status and transaction hash
	 */
	async transferFromCustodialToOracle(
		chainId: string,
		tokenAddress: string,
		oracleAddress: string,
		amount: string,
		custodialPrivateKey: string,
		rpcUrl?: string,
	): Promise<TransferResult> {
		const result = await this.tokenTransferService.transferFromCustodialToOracle({
			chainId,
			tokenAddress,
			custodialWallet: oracleAddress, // In this case, custodialWallet param is the destination (oracle)
			amount,
			privateKey: custodialPrivateKey,
			rpcUrl,
		})

		if (!result.success) {
			if (result.status === "insufficient_balance") {
				console.error("[Withdrawal] ❌ Insufficient custodial balance:", {
					available: result.oracleBalance,
					required: result.requiredAmount,
				})
			} else {
				console.error("[Withdrawal] ❌ Transfer failed:", result.error)
			}
		}

		return result
	}

	/**
	 * Map to response
	 */
	private mapToResponse(
		withdrawal: CreateWithdrawalRow | GetWithdrawalByOrderIDRow | ListWithdrawalsRow | ListWithdrawalsByUserRow,
		feeBreakdown?: WithdrawalResponse["feeBreakdown"],
	): WithdrawalResponse {
		return {
			id: withdrawal.id,
			orderId: withdrawal.orderId,
			clientId: withdrawal.clientId,
			userId: withdrawal.userId,
			requestedAmount: withdrawal.requestedAmount,
			actualAmount: withdrawal.actualAmount,
			currency: withdrawal.currency,
			status: withdrawal.status,
			destinationType: withdrawal.destinationType,
			createdAt: withdrawal.createdAt,
			completedAt: withdrawal.completedAt,
			feeBreakdown,
		}
	}
}
