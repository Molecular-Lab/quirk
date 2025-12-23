/**
 * B2B User Vault DTO - Request/Response Types
 * Used for API ↔ UseCase communication
 *
 * ENVIRONMENT-AWARE ARCHITECTURE (Dec 2025):
 * - One vault per user per client PER ENVIRONMENT
 * - Separate vaults for sandbox (mock tokens) and production (real USDC)
 * - Fiat-based tracking with weightedEntryIndex
 * - Balance calculation uses client growth index
 */

export interface UserBalanceRequest {
	userId: string
	clientId: string
	environment?: "sandbox" | "production" // Defaults to "sandbox"
}

export interface UserBalanceResponse {
	userId: string
	clientId: string
	environment?: "sandbox" | "production" // Which environment this balance is for

	// Balance information (fiat-based)
	totalDeposited: string // Fiat amount deposited
	totalWithdrawn: string // Fiat amount withdrawn
	effectiveBalance: string // totalDeposited × (clientGrowthIndex / weightedEntryIndex)
	yieldEarned: string // effectiveBalance - totalDeposited

	// Index tracking (for DCA)
	weightedEntryIndex: string // User's weighted average entry index

	// Status
	isActive: boolean
	lastDepositAt: Date | null
	lastWithdrawalAt: Date | null
}

export interface UserPortfolioResponse {
	userId: string
	clientId: string
	totalDeposited: string
	totalEffectiveBalance: string
	totalYieldEarned: string
	vault: UserBalanceResponse | null
}

export interface ListVaultUsersRequest {
	clientId: string
	environment?: "sandbox" | "production" // Defaults to "sandbox"
	limit?: number
	offset?: number
}
