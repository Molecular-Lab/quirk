import type { WalletClient } from 'viem'
import type {
	Protocol,
	TransactionReceipt,
	IProtocolAdapter,
} from '../types/common.types'
import { AaveAdapter } from '../protocols/aave/aave.adapter'
import { CompoundAdapter } from '../protocols/compound/compound.adapter'
import { MorphoAdapter } from '../protocols/morpho/morpho.adapter'

// ============================================================================
// BatchExecutor Types
// ============================================================================

/**
 * Allocation of funds to a specific protocol
 */
export interface ProtocolAllocation {
	/** Target protocol */
	protocol: Protocol
	/** Percentage allocation (0-100) */
	percentage: number
	/** Absolute amount in token's smallest unit */
	amount?: string
}

/**
 * Request for batch deposit across multiple protocols
 */
export interface BatchDepositRequest {
	/** Token symbol (e.g., "USDC") */
	token: string
	/** Chain ID */
	chainId: number
	/** Total amount to deposit */
	totalAmount: string
	/** Protocol allocations (must sum to 100%) */
	allocations: ProtocolAllocation[]
	/** Wallet client for signing transactions */
	walletClient: WalletClient
	/** Execution mode */
	executionMode: 'sequential' | 'parallel'
}

/**
 * Request for batch withdrawal across multiple protocols
 */
export interface BatchWithdrawalRequest {
	/** Token symbol */
	token: string
	/** Chain ID */
	chainId: number
	/** Protocol allocations with amounts to withdraw */
	allocations: ProtocolAllocation[]
	/** Wallet client for signing transactions */
	walletClient: WalletClient
	/** Execution mode */
	executionMode: 'sequential' | 'parallel'
}

/**
 * Result of a single protocol execution
 */
export interface ProtocolExecutionResult {
	/** Protocol that was executed */
	protocol: Protocol
	/** Whether execution succeeded */
	success: boolean
	/** Transaction receipt if successful */
	receipt?: TransactionReceipt
	/** Error message if failed */
	error?: string
	/** Amount that was deposited/withdrawn */
	amount: string
}

/**
 * Result of batch execution across multiple protocols
 */
export interface BatchExecutionResult {
	/** Overall success (true if all protocols succeeded) */
	overallSuccess: boolean
	/** Results per protocol */
	results: ProtocolExecutionResult[]
	/** Total amount successfully processed */
	totalProcessed: string
	/** Total gas used across all transactions */
	totalGasUsed: bigint
	/** Protocols that failed */
	failedProtocols: Protocol[]
	/** Execution timestamp */
	timestamp: number
}

// ============================================================================
// BatchExecutor Class
// ============================================================================

/**
 * BatchExecutor enables deposits/withdrawals across multiple DeFi protocols
 *
 * @example
 * ```typescript
 * const executor = new BatchExecutor();
 *
 * // Deposit $1000 USDC: 50% AAVE, 30% Compound, 20% Morpho
 * const result = await executor.executeBatchDeposit({
 *   token: 'USDC',
 *   chainId: 1,
 *   totalAmount: '1000000000', // 1000 USDC (6 decimals)
 *   allocations: [
 *     { protocol: 'aave', percentage: 50 },
 *     { protocol: 'compound', percentage: 30 },
 *     { protocol: 'morpho', percentage: 20 },
 *   ],
 *   walletClient,
 *   executionMode: 'sequential',
 * });
 * ```
 */
export class BatchExecutor {
	private adapters: Map<Protocol, IProtocolAdapter>

	constructor() {
		// Initialize adapters lazily - they'll be created on first use per chainId
		this.adapters = new Map()
	}

	/**
	 * Get or create adapter for a protocol
	 */
	private getAdapter(protocol: Protocol, chainId: number): IProtocolAdapter {
		const key = `${protocol}-${chainId}` as Protocol
		let adapter = this.adapters.get(key)

		if (!adapter) {
			switch (protocol) {
				case 'aave':
					adapter = new AaveAdapter(chainId)
					break
				case 'compound':
					adapter = new CompoundAdapter(chainId)
					break
				case 'morpho':
					adapter = new MorphoAdapter(chainId)
					break
				default:
					throw new Error(`Unsupported protocol: ${protocol}`)
			}
			this.adapters.set(key, adapter)
		}

		return adapter
	}

	/**
	 * Execute batch deposit across multiple protocols
	 */
	async executeBatchDeposit(
		request: BatchDepositRequest,
	): Promise<BatchExecutionResult> {
		// Validate allocations sum to 100%
		const totalPercentage = request.allocations.reduce(
			(sum, a) => sum + a.percentage,
			0,
		)
		if (Math.abs(totalPercentage - 100) > 0.01) {
			throw new Error(
				`Allocations must sum to 100%, got ${totalPercentage}%`,
			)
		}

		// Calculate amounts for each allocation
		const totalAmount = BigInt(request.totalAmount)
		const allocationsWithAmounts = request.allocations.map((a) => ({
			...a,
			amount: ((totalAmount * BigInt(Math.round(a.percentage * 100))) / 10000n).toString(),
		}))

		const results: ProtocolExecutionResult[] = []
		const failedProtocols: Protocol[] = []
		let totalGasUsed = 0n
		let totalProcessed = 0n

		if (request.executionMode === 'sequential') {
			// Execute one by one - recommended for production
			for (const allocation of allocationsWithAmounts) {
				const result = await this.executeProtocolDeposit(
					allocation,
					request.token,
					request.chainId,
					request.walletClient,
				)
				results.push(result)

				if (result.success) {
					totalProcessed += BigInt(result.amount)
					if (result.receipt) {
						totalGasUsed += result.receipt.gasUsed
					}
				} else {
					failedProtocols.push(allocation.protocol)
				}
			}
		} else {
			// Execute in parallel - for testing only
			const promises = allocationsWithAmounts.map((allocation) =>
				this.executeProtocolDeposit(
					allocation,
					request.token,
					request.chainId,
					request.walletClient,
				),
			)

			const settled = await Promise.allSettled(promises)

			for (let i = 0; i < settled.length; i++) {
				const outcome = settled[i]
				const protocol = allocationsWithAmounts[i].protocol

				if (outcome.status === 'fulfilled') {
					results.push(outcome.value)
					if (outcome.value.success) {
						totalProcessed += BigInt(outcome.value.amount)
						if (outcome.value.receipt) {
							totalGasUsed += outcome.value.receipt.gasUsed
						}
					} else {
						failedProtocols.push(protocol)
					}
				} else {
					results.push({
						protocol,
						success: false,
						error: outcome.reason?.message || 'Unknown error',
						amount: allocationsWithAmounts[i].amount || '0',
					})
					failedProtocols.push(protocol)
				}
			}
		}

		return {
			overallSuccess: failedProtocols.length === 0,
			results,
			totalProcessed: totalProcessed.toString(),
			totalGasUsed,
			failedProtocols,
			timestamp: Date.now(),
		}
	}

	/**
	 * Execute deposit for a single protocol
	 */
	async executeProtocolDeposit(
		allocation: ProtocolAllocation & { amount: string },
		token: string,
		chainId: number,
		walletClient: WalletClient,
	): Promise<ProtocolExecutionResult> {
		try {
			const adapter = this.getAdapter(allocation.protocol, chainId)

			const receipt = await adapter.executeDeposit(
				token,
				chainId,
				allocation.amount,
				walletClient,
			)

			return {
				protocol: allocation.protocol,
				success: receipt.status === 'success',
				receipt,
				amount: allocation.amount,
			}
		} catch (error) {
			return {
				protocol: allocation.protocol,
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error',
				amount: allocation.amount,
			}
		}
	}

	/**
	 * Execute batch withdrawal across multiple protocols
	 */
	async executeBatchWithdrawal(
		request: BatchWithdrawalRequest,
	): Promise<BatchExecutionResult> {
		const results: ProtocolExecutionResult[] = []
		const failedProtocols: Protocol[] = []
		let totalGasUsed = 0n
		let totalProcessed = 0n

		if (request.executionMode === 'sequential') {
			for (const allocation of request.allocations) {
				if (!allocation.amount) {
					throw new Error(
						`Amount required for withdrawal from ${allocation.protocol}`,
					)
				}
				const result = await this.executeProtocolWithdrawal(
					allocation as ProtocolAllocation & { amount: string },
					request.token,
					request.chainId,
					request.walletClient,
				)
				results.push(result)

				if (result.success) {
					totalProcessed += BigInt(result.amount)
					if (result.receipt) {
						totalGasUsed += result.receipt.gasUsed
					}
				} else {
					failedProtocols.push(allocation.protocol)
				}
			}
		} else {
			const promises = request.allocations.map((allocation) => {
				if (!allocation.amount) {
					return Promise.reject(
						new Error(`Amount required for withdrawal from ${allocation.protocol}`),
					)
				}
				return this.executeProtocolWithdrawal(
					allocation as ProtocolAllocation & { amount: string },
					request.token,
					request.chainId,
					request.walletClient,
				)
			})

			const settled = await Promise.allSettled(promises)

			for (let i = 0; i < settled.length; i++) {
				const outcome = settled[i]
				const protocol = request.allocations[i].protocol

				if (outcome.status === 'fulfilled') {
					results.push(outcome.value)
					if (outcome.value.success) {
						totalProcessed += BigInt(outcome.value.amount)
						if (outcome.value.receipt) {
							totalGasUsed += outcome.value.receipt.gasUsed
						}
					} else {
						failedProtocols.push(protocol)
					}
				} else {
					results.push({
						protocol,
						success: false,
						error: outcome.reason?.message || 'Unknown error',
						amount: request.allocations[i].amount || '0',
					})
					failedProtocols.push(protocol)
				}
			}
		}

		return {
			overallSuccess: failedProtocols.length === 0,
			results,
			totalProcessed: totalProcessed.toString(),
			totalGasUsed,
			failedProtocols,
			timestamp: Date.now(),
		}
	}

	/**
	 * Execute withdrawal for a single protocol
	 */
	async executeProtocolWithdrawal(
		allocation: ProtocolAllocation & { amount: string },
		token: string,
		chainId: number,
		walletClient: WalletClient,
	): Promise<ProtocolExecutionResult> {
		try {
			const adapter = this.getAdapter(allocation.protocol, chainId)

			const receipt = await adapter.executeWithdrawal(
				token,
				chainId,
				allocation.amount,
				walletClient,
			)

			return {
				protocol: allocation.protocol,
				success: receipt.status === 'success',
				receipt,
				amount: allocation.amount,
			}
		} catch (error) {
			return {
				protocol: allocation.protocol,
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error',
				amount: allocation.amount,
			}
		}
	}

	/**
	 * Estimate gas for batch deposit
	 */
	async estimateBatchGas(
		request: Omit<BatchDepositRequest, 'walletClient' | 'executionMode'>,
		fromAddress: string,
	): Promise<{ totalGas: bigint; perProtocol: Map<Protocol, bigint> }> {
		const totalAmount = BigInt(request.totalAmount)
		const perProtocol = new Map<Protocol, bigint>()
		let totalGas = 0n

		for (const allocation of request.allocations) {
			const amount = ((totalAmount * BigInt(Math.round(allocation.percentage * 100))) / 10000n).toString()
			const adapter = this.getAdapter(allocation.protocol, request.chainId)

			try {
				const gas = await adapter.estimateDepositGas(
					request.token,
					request.chainId,
					amount,
					fromAddress,
				)
				perProtocol.set(allocation.protocol, gas)
				totalGas += gas
			} catch {
				// Use default estimate
				const defaultGas = 250000n
				perProtocol.set(allocation.protocol, defaultGas)
				totalGas += defaultGas
			}
		}

		return { totalGas, perProtocol }
	}
}
