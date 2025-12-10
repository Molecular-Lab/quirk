import type { BatchWithdrawParams, ClaimClientRevenueParams, ClaimRevenueParams, ControllerWithdrawParams } from ".."
import type { Address } from "viem"

export interface ProxifyControllerReadAdapter {
	DEFAULT_ADMIN_ROLE(): Promise<string>
	GUARDIAN_ROLE(): Promise<string>
	ORACLE_ROLE(): Promise<string>
	MAX_BATCH_SIZE(): Promise<bigint>
	getRoleAdmin(role: string): Promise<string>
	hasRole(role: string, account: Address): Promise<boolean>
	isPaused(): Promise<boolean>
	isProtocolWhitelisted(protocol: Address): Promise<boolean>
	isTokenSupported(token: Address): Promise<boolean>
	proxify(): Promise<Address>
	clientRegistry(): Promise<Address>
	paused(): Promise<boolean>
	supportedTokens(token: Address): Promise<boolean>
	supportsInterface(interfaceId: string): Promise<boolean>
	whitelistedProtocols(protocol: Address): Promise<boolean>
	// Tier protocol management
	getTierProtocols(tierId: string): Promise<Address[]>
	isTierProtocol(tierId: string, protocol: Address): Promise<boolean>
	tierProtocols(tierId: string, index: bigint): Promise<Address>
	// Balance methods
	getClientRevenueBalance(clientId: string, token: Address): Promise<bigint>
	getOperationFeeBalance(token: Address): Promise<bigint>
	getProtocolRevenueBalance(token: Address): Promise<bigint>
}

export interface ProxifyControllerWriteAdapter {
	// Admin (multisig) actions
	addSupportedToken(token: Address, senderAddress: Address): Promise<void>
	removeSupportedToken(token: Address, senderAddress: Address): Promise<void>
	addWhitelistedProtocol(protocol: Address, senderAddress: Address): Promise<void>
	removeWhitelistedProtocol(protocol: Address, senderAddress: Address): Promise<void>
	grantRole(role: string, account: Address, senderAddress: Address): Promise<void>
	revokeRole(role: string, account: Address, senderAddress: Address): Promise<void>
	unpause(senderAddress: Address): Promise<void>
	renounceRole(role: string, callerConfirmation: Address, senderAddress?: Address): Promise<void>
	assignProtocolToTier(tierId: string, protocol: Address, senderAddress: Address): Promise<void>
	removeProtocolFromTier(tierId: string, protocol: Address, senderAddress: Address): Promise<void>
	updateMaxBatchSize(newMax: bigint, senderAddress: Address): Promise<void>
	updateMaxGasFeePerUser(newMax: bigint, senderAddress: Address): Promise<void>
	updateMaxIndexGrowth(newMax: bigint, senderAddress: Address): Promise<void>

	// Oracle actions
	executeTransfer(token: Address, protocol: Address, amount: bigint, tierId: string, tierName: string): Promise<void>
	confirmUnstake(token: Address, amount: bigint): Promise<void>
	staking(token: Address, amount: bigint, stakingExecutor: Address): Promise<void>
	updateTierIndex(token: Address, tierId: string, newIndex: bigint): Promise<void>
	batchUpdateTierIndices(token: Address, tierIds: string[], newIndices: bigint[]): Promise<void>
	initializeTier(token: Address, tierId: string): Promise<void>
	batchInitializeTiers(token: Address, tierIds: string[]): Promise<void>
	claimProtocolRevenue(params: ClaimRevenueParams): Promise<void>
	claimClientRevenue(params: ClaimClientRevenueParams): Promise<void>
	claimOperationFee(params: ClaimRevenueParams): Promise<void>
	batchWithdraw(params: BatchWithdrawParams): Promise<void>
	withdraw(params: ControllerWithdrawParams): Promise<void>

	// Guardian actions
	emergencyPause(): Promise<void>
}

export interface ProxifyControllerClientAdapter {
	read: ProxifyControllerReadAdapter
	write: ProxifyControllerWriteAdapter
}

export interface ProxifyControllerRepositoryDependencies<TChainId> {
	getControllerClient(chainId: TChainId): ProxifyControllerClientAdapter
}
