import {
	AaveV3Ethereum,
	AaveV3Polygon,
	AaveV3Base,
	AaveV3Arbitrum,
} from '@bgd-labs/aave-address-book'

/**
 * AAVE V3 Pool addresses by chain ID
 */
export const AAVE_POOL_ADDRESSES: Record<number, string> = {
	1: AaveV3Ethereum.POOL, // Ethereum
	137: AaveV3Polygon.POOL, // Polygon
	8453: AaveV3Base.POOL, // Base
	42161: AaveV3Arbitrum.POOL, // Arbitrum
}

/**
 * AAVE V3 Protocol Data Provider addresses by chain ID
 */
export const AAVE_DATA_PROVIDER_ADDRESSES: Record<number, string> = {
	1: AaveV3Ethereum.AAVE_PROTOCOL_DATA_PROVIDER, // Ethereum
	137: AaveV3Polygon.AAVE_PROTOCOL_DATA_PROVIDER, // Polygon
	8453: AaveV3Base.AAVE_PROTOCOL_DATA_PROVIDER, // Base
	42161: AaveV3Arbitrum.AAVE_PROTOCOL_DATA_PROVIDER, // Arbitrum
}

/**
 * Supported tokens on each chain
 */
export const AAVE_SUPPORTED_TOKENS = {
	// Ethereum Mainnet (Chain ID: 1)
	1: {
		USDC: {
			symbol: 'USDC',
			address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
			decimals: 6,
			name: 'USD Coin',
		},
		USDT: {
			symbol: 'USDT',
			address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
			decimals: 6,
			name: 'Tether USD',
		},
	},
	// Polygon (Chain ID: 137)
	137: {
		USDC: {
			symbol: 'USDC',
			address: '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359', // Native USDC
			decimals: 6,
			name: 'USD Coin (Native)',
		},
		'USDC.e': {
			symbol: 'USDC.e',
			address: '0x2791Bca1f2de4661ed88a30c99a7a9449aa84174', // Bridged USDC
			decimals: 6,
			name: 'USD Coin (Bridged)',
		},
		USDT: {
			symbol: 'USDT',
			address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
			decimals: 6,
			name: 'Tether USD',
		},
	},
	// Base (Chain ID: 8453)
	8453: {
		USDC: {
			symbol: 'USDC',
			address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // Native USDC
			decimals: 6,
			name: 'USD Coin (Native)',
		},
		USDbC: {
			symbol: 'USDbC',
			address: '0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA', // Bridged USDC
			decimals: 6,
			name: 'USD Base Coin',
		},
	},
	// Arbitrum One (Chain ID: 42161)
	42161: {
		USDC: {
			symbol: 'USDC',
			address: '0xaf88d065e77c8cc2239327c5edb3a432268e5831', // Native USDC
			decimals: 6,
			name: 'USD Coin (Native)',
		},
		USDT: {
			symbol: 'USDT',
			address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
			decimals: 6,
			name: 'Tether USD',
		},
	},
} as const

/**
 * Ray constant (1e27) - used for AAVE rate calculations
 */
export const RAY = 1e27

/**
 * Seconds per year - used for APY calculations
 */
export const SECONDS_PER_YEAR = 31536000

/**
 * Cache TTL for AAVE data (5 minutes)
 */
export const AAVE_CACHE_TTL = 5 * 60 * 1000

/**
 * Get Pool address for a chain
 */
export function getPoolAddress(chainId: number): string {
	const address = AAVE_POOL_ADDRESSES[chainId]
	if (!address) {
		throw new Error(`AAVE Pool not supported on chain ${chainId}`)
	}
	return address
}

/**
 * Get Data Provider address for a chain
 */
export function getDataProviderAddress(chainId: number): string {
	const address = AAVE_DATA_PROVIDER_ADDRESSES[chainId]
	if (!address) {
		throw new Error(`AAVE Data Provider not supported on chain ${chainId}`)
	}
	return address
}

/**
 * Get token address by symbol and chain
 */
export function getTokenAddress(
	symbol: string,
	chainId: number,
): string | undefined {
	const tokens = AAVE_SUPPORTED_TOKENS[chainId as keyof typeof AAVE_SUPPORTED_TOKENS]
	if (!tokens) {
		return undefined
	}
	const token = tokens[symbol as keyof typeof tokens]
	return token?.address
}

/**
 * Get token info by symbol and chain
 */
export function getTokenInfo(symbol: string, chainId: number) {
	const tokens = AAVE_SUPPORTED_TOKENS[chainId as keyof typeof AAVE_SUPPORTED_TOKENS]
	if (!tokens) {
		return undefined
	}
	return tokens[symbol as keyof typeof tokens]
}

/**
 * Check if a token is supported on a chain
 */
export function isTokenSupported(symbol: string, chainId: number): boolean {
	return getTokenAddress(symbol, chainId) !== undefined
}

/**
 * Get all supported tokens for a chain
 */
export function getSupportedTokens(chainId: number): string[] {
	const tokens = AAVE_SUPPORTED_TOKENS[chainId as keyof typeof AAVE_SUPPORTED_TOKENS]
	if (!tokens) {
		return []
	}
	return Object.keys(tokens)
}
