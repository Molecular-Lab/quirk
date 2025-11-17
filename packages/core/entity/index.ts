// Smart Contract Entities
export * from "./old/account.entity"
export * from "./old-adapter/client-registry.entity"
export * from "./old-adapter/controller.entity"
export * from "./old-adapter/proxify.entity"
export * from "./old/client-registry.entity"
export * from "./old/controller.entity"
export * from "./old/deposit-withdraw.entity"
export * from "./old/safe.entity"
export * from "./old/tier.entity"
export * from "./old/vault.entity"

// Privy & User Entities
export * from "./old/privy-user.entity"
export * from "./old/privy-wallet.entity"
export * from "./old/user-embedded-wallet.entity"
export * from "./old/wallet-transaction.entity"

// DeFi & Business Entities
export * from "./old/defi-position.entity"
export * from "./old/risk-profile.entity"
export * from "./old/yield-strategy.entity"

// B2B Client - Only non-conflicting types (rest are in ./database)
export type {
	ClientOrganization,
	BusinessType,
	KYBStatus,
	ClientRiskTier,
	SubscriptionTier,
	RiskAllocation,
	EndUserDeposit,
	VaultIndex,
	CreateClientParams,
	UpdateClientRiskTierParams,
	CreateEndUserDepositParams,
	UpdateEndUserBalanceParams,
	CreateVaultIndexParams,
	UpdateVaultIndexParams,
} from "./old/b2b-client.entity"

// Database Entities (Zod-validated, SQLC-mapped) - Primary source of truth
export * from "./database"
