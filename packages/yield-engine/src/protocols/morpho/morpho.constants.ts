import type { MorphoMarketConfig } from './morpho.types'

/**
 * Morpho Blue singleton address (same across all chains)
 */
export const MORPHO_BLUE_ADDRESS = '0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb'

/**
 * MetaMorpho vault configurations by chain and token
 * Supports both V1 and V2 vaults for maximum yield opportunities
 */
export const MORPHO_VAULTS: Record<number, Record<string, MorphoMarketConfig>> = {
	// Ethereum Mainnet (Chain ID: 1)
	1: {
		USDC: {
			version: 'v1',
			chainId: 1,
			vaultAddress: '0xdd0f28e19C1780eb6396170735D45153D261490d',
			vaultId: '0xdd0f28e19c1780eb6396170735d45153d261490d-1',
			vaultName: 'Gauntlet USDC Prime',
			baseToken: 'USDC',
			baseTokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
			baseTokenDecimals: 6,
		},
		USDT: {
			version: 'v2',
			chainId: 1,
			vaultAddress: '0x1CE2354074C717a266aDADCD5e34104f233Da446',
			vaultName: 'Re7 USDT',
			baseToken: 'USDT',
			baseTokenAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
			baseTokenDecimals: 6,
		},
	},
	// Base (Chain ID: 8453)
	8453: {
		USDC: {
			version: 'v2',
			chainId: 8453,
			vaultAddress: '0x618495ccC4e751178C4914b1E939C0fe0FB07b9b',
			vaultName: 'Re7 USDC',
			baseToken: 'USDC',
			baseTokenAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
			baseTokenDecimals: 6,
		},
	},
	// Sepolia Testnet (Chain ID: 11155111)
	// NOTE: User must deploy their own Morpho vault on Sepolia and update vaultAddress
	11155111: {
		USDC: {
			version: 'v2',
			chainId: 11155111,
			vaultAddress: '0x0000000000000000000000000000000000000000', // TODO: Replace with deployed Sepolia vault
			vaultName: 'Test USDC Vault (Sepolia)',
			baseToken: 'USDC',
			baseTokenAddress: '0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8', // Use AAVE Sepolia USDC
			baseTokenDecimals: 6,
		},
	},
}

/**
 * Seconds per year - used for APY calculations
 */
export const SECONDS_PER_YEAR = 31536000

/**
 * Cache TTL for Morpho data (5 minutes)
 */
export const MORPHO_CACHE_TTL = 5 * 60 * 1000

/**
 * Precision for Morpho rates (WAD = 1e18)
 */
export const MORPHO_RATE_PRECISION = 1e18

/**
 * Get MetaMorpho vault configuration for a token on a chain
 */
export function getVaultConfig(
	token: string,
	chainId: number,
): MorphoMarketConfig | undefined {
	const vaults = MORPHO_VAULTS[chainId as keyof typeof MORPHO_VAULTS]
	if (!vaults) {
		return undefined
	}
	return vaults[token as keyof typeof vaults]
}

/**
 * Get vault address for a token on a chain
 */
export function getVaultAddress(
	token: string,
	chainId: number,
): string | undefined {
	const config = getVaultConfig(token, chainId)
	return config?.vaultAddress
}

/**
 * Get base token address for a token on a chain
 */
export function getBaseTokenAddress(
	token: string,
	chainId: number,
): string | undefined {
	const config = getVaultConfig(token, chainId)
	return config?.baseTokenAddress
}

/**
 * Get token info by symbol and chain
 */
export function getTokenInfo(token: string, chainId: number) {
	return getVaultConfig(token, chainId)
}

/**
 * Check if a token is supported on a chain
 */
export function isTokenSupported(token: string, chainId: number): boolean {
	return getVaultConfig(token, chainId) !== undefined
}

/**
 * Get all supported tokens for a chain
 */
export function getSupportedTokens(chainId: number): string[] {
	const vaults = MORPHO_VAULTS[chainId as keyof typeof MORPHO_VAULTS]
	if (!vaults) {
		return []
	}
	return Object.keys(vaults)
}
