import type { RiskTier } from "../old/client-registry.entity"
import type { Address } from "viem"

export interface QuirkClientRegistryReadAdapter {
	DEFAULT_ADMIN_ROLE(): Promise<string>
	ORACLE_ROLE(): Promise<string>
	getRoleAdmin(role: string): Promise<string>
	hasRole(role: string, account: Address): Promise<boolean>
	isClientActive(clientId: string): Promise<boolean>
	isClientRegistered(clientId: string): Promise<boolean>
	getClientInfo(clientId: string): Promise<{
		name: string
		clientAddress: Address
		isActive: boolean
		registeredAt: bigint
		feeBps: number
		serviceFeeBps: number
		clientFeeBps: number
	}>
	getClientAddress(clientId: string): Promise<Address>

	// Risk tier read methods
	getClientRiskTiers(clientId: string): Promise<RiskTier[]>
	getClientRiskTier(clientId: string, tierId: string): Promise<RiskTier>
	hasTier(clientId: string, tierId: string): Promise<boolean>
	validateTierAllocations(tiers: RiskTier[]): Promise<boolean>
}

export interface QuirkClientRegistryWriteAdapter {
	// Oracle actions
	registerClient(
		clientId: string,
		clientAddress: Address,
		name: string,
		feeBps: number,
		serviceFeeBps: number,
		clientFeeBps: number,
	): Promise<void>

	// Admin (multisig) actions
	activateClient(clientId: string, senderAddress: Address): Promise<void>
	deactivateClient(clientId: string, senderAddress: Address): Promise<void>
	updateClientAddress(clientId: string, newAddress: Address, senderAddress: Address): Promise<void>
	updateClientFees(clientId: string, feeBps: number, serviceFeeBps: number, senderAddress: Address): Promise<void>
	renounceRole(role: string, callerConfirmation: Address, senderAddress?: Address): Promise<void>

	// Risk tier management (Oracle)
	setClientRiskTiers(clientId: string, riskTiers: RiskTier[], senderAddress: Address): Promise<void>
	addClientRiskTier(clientId: string, tier: RiskTier, senderAddress: Address): Promise<void>
	updateTierAllocation(
		clientId: string,
		tierId: string,
		newAllocationBps: number,
		senderAddress: Address,
	): Promise<void>
	setTierActive(clientId: string, tierId: string, isActive: boolean, senderAddress: Address): Promise<void>
}

export interface QuirkClientRegistryClientAdapter {
	read: QuirkClientRegistryReadAdapter
	write: QuirkClientRegistryWriteAdapter
}

export interface QuirkClientRegistryRepositoryDependencies<TChainId> {
	getClientRegistryClient(chainId: TChainId): QuirkClientRegistryClientAdapter
}
