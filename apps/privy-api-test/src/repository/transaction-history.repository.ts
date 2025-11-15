import dayjs from "dayjs"
import type {
	ITransactionHistoryDataGateway,
	TransactionStatusUpdate,
	TransactionHistoryEntry,
} from "@proxify/core"

/**
 * Mock Transaction History Repository
 * In-memory storage for transaction history
 *
 * TODO: Replace with PostgreSQL implementation using sqlc
 * Database schema should include:
 * - tx_hash (PK)
 * - chain_id
 * - product_id
 * - user_id
 * - from_address
 * - to_address
 * - value
 * - data
 * - status
 * - block_number
 * - gas_used
 * - created_at
 * - updated_at
 */
export class MockTransactionHistoryRepository implements ITransactionHistoryDataGateway {
	private transactions: Map<string, TransactionHistoryEntry> = new Map()

	/**
	 * Create a new transaction history entry
	 */
	public async create(entry: TransactionHistoryEntry): Promise<TransactionHistoryEntry> {
		console.log("[TxHistoryRepo] Creating transaction entry", {
			txHash: entry.txHash,
			userId: entry.userId,
		})

		// Check if transaction already exists
		const existing = this.transactions.get(entry.txHash)
		if (existing) {
			throw new Error(`Transaction ${entry.txHash} already exists`)
		}

		this.transactions.set(entry.txHash, entry)

		console.log("[TxHistoryRepo] Transaction entry created", {
			txHash: entry.txHash,
		})

		return entry
	}

	/**
	 * Get transaction by hash
	 */
	public async getByTxHash(txHash: string): Promise<TransactionHistoryEntry | null> {
		console.log("[TxHistoryRepo] Getting transaction by hash", { txHash })

		const transaction = this.transactions.get(txHash)

		if (!transaction) {
			console.log("[TxHistoryRepo] Transaction not found", { txHash })
			return null
		}

		return transaction
	}

	/**
	 * List all transactions for a user
	 */
	public async listByUser(params: {
		productId: string
		userId: string
		limit?: number
		offset?: number
	}): Promise<TransactionHistoryEntry[]> {
		const { productId, userId, limit = 50, offset = 0 } = params

		console.log("[TxHistoryRepo] Listing transactions for user", {
			productId,
			userId,
			limit,
			offset,
		})

		// Filter transactions for this user
		const userTransactions = Array.from(this.transactions.values()).filter(
			(tx) => tx.productId === productId && tx.userId === userId,
		)

		// Sort by timestamp descending (newest first)
		userTransactions.sort((a, b) => dayjs(b.timestamp).valueOf() - dayjs(a.timestamp).valueOf())

		// Apply pagination
		const paginatedTransactions = userTransactions.slice(offset, offset + limit)

		console.log("[TxHistoryRepo] Found transactions", {
			total: userTransactions.length,
			returned: paginatedTransactions.length,
		})

		return paginatedTransactions
	}

	/**
	 * Update transaction status
	 */
	public async updateStatus(update: TransactionStatusUpdate): Promise<TransactionHistoryEntry> {
		const { txHash, status, blockNumber, gasUsed } = update

		console.log("[TxHistoryRepo] Updating transaction status", {
			txHash,
			status,
		})

		const transaction = this.transactions.get(txHash)

		if (!transaction) {
			throw new Error(`Transaction ${txHash} not found`)
		}

		// Update status
		transaction.status = status

		if (blockNumber !== undefined) {
			transaction.blockNumber = blockNumber
		}

		if (gasUsed !== undefined) {
			transaction.gasUsed = gasUsed
		}

		this.transactions.set(txHash, transaction)

		console.log("[TxHistoryRepo] Transaction status updated", {
			txHash,
			status,
		})

		return transaction
	}

	/**
	 * Clear all transactions (for testing)
	 */
	public clear(): void {
		console.log("[TxHistoryRepo] Clearing all transactions")
		this.transactions.clear()
	}
}
