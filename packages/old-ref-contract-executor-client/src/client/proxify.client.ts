import { AccountSnapshot, PROXIFY_ABI, UserAccountSummary, VaultIndexInfo } from "@proxify/core"
import { Address } from "viem"
import { SupportedChainId } from "../config/chain"
import { ViemClient } from "../config/viem-client"

class ProxifyReadClient {
	constructor(
		private readonly chainId: SupportedChainId,
		private readonly contractAddress: Address,
	) {}

	private readContract<Result>(functionName: string, args?: unknown[]): Promise<Result> {
		const publicClient = ViemClient.getPublicClient(this.chainId)
		return publicClient.readContract({
			address: this.contractAddress,
			abi: PROXIFY_ABI,
			functionName: functionName as any,
			args: args as any,
		}) as Promise<Result>
	}

	async controller(): Promise<Address> {
		return this.readContract<Address>("controller")
	}

	async clientRegistry(): Promise<Address> {
		return this.readContract<Address>("clientRegistry")
	}

	async isSupportedToken(token: Address): Promise<boolean> {
		return this.readContract<boolean>("isSupportedToken", [token])
	}

	async supportedTokens(token: Address): Promise<boolean> {
		return this.readContract<boolean>("supportedTokens", [token])
	}

	async totalDeposits(token: Address): Promise<bigint> {
		return this.readContract<bigint>("totalDeposits", [token])
	}

	async totalStaked(token: Address): Promise<bigint> {
		return this.readContract<bigint>("totalStaked", [token])
	}

	async vaultIndex(token: Address): Promise<bigint> {
		return this.readContract<bigint>("getVaultIndex", [token])
	}

	async vaultIndexWithTimestamp(token: Address): Promise<VaultIndexInfo> {
		const [index, updatedAt] = (await this.readContract<[bigint, bigint]>("getVaultIndexWithTimestamp", [token])) as [
			bigint,
			bigint,
		]

		return { index, updatedAt }
	}

	async getUserAccountSummary(clientId: string, userId: string, token: Address): Promise<UserAccountSummary> {
		const [totalBalance, totalValue, accruedYield, activeTierCount] = (await this.readContract<
			[bigint, bigint, bigint, bigint]
		>("getUserAccountSummary", [clientId, userId, token])) as [bigint, bigint, bigint, bigint]

		return { totalBalance, totalValue, accruedYield, activeTierCount }
	}

	async getTotalValue(clientId: string, userId: string, token: Address): Promise<bigint> {
		return this.readContract<bigint>("getTotalValue", [clientId, userId, token])
	}

	async getAccruedYield(clientId: string, userId: string, token: Address): Promise<bigint> {
		return this.readContract<bigint>("getAccruedYield", [clientId, userId, token])
	}

	async getContractBalance(token: Address): Promise<bigint> {
		return this.readContract<bigint>("getContractBalance", [token])
	}

	// NEW: Tier-specific methods
	async getAccount(clientId: string, userId: string, tierId: string, token: Address): Promise<{
		balance: bigint
		entryIndex: bigint
		depositTimestamp: bigint
	}> {
		const result = (await this.readContract<{ balance: bigint; entryIndex: bigint; depositedAt: bigint }>(
			"getAccount",
			[clientId, userId, tierId, token],
		)) as { balance: bigint; entryIndex: bigint; depositedAt: bigint }
		return {
			balance: result.balance,
			entryIndex: result.entryIndex,
			depositTimestamp: result.depositedAt,
		}
	}

	async getUserActiveTiers(clientId: string, userId: string, token: Address): Promise<string[]> {
		return this.readContract<string[]>("getUserActiveTiers", [clientId, userId, token])
	}

	async getTierValue(clientId: string, userId: string, tierId: string, token: Address): Promise<bigint> {
		return this.readContract<bigint>("getTierValue", [clientId, userId, tierId, token])
	}

	async getTierIndex(token: Address, tierId: string): Promise<bigint> {
		return this.readContract<bigint>("getTierIndex", [token, tierId])
	}

	async getTierIndexWithTimestamp(
		token: Address,
		tierId: string,
	): Promise<{ index: bigint; updatedAt: bigint; tierId: string }> {
		const [index, updatedAt] = (await this.readContract<[bigint, bigint]>("getTierIndexWithTimestamp", [
			token,
			tierId,
		])) as [bigint, bigint]
		return { index, updatedAt, tierId }
	}

	async isTierInitialized(token: Address, tierId: string): Promise<boolean> {
		return this.readContract<boolean>("isTierInitialized", [token, tierId])
	}

	async isTierInitializedMap(tierId: string, token: Address): Promise<boolean> {
		return this.readContract<boolean>("isTierInitializedMap", [tierId, token])
	}

	// NEW: Stakeable and fee balance methods
	async getStakeableBalance(token: Address): Promise<bigint> {
		return this.readContract<bigint>("getStakeableBalance", [token])
	}

	async getOperationFeeBalance(token: Address): Promise<bigint> {
		return this.readContract<bigint>("getOperationFeeBalance", [token])
	}

	async getProtocolRevenueBalance(token: Address): Promise<bigint> {
		return this.readContract<bigint>("getProtocolRevenueBalance", [token])
	}

	async getClientRevenueBalance(clientId: string, token: Address): Promise<bigint> {
		return this.readContract<bigint>("getClientRevenueBalance", [clientId, token])
	}

	async getTotalClientRevenues(token: Address): Promise<bigint> {
		return this.readContract<bigint>("getTotalClientRevenues", [token])
	}

	async getTotalDeposits(token: Address): Promise<bigint> {
		return this.readContract<bigint>("getTotalDeposits", [token])
	}

	async getTotalStaked(token: Address): Promise<bigint> {
		return this.readContract<bigint>("getTotalStaked", [token])
	}

	// NEW: Additional view methods
	async INITIAL_INDEX(): Promise<bigint> {
		return this.readContract<bigint>("INITIAL_INDEX")
	}

	async maxBatchSize(): Promise<bigint> {
		return this.readContract<bigint>("maxBatchSize")
	}

	async maxIndexGrowth(): Promise<bigint> {
		return this.readContract<bigint>("maxIndexGrowth")
	}

	async operationFeeVault(token: Address): Promise<bigint> {
		return this.readContract<bigint>("operationFeeVault", [token])
	}

	async protocolRevenueVault(token: Address): Promise<bigint> {
		return this.readContract<bigint>("protocolRevenueVault", [token])
	}

	async clientRevenueVault(clientId: string, token: Address): Promise<bigint> {
		return this.readContract<bigint>("clientRevenueVault", [clientId, token])
	}

	async tierVaultIndices(tierId: string, token: Address): Promise<bigint> {
		return this.readContract<bigint>("tierVaultIndices", [tierId, token])
	}

	async tierVaultIndexUpdatedAt(tierId: string, token: Address): Promise<bigint> {
		return this.readContract<bigint>("tierVaultIndexUpdatedAt", [tierId, token])
	}
}

export class ProxifyClient {
	public readonly read: ProxifyReadClient

	constructor(chainId: SupportedChainId, contractAddress: Address) {
		this.read = new ProxifyReadClient(chainId, contractAddress)
	}
}
