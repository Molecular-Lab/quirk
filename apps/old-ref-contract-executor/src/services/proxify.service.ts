import type {
	AccountBalance,
	ProxifyRepository,
	RiskTier,
	SafeClientAdapter,
	TierAccount,
	TierIndexInfo,
	UserAccountSummary,
	VaultIndexInfo,
	VaultInfo,
	VaultTotals,
} from "@proxify/core"
import type { Address } from "viem"

export interface ProxifyServiceDependencies {
	proxifyRepository: ProxifyRepository
	safeClient?: SafeClientAdapter
}

export class ProxifyService {
	constructor(private readonly deps: ProxifyServiceDependencies) {}

	// Contract addresses
	async getController(): Promise<Address> {
		return this.deps.proxifyRepository.getController()
	}

	async getClientRegistry(): Promise<Address> {
		return this.deps.proxifyRepository.getClientRegistry()
	}

	// Token support
	async isSupportedToken(token: Address): Promise<boolean> {
		return this.deps.proxifyRepository.isSupportedToken(token)
	}

	async supportedTokens(token: Address): Promise<boolean> {
		return this.deps.proxifyRepository.supportedTokens(token)
	}

	// Account operations
	async getAccountBalance(clientId: string, userId: string, token: Address): Promise<AccountBalance> {
		return this.deps.proxifyRepository.getAccountBalance(clientId, userId, token)
	}

	async getUserAccountSummary(clientId: string, userId: string, token: Address): Promise<UserAccountSummary> {
		return this.deps.proxifyRepository.getUserAccountSummary(clientId, userId, token)
	}

	async getTotalValue(clientId: string, userId: string, token: Address): Promise<bigint> {
		return this.deps.proxifyRepository.getTotalValue(clientId, userId, token)
	}

	async getAccruedYield(clientId: string, userId: string, token: Address): Promise<bigint> {
		return this.deps.proxifyRepository.getAccruedYield(clientId, userId, token)
	}

	// Vault information
	async getVaultInfo(token: Address): Promise<VaultInfo> {
		return this.deps.proxifyRepository.getVaultInfo(token)
	}

	async getVaultTotals(token: Address): Promise<VaultTotals> {
		return this.deps.proxifyRepository.getVaultTotals(token)
	}

	async getVaultIndex(token: Address): Promise<bigint> {
		return this.deps.proxifyRepository.getVaultIndex(token)
	}

	async getVaultIndexWithTimestamp(token: Address): Promise<VaultIndexInfo> {
		return this.deps.proxifyRepository.getVaultIndexWithTimestamp(token)
	}

	async getContractBalance(token: Address): Promise<bigint> {
		return this.deps.proxifyRepository.getContractBalance(token)
	}

	async getStakeableBalance(token: Address): Promise<bigint> {
		return this.deps.proxifyRepository.getStakeableBalance(token)
	}

	// Tier-specific operations
	async getTierAccount(clientId: string, userId: string, tierId: string, token: Address): Promise<TierAccount> {
		return this.deps.proxifyRepository.getTierAccount(clientId, userId, tierId, token)
	}

	async getUserActiveTiers(clientId: string, userId: string, token: Address): Promise<string[]> {
		return this.deps.proxifyRepository.getUserActiveTiers(clientId, userId, token)
	}

	async getTierValue(clientId: string, userId: string, tierId: string, token: Address): Promise<bigint> {
		return this.deps.proxifyRepository.getTierValue(clientId, userId, tierId, token)
	}

	async getTierIndex(token: Address, tierId: string): Promise<bigint> {
		return this.deps.proxifyRepository.getTierIndex(token, tierId)
	}

	async getTierIndexWithTimestamp(token: Address, tierId: string): Promise<TierIndexInfo> {
		return this.deps.proxifyRepository.getTierIndexWithTimestamp(token, tierId)
	}

	async isTierInitialized(token: Address, tierId: string): Promise<boolean> {
		return this.deps.proxifyRepository.isTierInitialized(token, tierId)
	}

	// Fee vault balances
	async getOperationFeeBalance(token: Address): Promise<bigint> {
		return this.deps.proxifyRepository.getOperationFeeBalance(token)
	}

	async getProtocolRevenueBalance(token: Address): Promise<bigint> {
		return this.deps.proxifyRepository.getProtocolRevenueBalance(token)
	}

	async getClientRevenueBalance(clientId: string, token: Address): Promise<bigint> {
		return this.deps.proxifyRepository.getClientRevenueBalance(clientId, token)
	}

	async getTotalClientRevenues(token: Address): Promise<bigint> {
		return this.deps.proxifyRepository.getTotalClientRevenues(token)
	}

	// Safe operations
	async getSafeInfo(safeAddress: Address) {
		return this.deps.proxifyRepository.getSafeInfo(safeAddress)
	}
}
