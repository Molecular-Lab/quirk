import { z } from 'zod'

/**
 * AAVE Reserve Data returned from Pool.getReserveData()
 */
export interface AaveReserveData {
	configuration: bigint
	liquidityIndex: bigint
	currentLiquidityRate: bigint // Supply APR in Ray format (1e27)
	variableBorrowIndex: bigint
	currentVariableBorrowRate: bigint
	currentStableBorrowRate: bigint
	lastUpdateTimestamp: number
	id: number
	aTokenAddress: string
	stableDebtTokenAddress: string
	variableDebtTokenAddress: string
	interestRateStrategyAddress: string
	accruedToTreasury: bigint
	unbacked: bigint
	isolationModeTotalDebt: bigint
}

/**
 * AAVE User Reserve Data from Protocol Data Provider
 */
export interface AaveUserReserveData {
	currentATokenBalance: bigint
	currentStableDebt: bigint
	currentVariableDebt: bigint
	principalStableDebt: bigint
	scaledVariableDebt: bigint
	stableBorrowRate: bigint
	liquidityRate: bigint
	stableRateLastUpdated: number
	usageAsCollateralEnabled: boolean
}

/**
 * AAVE Adapter Configuration
 */
export const AaveConfigSchema = z.object({
	chainId: z.number(),
	poolAddress: z.string(),
	dataProviderAddress: z.string().optional(),
	cacheTTL: z.number().default(5 * 60 * 1000), // 5 minutes
})

export type AaveConfig = z.infer<typeof AaveConfigSchema>

/**
 * Token configuration
 */
export interface TokenConfig {
	symbol: string
	address: string
	decimals: number
	name: string
}
