/**
 * Multi-chain configuration for Privy wallet creation
 * Following contract-executor-client pattern
 */

export type SupportedChain =
	| 'ethereum'
	| 'solana'
	| 'polygon'
	| 'base'
	| 'arbitrum'
	| 'optimism'
	| 'bitcoin_segwit'

/**
 * Chain configuration interface
 */
export interface ChainConfig {
	chainType: string // Privy's chain_type value
	name: string // Display name
	enabled: boolean // Whether this chain is enabled
	testnet?: string // Testnet equivalent
	symbol?: string // Native token symbol
}

/**
 * Chain configurations mapped to Privy's chain_type values
 * Reference: https://docs.privy.io/wallets/wallets/create/create-a-wallet
 */
export const chains: Record<SupportedChain, ChainConfig> = {
	ethereum: {
		chainType: 'ethereum',
		name: 'Ethereum',
		enabled: true,
		testnet: 'sepolia',
		symbol: 'ETH',
	},
	solana: {
		chainType: 'solana',
		name: 'Solana',
		enabled: true,
		testnet: 'solana-devnet',
		symbol: 'SOL',
	},
	polygon: {
		chainType: 'polygon',
		name: 'Polygon',
		enabled: true,
		testnet: 'polygon-amoy',
		symbol: 'MATIC',
	},
	base: {
		chainType: 'base',
		name: 'Base',
		enabled: true,
		testnet: 'base-sepolia',
		symbol: 'ETH',
	},
	arbitrum: {
		chainType: 'arbitrum',
		name: 'Arbitrum',
		enabled: true,
		testnet: 'arbitrum-sepolia',
		symbol: 'ETH',
	},
	optimism: {
		chainType: 'optimism',
		name: 'Optimism',
		enabled: true,
		testnet: 'optimism-sepolia',
		symbol: 'ETH',
	},
	bitcoin_segwit: {
		chainType: 'bitcoin_segwit',
		name: 'Bitcoin',
		enabled: false, // Enable when needed
		testnet: 'bitcoin-testnet',
		symbol: 'BTC',
	},
}

/**
 * Get chain configuration by chain identifier
 * @throws Error if chain is not supported or not enabled
 */
export const getChainConfig = (chain: SupportedChain): ChainConfig => {
	const config = chains[chain]
	if (!config) {
		throw new Error(`Unsupported chain: ${chain}`)
	}
	if (!config.enabled) {
		throw new Error(`Chain not enabled: ${chain}. Enable it in chains.ts configuration.`)
	}
	return config
}

/**
 * Get all enabled chains
 */
export const getEnabledChains = (): SupportedChain[] => {
	return (Object.keys(chains) as SupportedChain[]).filter((chain) => chains[chain].enabled)
}

/**
 * Validate if a chain is supported
 */
export const isChainSupported = (chain: string): chain is SupportedChain => {
	return chain in chains && chains[chain as SupportedChain].enabled
}
