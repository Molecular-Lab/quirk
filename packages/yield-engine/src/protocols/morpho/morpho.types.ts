/**
 * Morpho Protocol Types
 */

/**
 * Vault version type
 */
export type VaultVersion = 'v1' | 'v2'

/**
 * MetaMorpho vault configuration
 */
export interface MorphoMarketConfig {
	version: VaultVersion // Vault version (v1 or v2)
	chainId: number
	vaultAddress: string // MetaMorpho vault address (ERC-4626)
	vaultId?: string // Vault ID for v1 vaults (computed from address+chainId)
	vaultName: string // Human-readable vault name
	baseToken: string // Base asset symbol (e.g., "USDC")
	baseTokenAddress: string // Base asset contract address
	baseTokenDecimals: number
}

/**
 * Morpho market parameters (from Morpho Blue)
 */
export interface MorphoMarketParams {
	loanToken: string // Address of the loan asset
	collateralToken: string // Address of the collateral asset
	oracle: string // Address of the oracle
	irm: string // Address of the interest rate model
	lltv: bigint // Liquidation Loan-To-Value (in WAD)
}

/**
 * Morpho market state data
 */
export interface MorphoMarketState {
	totalSupplyAssets: bigint // Total supply in assets
	totalSupplyShares: bigint // Total supply in shares
	totalBorrowAssets: bigint // Total borrow in assets
	totalBorrowShares: bigint // Total borrow in shares
	lastUpdate: bigint // Last update timestamp
	fee: bigint // Protocol fee
}

/**
 * User position in a Morpho market
 */
export interface MorphoPosition {
	supplyShares: bigint // User's supply shares
	borrowShares: bigint // User's borrow shares
	collateral: bigint // User's collateral amount
}

/**
 * MetaMorpho vault data (ERC-4626)
 */
export interface MetaMorphoVaultData {
	totalAssets: bigint // Total assets in the vault
	totalSupply: bigint // Total shares supply
	sharePrice: bigint // Current share price (assets per share)
	apy: string // Annual Percentage Yield
}
