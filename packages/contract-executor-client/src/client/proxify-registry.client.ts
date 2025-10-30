import { ClientInfo, ProxifyAccessControl, ProxifyAccessControlType, PROXIFY_CLIENT_REGISTRY_ABI, ROLE_HASHES } from "@proxify/core"
import { MetaTransactionData } from "@safe-global/safe-core-sdk-types"
import { Address, encodeFunctionData, type WalletClient } from "viem"
import { SupportedChainId } from "../config/chain"
import { GnosisSafeClient } from "../config/gnosis-client"
import { ViemClient } from "../config/viem-client"

export interface RiskTier {
	tierId: string
	name: string
	allocationBps: number
	isActive: boolean
}

class ProxifyClientRegistryReadClient {
	constructor(
		private readonly chainId: SupportedChainId,
		private readonly contractAddress: Address,
	) {}

	private readContract<Result>(functionName: string, args?: unknown[]): Promise<Result> {
		const publicClient = ViemClient.getPublicClient(this.chainId)
		return publicClient.readContract({
			address: this.contractAddress,
			abi: PROXIFY_CLIENT_REGISTRY_ABI,
			functionName: functionName as any,
			args: args as any,
		}) as Promise<Result>
	}

	async DEFAULT_ADMIN_ROLE(): Promise<string> {
		return this.readContract<string>("DEFAULT_ADMIN_ROLE")
	}

	async ORACLE_ROLE(): Promise<string> {
		return this.readContract<string>("ORACLE_ROLE")
	}

	async MAX_FEE_BPS(): Promise<number> {
		return this.readContract<number>("MAX_FEE_BPS")
	}

	async MAX_TIERS_PER_CLIENT(): Promise<bigint> {
		return this.readContract<bigint>("MAX_TIERS_PER_CLIENT")
	}

	async getRoleAdmin(role: string): Promise<string> {
		return this.readContract<string>("getRoleAdmin", [role])
	}

	async hasRole(role: string, account: Address): Promise<boolean> {
		return this.readContract<boolean>("hasRole", [role, account])
	}

	async isClientRegistered(clientId: string): Promise<boolean> {
		return this.readContract<boolean>("isClientRegistered", [clientId])
	}

	async isClientActive(clientId: string): Promise<boolean> {
		return this.readContract<boolean>("isClientActive", [clientId])
	}

	async getClientInfo(clientId: string): Promise<ClientInfo> {
		const result = (await this.readContract<{
			name: string
			clientAddress: Address
			isActive: boolean
			registeredAt: bigint
			feeBps: number
			serviceFeeBps: number
			clientFeeBps: number
		}>("getClientInfo", [clientId])) as {
			name: string
			clientAddress: Address
			isActive: boolean
			registeredAt: bigint
			feeBps: number
			serviceFeeBps: number
			clientFeeBps: number
		}

		return result
	}

	async getClientAddress(clientId: string): Promise<Address> {
		return this.readContract<Address>("getClientAddress", [clientId])
	}

	// NEW: Risk tier methods
	async getClientRiskTiers(clientId: string): Promise<RiskTier[]> {
		return this.readContract<RiskTier[]>("getClientRiskTiers", [clientId])
	}

	async getClientRiskTier(clientId: string, tierId: string): Promise<RiskTier> {
		return this.readContract<RiskTier>("getClientRiskTier", [clientId, tierId])
	}

	async hasTier(clientId: string, tierId: string): Promise<boolean> {
		return this.readContract<boolean>("hasTier", [clientId, tierId])
	}

	async validateTierAllocations(tiers: RiskTier[]): Promise<boolean> {
		return this.readContract<boolean>("validateTierAllocations", [tiers])
	}
}

class ProxifyClientRegistryWriteClient {
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
				abi: PROXIFY_CLIENT_REGISTRY_ABI,
				functionName: functionName as any,
				args: args as any,
			}),
			operation: 0,
		}

		await this.gnosisClient.proposeTransaction([transactionData], senderAddress)
	}

	private async withOracleWallet<T>(action: (walletClient: WalletClient) => Promise<T>): Promise<T> {
		if (this.callerRole !== ProxifyAccessControl.Enum.ORACLE_ROLE) {
			throw new Error(`Caller role ${this.callerRole ?? "undefined"} cannot execute oracle operation`)
		}

		const walletClient = ViemClient.getWalletClient(this.chainId, this.callerRole)

		return action(walletClient)
	}

	async registerClient(
		clientId: string,
		clientAddress: Address,
		name: string,
		feeBps: number,
		serviceFeeBps: number,
		clientFeeBps: number,
	): Promise<void> {
		await this.withOracleWallet(async (walletClient) => {
			await walletClient.writeContract({
				abi: PROXIFY_CLIENT_REGISTRY_ABI,
				functionName: "registerClient",
				args: [clientId as Address, clientAddress, name, feeBps, serviceFeeBps, clientFeeBps],
				address: this.contractAddress,
				account: walletClient.account!,
				chain: walletClient.chain,
			})
		})
	}

	async activateClient(clientId: string, senderAddress: Address): Promise<void> {
		await this.proposeMultisig("activateClient", [clientId], senderAddress)
	}

	async deactivateClient(clientId: string, senderAddress: Address): Promise<void> {
		await this.proposeMultisig("deactivateClient", [clientId], senderAddress)
	}

	async updateClientAddress(clientId: string, newAddress: Address, senderAddress: Address): Promise<void> {
		await this.proposeMultisig("updateClientAddress", [clientId, newAddress], senderAddress)
	}

	// NEW: Fee management methods
	async updateClientFees(
		clientId: string,
		feeBps: number,
		serviceFeeBps: number,
		senderAddress: Address,
	): Promise<void> {
		await this.proposeMultisig("updateClientFees", [clientId, feeBps, serviceFeeBps], senderAddress)
	}

	// NEW: Risk tier management methods
	async setClientRiskTiers(clientId: string, riskTiers: RiskTier[], senderAddress: Address): Promise<void> {
		await this.proposeMultisig("setClientRiskTiers", [clientId, riskTiers], senderAddress)
	}

	async addClientRiskTier(clientId: string, tier: RiskTier, senderAddress: Address): Promise<void> {
		await this.proposeMultisig("addClientRiskTier", [clientId, tier], senderAddress)
	}

	async updateTierAllocation(
		clientId: string,
		tierId: string,
		newAllocationBps: number,
		senderAddress: Address,
	): Promise<void> {
		await this.proposeMultisig("updateTierAllocation", [clientId, tierId, newAllocationBps], senderAddress)
	}

	async setTierActive(clientId: string, tierId: string, isActive: boolean, senderAddress: Address): Promise<void> {
		await this.proposeMultisig("setTierActive", [clientId, tierId, isActive], senderAddress)
	}

	async renounceRole(role: string, callerConfirmation: Address, senderAddress?: Address): Promise<void> {
		const normalizedRole = role.toLowerCase()

		if (normalizedRole === ROLE_HASHES.DEFAULT_ADMIN_ROLE) {
			await this.proposeMultisig("renounceRole", [role, callerConfirmation], senderAddress)
			return
		}

		if (normalizedRole !== ROLE_HASHES.ORACLE_ROLE || this.callerRole !== ProxifyAccessControl.Enum.ORACLE_ROLE) {
			throw new Error(`Caller role ${this.callerRole ?? "undefined"} cannot renounce provided role`)
		}

		await this.withOracleWallet(async (walletClient) => {
			const accountAddress = walletClient.account!.address

			if (accountAddress.toLowerCase() !== callerConfirmation.toLowerCase()) {
				throw new Error("Caller confirmation must match the role holder")
			}

			await walletClient.writeContract({
				abi: PROXIFY_CLIENT_REGISTRY_ABI,
				functionName: "renounceRole",
				args: [role as Address, callerConfirmation],
				address: this.contractAddress,
				account: walletClient.account!,
				chain: walletClient.chain,
			})
		})
	}
}

export class ProxifyClientRegistryClient {
	public readonly read: ProxifyClientRegistryReadClient
	public readonly write: ProxifyClientRegistryWriteClient

	constructor(
		gnosisClient: GnosisSafeClient,
		chainId: SupportedChainId,
		contractAddress: Address,
		callerRole?: ProxifyAccessControlType,
	) {
		this.read = new ProxifyClientRegistryReadClient(chainId, contractAddress)
		this.write = new ProxifyClientRegistryWriteClient(gnosisClient, chainId, contractAddress, callerRole)
	}
}

