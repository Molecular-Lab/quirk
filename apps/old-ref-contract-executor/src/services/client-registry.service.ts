import type {
	AddClientRiskTierParams,
	ClientActivationParams,
	ClientAddressUpdateParams,
	ClientDeactivationParams,
	ClientInfo,
	ClientRegistrationParams,
	ClientRegistryRepositoryResult,
	ClientStatus,
	ProxifyClientRegistryRepository,
	RiskTier,
	SetClientRiskTiersParams,
	SetTierActiveParams,
	UpdateClientFeesParams,
	UpdateTierAllocationParams,
} from "@proxify/core"
import type { Address } from "viem"

export interface ClientRegistryServiceDependencies {
	clientRegistryRepository: ProxifyClientRegistryRepository<string>
}

export class ClientRegistryService {
	constructor(private readonly deps: ClientRegistryServiceDependencies) {}

	// Write operations
	async registerClient(chainId: string, params: ClientRegistrationParams): Promise<ClientRegistryRepositoryResult> {
		return this.deps.clientRegistryRepository.registerClient(chainId, params)
	}

	async activateClient(chainId: string, params: ClientActivationParams): Promise<ClientRegistryRepositoryResult> {
		return this.deps.clientRegistryRepository.activateClient(chainId, params)
	}

	async deactivateClient(chainId: string, params: ClientDeactivationParams): Promise<ClientRegistryRepositoryResult> {
		return this.deps.clientRegistryRepository.deactivateClient(chainId, params)
	}

	async updateClientAddress(
		chainId: string,
		params: ClientAddressUpdateParams,
	): Promise<ClientRegistryRepositoryResult> {
		return this.deps.clientRegistryRepository.updateClientAddress(chainId, params)
	}

	async updateClientFees(chainId: string, params: UpdateClientFeesParams): Promise<ClientRegistryRepositoryResult> {
		return this.deps.clientRegistryRepository.updateClientFees(chainId, params)
	}

	async renounceRole(
		chainId: string,
		role: string,
		callerConfirmation: Address,
		senderAddress?: Address,
	): Promise<ClientRegistryRepositoryResult> {
		return this.deps.clientRegistryRepository.renounceRole(chainId, role, callerConfirmation, senderAddress)
	}

	// Risk tier management
	async setClientRiskTiers(chainId: string, params: SetClientRiskTiersParams): Promise<ClientRegistryRepositoryResult> {
		return this.deps.clientRegistryRepository.setClientRiskTiers(chainId, params)
	}

	async addClientRiskTier(chainId: string, params: AddClientRiskTierParams): Promise<ClientRegistryRepositoryResult> {
		return this.deps.clientRegistryRepository.addClientRiskTier(chainId, params)
	}

	async updateTierAllocation(
		chainId: string,
		params: UpdateTierAllocationParams,
	): Promise<ClientRegistryRepositoryResult> {
		return this.deps.clientRegistryRepository.updateTierAllocation(chainId, params)
	}

	async setTierActive(chainId: string, params: SetTierActiveParams): Promise<ClientRegistryRepositoryResult> {
		return this.deps.clientRegistryRepository.setTierActive(chainId, params)
	}

	// Read operations
	async isClientActive(chainId: string, clientId: string): Promise<boolean> {
		return this.deps.clientRegistryRepository.isClientActive(chainId, clientId)
	}

	async isClientRegistered(chainId: string, clientId: string): Promise<boolean> {
		return this.deps.clientRegistryRepository.isClientRegistered(chainId, clientId)
	}

	async getClientStatus(chainId: string, clientId: string): Promise<ClientStatus> {
		return this.deps.clientRegistryRepository.getClientStatus(chainId, clientId)
	}

	async getClientInfo(chainId: string, clientId: string): Promise<ClientInfo> {
		return this.deps.clientRegistryRepository.getClientInfo(chainId, clientId)
	}

	async getClientAddress(chainId: string, clientId: string): Promise<Address> {
		return this.deps.clientRegistryRepository.getClientAddress(chainId, clientId)
	}

	async getRoles(chainId: string): Promise<{ defaultAdminRole: string; oracleRole: string }> {
		return this.deps.clientRegistryRepository.getRoles(chainId)
	}

	async getRoleAdmin(chainId: string, role: string): Promise<string> {
		return this.deps.clientRegistryRepository.getRoleAdmin(chainId, role)
	}

	async hasRole(chainId: string, role: string, account: Address): Promise<boolean> {
		return this.deps.clientRegistryRepository.hasRole(chainId, role, account)
	}

	// Read operations - Risk tiers
	async getClientRiskTiers(chainId: string, clientId: string): Promise<RiskTier[]> {
		return this.deps.clientRegistryRepository.getClientRiskTiers(chainId, clientId)
	}

	async getClientRiskTier(chainId: string, clientId: string, tierId: string): Promise<RiskTier> {
		return this.deps.clientRegistryRepository.getClientRiskTier(chainId, clientId, tierId)
	}

	async hasTier(chainId: string, clientId: string, tierId: string): Promise<boolean> {
		return this.deps.clientRegistryRepository.hasTier(chainId, clientId, tierId)
	}

	async validateTierAllocations(chainId: string, tiers: RiskTier[]): Promise<boolean> {
		return this.deps.clientRegistryRepository.validateTierAllocations(chainId, tiers)
	}
}
