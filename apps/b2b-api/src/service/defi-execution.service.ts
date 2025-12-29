/**
 * DeFi Execution Service
 * Prepares DeFi deposit/withdrawal transactions using yield-engine adapters
 * 
 * This service bridges optimization → execution:
 * 1. Uses DeFiProtocolService.optimizeAllocation() for risk-based allocations
 * 2. Uses yield-engine adapters to prepare transaction data
 * 3. Returns transaction data for frontend/wallet signing
 */

import {
	AaveAdapter,
	CompoundAdapter,
	MorphoAdapter,
	BatchExecutor,
	type TransactionRequest,
	type Protocol,
	type BatchProtocolAllocation,
} from '@quirk/yield-engine'
import { DeFiProtocolService } from './defi-protocol.service'

// ============================================================================
// Types
// ============================================================================

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

	constructor(defiProtocolService: DeFiProtocolService) {
		this.defiProtocolService = defiProtocolService
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
		// Import constants from yield-engine
		switch (protocol) {
			case 'aave': {
				const { getPoolAddress } = await import('@quirk/yield-engine')
				return getPoolAddress(chainId) || ''
			}
			case 'compound': {
				const { getCompoundTokenInfo } = await import('@quirk/yield-engine')
				const config = getCompoundTokenInfo(token, chainId)
				return config?.cometAddress || ''
			}
			case 'morpho': {
				const { getMorphoTokenInfo } = await import('@quirk/yield-engine')
				const config = getMorphoTokenInfo(token, chainId)
				return config?.vaultAddress || ''
			}
			default:
				throw new Error(`Unknown protocol: ${protocol}`)
		}
	}
}
