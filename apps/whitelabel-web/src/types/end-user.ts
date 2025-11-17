/**
 * End-User Deposit Types
 * Based on PRODUCT_OWNER_FLOW.md - user_deposits table schema
 * Index-based accounting: value = (balance × currentIndex) / entryIndex
 */

export interface EndUserDeposit {
	id: string
	clientId: string
	userId: string // Client's end-user ID
	amountDeposited: string // Original deposit amount
	balance: string // Balance units (fixed at deposit)
	entryIndex: string // Index at deposit time (locked)
	depositedAt: string
	updatedAt: string
}

export interface EndUserWithValue extends EndUserDeposit {
	currentValue: string // Calculated: (balance × currentIndex) / entryIndex
	yieldEarned: string // currentValue - amountDeposited
	yieldPercent: number // (yieldEarned / amountDeposited) * 100
}

/**
 * Alias for hooks compatibility
 */
export type EndUserValue = EndUserWithValue

/**
 * End-user list item for dashboard table
 */
export interface EndUserListItem {
	userId: string
	deposited: number
	currentValue: number
	yieldEarned: number
	yieldPercent: number
	depositedAt: string
	lastActivity: string
}

export interface CreateDepositRequest {
	userId: string
	amount: string
}

export interface WithdrawRequest {
	userId: string
	amount: string
}
