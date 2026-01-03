/**
 * DeFi Execution Service
 * Prepares and executes DeFi deposit/withdrawal transactions using yield-engine adapters
 * 
 * This service bridges optimization → execution:
 * 1. Uses DeFiProtocolService.optimizeAllocation() for risk-based allocations
 * 2. Uses yield-engine adapters to prepare transaction data
 * 3. Executes transactions via:
 *    - Sandbox: ViemClientManager (mock USDC)
 *    - Production: PrivyWalletService (real USDC)
 */

import {
	AaveAdapter,
	CompoundAdapter,
	MorphoAdapter,
	BatchExecutor,
	type TransactionRequest,
	type Protocol,
	type BatchProtocolAllocation,
	getPoolAddress,
	getCompoundTokenInfo,
	getMorphoTokenInfo,
} from '@quirk/yield-engine'
import { ViemClientManager, type PrivyWalletService } from '@quirk/core'
import { DeFiProtocolService } from './defi-protocol.service'
import type { Logger } from 'winston'

// ============================================================================
// Types
// ============================================================================

export type Environment = 'sandbox' | 'production'

export interface PrepareDepositParams {
	/** Token symbol (e.g., "USDC") */
	token: string
	/** Chain ID */
	chainId: number
	/** Amount in token's smallest unit (e.g., "1000000000" for 1000 USDC) */
	amount: string
	/** User wallet address */
	fromAddress: string
	/** Risk level for allocation strategy */
	riskLevel: 'conservative' | 'moderate' | 'aggressive'
}

export interface ExecuteDepositParams extends PrepareDepositParams {
	/** Environment determines execution path */
	environment: Environment
	/** Privy wallet ID (required for production) */
	privyWalletId?: string
}

export interface PrepareWithdrawalParams {
	/** Token symbol */
	token: string
	/** Chain ID */
	chainId: number
	/** Amount to withdraw per protocol */
	withdrawals: Array<{
		protocol: Protocol
		amount: string
	}>
	/** User wallet address */
	toAddress: string
}

export interface ExecuteWithdrawalParams extends PrepareWithdrawalParams {
	/** Environment determines execution path */
	environment: Environment
	/** Privy wallet ID (required for production) */
	privyWalletId?: string
}

export interface PreparedTransaction {
	/** Protocol this transaction is for */
	protocol: Protocol
	/** Transaction data ready for signing */
	transaction: TransactionRequest
	/** Amount being deposited/withdrawn */
	amount: string
	/** Percentage of total (for deposits) */
	percentage?: number
}

export interface PrepareDepositResult {
	/** All transactions to execute (approval + deposit per protocol) */
	transactions: PreparedTransaction[]
	/** Allocation breakdown */
	allocation: Array<{
		protocol: Protocol
		percentage: number
		amount: string
		expectedAPY: string
	}>
	/** Total amount being deposited */
	totalAmount: string
	/** Expected blended APY */
	expectedBlendedAPY: string
	/** Risk level used */
	riskLevel: string
}

export interface ExecutionResult {
	/** Whether execution succeeded */
	success: boolean
	/** Transaction hashes */
	transactionHashes: string[]
	/** Environment used */
	environment: Environment
	/** Error message if failed */
	error?: string
}

export interface GasEstimateResult {
	/** Total gas estimate across all protocols */
	totalGas: string
	/** Gas estimate per protocol */
	perProtocol: Array<{
		protocol: Protocol
		gasEstimate: string
	}>
	/** Estimated cost in USD (if ETH price available) */
	estimatedCostUSD?: string
}

// ============================================================================
// Service
// ============================================================================

export class DeFiExecutionService {
	private defiProtocolService: DeFiProtocolService
	private privyWalletService?: PrivyWalletService
	private logger?: Logger

	constructor(
		defiProtocolService: DeFiProtocolService,
		privyWalletService?: PrivyWalletService,
		logger?: Logger
	) {
		this.defiProtocolService = defiProtocolService
		this.privyWalletService = privyWalletService
		this.logger = logger
		console.log('✅ DeFiExecutionService initialized')
	}

	/**
	 * Get adapter for a specific protocol
	 */
	private getAdapter(protocol: Protocol, chainId: number) {
		switch (protocol) {
			case 'aave':
				return new AaveAdapter(chainId)
			case 'compound':
				return new CompoundAdapter(chainId)
			case 'morpho':
				return new MorphoAdapter(chainId)
			default:
				throw new Error(`Unsupported protocol: ${protocol}`)
		}
	}

	/**
	 * Prepare deposit transactions
	 * Returns transaction data for all protocols based on risk-adjusted allocation
	 */
	async prepareDeposit(params: PrepareDepositParams): Promise<PrepareDepositResult> {
		const { token, chainId, amount, fromAddress, riskLevel } = params

		// 1. Get optimized allocation from DeFiProtocolService
		const optimization = await this.defiProtocolService.optimizeAllocation(
			token,
			chainId,
			riskLevel
		)

		// 2. Calculate amounts per protocol
		const totalAmount = BigInt(amount)
		const allocationsWithAmounts = optimization.allocation.map((alloc) => ({
			...alloc,
			amount: ((totalAmount * BigInt(Math.round(alloc.percentage * 100))) / 10000n).toString(),
		}))

		// 3. Prepare transactions for each protocol
		const transactions: PreparedTransaction[] = []

		for (const alloc of allocationsWithAmounts) {
			const adapter = this.getAdapter(alloc.protocol, chainId)

			// Prepare deposit transaction
			const depositTx = await adapter.prepareDeposit(
				token,
				chainId,
				alloc.amount,
				fromAddress
			)

			transactions.push({
				protocol: alloc.protocol,
				transaction: depositTx,
				amount: alloc.amount,
				percentage: alloc.percentage,
			})
		}

		return {
			transactions,
			allocation: allocationsWithAmounts.map((a) => ({
				protocol: a.protocol,
				percentage: a.percentage,
				amount: a.amount,
				expectedAPY: a.expectedAPY,
			})),
			totalAmount: amount,
			expectedBlendedAPY: optimization.expectedBlendedAPY,
			riskLevel,
		}
	}

	/**
	 * Prepare approval transactions for each protocol
	 * Should be called before deposit if approvals are needed
	 */
	async prepareApprovals(
		token: string,
		chainId: number,
		fromAddress: string,
		allocations: Array<{ protocol: Protocol; amount: string }>
	): Promise<PreparedTransaction[]> {
		const transactions: PreparedTransaction[] = []

		for (const alloc of allocations) {
			const adapter = this.getAdapter(alloc.protocol, chainId)

			// Get the spender address (protocol contract)
			// For now, prepare approval with max amount
			const approvalTx = await adapter.prepareApproval(
				token,
				chainId,
				// Spender will be determined by the adapter internally
				'', // The adapter will use the correct pool/comet/vault address
				alloc.amount,
				fromAddress
			)

			transactions.push({
				protocol: alloc.protocol,
				transaction: approvalTx,
				amount: alloc.amount,
			})
		}

		return transactions
	}

	/**
	 * Prepare withdrawal transactions
	 */
	async prepareWithdrawal(params: PrepareWithdrawalParams): Promise<PreparedTransaction[]> {
		const { token, chainId, withdrawals, toAddress } = params
		const transactions: PreparedTransaction[] = []

		for (const withdrawal of withdrawals) {
			const adapter = this.getAdapter(withdrawal.protocol, chainId)

			const withdrawTx = await adapter.prepareWithdrawal(
				token,
				chainId,
				withdrawal.amount,
				toAddress
			)

			transactions.push({
				protocol: withdrawal.protocol,
				transaction: withdrawTx,
				amount: withdrawal.amount,
			})
		}

		return transactions
	}

	/**
	 * Estimate gas for deposit operation
	 */
	async estimateDepositGas(
		token: string,
		chainId: number,
		amount: string,
		fromAddress: string,
		riskLevel: 'conservative' | 'moderate' | 'aggressive'
	): Promise<GasEstimateResult> {
		// Get allocation
		const optimization = await this.defiProtocolService.optimizeAllocation(
			token,
			chainId,
			riskLevel
		)

		const totalAmount = BigInt(amount)
		const perProtocol: Array<{ protocol: Protocol; gasEstimate: string }> = []
		let totalGas = 0n

		for (const alloc of optimization.allocation) {
			const allocAmount = ((totalAmount * BigInt(Math.round(alloc.percentage * 100))) / 10000n).toString()
			const adapter = this.getAdapter(alloc.protocol, chainId)

			try {
				const gas = await adapter.estimateDepositGas(token, chainId, allocAmount, fromAddress)
				perProtocol.push({
					protocol: alloc.protocol,
					gasEstimate: gas.toString(),
				})
				totalGas += gas
			} catch {
				// Use default estimate if estimation fails
				const defaultGas = 250000n
				perProtocol.push({
					protocol: alloc.protocol,
					gasEstimate: defaultGas.toString(),
				})
				totalGas += defaultGas
			}
		}

		return {
			totalGas: totalGas.toString(),
			perProtocol,
		}
	}

	/**
	 * Check if approvals are needed for each protocol
	 */
	async checkApprovals(
		token: string,
		chainId: number,
		owner: string,
		allocations: Array<{ protocol: Protocol; amount: string }>
	): Promise<Array<{ protocol: Protocol; needsApproval: boolean; currentAllowance: string }>> {
		const results = []

		for (const alloc of allocations) {
			const adapter = this.getAdapter(alloc.protocol, chainId)

			// Get the spender address based on protocol
			// This is a simplified version - in production we'd get the actual spender
			const spender = await this.getProtocolSpender(alloc.protocol, token, chainId)

			const status = await adapter.checkApproval(
				token,
				chainId,
				owner,
				spender,
				alloc.amount
			)

			results.push({
				protocol: alloc.protocol,
				needsApproval: status.needsApproval,
				currentAllowance: status.currentAllowance,
			})
		}

		return results
	}

	/**
	 * Get the spender address for a protocol (the contract that needs approval)
	 */
	private async getProtocolSpender(
		protocol: Protocol,
		token: string,
		chainId: number
	): Promise<string> {
		switch (protocol) {
			case 'aave': {
				return getPoolAddress(chainId) || ''
			}
			case 'compound': {
				const config = getCompoundTokenInfo(token, chainId)
				return config?.cometAddress || ''
			}
			case 'morpho': {
				const config = getMorphoTokenInfo(token, chainId)
				return config?.vaultAddress || ''
			}
			default:
				throw new Error(`Unknown protocol: ${protocol}`)
		}
	}

	// ============================================================================
	// Execution Methods (Environment-Aware)
	// ============================================================================

	/**
	 * Execute deposit - environment determines execution path
	 * - Sandbox: Uses ViemClientManager (mock USDC with private key)
	 * - Production: Uses PrivyWalletService (real USDC via Privy API)
	 */
	async executeDeposit(params: ExecuteDepositParams): Promise<ExecutionResult> {
		const { token, chainId, amount, fromAddress, riskLevel, environment, privyWalletId } = params
		const transactionHashes: string[] = []

		try {
			// 1. Prepare all deposit transactions
			const prepared = await this.prepareDeposit({
				token,
				chainId,
				amount,
				fromAddress,
				riskLevel,
			})

			// 2. Execute based on environment
			if (environment === 'sandbox') {
				// Use ViemClientManager for sandbox (mock USDC)
				const walletClient = ViemClientManager.getWalletClient(chainId.toString() as '11155111' | '84532')
				
				for (const tx of prepared.transactions) {
					const adapter = this.getAdapter(tx.protocol, chainId)
					const receipt = await adapter.executeDeposit(
						token,
						chainId,
						tx.amount,
						walletClient
					)
					transactionHashes.push(receipt.hash)
					this.logger?.info('[DeFiExecution] Sandbox deposit executed', {
						protocol: tx.protocol,
						hash: receipt.hash,
					})
				}
			} else {
				// Use PrivyWalletService for production
				if (!this.privyWalletService) {
					throw new Error('PrivyWalletService not configured for production')
				}
				if (!privyWalletId) {
					throw new Error('Privy wallet ID required for production execution')
				}

				for (const tx of prepared.transactions) {
					// Ensure value is properly formatted as hex string starting with 0x
					const value = tx.transaction.value
						? (typeof tx.transaction.value === 'string' && tx.transaction.value.startsWith('0x'))
							? tx.transaction.value
							: `0x${BigInt(tx.transaction.value).toString(16)}`
						: '0x0'

					const result = await this.privyWalletService.sendTransaction({
						walletId: privyWalletId,
						chainId,
						to: tx.transaction.to,
						data: tx.transaction.data,
						value,
					})
					transactionHashes.push(result.hash)
					this.logger?.info('[DeFiExecution] Production deposit executed', {
						protocol: tx.protocol,
						hash: result.hash,
					})
				}
			}

			return {
				success: true,
				transactionHashes,
				environment,
			}
		} catch (error) {
			this.logger?.error('[DeFiExecution] Deposit failed', { error, environment })
			return {
				success: false,
				transactionHashes,
				environment,
				error: error instanceof Error ? error.message : 'Unknown error',
			}
		}
	}

	/**
	 * Execute withdrawal - environment determines execution path
	 */
	async executeWithdrawal(params: ExecuteWithdrawalParams): Promise<ExecutionResult> {
		const { token, chainId, withdrawals, toAddress, environment, privyWalletId } = params
		const transactionHashes: string[] = []

		try {
			// 1. Prepare all withdrawal transactions
			const prepared = await this.prepareWithdrawal({
				token,
				chainId,
				withdrawals,
				toAddress,
			})

			// 2. Execute based on environment
			if (environment === 'sandbox') {
				const walletClient = ViemClientManager.getWalletClient(chainId.toString() as '11155111' | '84532')
				
				for (const tx of prepared) {
					const adapter = this.getAdapter(tx.protocol, chainId)
					const receipt = await adapter.executeWithdrawal(
						token,
						chainId,
						tx.amount,
						walletClient
					)
					transactionHashes.push(receipt.hash)
					this.logger?.info('[DeFiExecution] Sandbox withdrawal executed', {
						protocol: tx.protocol,
						hash: receipt.hash,
					})
				}
			} else {
				if (!this.privyWalletService) {
					throw new Error('PrivyWalletService not configured for production')
				}
				if (!privyWalletId) {
					throw new Error('Privy wallet ID required for production execution')
				}

				for (const tx of prepared) {
					// Ensure value is properly formatted as hex string starting with 0x
					const value = tx.transaction.value
						? (typeof tx.transaction.value === 'string' && tx.transaction.value.startsWith('0x'))
							? tx.transaction.value
							: `0x${BigInt(tx.transaction.value).toString(16)}`
						: '0x0'

					const result = await this.privyWalletService.sendTransaction({
						walletId: privyWalletId,
						chainId,
						to: tx.transaction.to,
						data: tx.transaction.data,
						value,
					})
					transactionHashes.push(result.hash)
					this.logger?.info('[DeFiExecution] Production withdrawal executed', {
						protocol: tx.protocol,
						hash: result.hash,
					})
				}
			}

			return {
				success: true,
				transactionHashes,
				environment,
			}
		} catch (error) {
			this.logger?.error('[DeFiExecution] Withdrawal failed', { error, environment })
			return {
				success: false,
				transactionHashes,
				environment,
				error: error instanceof Error ? error.message : 'Unknown error',
			}
		}
	}
}
