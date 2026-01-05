import type { CometMarketConfig } from './compound.types'

/**
 * Compound V3 (Comet) market configurations by chain and token
 * Each Comet deployment represents a single base asset market
 */
export const COMPOUND_MARKETS: Record<number, Record<string, CometMarketConfig>> = {
	// Ethereum Mainnet (Chain ID: 1)
	1: {
		USDC: {
			chainId: 1,
			cometAddress: '0xc3d688B66703497DAA19211EEdff47f25384cdc3', // cUSDCv3 address
			baseToken: 'USDC',
			baseTokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
			baseTokenDecimals: 6,
		},
		USDT: {
			chainId: 1,
			cometAddress: '0x3Afdc9BCA9213A35503b077a6072F3D0d5AB0840', // cUSDTv3 address
			baseToken: 'USDT',
			baseTokenAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
			baseTokenDecimals: 6,
		},
	},
	// Polygon (Chain ID: 137)
	137: {
		USDC: {
			chainId: 137,
			cometAddress: '0xF25212E676D1F7F89Cd72fFEe66158f541246445', // cUSDCv3 address
			baseToken: 'USDC',
			baseTokenAddress: '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359', // Native USDC
			baseTokenDecimals: 6,
		},
		USDT: {
			chainId: 137,
			cometAddress: '0xaeB318360f27748Acb200CE616E389A6C9409a07', // cUSDTv3 address
			baseToken: 'USDT',
			baseTokenAddress: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
			baseTokenDecimals: 6,
		},
	},
	// Base (Chain ID: 8453)
	8453: {
		USDC: {
			chainId: 8453,
			cometAddress: '0xb125E6687d4313864e53df431d5425969c15Eb2F', // cUSDCv3 address
			baseToken: 'USDC',
			baseTokenAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // Native USDC
			baseTokenDecimals: 6,
		},
		USDbC: {
			chainId: 8453,
			cometAddress: '0x9c4ec768c28520B50860ea7a15bd7213a9fF58bf', // cUSDbCv3 address
			baseToken: 'USDbC',
			baseTokenAddress: '0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA', // Bridged USDC
			baseTokenDecimals: 6,
		},
	},
	// Arbitrum One (Chain ID: 42161)
	42161: {
		USDC: {
			chainId: 42161,
			cometAddress: '0x9c4ec768c28520B50860ea7a15bd7213a9fF58bf', // cUSDCv3 address
			baseToken: 'USDC',
			baseTokenAddress: '0xaf88d065e77c8cc2239327c5edb3a432268e5831', // Native USDC
			baseTokenDecimals: 6,
		},
		'USDC.e': {
			chainId: 42161,
			cometAddress: '0xA5EDBDD9646f8dFF606d7448e414884C7d905dCA', // cUSDC.ev3 address
			baseToken: 'USDC.e',
			baseTokenAddress: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8', // Bridged USDC
			baseTokenDecimals: 6,
		},
		USDT: {
			chainId: 42161,
			cometAddress: '0xd98Be00b5D27fc98112BdE293e487f8D4cA57d07', // cUSDTv3 address
			baseToken: 'USDT',
			baseTokenAddress: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
			baseTokenDecimals: 6,
		},
	},
	// Sepolia Testnet (Chain ID: 11155111)
	11155111: {
		USDC: {
			chainId: 11155111,
			cometAddress: '0xAec1F48e02Cfb822Be958B68C7957156EB3F0b6e', // cUSDCv3 Sepolia
			baseToken: 'USDC',
			baseTokenAddress: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', // Sepolia test USDC
			baseTokenDecimals: 6,
		},
	},
} as const

/**
 * Seconds per year - used for APY calculations
 */
export const SECONDS_PER_YEAR = 31536000

/**
 * Cache TTL for Compound data (5 minutes)
 */
export const COMPOUND_CACHE_TTL = 5 * 60 * 1000

/**
 * Precision for Compound V3 rates (1e18)
 * Note: This is different from AAVE's Ray (1e27)
 */
export const COMPOUND_RATE_PRECISION = 1e18

/**
 * Get Comet market configuration for a token on a chain
 */
export function getMarketConfig(
	token: string,
	chainId: number,
): CometMarketConfig | undefined {
	const markets = COMPOUND_MARKETS[chainId as keyof typeof COMPOUND_MARKETS]
	if (!markets) {
		return undefined
	}
	return markets[token as keyof typeof markets]
}

/**
 * Get Comet address for a token on a chain
 */
export function getCometAddress(
	token: string,
	chainId: number,
): string | undefined {
	const config = getMarketConfig(token, chainId)
	return config?.cometAddress
}

/**
 * Get base token address for a token on a chain
 */
export function getBaseTokenAddress(
	token: string,
	chainId: number,
): string | undefined {
	const config = getMarketConfig(token, chainId)
	return config?.baseTokenAddress
}

/**
 * Get token info by symbol and chain
 */
export function getTokenInfo(token: string, chainId: number) {
	return getMarketConfig(token, chainId)
}

/**
 * Check if a token is supported on a chain
 */
export function isTokenSupported(token: string, chainId: number): boolean {
	return getMarketConfig(token, chainId) !== undefined
}

/**
 * Get all supported tokens for a chain
 */
export function getSupportedTokens(chainId: number): string[] {
	const markets = COMPOUND_MARKETS[chainId as keyof typeof COMPOUND_MARKETS]
	if (!markets) {
		return []
	}
	return Object.keys(markets)
}
