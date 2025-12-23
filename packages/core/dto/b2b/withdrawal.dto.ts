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
	// Environment support (sandbox vs production)
	environment?: "sandbox" | "production"
	network?: string // e.g., "sepolia", "mainnet"
	oracleAddress?: string // Oracle custodial wallet address that sends the withdrawal
	// Revenue split control
	deductFees?: boolean // If true, deduct platform/client fees from withdrawal; if false, defer fees for later settlement (default: true)
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
	// Fee breakdown (if withdrawal processed)
	feeBreakdown?: {
		totalYield: string // Total yield earned since deposit
		platformFee: string // Fee taken by Quirk platform
		clientFee: string // Fee taken by client
		userNetYield: string // Net yield received by user
		feesDeducted: boolean // Whether fees were deducted or deferred
		platformFeePercent: string // Platform fee percentage applied
		clientFeePercent: string // Client fee percentage applied
	}
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
