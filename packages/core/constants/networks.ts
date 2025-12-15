/**
 * Centralized Network Configuration
 * Single source of truth for all blockchain networks and token addresses
 *
 * @usage
 * ```typescript
 * import { NETWORK_CONFIG } from '@proxify/core/constants'
 *
 * // Access network config
 * const chainId = NETWORK_CONFIG.eth_mainnet.chainId
 * const usdcAddress = NETWORK_CONFIG.eth_mainnet.token.usdc.address
 * const wethSymbol = NETWORK_CONFIG.eth_sepolia.token.weth.symbol
 *
 * // Use helper functions
 * const network = getNetworkByChainId(1)
 * const address = getTokenAddress('eth_sepolia', 'usdc')
 * const isNative = isNativeToken('eth_mainnet', 'eth')
 * ```
 */

// Token type classification
export const TOKEN_TYPE = {
	NATIVE: "native", // ETH (not an ERC20)
	WRAPPED_NATIVE: "wrapped", // WETH (ERC20 wrapper of native)
	STABLECOIN: "stablecoin", // USDC, USDT
	MOCK: "mock", // Mock tokens for testing
} as const

export type TokenType = (typeof TOKEN_TYPE)[keyof typeof TOKEN_TYPE]

// Token configuration interface
interface TokenConfig {
	address: string
	symbol: string
	decimals: number
	type: TokenType
	isNative: boolean // true for ETH, false for all ERC20s
}

// Network configuration interface
interface NetworkConfig {
	chainId: number
	name: string
	shortName: string
	nativeCurrency: {
		name: string
		symbol: string
		decimals: number
	}
	rpcUrl: string
	explorerUrl: string
	isTestnet: boolean
	token: {
		eth: TokenConfig
		weth: TokenConfig
		usdc: TokenConfig
		usdt: TokenConfig
		mock_usdc: TokenConfig | null
	}
}

// Main network configuration
export const NETWORK_CONFIG = {
	eth_mainnet: {
		chainId: 1,
		name: "Ethereum Mainnet",
		shortName: "eth",
		nativeCurrency: {
			name: "Ether",
			symbol: "ETH",
			decimals: 18,
		},
		rpcUrl: process.env.MAINNET_RPC_URL || "",
		explorerUrl: "https://etherscan.io",
		isTestnet: false,
		token: {
			eth: {
				address: "0x0000000000000000000000000000000000000000",
				symbol: "ETH",
				decimals: 18,
				type: TOKEN_TYPE.NATIVE,
				isNative: true,
			},
			weth: {
				address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
				symbol: "WETH",
				decimals: 18,
				type: TOKEN_TYPE.WRAPPED_NATIVE,
				isNative: false,
			},
			usdc: {
				address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
				symbol: "USDC",
				decimals: 6,
				type: TOKEN_TYPE.STABLECOIN,
				isNative: false,
			},
			usdt: {
				address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
				symbol: "USDT",
				decimals: 6,
				type: TOKEN_TYPE.STABLECOIN,
				isNative: false,
			},
			mock_usdc: null, // Not available on mainnet
		},
	},

	eth_sepolia: {
		chainId: 11155111,
		name: "Ethereum Sepolia",
		shortName: "eth",
		nativeCurrency: {
			name: "Sepolia Ether",
			symbol: "ETH",
			decimals: 18,
		},
		rpcUrl: process.env.SEPOLIA_RPC_URL || "",
		explorerUrl: "https://sepolia.etherscan.io",
		isTestnet: true,
		token: {
			eth: {
				address: "0x0000000000000000000000000000000000000000",
				symbol: "ETH",
				decimals: 18,
				type: TOKEN_TYPE.NATIVE,
				isNative: true,
			},
			weth: {
				address: "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9", // Official Sepolia WETH
				symbol: "WETH",
				decimals: 18,
				type: TOKEN_TYPE.WRAPPED_NATIVE,
				isNative: false,
			},
			usdc: {
				address: "0x1d02848c34ed2155613dd5cd26ce20a601b9a489", // Existing Mock USDC
				symbol: "USDC",
				decimals: 6,
				type: TOKEN_TYPE.MOCK,
				isNative: false,
			},
			usdt: {
				address: "0x1d02848c34ed2155613dd5cd26ce20a601b9a489", // Same as Mock USDC for now
				symbol: "USDT",
				decimals: 6,
				type: TOKEN_TYPE.MOCK,
				isNative: false,
			},
			mock_usdc: {
				address: "0x1d02848c34ed2155613dd5cd26ce20a601b9a489",
				symbol: "MOCK_USDC",
				decimals: 6,
				type: TOKEN_TYPE.MOCK,
				isNative: false,
			},
		},
	},
} as const

// Type helpers
export type NetworkKey = keyof typeof NETWORK_CONFIG
export type TokenKey = keyof (typeof NETWORK_CONFIG)[NetworkKey]["token"]

/**
 * Get network configuration by chain ID
 * @param chainId - Blockchain chain ID (e.g., 1 for Ethereum Mainnet)
 * @returns Network configuration or undefined if not found
 */
export function getNetworkByChainId(chainId: number): NetworkConfig | undefined {
	return Object.values(NETWORK_CONFIG).find((n) => n.chainId === chainId)
}

/**
 * Get network key by chain ID
 * @param chainId - Blockchain chain ID
 * @returns Network key (e.g., 'eth_mainnet') or undefined
 */
export function getNetworkKeyByChainId(chainId: number): NetworkKey | undefined {
	const entry = Object.entries(NETWORK_CONFIG).find(([_, config]) => config.chainId === chainId)
	return entry ? (entry[0] as NetworkKey) : undefined
}

/**
 * Get token address for specific network and token
 * @param networkKey - Network identifier (e.g., 'eth_mainnet')
 * @param tokenKey - Token identifier (e.g., 'usdc')
 * @returns Token address or null if not available
 */
export function getTokenAddress(networkKey: NetworkKey, tokenKey: TokenKey): string | null {
	const token = NETWORK_CONFIG[networkKey].token[tokenKey]
	return token ? token.address : null
}

/**
 * Check if token is native (ETH, not ERC20)
 * @param networkKey - Network identifier
 * @param tokenKey - Token identifier
 * @returns True if native token (ETH), false if ERC20 token
 */
export function isNativeToken(networkKey: NetworkKey, tokenKey: TokenKey): boolean {
	const token = NETWORK_CONFIG[networkKey].token[tokenKey]
	return token ? token.isNative : false
}

/**
 * Get active network based on NODE_ENV
 * @returns Network configuration (Sepolia for dev, Mainnet for production)
 */
export function getActiveNetwork(): NetworkConfig {
	const env = process.env.NODE_ENV || "development"
	return env === "production" ? NETWORK_CONFIG.eth_mainnet : NETWORK_CONFIG.eth_sepolia
}

/**
 * Get active network key based on NODE_ENV
 * @returns Network key ('eth_mainnet' for production, 'eth_sepolia' for dev)
 */
export function getActiveNetworkKey(): NetworkKey {
	const env = process.env.NODE_ENV || "development"
	return env === "production" ? "eth_mainnet" : "eth_sepolia"
}

/**
 * Validate that all required RPC URLs are configured
 * @throws Error if any RPC URLs are missing
 */
export function validateNetworkConfig(): void {
	const errors: string[] = []

	Object.entries(NETWORK_CONFIG).forEach(([key, config]) => {
		if (!config.rpcUrl) {
			errors.push(`RPC URL missing for ${key} (set ${key.toUpperCase()}_RPC_URL env var)`)
		}
	})

	if (errors.length > 0) {
		throw new Error(`Network configuration errors:\n${errors.join("\n")}`)
	}
}

/**
 * Get all supported chain IDs
 * @returns Array of chain IDs
 */
export function getSupportedChainIds(): number[] {
	return Object.values(NETWORK_CONFIG).map((config) => config.chainId)
}

/**
 * Check if chain ID is supported
 * @param chainId - Chain ID to check
 * @returns True if supported, false otherwise
 */
export function isSupportedChainId(chainId: number): boolean {
	return getSupportedChainIds().includes(chainId)
}
