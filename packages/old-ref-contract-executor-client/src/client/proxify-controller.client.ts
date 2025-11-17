import { BatchWithdrawParams, ClaimClientRevenueParams, ClaimRevenueParams, ControllerWithdrawParams, ProxifyAccessControl, ProxifyAccessControlType, PROXIFY_CONTROLLER_ABI, ROLE_HASHES } from "@proxify/core"
import { MetaTransactionData } from "@safe-global/safe-core-sdk-types"
import { Address, encodeFunctionData, type WalletClient } from "viem"
import { SupportedChainId, GnosisSafeClient, ViemClient } from "../config"

class ProxifyControllerReadClient {
	constructor(
		private readonly chainId: SupportedChainId,
		private readonly contractAddress: Address,
	) {}

	private readContract<Result>(functionName: string, args?: unknown[]): Promise<Result> {
		const publicClient = ViemClient.getPublicClient(this.chainId)
		return publicClient.readContract({
			address: this.contractAddress,
			abi: PROXIFY_CONTROLLER_ABI,
			functionName: functionName as any,
			args: args as any,
		}) as Promise<Result>
	}

	async DEFAULT_ADMIN_ROLE(): Promise<string> {
		return this.readContract<string>("DEFAULT_ADMIN_ROLE")
	}

	async GUARDIAN_ROLE(): Promise<string> {
		return this.readContract<string>("GUARDIAN_ROLE")
	}

	async ORACLE_ROLE(): Promise<string> {
		return this.readContract<string>("ORACLE_ROLE")
	}

	async MAX_BATCH_SIZE(): Promise<bigint> {
		return this.readContract<bigint>("MAX_BATCH_SIZE")
	}

	async getRoleAdmin(role: string): Promise<string> {
		return this.readContract<string>("getRoleAdmin", [role])
	}

	async hasRole(role: string, account: Address): Promise<boolean> {
		return this.readContract<boolean>("hasRole", [role, account])
	}

	async isPaused(): Promise<boolean> {
		return this.readContract<boolean>("isPaused")
	}

	async isProtocolWhitelisted(protocol: Address): Promise<boolean> {
		return this.readContract<boolean>("isProtocolWhitelisted", [protocol])
	}

	async isTokenSupported(token: Address): Promise<boolean> {
		return this.readContract<boolean>("isTokenSupported", [token])
	}

	async proxify(): Promise<Address> {
		return this.readContract<Address>("proxify")
	}

	async clientRegistry(): Promise<Address> {
		return this.readContract<Address>("clientRegistry")
	}

	async paused(): Promise<boolean> {
		return this.readContract<boolean>("paused")
	}

	async supportedTokens(token: Address): Promise<boolean> {
		return this.readContract<boolean>("supportedTokens", [token])
	}

	async supportsInterface(interfaceId: string): Promise<boolean> {
		return this.readContract<boolean>("supportsInterface", [interfaceId])
	}

	async whitelistedProtocols(protocol: Address): Promise<boolean> {
		return this.readContract<boolean>("whitelistedProtocols", [protocol])
	}

	// NEW: Tier protocol management
	async getTierProtocols(tierId: string): Promise<Address[]> {
		return this.readContract<Address[]>("getTierProtocols", [tierId])
	}

	async isTierProtocol(tierId: string, protocol: Address): Promise<boolean> {
		return this.readContract<boolean>("isTierProtocol", [tierId, protocol])
	}

	async tierProtocols(tierId: string, index: bigint): Promise<Address> {
		return this.readContract<Address>("tierProtocols", [tierId, index])
	}

	// NEW: Balance methods (proxied from Proxify)
	async getClientRevenueBalance(clientId: string, token: Address): Promise<bigint> {
		return this.readContract<bigint>("getClientRevenueBalance", [clientId, token])
	}

	async getOperationFeeBalance(token: Address): Promise<bigint> {
		return this.readContract<bigint>("getOperationFeeBalance", [token])
	}

	async getProtocolRevenueBalance(token: Address): Promise<bigint> {
		return this.readContract<bigint>("getProtocolRevenueBalance", [token])
	}
}

class ProxifyControllerWriteClient {
	constructor(
		private readonly gnosisClient: GnosisSafeClient,
		private readonly chainId: SupportedChainId,
		private readonly contractAddress: Address,
		private readonly callerRole?: ProxifyAccessControlType,
	) {}

	private async proposeMultisig(functionName: string, args: unknown[], senderAddress?: Address): Promise<void> {
		if (!senderAddress) {
			throw new Error(`Missing sender address for multisig proposal to ${functionName}`)
		}

		const transactionData: MetaTransactionData = {
			to: this.contractAddress,
			value: "0",
			data: encodeFunctionData({
				abi: PROXIFY_CONTROLLER_ABI,
				functionName: functionName as any,
				args: args as any,
			}),
			operation: 0,
		}

		await this.gnosisClient.proposeTransaction([transactionData], senderAddress)
	}

	private assertCallerRole(expected: ProxifyAccessControlType): void {
		if (this.callerRole !== expected) {
			throw new Error(`Caller role ${this.callerRole ?? "undefined"} cannot execute ${expected}`)
		}
	}

	private async withRoleWallet<T>(
		role: ProxifyAccessControlType,
		action: (walletClient: WalletClient) => Promise<T>,
	): Promise<T> {
		this.assertCallerRole(role)
		const walletClient = ViemClient.getWalletClient(this.chainId, role)
		return action(walletClient)
	}

	private isDefaultAdminRole(role: string): boolean {
		return role.toLowerCase() === ROLE_HASHES.DEFAULT_ADMIN_ROLE
	}

	private getRoleHash(role: ProxifyAccessControlType): string | undefined {
		switch (role) {
			case ProxifyAccessControl.Enum.DEFAULT_ADMIN_ROLE:
				return ROLE_HASHES.DEFAULT_ADMIN_ROLE
			case ProxifyAccessControl.Enum.ORACLE_ROLE:
				return ROLE_HASHES.ORACLE_ROLE
			case ProxifyAccessControl.Enum.GUARDIAN_ROLE:
				return ROLE_HASHES.GUARDIAN_ROLE
			default:
				return undefined
		}
	}

	// ---------- admin (multisig) actions ----------

	async addSupportedToken(token: Address, senderAddress: Address): Promise<void> {
		await this.proposeMultisig("addSupportedToken", [token], senderAddress)
	}

	async removeSupportedToken(token: Address, senderAddress: Address): Promise<void> {
		await this.proposeMultisig("removeSupportedToken", [token], senderAddress)
	}

	async addWhitelistedProtocol(protocol: Address, senderAddress: Address): Promise<void> {
		await this.proposeMultisig("addWhitelistedProtocol", [protocol], senderAddress)
	}

	async removeWhitelistedProtocol(protocol: Address, senderAddress: Address): Promise<void> {
		await this.proposeMultisig("removeWhitelistedProtocol", [protocol], senderAddress)
	}

	async grantRole(role: string, account: Address, senderAddress: Address): Promise<void> {
		await this.proposeMultisig("grantRole", [role, account], senderAddress)
	}

	async revokeRole(role: string, account: Address, senderAddress: Address): Promise<void> {
		await this.proposeMultisig("revokeRole", [role, account], senderAddress)
	}

	async unpause(senderAddress: Address): Promise<void> {
		await this.proposeMultisig("unpause", [], senderAddress)
	}

	// NEW: Tier protocol management
	async assignProtocolToTier(tierId: string, protocol: Address, senderAddress: Address): Promise<void> {
		await this.proposeMultisig("assignProtocolToTier", [tierId, protocol], senderAddress)
	}

	async removeProtocolFromTier(tierId: string, protocol: Address, senderAddress: Address): Promise<void> {
		await this.proposeMultisig("removeProtocolFromTier", [tierId, protocol], senderAddress)
	}

	// NEW: Proxify configuration updates
	async updateMaxBatchSize(newMax: bigint, senderAddress: Address): Promise<void> {
		await this.proposeMultisig("updateMaxBatchSize", [newMax], senderAddress)
	}

	async updateMaxGasFeePerUser(newMax: bigint, senderAddress: Address): Promise<void> {
		await this.proposeMultisig("updateMaxGasFeePerUser", [newMax], senderAddress)
	}

	async updateMaxIndexGrowth(newMax: bigint, senderAddress: Address): Promise<void> {
		await this.proposeMultisig("updateMaxIndexGrowth", [newMax], senderAddress)
	}

	async renounceRole(role: string, callerConfirmation: Address, senderAddress?: Address): Promise<void> {
		if (this.isDefaultAdminRole(role)) {
			await this.proposeMultisig("renounceRole", [role, callerConfirmation], senderAddress)
			return
		}

		if (!this.callerRole) {
			throw new Error("Cannot renounce role without specifying caller role")
		}

		const expectedHash = this.getRoleHash(this.callerRole)
		if (!expectedHash || role.toLowerCase() !== expectedHash) {
			throw new Error(`Caller role ${this.callerRole} does not match provided role hash`)
		}

		await this.withRoleWallet(this.callerRole, async (walletClient) => {
			const account = walletClient.account!
			if (callerConfirmation.toLowerCase() !== account.address.toLowerCase()) {
				throw new Error("Caller confirmation must match the role holder")
			}

			await walletClient.writeContract({
				abi: PROXIFY_CONTROLLER_ABI,
				functionName: "renounceRole",
				args: [role, callerConfirmation] as any,
				address: this.contractAddress,
				account,
				chain: walletClient.chain,
			})
		})
	}

	// ---------- oracle actions ----------

	async executeTransfer(
		token: Address,
		protocol: Address,
		amount: bigint,
		tierId: string,
		tierName: string,
	): Promise<void> {
		await this.withRoleWallet(ProxifyAccessControl.Enum.ORACLE_ROLE, async (walletClient) => {
			await walletClient.writeContract({
				abi: PROXIFY_CONTROLLER_ABI,
				functionName: "executeTransfer",
				args: [token, protocol, amount, tierId, tierName] as any,
				address: this.contractAddress,
				account: walletClient.account!,
				chain: walletClient.chain,
			})
		})
	}

	async confirmUnstake(token: Address, amount: bigint): Promise<void> {
		await this.withRoleWallet(ProxifyAccessControl.Enum.ORACLE_ROLE, async (walletClient) => {
			await walletClient.writeContract({
				abi: PROXIFY_CONTROLLER_ABI,
				functionName: "confirmUnstake",
				args: [token, amount],
				address: this.contractAddress,
				account: walletClient.account!,
				chain: walletClient.chain,
			})
		})
	}

	async staking(token: Address, amount: bigint, stakingExecutor: Address): Promise<void> {
		await this.withRoleWallet(ProxifyAccessControl.Enum.ORACLE_ROLE, async (walletClient) => {
			await walletClient.writeContract({
				abi: PROXIFY_CONTROLLER_ABI,
				functionName: "staking",
				args: [token, amount, stakingExecutor] as any,
				address: this.contractAddress,
				account: walletClient.account!,
				chain: walletClient.chain,
			})
		})
	}

	// NEW: Tier index management
	async updateTierIndex(token: Address, tierId: string, newIndex: bigint): Promise<void> {
		await this.withRoleWallet(ProxifyAccessControl.Enum.ORACLE_ROLE, async (walletClient) => {
			await walletClient.writeContract({
				abi: PROXIFY_CONTROLLER_ABI,
				functionName: "updateTierIndex",
				args: [token, tierId, newIndex] as any,
				address: this.contractAddress,
				account: walletClient.account!,
				chain: walletClient.chain,
			})
		})
	}

	async batchUpdateTierIndices(token: Address, tierIds: string[], newIndices: bigint[]): Promise<void> {
		await this.withRoleWallet(ProxifyAccessControl.Enum.ORACLE_ROLE, async (walletClient) => {
			await walletClient.writeContract({
				abi: PROXIFY_CONTROLLER_ABI,
				functionName: "batchUpdateTierIndices",
				args: [token, tierIds, newIndices] as any,
				address: this.contractAddress,
				account: walletClient.account!,
				chain: walletClient.chain,
			})
		})
	}

	async initializeTier(token: Address, tierId: string): Promise<void> {
		await this.withRoleWallet(ProxifyAccessControl.Enum.ORACLE_ROLE, async (walletClient) => {
			await walletClient.writeContract({
				abi: PROXIFY_CONTROLLER_ABI,
				functionName: "initializeTier",
				args: [token, tierId] as any,
				address: this.contractAddress,
				account: walletClient.account!,
				chain: walletClient.chain,
			})
		})
	}

	async batchInitializeTiers(token: Address, tierIds: string[]): Promise<void> {
		await this.withRoleWallet(ProxifyAccessControl.Enum.ORACLE_ROLE, async (walletClient) => {
			await walletClient.writeContract({
				abi: PROXIFY_CONTROLLER_ABI,
				functionName: "batchInitializeTiers",
				args: [token, tierIds] as any,
				address: this.contractAddress,
				account: walletClient.account!,
				chain: walletClient.chain,
			})
		})
	}

	// NEW: Batch withdrawal
	async batchWithdraw(params: BatchWithdrawParams): Promise<void> {
		await this.withRoleWallet(ProxifyAccessControl.Enum.ORACLE_ROLE, async (walletClient) => {
			await walletClient.writeContract({
				abi: PROXIFY_CONTROLLER_ABI,
				functionName: "batchWithdraw",
				args: [params.executions] as any,
				address: this.contractAddress,
				account: walletClient.account!,
				chain: walletClient.chain,
			})
		})
	}

	async withdraw(params: ControllerWithdrawParams): Promise<void> {
		await this.withRoleWallet(ProxifyAccessControl.Enum.ORACLE_ROLE, async (walletClient) => {
			await walletClient.writeContract({
				abi: PROXIFY_CONTROLLER_ABI,
				functionName: "withdraw",
				args: [params.clientId, params.userId, params.token, params.amount, params.to] as any,
				address: this.contractAddress,
				account: walletClient.account!,
				chain: walletClient.chain,
			})
		})
	}

	// NEW: Revenue claiming
	async claimClientRevenue(params: ClaimClientRevenueParams): Promise<void> {
		await this.withRoleWallet(ProxifyAccessControl.Enum.ORACLE_ROLE, async (walletClient) => {
			await walletClient.writeContract({
				abi: PROXIFY_CONTROLLER_ABI,
				functionName: "claimClientRevenue",
				args: [params.clientId, params.token, params.to, params.amount] as any,
				address: this.contractAddress,
				account: walletClient.account!,
				chain: walletClient.chain,
			})
		})
	}

	async claimOperationFee(params: ClaimRevenueParams): Promise<void> {
		await this.withRoleWallet(ProxifyAccessControl.Enum.ORACLE_ROLE, async (walletClient) => {
			await walletClient.writeContract({
				abi: PROXIFY_CONTROLLER_ABI,
				functionName: "claimOperationFee",
				args: [params.token, params.to, params.amount],
				address: this.contractAddress,
				account: walletClient.account!,
				chain: walletClient.chain,
			})
		})
	}

	async claimProtocolRevenue(params: ClaimRevenueParams): Promise<void> {
		await this.withRoleWallet(ProxifyAccessControl.Enum.ORACLE_ROLE, async (walletClient) => {
			await walletClient.writeContract({
				abi: PROXIFY_CONTROLLER_ABI,
				functionName: "claimProtocolRevenue",
				args: [params.token, params.to, params.amount],
				address: this.contractAddress,
				account: walletClient.account!,
				chain: walletClient.chain,
			})
		})
	}

	// ---------- guardian actions ----------
	async emergencyPause(): Promise<void> {
		await this.withRoleWallet(ProxifyAccessControl.Enum.GUARDIAN_ROLE, async (walletClient) => {
			await walletClient.writeContract({
				abi: PROXIFY_CONTROLLER_ABI,
				functionName: "emergencyPause",
				args: [],
				address: this.contractAddress,
				account: walletClient.account!,
				chain: walletClient.chain,
			})
		})
	}
}

export class ProxifyControllerClient {
	public readonly read: ProxifyControllerReadClient
	public readonly write: ProxifyControllerWriteClient

	constructor(
		gnosisClient: GnosisSafeClient,
		chainId: SupportedChainId,
		contractAddress: Address,
		callerRole?: ProxifyAccessControlType,
	) {
		this.read = new ProxifyControllerReadClient(chainId, contractAddress)
		this.write = new ProxifyControllerWriteClient(gnosisClient, chainId, contractAddress, callerRole)
	}
}