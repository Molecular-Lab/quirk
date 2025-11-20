/**
 * Compound V3 (Comet) Protocol Types
 */

/**
 * User basic data from Compound V3
 * Represents a user's position in the protocol
 */
export interface CometUserBasic {
	principal: bigint // Signed principal amount (positive = supply, negative = borrow)
	baseTrackingIndex: bigint // Index for tracking rewards
	baseTrackingAccrued: bigint // Accrued COMP rewards
	assetsIn: bigint // Bitmap of collateral assets
}

/**
 * Asset information from Compound V3
 */
export interface CometAssetInfo {
	offset: bigint // Storage offset
	asset: string // Asset address
	priceFeed: string // Price feed address
	scale: bigint // Scale factor for price
	borrowCollateralFactor: bigint // Collateral factor for borrowing
	liquidateCollateralFactor: bigint // Collateral factor for liquidation
	liquidationFactor: bigint // Liquidation penalty
	supplyCap: bigint // Maximum supply cap
}

/**
 * Market configuration for a Compound V3 deployment
 */
export interface CometMarketConfig {
	chainId: number
	cometAddress: string // Comet proxy address
	baseToken: string // Base asset symbol (e.g., "USDC")
	baseTokenAddress: string // Base asset contract address
	baseTokenDecimals: number
}
