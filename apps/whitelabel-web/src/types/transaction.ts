/**
 * Transaction Types
 * Based on PRODUCT_OWNER_FLOW.md - transactions table schema
 */

export type TransactionType = 'deposit' | 'withdraw' | 'yield' | 'rebalance'

export interface Transaction {
	id: string
	clientId: string
	userId: string
	type: TransactionType
	amount: string
	indexAtTime: string // Index value when transaction occurred
	txHash: string | null
	status: 'pending' | 'completed' | 'failed'
	createdAt: string
}

/**
 * Transaction list item for dashboard
 */
export interface TransactionListItem {
	id: string
	userId: string
	type: TransactionType
	amount: number
	status: 'pending' | 'completed' | 'failed'
	txHash: string | null
	timestamp: string
}

/**
 * Transaction summary
 */
export interface TransactionSummary {
	totalDeposits: number
	totalWithdrawals: number
	totalYield: number
	transactionCount: number
	averageDeposit: number
	averageWithdrawal: number
}

export interface TransactionListResponse {
	transactions: Transaction[]
	total: number
	page: number
	pageSize: number
}

export interface TransactionFilters {
	type?: TransactionType
	userId?: string
	startDate?: string
	endDate?: string
}
