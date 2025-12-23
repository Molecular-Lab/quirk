import { Address } from "viem"

import { AccountSnapshot, UserAccountSummary } from "../old/account.entity"
import { TierIndexInfo } from "../old/tier.entity"
import { VaultIndexInfo } from "../old/vault.entity"

export interface QuirkVaultClientAdapter {
	// Contract addresses
	controller(): Promise<Address>
	clientRegistry(): Promise<Address>

	// Token support
	isSupportedToken(token: Address): Promise<boolean>
	supportedTokens(token: Address): Promise<boolean>

	// Vault totals
	totalDeposits(token: Address): Promise<bigint>
	totalStaked(token: Address): Promise<bigint>

	// Legacy vault index (deprecated, use tier-specific indices)
	vaultIndex(token: Address): Promise<bigint>
	vaultIndexWithTimestamp(token: Address): Promise<VaultIndexInfo>

	// Tier-specific indices
	getTierIndex(token: Address, tierId: string): Promise<bigint>
	getTierIndexWithTimestamp(token: Address, tierId: string): Promise<TierIndexInfo>
	isTierInitialized(token: Address, tierId: string): Promise<boolean>

	// Tier-specific account operations
	getAccount(clientId: string, userId: string, tierId: string, token: Address): Promise<AccountSnapshot>
	getUserActiveTiers(clientId: string, userId: string, token: Address): Promise<string[]>
	getTierValue(clientId: string, userId: string, tierId: string, token: Address): Promise<bigint>

	// User account summary (aggregated across all tiers)
	getUserAccountSummary(clientId: string, userId: string, token: Address): Promise<UserAccountSummary>
	getTotalValue(clientId: string, userId: string, token: Address): Promise<bigint>
	getAccruedYield(clientId: string, userId: string, token: Address): Promise<bigint>

	// Balance queries
	getContractBalance(token: Address): Promise<bigint>
	getStakeableBalance(token: Address): Promise<bigint>

	// Fee vault balances
	getOperationFeeBalance(token: Address): Promise<bigint>
	getProtocolRevenueBalance(token: Address): Promise<bigint>
	getClientRevenueBalance(clientId: string, token: Address): Promise<bigint>
	getTotalClientRevenues(token: Address): Promise<bigint>
}
