import type { Address } from "viem"
import type {
	ControllerGrantRoleParams,
	ControllerPauseStatus,
	ControllerProtocolStatus,
	ControllerRenounceRoleParams,
	ControllerRepositoryResult,
	ControllerRevokeRoleParams,
	ControllerRoleSummary,
	ControllerTokenStatus,
	ControllerWithdrawParams,
	QuirkControllerClientAdapter,
	QuirkControllerRepositoryDependencies,
	InitializeTierParams,
	BatchInitializeTiersParams,
	AssignProtocolToTierParams,
	RemoveProtocolFromTierParams,
	ClaimRevenueParams,
	ClaimClientRevenueParams,
	BatchWithdrawParams,
	UpdateTierIndexParams,
	BatchUpdateTierIndicesParams,
	ExecuteTransferParams,
	StakingParams,
} from "../entity"

export class QuirkControllerRepository<TChainId = string> {
	constructor(private readonly deps: QuirkControllerRepositoryDependencies<TChainId>) {}

	private getClient(chainId: TChainId): QuirkControllerClientAdapter {
		return this.deps.getControllerClient(chainId)
	}

	async getRoles(chainId: TChainId): Promise<ControllerRoleSummary> {
		const client = this.getClient(chainId)

		const [defaultAdminRole, guardianRole, oracleRole] = await Promise.all([
			client.read.DEFAULT_ADMIN_ROLE(),
			client.read.GUARDIAN_ROLE(),
			client.read.ORACLE_ROLE(),
		])

		return { defaultAdminRole, guardianRole, oracleRole }
	}

	async isProtocolWhitelisted(chainId: TChainId, protocol: Address): Promise<ControllerProtocolStatus> {
		const client = this.getClient(chainId)
		const isWhitelisted = await client.read.isProtocolWhitelisted(protocol)
		return { isWhitelisted }
	}

	async isTokenSupported(chainId: TChainId, token: Address): Promise<ControllerTokenStatus> {
		const client = this.getClient(chainId)
		const isSupported = await client.read.isTokenSupported(token)
		return { isSupported }
	}

	async getPauseStatus(chainId: TChainId): Promise<ControllerPauseStatus> {
		const client = this.getClient(chainId)
		const isPaused = await client.read.isPaused()
		return { isPaused }
	}

	async getQuirkAddress(chainId: TChainId): Promise<Address> {
		const client = this.getClient(chainId)
		return client.read.proxify()
	}

	async getRoleAdmin(chainId: TChainId, role: string): Promise<string> {
		const client = this.getClient(chainId)
		return client.read.getRoleAdmin(role)
	}

	async hasRole(chainId: TChainId, role: string, account: Address): Promise<boolean> {
		const client = this.getClient(chainId)
		return client.read.hasRole(role, account)
	}

	async supportedTokens(chainId: TChainId, token: Address): Promise<boolean> {
		const client = this.getClient(chainId)
		return client.read.supportedTokens(token)
	}

	async whitelistedProtocols(chainId: TChainId, protocol: Address): Promise<boolean> {
		const client = this.getClient(chainId)
		return client.read.whitelistedProtocols(protocol)
	}

	async supportsInterface(chainId: TChainId, interfaceId: string): Promise<boolean> {
		const client = this.getClient(chainId)
		return client.read.supportsInterface(interfaceId)
	}

	// Tier protocol management - read methods
	async getTierProtocols(chainId: TChainId, tierId: string): Promise<Address[]> {
		const client = this.getClient(chainId)
		return client.read.getTierProtocols(tierId)
	}

	async isTierProtocol(chainId: TChainId, tierId: string, protocol: Address): Promise<boolean> {
		const client = this.getClient(chainId)
		return client.read.isTierProtocol(tierId, protocol)
	}

	// Balance methods
	async getOperationFeeBalance(chainId: TChainId, token: Address): Promise<bigint> {
		const client = this.getClient(chainId)
		return client.read.getOperationFeeBalance(token)
	}

	async getProtocolRevenueBalance(chainId: TChainId, token: Address): Promise<bigint> {
		const client = this.getClient(chainId)
		return client.read.getProtocolRevenueBalance(token)
	}

	async getClientRevenueBalance(chainId: TChainId, clientId: string, token: Address): Promise<bigint> {
		const client = this.getClient(chainId)
		return client.read.getClientRevenueBalance(clientId, token)
	}

	async addSupportedToken(
		chainId: TChainId,
		token: Address,
		senderAddress: Address,
	): Promise<ControllerRepositoryResult> {
		const client = this.getClient(chainId)
		try {
			await client.write.addSupportedToken(token, senderAddress)
			return { success: true, message: "Token added to supported list" }
		} catch (error) {
			return this.toFailure("Failed to add supported token", error)
		}
	}

	async removeSupportedToken(
		chainId: TChainId,
		token: Address,
		senderAddress: Address,
	): Promise<ControllerRepositoryResult> {
		const client = this.getClient(chainId)
		try {
			await client.write.removeSupportedToken(token, senderAddress)
			return { success: true, message: "Token removed from supported list" }
		} catch (error) {
			return this.toFailure("Failed to remove supported token", error)
		}
	}

	async addWhitelistedProtocol(
		chainId: TChainId,
		protocol: Address,
		senderAddress: Address,
	): Promise<ControllerRepositoryResult> {
		const client = this.getClient(chainId)
		try {
			await client.write.addWhitelistedProtocol(protocol, senderAddress)
			return { success: true, message: "Protocol added to whitelist" }
		} catch (error) {
			return this.toFailure("Failed to add protocol to whitelist", error)
		}
	}

	async removeWhitelistedProtocol(
		chainId: TChainId,
		protocol: Address,
		senderAddress: Address,
	): Promise<ControllerRepositoryResult> {
		const client = this.getClient(chainId)
		try {
			await client.write.removeWhitelistedProtocol(protocol, senderAddress)
			return { success: true, message: "Protocol removed from whitelist" }
		} catch (error) {
			return this.toFailure("Failed to remove protocol from whitelist", error)
		}
	}

	async executeTransfer(chainId: TChainId, params: ExecuteTransferParams): Promise<ControllerRepositoryResult> {
		const client = this.getClient(chainId)
		try {
			await client.write.executeTransfer(params.token, params.protocol, params.amount, params.tierId, params.tierName)
			return { success: true, message: "Transfer executed" }
		} catch (error) {
			return this.toFailure("Failed to execute transfer", error)
		}
	}

	async confirmUnstake(chainId: TChainId, token: Address, amount: bigint): Promise<ControllerRepositoryResult> {
		const client = this.getClient(chainId)
		try {
			await client.write.confirmUnstake(token, amount)
			return { success: true, message: "Unstake confirmed" }
		} catch (error) {
			return this.toFailure("Failed to confirm unstake", error)
		}
	}

	async staking(chainId: TChainId, params: StakingParams): Promise<ControllerRepositoryResult> {
		const client = this.getClient(chainId)
		try {
			await client.write.staking(params.token, params.amount, params.stakingExecutor)
			return { success: true, message: "Staking executed" }
		} catch (error) {
			return this.toFailure("Failed to execute staking", error)
		}
	}

	async updateTierIndex(chainId: TChainId, params: UpdateTierIndexParams): Promise<ControllerRepositoryResult> {
		const client = this.getClient(chainId)
		try {
			await client.write.updateTierIndex(params.token, params.tierId, params.newIndex)
			return { success: true, message: "Tier index updated" }
		} catch (error) {
			return this.toFailure("Failed to update tier index", error)
		}
	}

	async batchUpdateTierIndices(chainId: TChainId, params: BatchUpdateTierIndicesParams): Promise<ControllerRepositoryResult> {
		const client = this.getClient(chainId)
		try {
			await client.write.batchUpdateTierIndices(params.token, params.tierIds, params.newIndices)
			return { success: true, message: "Batch tier indices updated" }
		} catch (error) {
			return this.toFailure("Failed to batch update tier indices", error)
		}
	}

	async initializeTier(chainId: TChainId, params: InitializeTierParams): Promise<ControllerRepositoryResult> {
		const client = this.getClient(chainId)
		try {
			await client.write.initializeTier(params.token, params.tierId)
			return { success: true, message: "Tier initialized" }
		} catch (error) {
			return this.toFailure("Failed to initialize tier", error)
		}
	}

	async batchInitializeTiers(chainId: TChainId, params: BatchInitializeTiersParams): Promise<ControllerRepositoryResult> {
		const client = this.getClient(chainId)
		try {
			await client.write.batchInitializeTiers(params.token, params.tierIds)
			return { success: true, message: "Batch tiers initialized" }
		} catch (error) {
			return this.toFailure("Failed to batch initialize tiers", error)
		}
	}

	async assignProtocolToTier(chainId: TChainId, params: AssignProtocolToTierParams): Promise<ControllerRepositoryResult> {
		const client = this.getClient(chainId)
		try {
			await client.write.assignProtocolToTier(params.tierId, params.protocol, params.senderAddress)
			return { success: true, message: "Protocol assigned to tier" }
		} catch (error) {
			return this.toFailure("Failed to assign protocol to tier", error)
		}
	}

	async removeProtocolFromTier(chainId: TChainId, params: RemoveProtocolFromTierParams): Promise<ControllerRepositoryResult> {
		const client = this.getClient(chainId)
		try {
			await client.write.removeProtocolFromTier(params.tierId, params.protocol, params.senderAddress)
			return { success: true, message: "Protocol removed from tier" }
		} catch (error) {
			return this.toFailure("Failed to remove protocol from tier", error)
		}
	}

	async claimProtocolRevenue(chainId: TChainId, params: ClaimRevenueParams): Promise<ControllerRepositoryResult> {
		const client = this.getClient(chainId)
		try {
			await client.write.claimProtocolRevenue(params)
			return { success: true, message: "Protocol revenue claimed" }
		} catch (error) {
			return this.toFailure("Failed to claim protocol revenue", error)
		}
	}

	async claimClientRevenue(chainId: TChainId, params: ClaimClientRevenueParams): Promise<ControllerRepositoryResult> {
		const client = this.getClient(chainId)
		try {
			await client.write.claimClientRevenue(params)
			return { success: true, message: "Client revenue claimed" }
		} catch (error) {
			return this.toFailure("Failed to claim client revenue", error)
		}
	}

	async claimOperationFee(chainId: TChainId, params: ClaimRevenueParams): Promise<ControllerRepositoryResult> {
		const client = this.getClient(chainId)
		try {
			await client.write.claimOperationFee(params)
			return { success: true, message: "Operation fee claimed" }
		} catch (error) {
			return this.toFailure("Failed to claim operation fee", error)
		}
	}

	async batchWithdraw(chainId: TChainId, params: BatchWithdrawParams): Promise<ControllerRepositoryResult> {
		const client = this.getClient(chainId)
		try {
			await client.write.batchWithdraw(params)
			return { success: true, message: "Batch withdrawal executed" }
		} catch (error) {
			return this.toFailure("Failed to execute batch withdrawal", error)
		}
	}

	async withdraw(chainId: TChainId, params: ControllerWithdrawParams): Promise<ControllerRepositoryResult> {
		const client = this.getClient(chainId)
		try {
			await client.write.withdraw(params)
			return { success: true, message: "Withdrawal executed" }
		} catch (error) {
			return this.toFailure("Failed to execute withdrawal", error)
		}
	}

	async emergencyPause(chainId: TChainId): Promise<ControllerRepositoryResult> {
		const client = this.getClient(chainId)
		try {
			await client.write.emergencyPause()
			return { success: true, message: "Protocol paused" }
		} catch (error) {
			return this.toFailure("Failed to pause protocol", error)
		}
	}

	async unpause(chainId: TChainId, senderAddress: Address): Promise<ControllerRepositoryResult> {
		const client = this.getClient(chainId)
		try {
			await client.write.unpause(senderAddress)
			return { success: true, message: "Protocol unpaused" }
		} catch (error) {
			return this.toFailure("Failed to unpause protocol", error)
		}
	}

	async grantRole(chainId: TChainId, params: ControllerGrantRoleParams): Promise<ControllerRepositoryResult> {
		const client = this.getClient(chainId)
		try {
			await client.write.grantRole(params.role, params.account, params.senderAddress!)
			return { success: true, message: "Role granted" }
		} catch (error) {
			return this.toFailure("Failed to grant role", error)
		}
	}

	async revokeRole(chainId: TChainId, params: ControllerRevokeRoleParams): Promise<ControllerRepositoryResult> {
		const client = this.getClient(chainId)
		try {
			await client.write.revokeRole(params.role, params.account, params.senderAddress!)
			return { success: true, message: "Role revoked" }
		} catch (error) {
			return this.toFailure("Failed to revoke role", error)
		}
	}

	async renounceRole(chainId: TChainId, params: ControllerRenounceRoleParams): Promise<ControllerRepositoryResult> {
		const client = this.getClient(chainId)
		try {
			await client.write.renounceRole(params.role, params.callerConfirmation, params.senderAddress)
			return { success: true, message: "Role renounced" }
		} catch (error) {
			return this.toFailure("Failed to renounce role", error)
		}
	}

	private toFailure(message: string, error: unknown): ControllerRepositoryResult {
		return {
			success: false,
			message: `${message}: ${error instanceof Error ? error.message : "Unknown error"}`,
		}
	}
}