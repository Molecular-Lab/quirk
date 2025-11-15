import { randomUUID } from "node:crypto"
import VError from "verror"
import type { IWalletTransactionDataGateway } from "../datagateway/wallet-transaction.datagateway"
import type { ITransactionHistoryDataGateway } from "../datagateway/wallet-transaction.datagateway"
import type {
	EthereumTransactionParams,
	EthereumTransactionResult,
	RpcRequestParams,
	TransactionHistoryEntry,
} from "../entity/wallet-transaction.entity"

/**
 * Wallet Transaction Use Case
 * Business logic for wallet transaction execution
 *
 * Responsibilities:
 * - Validate transaction parameters
 * - Execute transactions via Privy
 * - Store transaction history in database
 * - Provide transaction status queries
 * - Estimate gas and provide gas price info
 */
export class WalletTransactionUseCase {
	constructor(
		private readonly walletTransactionGateway: IWalletTransactionDataGateway,
		private readonly transactionHistoryGateway: ITransactionHistoryDataGateway,
	) {}

	/**
	 * Send a transaction from user's embedded wallet
	 */
	public async sendTransaction(params: {
		productId: string
		userId: string
		walletAddress: string
		transaction: EthereumTransactionParams
	}): Promise<{
		transaction: EthereumTransactionResult
		historyEntry: TransactionHistoryEntry
	}> {
		const { productId, userId, walletAddress, transaction } = params

		try {
			console.log("[WalletTxUseCase] Sending transaction", {
				userId,
				walletAddress,
				to: transaction.to,
				chainId: transaction.chainId,
			})

			// Validate transaction parameters
			this.validateTransaction(transaction)

			// Send transaction via Privy
			const txResult = await this.walletTransactionGateway.sendTransaction({
				walletAddress,
				transaction,
			})

			// Create history entry
			const historyEntry: TransactionHistoryEntry = {
				id: randomUUID(),
				productId,
				userId,
				walletAddress,
				txHash: txResult.txHash,
				chainId: txResult.chainId,
				from: txResult.from,
				to: txResult.to,
				value: txResult.value,
				status: txResult.status,
				timestamp: txResult.timestamp,
			}

			// Save to database
			const savedEntry = await this.transactionHistoryGateway.create(historyEntry)

			console.log("[WalletTxUseCase] Transaction sent and recorded", {
				txHash: txResult.txHash,
			})

			return {
				transaction: txResult,
				historyEntry: savedEntry,
			}
		} catch (error) {
			console.error("[WalletTxUseCase] Send transaction failed", {
				error: error instanceof Error ? error.message : error,
				userId,
			})

			throw new VError(
				{
					cause: error as Error,
					info: {
						event: "send_transaction_failed",
						userId,
						walletAddress,
						chainId: transaction.chainId,
					},
				},
				"[WalletTransaction] Failed to send transaction",
			)
		}
	}

	/**
	 * Sign a transaction without sending
	 */
	public async signTransaction(params: {
		walletAddress: string
		transaction: EthereumTransactionParams
	}): Promise<{ signedTx: string }> {
		const { walletAddress, transaction } = params

		try {
			console.log("[WalletTxUseCase] Signing transaction", {
				walletAddress,
				to: transaction.to,
				chainId: transaction.chainId,
			})

			// Validate transaction parameters
			this.validateTransaction(transaction)

			// Sign transaction via Privy
			const result = await this.walletTransactionGateway.signTransaction({
				walletAddress,
				transaction,
			})

			console.log("[WalletTxUseCase] Transaction signed")

			return result
		} catch (error) {
			console.error("[WalletTxUseCase] Sign transaction failed", {
				error: error instanceof Error ? error.message : error,
				walletAddress,
			})

			throw new VError(
				{
					cause: error as Error,
					info: {
						event: "sign_transaction_failed",
						walletAddress,
						chainId: transaction.chainId,
					},
				},
				"[WalletTransaction] Failed to sign transaction",
			)
		}
	}

	/**
	 * Execute custom RPC call
	 */
	public async executeRpc(params: RpcRequestParams): Promise<any> {
		try {
			console.log("[WalletTxUseCase] Executing RPC", {
				method: params.method,
				chainId: params.chainId,
			})

			const result = await this.walletTransactionGateway.executeRpc(params)

			console.log("[WalletTxUseCase] RPC executed")

			return result
		} catch (error) {
			console.error("[WalletTxUseCase] RPC execution failed", {
				error: error instanceof Error ? error.message : error,
				method: params.method,
			})

			throw new VError(
				{
					cause: error as Error,
					info: {
						event: "rpc_execution_failed",
						method: params.method,
						chainId: params.chainId,
					},
				},
				"[WalletTransaction] Failed to execute RPC call",
			)
		}
	}

	/**
	 * Get transaction status
	 */
	public async getTransactionStatus(params: {
		txHash: string
		chainId: number
	}): Promise<{
		status: "pending" | "confirmed" | "failed"
		blockNumber?: number
		gasUsed?: string
		effectiveGasPrice?: string
	}> {
		try {
			console.log("[WalletTxUseCase] Getting transaction status", {
				txHash: params.txHash,
				chainId: params.chainId,
			})

			const status = await this.walletTransactionGateway.getTransactionStatus(params.txHash, params.chainId)

			console.log("[WalletTxUseCase] Transaction status retrieved", {
				status: status.status,
			})

			return status
		} catch (error) {
			console.error("[WalletTxUseCase] Get transaction status failed", {
				error: error instanceof Error ? error.message : error,
				txHash: params.txHash,
			})

			throw new VError(
				{
					cause: error as Error,
					info: {
						event: "get_transaction_status_failed",
						txHash: params.txHash,
						chainId: params.chainId,
					},
				},
				"[WalletTransaction] Failed to get transaction status",
			)
		}
	}

	/**
	 * Estimate gas for transaction
	 */
	public async estimateGas(transaction: EthereumTransactionParams): Promise<{ gasEstimate: string }> {
		try {
			console.log("[WalletTxUseCase] Estimating gas", {
				to: transaction.to,
				chainId: transaction.chainId,
			})

			const estimate = await this.walletTransactionGateway.estimateGas(transaction)

			console.log("[WalletTxUseCase] Gas estimated", {
				gasEstimate: estimate.gasEstimate,
			})

			return estimate
		} catch (error) {
			console.error("[WalletTxUseCase] Gas estimation failed", {
				error: error instanceof Error ? error.message : error,
			})

			throw new VError(
				{
					cause: error as Error,
					info: {
						event: "gas_estimation_failed",
						chainId: transaction.chainId,
					},
				},
				"[WalletTransaction] Failed to estimate gas",
			)
		}
	}

	/**
	 * Get current gas price
	 */
	public async getGasPrice(chainId: number): Promise<{
		gasPrice: string
		maxFeePerGas?: string
		maxPriorityFeePerGas?: string
	}> {
		try {
			console.log("[WalletTxUseCase] Getting gas price", { chainId })

			const gasPrice = await this.walletTransactionGateway.getGasPrice(chainId)

			console.log("[WalletTxUseCase] Gas price retrieved")

			return gasPrice
		} catch (error) {
			console.error("[WalletTxUseCase] Get gas price failed", {
				error: error instanceof Error ? error.message : error,
				chainId,
			})

			throw new VError(
				{
					cause: error as Error,
					info: {
						event: "get_gas_price_failed",
						chainId,
					},
				},
				"[WalletTransaction] Failed to get gas price",
			)
		}
	}

	/**
	 * Get transaction history for a user
	 */
	public async getTransactionHistory(params: {
		productId: string
		userId: string
		limit?: number
		offset?: number
	}): Promise<TransactionHistoryEntry[]> {
		try {
			console.log("[WalletTxUseCase] Getting transaction history", {
				productId: params.productId,
				userId: params.userId,
			})

			const transactions = await this.transactionHistoryGateway.listByUser(params)

			console.log("[WalletTxUseCase] Transaction history retrieved", {
				count: transactions.length,
			})

			return transactions
		} catch (error) {
			console.error("[WalletTxUseCase] Get transaction history failed", {
				error: error instanceof Error ? error.message : error,
				userId: params.userId,
			})

			throw new VError(
				{
					cause: error as Error,
					info: {
						event: "get_transaction_history_failed",
						productId: params.productId,
						userId: params.userId,
					},
				},
				"[WalletTransaction] Failed to get transaction history",
			)
		}
	}

	/**
	 * Get transaction by hash
	 */
	public async getTransactionByHash(txHash: string): Promise<TransactionHistoryEntry | null> {
		try {
			console.log("[WalletTxUseCase] Getting transaction by hash", { txHash })

			const transaction = await this.transactionHistoryGateway.getByTxHash(txHash)

			if (!transaction) {
				console.log("[WalletTxUseCase] Transaction not found", { txHash })
				return null
			}

			console.log("[WalletTxUseCase] Transaction found")

			return transaction
		} catch (error) {
			console.error("[WalletTxUseCase] Get transaction by hash failed", {
				error: error instanceof Error ? error.message : error,
				txHash,
			})

			throw new VError(
				{
					cause: error as Error,
					info: {
						event: "get_transaction_by_hash_failed",
						txHash,
					},
				},
				"[WalletTransaction] Failed to get transaction by hash",
			)
		}
	}

	/**
	 * Validate transaction parameters
	 */
	private validateTransaction(transaction: EthereumTransactionParams): void {
		// Validate addresses
		if (!transaction.to || !/^0x[a-fA-F0-9]{40}$/.test(transaction.to)) {
			throw new Error("Invalid 'to' address")
		}

		// Validate chainId
		if (!transaction.chainId || transaction.chainId <= 0) {
			throw new Error("Invalid chainId")
		}

		// Validate value (if provided)
		if (transaction.value && !/^0x[a-fA-F0-9]+$/.test(transaction.value)) {
			throw new Error("Invalid value format. Must be hex string")
		}

		// Validate data (if provided)
		if (transaction.data && !/^0x[a-fA-F0-9]*$/.test(transaction.data)) {
			throw new Error("Invalid data format. Must be hex string")
		}
	}
}
