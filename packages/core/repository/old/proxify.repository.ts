import type { Address } from "viem"
import type {
	AccountBalance,
	AccountSnapshot,
	ProxifyVaultClientAdapter,
	SafeClientAdapter,
	SafeInfo,
	TierAccount,
	TierIndexInfo,
	UserAccountSummary,
	UserTierSummary,
	VaultIndexInfo,
	VaultInfo,
	VaultTotals,
} from "../entity"

export class ProxifyRepository {
	constructor(
		private readonly vaultClient: ProxifyVaultClientAdapter,
		private readonly safeClient?: SafeClientAdapter,
	) {}

	// Contract addresses
	async getController(): Promise<Address> {
		return this.vaultClient.controller()
	}

	async getClientRegistry(): Promise<Address> {
		return this.vaultClient.clientRegistry()
	}

	// Token support
	async isSupportedToken(token: Address): Promise<boolean> {
		return this.vaultClient.isSupportedToken(token)
	}

	async supportedTokens(token: Address): Promise<boolean> {
		return this.vaultClient.supportedTokens(token)
	}

	// Tier-specific account operations
	async getTierAccount(clientId: string, userId: string, tierId: string, token: Address): Promise<TierAccount> {
		const [accountInfo, tierIndexInfo] = await Promise.all([
			this.vaultClient.getAccount(clientId, userId, tierId, token),
			this.vaultClient.getTierIndexWithTimestamp(token, tierId),
		])

		const currentValue = this.computeCurrentValue(accountInfo, tierIndexInfo.index)

		return {
			tierId,
			balance: accountInfo.balance,
			entryIndex: accountInfo.entryIndex,
			depositedAt: accountInfo.depositTimestamp,
			currentValue,
		}
	}

	async getUserActiveTiers(clientId: string, userId: string, token: Address): Promise<string[]> {
		return this.vaultClient.getUserActiveTiers(clientId, userId, token)
	}

	async getTierValue(clientId: string, userId: string, tierId: string, token: Address): Promise<bigint> {
		return this.vaultClient.getTierValue(clientId, userId, tierId, token)
	}

	// Legacy account balance method (uses first tier if any exist, otherwise returns zero balance)
	async getAccountBalance(clientId: string, userId: string, token: Address): Promise<AccountBalance> {
		const activeTiers = await this.vaultClient.getUserActiveTiers(clientId, userId, token)

		if (activeTiers.length === 0) {
			return {
				balance: 0n,
				entryIndex: 0n,
				depositTimestamp: 0n,
				currentValue: 0n,
			}
		}

		// Use first tier for legacy compatibility
		const tierId = activeTiers[0]
		const [accountInfo, tierIndex] = await Promise.all([
			this.vaultClient.getAccount(clientId, userId, tierId, token),
			this.vaultClient.getTierIndex(token, tierId),
		])

		const currentValue = this.computeCurrentValue(accountInfo, tierIndex)

		return {
			...accountInfo,
			currentValue,
		}
	}

	async getUserAccountSummary(clientId: string, userId: string, token: Address): Promise<UserAccountSummary> {
		return this.vaultClient.getUserAccountSummary(clientId, userId, token)
	}

	async getTotalValue(clientId: string, userId: string, token: Address): Promise<bigint> {
		return this.vaultClient.getTotalValue(clientId, userId, token)
	}

	async getAccruedYield(clientId: string, userId: string, token: Address): Promise<bigint> {
		return this.vaultClient.getAccruedYield(clientId, userId, token)
	}

	// Vault information
	async getVaultInfo(token: Address): Promise<VaultInfo> {
		const [totals, indexInfo] = await Promise.all([this.getVaultTotals(token), this.getVaultIndexWithTimestamp(token)])

		return {
			totalDeposits: totals.totalDeposits,
			totalStaked: totals.totalStaked,
			vaultIndex: indexInfo.index,
			indexUpdatedAt: indexInfo.updatedAt,
		}
	}

	async getVaultTotals(token: Address): Promise<VaultTotals> {
		const [totalDeposits, totalStaked] = await Promise.all([
			this.vaultClient.totalDeposits(token),
			this.vaultClient.totalStaked(token),
		])

		return {
			totalDeposits,
			totalStaked,
		}
	}

	async getVaultIndex(token: Address): Promise<bigint> {
		return this.vaultClient.vaultIndex(token)
	}

	async getVaultIndexWithTimestamp(token: Address): Promise<VaultIndexInfo> {
		return this.vaultClient.vaultIndexWithTimestamp(token)
	}

	async getContractBalance(token: Address): Promise<bigint> {
		return this.vaultClient.getContractBalance(token)
	}

	async getStakeableBalance(token: Address): Promise<bigint> {
		return this.vaultClient.getStakeableBalance(token)
	}

	// Tier-specific indices
	async getTierIndex(token: Address, tierId: string): Promise<bigint> {
		return this.vaultClient.getTierIndex(token, tierId)
	}

	async getTierIndexWithTimestamp(token: Address, tierId: string): Promise<TierIndexInfo> {
		return this.vaultClient.getTierIndexWithTimestamp(token, tierId)
	}

	async isTierInitialized(token: Address, tierId: string): Promise<boolean> {
		return this.vaultClient.isTierInitialized(token, tierId)
	}

	// Fee vault balances
	async getOperationFeeBalance(token: Address): Promise<bigint> {
		return this.vaultClient.getOperationFeeBalance(token)
	}

	async getProtocolRevenueBalance(token: Address): Promise<bigint> {
		return this.vaultClient.getProtocolRevenueBalance(token)
	}

	async getClientRevenueBalance(clientId: string, token: Address): Promise<bigint> {
		return this.vaultClient.getClientRevenueBalance(clientId, token)
	}

	async getTotalClientRevenues(token: Address): Promise<bigint> {
		return this.vaultClient.getTotalClientRevenues(token)
	}

	// Safe operations
	async getSafeInfo(safeAddress: Address): Promise<SafeInfo> {
		const safeClient = this.requireSafeClient()
		return safeClient.getInfo(safeAddress)
	}

	private computeCurrentValue(account: AccountSnapshot, vaultIndex: bigint): bigint {
		if (account.balance === 0n) {
			return 0n
		}

		if (account.entryIndex === 0n || vaultIndex === 0n) {
			return account.balance
		}

		return (account.balance * vaultIndex) / account.entryIndex
	}

	private requireSafeClient(): SafeClientAdapter {
		if (!this.safeClient) {
			throw new Error("Safe client not configured")
		}

		return this.safeClient
	}
}
