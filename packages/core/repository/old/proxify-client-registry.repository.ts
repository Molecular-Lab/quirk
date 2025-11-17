import type { Address } from "viem"
import type {
	AddClientRiskTierParams,
	ClientActivationParams,
	ClientAddressUpdateParams,
	ClientDeactivationParams,
	ClientInfo,
	ClientRegistrationParams,
	ClientRegistryRepositoryResult,
	ClientStatus,
	ProxifyClientRegistryClientAdapter,
	ProxifyClientRegistryRepositoryDependencies,
	RiskTier,
	SetClientRiskTiersParams,
	SetTierActiveParams,
	UpdateClientFeesParams,
	UpdateTierAllocationParams,
} from "../entity"

export class ProxifyClientRegistryRepository<TChainId = string> {
	constructor(private readonly deps: ProxifyClientRegistryRepositoryDependencies<TChainId>) {}

	private getClient(chainId: TChainId): ProxifyClientRegistryClientAdapter {
		return this.deps.getClientRegistryClient(chainId)
	}

	// Write operations
	async registerClient(chainId: TChainId, params: ClientRegistrationParams): Promise<ClientRegistryRepositoryResult> {
		const client = this.getClient(chainId)
		try {
			await client.write.registerClient(
				params.clientId,
				params.clientAddress,
				params.name,
				params.feeBps,
				params.serviceFeeBps,
				params.clientFeeBps,
			)
			return { success: true, message: "Client registered successfully" }
		} catch (error) {
			return this.toFailure("Failed to register client", error)
		}
	}

	async activateClient(chainId: TChainId, params: ClientActivationParams): Promise<ClientRegistryRepositoryResult> {
		const client = this.getClient(chainId)
		try {
			await client.write.activateClient(params.clientId, params.senderAddress)
			return { success: true, message: "Client activated successfully" }
		} catch (error) {
			return this.toFailure("Failed to activate client", error)
		}
	}

	async deactivateClient(chainId: TChainId, params: ClientDeactivationParams): Promise<ClientRegistryRepositoryResult> {
		const client = this.getClient(chainId)
		try {
			await client.write.deactivateClient(params.clientId, params.senderAddress)
			return { success: true, message: "Client deactivated successfully" }
		} catch (error) {
			return this.toFailure("Failed to deactivate client", error)
		}
	}

	async updateClientAddress(
		chainId: TChainId,
		params: ClientAddressUpdateParams,
	): Promise<ClientRegistryRepositoryResult> {
		const client = this.getClient(chainId)
		try {
			await client.write.updateClientAddress(params.clientId, params.newAddress, params.senderAddress)
			return { success: true, message: "Client address updated successfully" }
		} catch (error) {
			return this.toFailure("Failed to update client address", error)
		}
	}

	async isClientActive(chainId: TChainId, clientId: string): Promise<boolean> {
		const client = this.getClient(chainId)
		return client.read.isClientActive(clientId)
	}

	async isClientRegistered(chainId: TChainId, clientId: string): Promise<boolean> {
		const client = this.getClient(chainId)
		return client.read.isClientRegistered(clientId)
	}

	async getClientStatus(chainId: TChainId, clientId: string): Promise<ClientStatus> {
		const client = this.getClient(chainId)
		const [isRegistered, isActive] = await Promise.all([
			client.read.isClientRegistered(clientId),
			client.read.isClientActive(clientId),
		])

		return { isRegistered, isActive }
	}

	async getClientInfo(chainId: TChainId, clientId: string): Promise<ClientInfo> {
		const client = this.getClient(chainId)
		return client.read.getClientInfo(clientId)
	}

	async getClientAddress(chainId: TChainId, clientId: string): Promise<Address> {
		const client = this.getClient(chainId)
		return client.read.getClientAddress(clientId)
	}

	async getRoles(chainId: TChainId): Promise<{ defaultAdminRole: string; oracleRole: string }> {
		const client = this.getClient(chainId)
		const [defaultAdminRole, oracleRole] = await Promise.all([
			client.read.DEFAULT_ADMIN_ROLE(),
			client.read.ORACLE_ROLE(),
		])
		return { defaultAdminRole, oracleRole }
	}

	async getRoleAdmin(chainId: TChainId, role: string): Promise<string> {
		const client = this.getClient(chainId)
		return client.read.getRoleAdmin(role)
	}

	async hasRole(chainId: TChainId, role: string, account: Address): Promise<boolean> {
		const client = this.getClient(chainId)
		return client.read.hasRole(role, account)
	}

	async updateClientFees(chainId: TChainId, params: UpdateClientFeesParams): Promise<ClientRegistryRepositoryResult> {
		const client = this.getClient(chainId)
		try {
			await client.write.updateClientFees(params.clientId, params.feeBps, params.serviceFeeBps, params.senderAddress)
			return { success: true, message: "Client fees updated successfully" }
		} catch (error) {
			return this.toFailure("Failed to update client fees", error)
		}
	}

	async renounceRole(
		chainId: TChainId,
		role: string,
		callerConfirmation: Address,
		senderAddress?: Address,
	): Promise<ClientRegistryRepositoryResult> {
		const client = this.getClient(chainId)
		try {
			await client.write.renounceRole(role, callerConfirmation, senderAddress)
			return { success: true, message: "Role renounced successfully" }
		} catch (error) {
			return this.toFailure("Failed to renounce role", error)
		}
	}

	// Risk tier management
	async setClientRiskTiers(
		chainId: TChainId,
		params: SetClientRiskTiersParams,
	): Promise<ClientRegistryRepositoryResult> {
		const client = this.getClient(chainId)
		try {
			await client.write.setClientRiskTiers(params.clientId, params.riskTiers, params.senderAddress)
			return { success: true, message: "Client risk tiers updated successfully" }
		} catch (error) {
			return this.toFailure("Failed to set client risk tiers", error)
		}
	}

	async addClientRiskTier(chainId: TChainId, params: AddClientRiskTierParams): Promise<ClientRegistryRepositoryResult> {
		const client = this.getClient(chainId)
		try {
			await client.write.addClientRiskTier(params.clientId, params.tier, params.senderAddress)
			return { success: true, message: "Risk tier added successfully" }
		} catch (error) {
			return this.toFailure("Failed to add risk tier", error)
		}
	}

	async updateTierAllocation(
		chainId: TChainId,
		params: UpdateTierAllocationParams,
	): Promise<ClientRegistryRepositoryResult> {
		const client = this.getClient(chainId)
		try {
			await client.write.updateTierAllocation(
				params.clientId,
				params.tierId,
				params.newAllocationBps,
				params.senderAddress,
			)
			return { success: true, message: "Tier allocation updated successfully" }
		} catch (error) {
			return this.toFailure("Failed to update tier allocation", error)
		}
	}

	async setTierActive(chainId: TChainId, params: SetTierActiveParams): Promise<ClientRegistryRepositoryResult> {
		const client = this.getClient(chainId)
		try {
			await client.write.setTierActive(params.clientId, params.tierId, params.isActive, params.senderAddress)
			return { success: true, message: "Tier status updated successfully" }
		} catch (error) {
			return this.toFailure("Failed to update tier status", error)
		}
	}

	// Read operations - Risk tiers
	async getClientRiskTiers(chainId: TChainId, clientId: string): Promise<RiskTier[]> {
		const client = this.getClient(chainId)
		return client.read.getClientRiskTiers(clientId)
	}

	async getClientRiskTier(chainId: TChainId, clientId: string, tierId: string): Promise<RiskTier> {
		const client = this.getClient(chainId)
		return client.read.getClientRiskTier(clientId, tierId)
	}

	async hasTier(chainId: TChainId, clientId: string, tierId: string): Promise<boolean> {
		const client = this.getClient(chainId)
		return client.read.hasTier(clientId, tierId)
	}

	async validateTierAllocations(chainId: TChainId, tiers: RiskTier[]): Promise<boolean> {
		const client = this.getClient(chainId)
		return client.read.validateTierAllocations(tiers)
	}

	private toFailure(message: string, error: unknown): ClientRegistryRepositoryResult {
		return {
			success: false,
			message: `${message}: ${error instanceof Error ? error.message : "Unknown error"}`,
		}
	}
}
