import type {
	EthereumTransactionParams,
	EthereumTransactionResult,
	RpcRequestParams,
	TransactionHistoryEntry,
} from "../entity/wallet-transaction.entity"

/**
 * Wallet Transaction DataGateway
 * Interface for executing wallet transactions via Privy
 *
 * This handles all server-side wallet operations:
 * - Sending transactions
 * - Signing transactions
 * - Making RPC calls
 * - Querying transaction status
 */
export interface IWalletTransactionDataGateway {
	/**
	 * Send a transaction from an embedded wallet
	 * @param params Transaction parameters
	 * @returns Transaction result with hash
	 */
	sendTransaction(params: {
		walletAddress: string
		transaction: EthereumTransactionParams
	}): Promise<EthereumTransactionResult>

	/**
	 * Sign a transaction without sending
	 * @param params Transaction parameters
	 * @returns Signed transaction hex string
	 */
	signTransaction(params: {
		walletAddress: string
		transaction: EthereumTransactionParams
	}): Promise<{ signedTx: string }>

	/**
	 * Execute custom RPC call via Privy
	 * @param params RPC request parameters
	 * @returns RPC response
	 */
	executeRpc(params: RpcRequestParams): Promise<any>

	/**
	 * Get transaction status from blockchain
	 * @param txHash Transaction hash
	 * @param chainId Chain ID
	 * @returns Transaction receipt
	 */
	getTransactionStatus(txHash: string, chainId: number): Promise<{
		status: "pending" | "confirmed" | "failed"
		blockNumber?: number
		gasUsed?: string
		effectiveGasPrice?: string
	}>

	/**
	 * Estimate gas for a transaction
	 * @param transaction Transaction parameters
	 * @returns Estimated gas amount
	 */
	estimateGas(transaction: EthereumTransactionParams): Promise<{ gasEstimate: string }>

	/**
	 * Get current gas price
	 * @param chainId Chain ID
	 * @returns Gas price information
	 */
	getGasPrice(chainId: number): Promise<{
		gasPrice: string
		maxFeePerGas?: string
		maxPriorityFeePerGas?: string
	}>
}

/**
 * Transaction History DataGateway
 * Interface for storing transaction history in database
 */
export interface ITransactionHistoryDataGateway {
	/**
	 * Save transaction to history
	 */
	create(entry: TransactionHistoryEntry): Promise<TransactionHistoryEntry>

	/**
	 * Get transaction by hash
	 */
	getByTxHash(txHash: string): Promise<TransactionHistoryEntry | null>

	/**
	 * Get user's transaction history
	 */
	listByUser(params: {
		productId: string
		userId: string
		limit?: number
		offset?: number
	}): Promise<TransactionHistoryEntry[]>

	/**
	 * Update transaction status
	 */
	updateStatus(update: TransactionStatusUpdate): Promise<TransactionHistoryEntry>
}

export interface TransactionStatusUpdate {
	txHash: string
	status: "pending" | "confirmed" | "failed"
	blockNumber?: number
	gasUsed?: string
}
