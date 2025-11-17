/**
 * B2B Client Data Gateway Interface
 * Defines contract for client organization operations
 */

import type {
	ClientOrganization,
	CreateClientParams,
	UpdateClientRiskTierParams,
	EndUserDeposit,
	CreateEndUserDepositParams,
	UpdateEndUserBalanceParams,
	VaultIndex,
	CreateVaultIndexParams,
	UpdateVaultIndexParams,
	ClientBalance,
	DefiAllocation,
	DepositTransaction,
	WithdrawalTransaction,
	AuditLog,
} from '../entity/b2b-client.entity'

/**
 * Client Organization Data Gateway
 */
export interface IClientOrganizationDataGateway {
	/**
	 * Create new client organization
	 */
	create(params: CreateClientParams): Promise<ClientOrganization>

	/**
	 * Get client by ID
	 */
	getById(id: string): Promise<ClientOrganization | null>

	/**
	 * Get client by product ID
	 */
	getByProductId(productId: string): Promise<ClientOrganization | null>

	/**
	 * Get client by Privy user ID
	 */
	getByPrivyUserId(privyUserId: string): Promise<ClientOrganization | null>

	/**
	 * Get client by API key prefix
	 */
	getByApiKeyPrefix(prefix: string): Promise<ClientOrganization | null>

	/**
	 * List all active clients with pagination
	 */
	list(params: { limit: number; offset: number }): Promise<ClientOrganization[]>

	/**
	 * Update client risk tier
	 */
	updateRiskTier(params: UpdateClientRiskTierParams): Promise<ClientOrganization>

	/**
	 * Update KYB status
	 */
	updateKYBStatus(id: string, status: 'pending' | 'verified' | 'rejected'): Promise<ClientOrganization>

	/**
	 * Update webhook configuration
	 */
	updateWebhook(id: string, webhookUrl: string, webhookSecret?: string): Promise<ClientOrganization>

	/**
	 * Deactivate client
	 */
	deactivate(id: string): Promise<ClientOrganization>
}

/**
 * End-User Deposit Data Gateway
 */
export interface IEndUserDepositDataGateway {
	/**
	 * Create new end-user deposit
	 */
	create(params: CreateEndUserDepositParams): Promise<EndUserDeposit>

	/**
	 * Get deposit by client and user ID
	 */
	getByClientAndUser(clientId: string, userId: string): Promise<EndUserDeposit | null>

	/**
	 * Get deposit by ID
	 */
	getById(id: string): Promise<EndUserDeposit | null>

	/**
	 * List deposits by client
	 */
	listByClient(clientId: string, params: { limit: number; offset: number }): Promise<EndUserDeposit[]>

	/**
	 * Update user balance (for deposits)
	 */
	updateBalance(params: UpdateEndUserBalanceParams): Promise<EndUserDeposit>

	/**
	 * Update user balance (for withdrawals)
	 */
	updateBalanceWithdraw(params: UpdateEndUserBalanceParams): Promise<EndUserDeposit>

	/**
	 * Get client total deposits summary
	 */
	getClientTotals(clientId: string): Promise<{
		totalUsers: number
		totalBalance: number
	}>
}

/**
 * Vault Index Data Gateway
 */
export interface IVaultIndexDataGateway {
	/**
	 * Create vault index for client + risk tier
	 */
	create(params: CreateVaultIndexParams): Promise<VaultIndex>

	/**
	 * Get vault index
	 */
	get(clientId: string, riskTier: ClientRiskTier): Promise<VaultIndex | null>

	/**
	 * Update vault index with new yield data
	 */
	update(params: UpdateVaultIndexParams): Promise<VaultIndex>

	/**
	 * List all vault indices for a client
	 */
	listByClient(clientId: string): Promise<VaultIndex[]>
}

/**
 * Client Balance Data Gateway
 */
export interface IClientBalanceDataGateway {
	/**
	 * Create client balance record
	 */
	create(clientId: string, available?: number, reserved?: number): Promise<ClientBalance>

	/**
	 * Get client balance
	 */
	get(clientId: string): Promise<ClientBalance | null>

	/**
	 * Update balance
	 */
	update(clientId: string, available: number, reserved: number): Promise<ClientBalance>

	/**
	 * Deduct from available balance
	 */
	deduct(clientId: string, amount: number): Promise<ClientBalance>

	/**
	 * Add to available balance
	 */
	add(clientId: string, amount: number): Promise<ClientBalance>
}

/**
 * DeFi Allocation Data Gateway
 */
export interface IDefiAllocationDataGateway {
	/**
	 * Create new allocation
	 */
	create(params: {
		clientId: string
		protocol: 'aave' | 'curve' | 'compound' | 'uniswap'
		chain: string
		amountDeployed: number
		percentage: number
		apy?: number
		txHash?: string
		walletAddress?: string
	}): Promise<DefiAllocation>

	/**
	 * Get allocation by ID
	 */
	getById(id: string): Promise<DefiAllocation | null>

	/**
	 * List active allocations by client
	 */
	listActiveByClient(clientId: string): Promise<DefiAllocation[]>

	/**
	 * List allocations by protocol
	 */
	listByProtocol(clientId: string, protocol: string): Promise<DefiAllocation[]>

	/**
	 * Update allocation yield
	 */
	updateYield(id: string, yieldEarned: number, apy: number): Promise<DefiAllocation>

	/**
	 * Mark allocation as withdrawn
	 */
	withdraw(id: string): Promise<DefiAllocation>

	/**
	 * Get client total allocations summary
	 */
	getClientTotals(clientId: string): Promise<{
		totalDeployed: number
		averageApy: number
		totalYield: number
	}>
}

/**
 * Deposit Transaction Data Gateway
 */
export interface IDepositTransactionDataGateway {
	/**
	 * Create deposit transaction
	 */
	create(params: {
		orderId: string
		clientId: string
		userId: string
		depositType: 'external' | 'internal'
		paymentMethod?: string
		fiatAmount: number
		cryptoAmount?: number
		currency: string
		cryptoCurrency: string
		gatewayFee?: number
		proxifyFee?: number
		networkFee?: number
		totalFees?: number
		status?: string
		paymentUrl?: string
		gatewayOrderId?: string
		clientBalanceId?: string
		deductedFromClient?: number
		walletAddress?: string
		expiresAt?: Date
	}): Promise<DepositTransaction>

	/**
	 * Get deposit by order ID
	 */
	getByOrderId(orderId: string): Promise<DepositTransaction | null>

	/**
	 * Get deposit by ID
	 */
	getById(id: string): Promise<DepositTransaction | null>

	/**
	 * List deposits by user
	 */
	listByUser(
		clientId: string,
		userId: string,
		params: { limit: number; offset: number },
	): Promise<DepositTransaction[]>

	/**
	 * List deposits by client
	 */
	listByClient(clientId: string, params: { limit: number; offset: number }): Promise<DepositTransaction[]>

	/**
	 * Update deposit status
	 */
	updateStatus(orderId: string, status: string, cryptoAmount?: number): Promise<DepositTransaction>

	/**
	 * Update deposit error
	 */
	updateError(orderId: string, errorMessage: string, errorCode: string): Promise<DepositTransaction>

	/**
	 * Get pending deposits
	 */
	getPending(): Promise<DepositTransaction[]>
}

/**
 * Withdrawal Transaction Data Gateway
 */
export interface IWithdrawalTransactionDataGateway {
	/**
	 * Create withdrawal transaction
	 */
	create(params: {
		orderId: string
		clientId: string
		userId: string
		requestedAmount: number
		actualAmount?: number
		currency: string
		withdrawalFee?: number
		networkFee?: number
		destinationType: 'client_balance' | 'bank_account' | 'debit_card'
		destinationDetails?: Record<string, any>
		status?: string
	}): Promise<WithdrawalTransaction>

	/**
	 * Get withdrawal by order ID
	 */
	getByOrderId(orderId: string): Promise<WithdrawalTransaction | null>

	/**
	 * List withdrawals by user
	 */
	listByUser(
		clientId: string,
		userId: string,
		params: { limit: number; offset: number },
	): Promise<WithdrawalTransaction[]>

	/**
	 * Update withdrawal status
	 */
	updateStatus(orderId: string, status: string): Promise<WithdrawalTransaction>
}

/**
 * Audit Log Data Gateway
 */
export interface IAuditLogDataGateway {
	/**
	 * Create audit log entry
	 */
	create(params: {
		clientId?: string
		userId?: string
		actorType: 'client' | 'end_user' | 'system' | 'admin'
		action: string
		resourceType?: string
		resourceId?: string
		description?: string
		metadata?: Record<string, any>
		ipAddress?: string
		userAgent?: string
	}): Promise<AuditLog>

	/**
	 * List audit logs by client
	 */
	listByClient(clientId: string, params: { limit: number; offset: number }): Promise<AuditLog[]>

	/**
	 * List audit logs by user
	 */
	listByUser(
		clientId: string,
		userId: string,
		params: { limit: number; offset: number },
	): Promise<AuditLog[]>

	/**
	 * List audit logs by action
	 */
	listByAction(action: string, params: { limit: number; offset: number }): Promise<AuditLog[]>
}
