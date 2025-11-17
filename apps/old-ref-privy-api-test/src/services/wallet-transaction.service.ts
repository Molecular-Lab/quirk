import {
	WalletTransactionUseCase,
	type EthereumTransactionParams,
	type EthereumTransactionResult,
	type RpcRequestParams,
	type TransactionHistoryEntry,
} from "@proxify/core"

/**
 * Wallet Transaction Service
 * Service layer wrapping wallet transaction use case
 */
export class WalletTransactionService {
	constructor(private readonly walletTransactionUseCase: WalletTransactionUseCase) {}

	/**
	 * Send a transaction
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
		return this.walletTransactionUseCase.sendTransaction(params)
	}

	/**
	 * Sign a transaction
	 */
	public async signTransaction(params: {
		walletAddress: string
		transaction: EthereumTransactionParams
	}): Promise<{ signedTx: string }> {
		return this.walletTransactionUseCase.signTransaction(params)
	}

	/**
	 * Execute RPC call
	 */
	public async executeRpc(params: RpcRequestParams): Promise<any> {
		return this.walletTransactionUseCase.executeRpc(params)
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
		return this.walletTransactionUseCase.getTransactionStatus(params)
	}

	/**
	 * Estimate gas
	 */
	public async estimateGas(transaction: EthereumTransactionParams): Promise<{ gasEstimate: string }> {
		return this.walletTransactionUseCase.estimateGas(transaction)
	}

	/**
	 * Get gas price
	 */
	public async getGasPrice(chainId: number): Promise<{
		gasPrice: string
		maxFeePerGas?: string
		maxPriorityFeePerGas?: string
	}> {
		return this.walletTransactionUseCase.getGasPrice(chainId)
	}

	/**
	 * Get transaction history
	 */
	public async getTransactionHistory(params: {
		productId: string
		userId: string
		limit?: number
		offset?: number
	}): Promise<TransactionHistoryEntry[]> {
		return this.walletTransactionUseCase.getTransactionHistory(params)
	}

	/**
	 * Get transaction by hash
	 */
	public async getTransactionByHash(txHash: string): Promise<TransactionHistoryEntry | null> {
		return this.walletTransactionUseCase.getTransactionByHash(txHash)
	}
}
