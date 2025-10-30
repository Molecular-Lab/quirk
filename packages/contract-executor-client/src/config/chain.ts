import { type Chain } from "viem"
import { arbitrum, base, mainnet, optimism, polygon, sepolia } from "viem/chains"

export type SupportedChainId = 1 | 11155111 | 10 | 42161 | 8453 | 137

export interface ChainConfig {
	chain: Chain
	rpcUrl: string
	safeAddress?: string
	proxifyAddress?: string
	proxifyControllerAddress?: string
	proxifyClientRegistryAddress?: string
}

/**
 * Multi-chain configuration
 * Supports: Ethereum, Sepolia, Optimism, Arbitrum, Base, Polygon
 */
export const chains: Record<SupportedChainId, ChainConfig> = {
	// Ethereum Mainnet
	1: {
		chain: mainnet,
		rpcUrl: process.env.RPC_URL_MAINNET || "",
		safeAddress: process.env.SAFE_ADDRESS_MAINNET,
		proxifyAddress: process.env.PROXIFY_ADDRESS_MAINNET,
		proxifyControllerAddress: process.env.PROXIFY_CONTROLLER_ADDRESS_MAINNET,
		proxifyClientRegistryAddress: process.env.PROXIFY_CLIENT_REGISTRY_ADDRESS_MAINNET,
	},

	// Sepolia Testnet
	11155111: {
		chain: sepolia,
		rpcUrl: process.env.RPC_URL_SEPOLIA || "",
		safeAddress: process.env.SAFE_ADDRESS_SEPOLIA,
		proxifyAddress: process.env.PROXIFY_ADDRESS_SEPOLIA,
		proxifyControllerAddress: process.env.PROXIFY_CONTROLLER_ADDRESS_SEPOLIA,
		proxifyClientRegistryAddress: process.env.PROXIFY_CLIENT_REGISTRY_ADDRESS_SEPOLIA,
	},

	// Optimism
	10: {
		chain: optimism,
		rpcUrl: process.env.RPC_URL_OPTIMISM || "",
		safeAddress: process.env.SAFE_ADDRESS_OPTIMISM,
		proxifyAddress: process.env.PROXIFY_ADDRESS_OPTIMISM,
		proxifyControllerAddress: process.env.PROXIFY_CONTROLLER_ADDRESS_OPTIMISM,
		proxifyClientRegistryAddress: process.env.PROXIFY_CLIENT_REGISTRY_ADDRESS_OPTIMISM,
	},

	// Arbitrum
	42161: {
		chain: arbitrum,
		rpcUrl: process.env.RPC_URL_ARBITRUM || "",
		safeAddress: process.env.SAFE_ADDRESS_ARBITRUM,
		proxifyAddress: process.env.PROXIFY_ADDRESS_ARBITRUM,
		proxifyControllerAddress: process.env.PROXIFY_CONTROLLER_ADDRESS_ARBITRUM,
		proxifyClientRegistryAddress: process.env.PROXIFY_CLIENT_REGISTRY_ADDRESS_ARBITRUM,
	},

	// Base
	8453: {
		chain: base,
		rpcUrl: process.env.RPC_URL_BASE || "",
		safeAddress: process.env.SAFE_ADDRESS_BASE,
		proxifyAddress: process.env.PROXIFY_ADDRESS_BASE,
		proxifyControllerAddress: process.env.PROXIFY_CONTROLLER_ADDRESS_BASE,
		proxifyClientRegistryAddress: process.env.PROXIFY_CLIENT_REGISTRY_ADDRESS_BASE,
	},

	// Polygon
	137: {
		chain: polygon,
		rpcUrl: process.env.RPC_URL_POLYGON || "",
		safeAddress: process.env.SAFE_ADDRESS_POLYGON,
		proxifyAddress: process.env.PROXIFY_ADDRESS_POLYGON,
		proxifyControllerAddress: process.env.PROXIFY_CONTROLLER_ADDRESS_POLYGON,
		proxifyClientRegistryAddress: process.env.PROXIFY_CLIENT_REGISTRY_ADDRESS_POLYGON,
	},
}

export const getChainConfig = (chainId: SupportedChainId): ChainConfig => {
	const config = chains[chainId]
	if (!config) {
		throw new Error(`Unsupported chain ID: ${chainId}`)
	}
	if (!config.rpcUrl) {
		throw new Error(`RPC URL not configured for chain ID: ${chainId}`)
	}
	return config
}

export const getDefaultChainId = (): SupportedChainId => {
	const chainId = parseInt(process.env.DEFAULT_CHAIN_ID || "11155111")
	if (!chains[chainId as SupportedChainId]) {
		throw new Error(`Invalid default chain ID: ${chainId}`)
	}
	return chainId as SupportedChainId
}
