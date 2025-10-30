import type {
	AssignProtocolToTierParams,
	BatchInitializeTiersParams,
	BatchUpdateTierIndicesParams,
	BatchWithdrawParams,
	ClaimClientRevenueParams,
	ClaimRevenueParams,
	ControllerGrantRoleParams,
	ControllerPauseStatus,
	ControllerProtocolStatus,
	ControllerRenounceRoleParams,
	ControllerRepositoryResult,
	ControllerRevokeRoleParams,
	ControllerRoleSummary,
	ControllerTokenStatus,
	ControllerWithdrawParams,
	ExecuteTransferParams,
	InitializeTierParams,
	ProxifyControllerRepository,
	RemoveProtocolFromTierParams,
	UpdateTierIndexParams,
} from "@proxify/core"
import type { Address } from "viem"

export interface ControllerServiceDependencies {
	controllerRepository: ProxifyControllerRepository<string>
}

export class ControllerService {
	constructor(private readonly deps: ControllerServiceDependencies) {}

	// Read operations
	async getRoles(chainId: string): Promise<ControllerRoleSummary> {
		return this.deps.controllerRepository.getRoles(chainId)
	}

	async isProtocolWhitelisted(chainId: string, protocol: Address): Promise<ControllerProtocolStatus> {
		return this.deps.controllerRepository.isProtocolWhitelisted(chainId, protocol)
	}

	async isTokenSupported(chainId: string, token: Address): Promise<ControllerTokenStatus> {
		return this.deps.controllerRepository.isTokenSupported(chainId, token)
	}

	async getPauseStatus(chainId: string): Promise<ControllerPauseStatus> {
		return this.deps.controllerRepository.getPauseStatus(chainId)
	}

	async getProxifyAddress(chainId: string): Promise<Address> {
		return this.deps.controllerRepository.getProxifyAddress(chainId)
	}

	async getRoleAdmin(chainId: string, role: string): Promise<string> {
		return this.deps.controllerRepository.getRoleAdmin(chainId, role)
	}

	async hasRole(chainId: string, role: string, account: Address): Promise<boolean> {
		return this.deps.controllerRepository.hasRole(chainId, role, account)
	}

	async supportedTokens(chainId: string, token: Address): Promise<boolean> {
		return this.deps.controllerRepository.supportedTokens(chainId, token)
	}

	async whitelistedProtocols(chainId: string, protocol: Address): Promise<boolean> {
		return this.deps.controllerRepository.whitelistedProtocols(chainId, protocol)
	}

	async supportsInterface(chainId: string, interfaceId: string): Promise<boolean> {
		return this.deps.controllerRepository.supportsInterface(chainId, interfaceId)
	}

	// Tier protocol management
	async getTierProtocols(chainId: string, tierId: string): Promise<Address[]> {
		return this.deps.controllerRepository.getTierProtocols(chainId, tierId)
	}

	async isTierProtocol(chainId: string, tierId: string, protocol: Address): Promise<boolean> {
		return this.deps.controllerRepository.isTierProtocol(chainId, tierId, protocol)
	}

	// Balance methods
	async getOperationFeeBalance(chainId: string, token: Address): Promise<bigint> {
		return this.deps.controllerRepository.getOperationFeeBalance(chainId, token)
	}

	async getProtocolRevenueBalance(chainId: string, token: Address): Promise<bigint> {
		return this.deps.controllerRepository.getProtocolRevenueBalance(chainId, token)
	}

	async getClientRevenueBalance(chainId: string, clientId: string, token: Address): Promise<bigint> {
		return this.deps.controllerRepository.getClientRevenueBalance(chainId, clientId, token)
	}

	// Write operations
	async addSupportedToken(
		chainId: string,
		token: Address,
		senderAddress: Address,
	): Promise<ControllerRepositoryResult> {
		return this.deps.controllerRepository.addSupportedToken(chainId, token, senderAddress)
	}

	async removeSupportedToken(
		chainId: string,
		token: Address,
		senderAddress: Address,
	): Promise<ControllerRepositoryResult> {
		return this.deps.controllerRepository.removeSupportedToken(chainId, token, senderAddress)
	}

	async addWhitelistedProtocol(
		chainId: string,
		protocol: Address,
		senderAddress: Address,
	): Promise<ControllerRepositoryResult> {
		return this.deps.controllerRepository.addWhitelistedProtocol(chainId, protocol, senderAddress)
	}

	async removeWhitelistedProtocol(
		chainId: string,
		protocol: Address,
		senderAddress: Address,
	): Promise<ControllerRepositoryResult> {
		return this.deps.controllerRepository.removeWhitelistedProtocol(chainId, protocol, senderAddress)
	}

	async executeTransfer(chainId: string, params: ExecuteTransferParams): Promise<ControllerRepositoryResult> {
		return this.deps.controllerRepository.executeTransfer(chainId, params)
	}

	async confirmUnstake(chainId: string, token: Address, amount: bigint): Promise<ControllerRepositoryResult> {
		return this.deps.controllerRepository.confirmUnstake(chainId, token, amount)
	}

	// Tier index management
	async updateTierIndex(chainId: string, params: UpdateTierIndexParams): Promise<ControllerRepositoryResult> {
		return this.deps.controllerRepository.updateTierIndex(chainId, params)
	}

	async batchUpdateTierIndices(chainId: string, params: BatchUpdateTierIndicesParams): Promise<ControllerRepositoryResult> {
		return this.deps.controllerRepository.batchUpdateTierIndices(chainId, params)
	}

	async initializeTier(chainId: string, params: InitializeTierParams): Promise<ControllerRepositoryResult> {
		return this.deps.controllerRepository.initializeTier(chainId, params)
	}

	async batchInitializeTiers(chainId: string, params: BatchInitializeTiersParams): Promise<ControllerRepositoryResult> {
		return this.deps.controllerRepository.batchInitializeTiers(chainId, params)
	}

	// Tier protocol management (write)
	async assignProtocolToTier(chainId: string, params: AssignProtocolToTierParams): Promise<ControllerRepositoryResult> {
		return this.deps.controllerRepository.assignProtocolToTier(chainId, params)
	}

	async removeProtocolFromTier(chainId: string, params: RemoveProtocolFromTierParams): Promise<ControllerRepositoryResult> {
		return this.deps.controllerRepository.removeProtocolFromTier(chainId, params)
	}

	// Revenue claiming
	async claimOperationFee(chainId: string, params: ClaimRevenueParams): Promise<ControllerRepositoryResult> {
		return this.deps.controllerRepository.claimOperationFee(chainId, params)
	}

	async claimProtocolRevenue(chainId: string, params: ClaimRevenueParams): Promise<ControllerRepositoryResult> {
		return this.deps.controllerRepository.claimProtocolRevenue(chainId, params)
	}

	async claimClientRevenue(chainId: string, params: ClaimClientRevenueParams): Promise<ControllerRepositoryResult> {
		return this.deps.controllerRepository.claimClientRevenue(chainId, params)
	}

	// Batch withdrawal
	async batchWithdraw(chainId: string, params: BatchWithdrawParams): Promise<ControllerRepositoryResult> {
		return this.deps.controllerRepository.batchWithdraw(chainId, params)
	}

	// Legacy withdrawal (deprecated but kept for compatibility)
	async withdraw(chainId: string, params: ControllerWithdrawParams): Promise<ControllerRepositoryResult> {
		return this.deps.controllerRepository.withdraw(chainId, params)
	}

	async emergencyPause(chainId: string): Promise<ControllerRepositoryResult> {
		return this.deps.controllerRepository.emergencyPause(chainId)
	}

	async unpause(chainId: string, senderAddress: Address): Promise<ControllerRepositoryResult> {
		return this.deps.controllerRepository.unpause(chainId, senderAddress)
	}

	async grantRole(chainId: string, params: ControllerGrantRoleParams): Promise<ControllerRepositoryResult> {
		return this.deps.controllerRepository.grantRole(chainId, params)
	}

	async revokeRole(chainId: string, params: ControllerRevokeRoleParams): Promise<ControllerRepositoryResult> {
		return this.deps.controllerRepository.revokeRole(chainId, params)
	}

	async renounceRole(chainId: string, params: ControllerRenounceRoleParams): Promise<ControllerRepositoryResult> {
		return this.deps.controllerRepository.renounceRole(chainId, params)
	}
}
