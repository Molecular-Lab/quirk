/**
 * B2B Deposit Service
 * Handles deposit creation and processing
 */

import BigNumber from "bignumber.js"

import { type MockTokenChainId, MockUSDCClient } from "../../blockchain"
import { ClientGrowthIndexService } from "../../service/client-growth-index.service"
import { TokenTransferService, type TransferResult } from "../../service/token-transfer.service"

import type { CompleteDepositRequest, CreateDepositRequest } from "../../dto/b2b"
import type {
	AuditRepository,
	ClientRepository,
	DepositRepository,
	UserRepository,
	VaultRepository,
} from "../../repository"
import type { CreateDepositArgs, CreateDepositRow, GetDepositByOrderIDRow } from "@quirk/sqlcgen"

/**
 * B2B Deposit Service
 */
export class B2BDepositUseCase {
	private tokenTransferService: TokenTransferService

	constructor(
		private readonly depositRepository: DepositRepository,
		private readonly clientRepository: ClientRepository,
		private readonly vaultRepository: VaultRepository,
		private readonly userRepository: UserRepository,
		private readonly auditRepository: AuditRepository,
		private readonly clientGrowthIndexService: ClientGrowthIndexService,
	) {
		this.tokenTransferService = new TokenTransferService()
	}

	/**
	 * Create deposit transaction with environment support
	 */
	async createDeposit(request: CreateDepositRequest): Promise<CreateDepositRow> {
		// Validate client
		const client = await this.clientRepository.getById(request.clientId)
		if (!client?.isActive) {
			throw new Error("Invalid or inactive client")
		}

		// Get or create end user
		const user = await this.userRepository.getOrCreate(
			request.clientId,
			request.userId,
			"custodial", // Default userType
			undefined, // No wallet address yet
		)

		// Determine environment and network
		// Default to sandbox if not specified
		const environment = request.environment || "sandbox"
		const network = request.network || (environment === "sandbox" ? "sepolia" : "mainnet")

		console.log("[Deposit] Creating deposit with environment:", {
			environment,
			network,
			oracleAddress: request.oracleAddress,
		})

		// Create deposit args
		const args: CreateDepositArgs = {
			orderId: request.orderId || `DEP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
			clientId: request.clientId,
			userId: user.id,
			depositType: request.depositType,
			paymentMethod: request.gatewayProvider || null,
			fiatAmount: request.fiatAmount,
			cryptoAmount: null,
			currency: request.fiatCurrency,
			cryptoCurrency: request.cryptoCurrency,
			gatewayFee: null,
			proxifyFee: null,
			networkFee: null,
			totalFees: null,
			status: "pending",
			paymentUrl: request.paymentUrl || null,
			gatewayOrderId: request.gatewayOrderId || null,
			clientBalanceId: null,
			deductedFromClient: null,
			walletAddress: null,
			expiresAt: request.expiresAt || null,
			paymentInstructions: request.paymentInstructions || null,
			chain: request.chain || null,
			tokenSymbol: request.tokenSymbol || request.cryptoCurrency || null,
			tokenAddress: request.tokenAddress || null,
			onRampProvider: request.onRampProvider || request.gatewayProvider || null,
			qrCode: request.qrCode || null,
			// ✅ Environment support
			environment,
			network,
			oracleAddress: request.oracleAddress || null,
		}

		const deposit = await this.depositRepository.create(args)

		if (!deposit) {
			throw new Error("Failed to create deposit")
		}

		// Audit log
		await this.auditRepository.create({
			clientId: request.clientId,
			userId: user.id,
			actorType: "client",
			action: "deposit_created",
			resourceType: "deposit",
			resourceId: deposit.id,
			description: `Deposit created: ${request.fiatAmount} ${request.fiatCurrency}`,
			metadata: {
				orderId: deposit.orderId,
				fiatAmount: request.fiatAmount,
				fiatCurrency: request.fiatCurrency,
				cryptoCurrency: request.cryptoCurrency,
			},
			ipAddress: null,
			userAgent: null,
		})

		return deposit
	}

	/**
	 * Get deposit by order ID
	 */
	async getDepositByOrderId(orderId: string): Promise<GetDepositByOrderIDRow | null> {
		return await this.depositRepository.getByOrderId(orderId)
	}

	/**
	 * Complete deposit (FLOW 4 - with vault operations)
	 *
	 * ✅ NEW SIMPLIFIED FLOW:
	 * 1. Mark deposit as completed
	 * 2. Get client vault (for custodial wallet verification)
	 * 3. Calculate client growth index (weighted average across all vaults)
	 * 4. Get or create end_user_vault (simplified - no chain/token)
	 * 5. Calculate new weighted entry index (for DCA)
	 * 6. Update vault deposit (fiat amount, no shares)
	 * 7. Add pending deposit to client_vault
	 * 8. Update end_user.last_deposit_at
	 *
	 * Note: Token minting (Step 1.5) happens in the API router before this is called
	 */
	async completeDeposit(request: CompleteDepositRequest): Promise<void> {
		const deposit = await this.depositRepository.getByOrderId(request.orderId)

		if (!deposit) {
			throw new Error("Deposit not found")
		}

		if (deposit.status !== "pending") {
			throw new Error(`Deposit is already ${deposit.status}`)
		}

		// Get environment from deposit (was set during creation)
		const environment: "sandbox" | "production" = (deposit.environment as "sandbox" | "production") || "sandbox"

		// Step 0: Get client vault to retrieve custodial wallet address
		const clientVault = await this.vaultRepository.getClientVault(deposit.clientId, request.chain, request.tokenAddress, environment)

		if (!clientVault) {
			throw new Error(`Client vault not found for ${request.chain}/${request.tokenAddress}`)
		}

		// Step 0.5: Verify token transfer on-chain
		// In production, this checks the blockchain. In mock mode, it simulates verification.
		if (request.transactionHash) {
			console.log("[Deposit] Verifying token transfer on-chain...")

			const verification = await this.tokenTransferService.verifyTransfer({
				chain: request.chain,
				tokenAddress: request.tokenAddress,
				expectedAmount: request.cryptoAmount,
				transactionHash: request.transactionHash,
				toAddress: clientVault.custodialWalletAddress || "", // Custodial wallet
			})

			if (!verification.verified) {
				// Mark deposit as failed
				await this.depositRepository.markFailed(deposit.id, verification.error || "Token transfer verification failed")
				throw new Error(`Token transfer verification failed: ${verification.error}`)
			}

			console.log("[Deposit] ✅ Token transfer verified:", {
				amount: verification.actualAmount,
				from: verification.from,
				block: verification.blockNumber,
			})
		}

		// Step 1: Mark deposit as completed
		await this.depositRepository.markCompleted(
			deposit.id,
			request.cryptoAmount,
			request.gatewayFee,
			request.proxifyFee,
			request.networkFee,
			request.totalFees,
			request.transactionHash,
		)

		// Note: Token minting happens in the API router layer (batch complete deposits)
		// before this method is called. This usecase only handles vault accounting.

		// Step 2: Calculate client growth index (weighted average across all client vaults)
		const clientGrowthIndex = new BigNumber(
			await this.clientGrowthIndexService.calculateClientGrowthIndex(deposit.clientId),
		)

		console.log("[Deposit] Client Growth Index:", {
			clientId: deposit.clientId,
			growthIndex: clientGrowthIndex.toString(),
			growthIndexDecimal: clientGrowthIndex.dividedBy("1e18").toString(),
		})

		// Step 3: Get end_user record (with fallback lookup)
		console.log("[Deposit] Looking up end user:", {
			userId: deposit.userId,
			clientId: deposit.clientId,
		})

		let endUser = null

		// Check if userId looks like a UUID (simple check)
		const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(deposit.userId)

		if (isUuid) {
			try {
				endUser = await this.userRepository.getById(deposit.userId)
			} catch (error) {
				// UUID lookup failed, will try clientUserId lookup
				console.log("[Deposit] UUID lookup failed, trying clientUserId lookup")
			}
		}

		if (!endUser) {
			// Fallback: try looking up by client + user_id (client-provided ID)
			console.log("[Deposit] User not found by ID, trying clientId+userId lookup")
			endUser = await this.userRepository.getByClientAndUserId(deposit.clientId, deposit.userId)
		}

		if (!endUser) {
			console.error("[Deposit] End user not found after fallback lookup:", {
				userId: deposit.userId,
				clientId: deposit.clientId,
			})
			throw new Error(`End user not found: ${deposit.userId} for client ${deposit.clientId}`)
		}

		console.log("[Deposit] Found end user:", { id: endUser.id, userId: endUser.userId })

		// Step 4: Get or create end_user_vault (with environment support)
		const userVault = await this.vaultRepository.getEndUserVaultByClient(endUser.id, deposit.clientId, environment)

		const depositAmount = new BigNumber(request.cryptoAmount)

		if (!userVault) {
			// ✅ First deposit - create vault with entry index = client growth index
			// (This shouldn't happen often now that we create vaults on registration)
			console.log("[Deposit] Creating new end-user vault (vault missing - should have been created on registration)")

			const newVault = await this.vaultRepository.createEndUserVault({
				endUserId: endUser.id,
				clientId: deposit.clientId,
				totalDeposited: depositAmount.toString(),
				weightedEntryIndex: clientGrowthIndex.toString(),
				environment,
			})

			if (!newVault) {
				throw new Error("Failed to create end-user vault")
			}

			console.log("[Deposit] ✅ Vault created:", {
				vaultId: newVault.id,
				totalDeposited: depositAmount.toString(),
				entryIndex: clientGrowthIndex.toString(),
				entryIndexDecimal: clientGrowthIndex.dividedBy("1e18").toString(),
			})
		} else {
			const oldDeposited = new BigNumber(userVault.totalDeposited)
			const oldEntryIndex = new BigNumber(userVault.weightedEntryIndex)

			// Check if this is the first deposit (vault exists but has 0 balance from registration)
			if (oldDeposited.isZero()) {
				console.log("[Deposit] First deposit - updating vault created on registration")

				// Set entry index to current client growth index
				await this.vaultRepository.updateVaultDeposit(
					userVault.id,
					depositAmount.toString(),
					clientGrowthIndex.toString(), // Entry index = current growth index
				)

				console.log("[Deposit] ✅ Vault updated (first deposit):", {
					vaultId: userVault.id,
					totalDeposited: depositAmount.toString(),
					entryIndex: clientGrowthIndex.toString(),
					entryIndexDecimal: clientGrowthIndex.dividedBy("1e18").toString(),
				})
			} else {
				// ✅ DCA (Dollar-Cost Averaging) - recalculate weighted entry index
				console.log("[Deposit] Updating existing vault (DCA)")

				const totalDeposited = oldDeposited.plus(depositAmount)

				// Formula: new_weighted_entry_index = (old_deposited × old_entry_index + new_deposited × client_growth_index) / total_deposited
				const newWeightedEntryIndex = oldDeposited
					.multipliedBy(oldEntryIndex)
					.plus(depositAmount.multipliedBy(clientGrowthIndex))
					.dividedBy(totalDeposited)
					.integerValue(BigNumber.ROUND_DOWN)

				console.log("[Deposit] DCA Calculation:", {
					oldDeposited: oldDeposited.toString(),
					oldEntryIndex: oldEntryIndex.toString(),
					oldEntryIndexDecimal: oldEntryIndex.dividedBy("1e18").toString(),
					newDeposited: depositAmount.toString(),
					currentGrowthIndex: clientGrowthIndex.toString(),
					currentGrowthIndexDecimal: clientGrowthIndex.dividedBy("1e18").toString(),
					totalDeposited: totalDeposited.toString(),
					newWeightedEntryIndex: newWeightedEntryIndex.toString(),
					newWeightedEntryIndexDecimal: newWeightedEntryIndex.dividedBy("1e18").toString(),
				})

				// Update vault with new totals
				await this.vaultRepository.updateVaultDeposit(
					userVault.id,
					depositAmount.toString(),
					newWeightedEntryIndex.toString(),
				)

				console.log("[Deposit] ✅ Vault updated (DCA)")
			}
		}

		// Step 5: Update client_vault (add pending deposit balance)
		// Note: Client vaults still track shares internally for their own accounting
		// End users don't see shares, they see fiat balance
		await this.vaultRepository.addPendingDeposit(
			clientVault.id,
			request.cryptoAmount,
			clientVault.totalShares, // Keep existing shares unchanged
		)

		// Step 6: Update end_user.last_deposit_at
		await this.userRepository.updateDepositTimestamp(endUser.id)

		// Step 7: Mark first deposit if needed (check if firstDepositAt is null)
		if (!endUser.firstDepositAt) {
			await this.userRepository.markFirstDeposit(endUser.id)
		}

		// Audit log
		await this.auditRepository.create({
			clientId: deposit.clientId,
			userId: deposit.userId,
			actorType: "system",
			action: "deposit_completed",
			resourceType: "deposit",
			resourceId: deposit.id,
			description: `Deposit completed: ${request.cryptoAmount} ${request.tokenSymbol}`,
			metadata: {
				orderId: request.orderId,
				cryptoAmount: request.cryptoAmount,
				totalFees: request.totalFees,
				clientGrowthIndex: clientGrowthIndex.toString(),
				clientGrowthIndexDecimal: clientGrowthIndex.dividedBy("1e18").toString(),
				chain: request.chain,
				tokenAddress: request.tokenAddress,
			},
			ipAddress: null,
			userAgent: null,
		})

		console.log("[Deposit] ✅ Deposit completed:", {
			orderId: request.orderId,
			userId: deposit.userId,
			clientId: deposit.clientId,
			amount: request.cryptoAmount,
			chain: request.chain,
			token: request.tokenSymbol,
		})
	}

	/**
	 * Mint tokens to custodial wallet using MockUSDCClient
	 *
	 * @param chainId - Chain ID (Sepolia: 11155111, Base Sepolia: 84532)
	 * @param tokenAddress - MockUSDC token contract address
	 * @param custodialWallet - Destination custodial wallet address
	 * @param amount - Amount to mint (in USDC, e.g., "1000.50")
	 * @returns Mint result with transaction hash
	 */
	async mintTokensToCustodial(chainId: string, tokenAddress: string, custodialWallet: string, amount: string) {
		console.log("[Deposit] Minting tokens to custodial wallet:", {
			chainId,
			tokenAddress,
			custodialWallet,
			amount,
		})

		// Create MockUSDC client
		const mockUSDC = new MockUSDCClient(chainId as MockTokenChainId, tokenAddress as `0x${string}`)

		// Mint tokens
		const result = await mockUSDC.write.mintToCustodial(custodialWallet as `0x${string}`, amount)

		if (!result.success) {
			console.error("[Deposit] ❌ Mint failed:", result.error)
			throw new Error(`Token mint failed: ${result.error}`)
		}

		console.log("[Deposit] ✅ Tokens minted:", {
			txHash: result.txHash,
			blockNumber: result.blockNumber?.toString(),
			amount: result.amountMinted,
		})

		return result
	}

	/**
	 * Transfer USDC from oracle wallet to custodial wallet (for mainnet/production)
	 *
	 * Flow:
	 * 1. Check oracle wallet balance FIRST
	 * 2. If insufficient → return error with balance details
	 * 3. If sufficient → execute ERC20 transfer
	 *
	 * @param chainId - Chain ID (Mainnet: 1, Sepolia: 11155111)
	 * @param tokenAddress - USDC token contract address
	 * @param custodialWallet - Destination custodial wallet address
	 * @param amount - Amount to transfer (in USDC, e.g., "1000.50")
	 * @param privateKey - Oracle wallet private key
	 * @param rpcUrl - Optional custom RPC URL
	 * @returns Transfer result with status and balance info
	 */
	async transferFromOracle(
		chainId: string,
		tokenAddress: string,
		custodialWallet: string,
		amount: string,
		privateKey: string,
		rpcUrl?: string,
	): Promise<TransferResult> {
		console.log("[Deposit] Transferring USDC from oracle to custodial wallet:", {
			chainId,
			tokenAddress,
			custodialWallet,
			amount,
		})

		const result = await this.tokenTransferService.transferFromOracle({
			chainId,
			tokenAddress,
			custodialWallet,
			amount,
			privateKey,
			rpcUrl,
		})

		if (!result.success) {
			if (result.status === "insufficient_balance") {
				console.error("[Deposit] ❌ Insufficient oracle balance:", {
					required: result.requiredAmount,
					available: result.oracleBalance,
				})
			} else {
				console.error("[Deposit] ❌ Transfer failed:", result.error)
			}
		} else {
			console.log("[Deposit] ✅ USDC transferred:", {
				txHash: result.txHash,
				blockNumber: result.blockNumber?.toString(),
				amount: result.amountTransferred,
				oracleBalanceAfter: result.oracleBalanceAfter,
			})
		}

		return result
	}

	/**
	 * Fail deposit
	 */
	async failDeposit(orderId: string, errorMessage: string, errorCode?: string): Promise<void> {
		const deposit = await this.depositRepository.getByOrderId(orderId)

		if (!deposit) {
			throw new Error("Deposit not found")
		}

		await this.depositRepository.markFailed(deposit.id, errorMessage, errorCode)

		// Audit log
		await this.auditRepository.create({
			clientId: deposit.clientId,
			userId: deposit.userId,
			actorType: "system",
			action: "deposit_failed",
			resourceType: "deposit",
			resourceId: deposit.id,
			description: `Deposit failed: ${errorMessage}`,
			metadata: {
				orderId,
				errorMessage,
				errorCode,
			},
			ipAddress: null,
			userAgent: null,
		})
	}

	/**
	 * Update transaction hash for a deposit
	 */
	async updateTransactionHash(orderId: string, transactionHash: string): Promise<void> {
		await this.depositRepository.updateTransactionHash(orderId, transactionHash)
	}

	/**
	 * List deposits by client
	 */
	async listDepositsByClient(clientId: string, limit = 50, offset = 0) {
		return await this.depositRepository.listByClient(clientId, limit, offset)
	}

	/**
	 * List deposits by user
	 */
	async listDepositsByUser(clientId: string, userId: string, limit = 50) {
		return await this.depositRepository.listByUser(clientId, userId, limit)
	}

	/**
	 * List deposits by status
	 */
	async listDepositsByStatus(clientId: string, status: string, limit = 50) {
		return await this.depositRepository.listByStatus(clientId, status, limit)
	}

	/**
	 * Get deposit stats
	 */
	async getDepositStats(clientId: string, startDate?: Date, endDate?: Date) {
		// Default to last 30 days if not provided
		const end = endDate || new Date()
		const start = startDate || new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000)

		return await this.depositRepository.getStats(clientId, start, end)
	}

	/**
	 * List pending deposits with summary by currency
	 * Used for automated banking flow demo
	 */
	async listAllPendingDeposits(environment?: "sandbox" | "production"): Promise<any[]> {
		if (environment) {
			return await this.depositRepository.listAllPendingByEnvironment(environment)
		}
		return await this.depositRepository.listAllPending()
	}

	async listPendingDeposits(
		clientId: string,
		environment?: "sandbox" | "production",
	): Promise<{
		deposits: any[]
		summary: {
			currency: string
			count: number
			totalAmount: string
		}[]
	}> {
		// Use environment-filtered query if environment is provided
		const deposits = environment
			? await this.depositRepository.listPendingByClientAndEnvironment(clientId, environment)
			: await this.depositRepository.listPending(clientId)

		// Group by currency and calculate totals
		const summaryMap = new Map<string, { count: number; totalAmount: BigNumber }>()

		for (const deposit of deposits) {
			const currency = deposit.currency || "USD"
			const amount = new BigNumber(deposit.fiatAmount || "0")

			if (summaryMap.has(currency)) {
				const existing = summaryMap.get(currency)!
				existing.count += 1
				existing.totalAmount = existing.totalAmount.plus(amount)
			} else {
				summaryMap.set(currency, {
					count: 1,
					totalAmount: amount,
				})
			}
		}

		// Convert summary map to array
		const summary = Array.from(summaryMap.entries()).map(([currency, data]) => ({
			currency,
			count: data.count,
			totalAmount: data.totalAmount.toString(),
		}))

		return {
			deposits,
			summary,
		}
	}
}
