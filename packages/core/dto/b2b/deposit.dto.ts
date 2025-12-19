/**
 * B2B Deposit DTO - Request/Response Types
 * Used for API ↔ UseCase communication
 */

export interface CreateDepositRequest {
	orderId?: string
	clientId: string
	userId: string
	fiatCurrency: string
	fiatAmount: string
	cryptoCurrency: string
	depositType: "internal" | "external"
	gatewayProvider?: string
	gatewayOrderId?: string
	paymentUrl?: string
	paymentInstructions?: any
	chain?: string
	tokenSymbol?: string
	tokenAddress?: string
	onRampProvider?: string
	qrCode?: string
	expiresAt?: Date
	// Environment support (sandbox vs production)
	environment?: "sandbox" | "production"
	network?: string // e.g., "sepolia", "mainnet"
	oracleAddress?: string // Oracle custodial wallet address
}

export interface CompleteDepositRequest {
	orderId: string
	chain: string
	tokenAddress: string
	tokenSymbol: string
	cryptoAmount: string
	gatewayFee: string
	proxifyFee: string
	networkFee: string
	totalFees: string
	transactionHash?: string // Optional: On-chain transaction hash for verification
}

export interface FailDepositRequest {
	orderId: string
	errorMessage: string
	errorCode?: string
}

export interface GetDepositStatsRequest {
	clientId: string
	startDate?: Date
	endDate?: Date
}

/**
 * Batch Complete Deposits Response
 * Returned after successfully completing multiple deposit orders
 */
export interface BatchCompleteDepositsResponse {
	success: boolean
	completedOrders: CompletedOrderInfo[]
	totalUSDC: string
	custodialWallet: string
	mockNote?: string
}

export interface CompletedOrderInfo {
	orderId: string
	status: string
	cryptoAmount: string
	transferTxHash?: string // Transaction hash from blockchain mint
}
