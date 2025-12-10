/**
 * B2B Vault DTO - Request/Response Types
 * Used for API ↔ UseCase communication
 */

export interface CreateVaultRequest {
	clientId: string
	chain: string
	tokenAddress: string
	tokenSymbol: string
	tokenDecimals: number
}

export interface VaultStrategyConfig {
	category: string // 'lending' | 'lp' | 'staking'
	targetPercent: number
}

export interface ConfigureStrategiesRequest {
	clientId: string
	vaultId: string
	chain: string
	tokenAddress: string
	strategies: VaultStrategyConfig[]
}

export interface UpdateIndexRequest {
	vaultId: string
	yieldEarned: string
}

export interface MarkFundsAsStakedRequest {
	vaultId: string
	amount: string
}
