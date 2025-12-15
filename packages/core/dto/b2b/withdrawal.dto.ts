/**
 * B2B Withdrawal DTO - Request/Response Types
 * Used for API ↔ UseCase communication
 */

export interface CreateWithdrawalRequest {
	clientId: string
	userId: string
	chain: string
	tokenAddress: string
	amount: string // USD amount
	orderId: string
	destinationType: "client_balance" | "bank_account" | "debit_card" | "crypto_wallet"
	destinationDetails?: any
}

export interface WithdrawalResponse {
	id: string
	orderId: string
	clientId: string
	userId: string
	requestedAmount: string
	actualAmount: string | null
	currency: string
	status: string
	destinationType: string
	createdAt: Date
	completedAt: Date | null
}

export interface CompleteWithdrawalRequest {
	orderId: string
	actualAmount?: string
}

export interface FailWithdrawalRequest {
	orderId: string
	errorMessage: string
	errorCode?: string
}

export interface GetWithdrawalStatsRequest {
	clientId: string
	startDate: Date
	endDate: Date
}
