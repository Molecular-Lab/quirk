import { type Chain } from "viem"
import { arbitrum, base, mainnet, optimism, polygon, sepolia } from "viem/chains"
import { NETWORK_CONFIG, getSupportedChainIds } from "./networks"

// Currently supported chain IDs from NETWORK_CONFIG
export type SupportedChainId = 1 | 11155111 | 10 | 42161 | 8453 | 137

const CHAIN_DEFINITIONS: Record<SupportedChainId, Chain> = {
	1: mainnet,
	11155111: sepolia,
	10: optimism,
	42161: arbitrum,
	8453: base,
	137: polygon,
}

/**
 * Check if chainId is configured in NETWORK_CONFIG
 * @param chainId - Chain ID to check
 * @returns true if chain is in NETWORK_CONFIG
 */
export function isNetworkConfigured(chainId: number): boolean {
	return getSupportedChainIds().includes(chainId)
}

export interface ChainAddresses {
	safeAddress?: string
	proxifyAddress?: string
	proxifyControllerAddress?: string
	proxifyClientRegistryAddress?: string
}

export interface ChainConfig extends ChainAddresses {
	chain: Chain
	rpcUrl: string
}

export interface ChainConfigInput extends ChainAddresses {
	rpcUrl: string
}

export interface ChainConfigParams {
	chains: Partial<Record<SupportedChainId, ChainConfigInput | undefined>>
	defaultChainId?: SupportedChainId | string | number
}

export const createChainConstants = (params: ChainConfigParams) => {
	const configuredChains: Partial<Record<SupportedChainId, ChainConfig>> = {}

	for (const [key, value] of Object.entries(params.chains ?? {})) {
		const numericId = Number(key) as SupportedChainId

		// Get RPC URL from param or fallback to NETWORK_CONFIG
		const networkConfig = Object.values(NETWORK_CONFIG).find(n => n.chainId === numericId)
		const rpcUrl = value?.rpcUrl || networkConfig?.rpcUrl || ''

		if (!rpcUrl) {
			console.warn(`Skipping chain ${numericId}: No RPC URL configured`)
			continue
		}

		const chainDefinition = CHAIN_DEFINITIONS[numericId]
		if (!chainDefinition) {
			console.warn(`Skipping chain ${numericId}: No viem chain definition`)
			continue
		}

		configuredChains[numericId] = {
			chain: chainDefinition,
			rpcUrl,
			safeAddress: value?.safeAddress,
			proxifyAddress: value?.proxifyAddress,
			proxifyControllerAddress: value?.proxifyControllerAddress,
			proxifyClientRegistryAddress: value?.proxifyClientRegistryAddress,
		}
	}

	if (Object.keys(configuredChains).length === 0) {
		throw new Error("At least one chain configuration is required")
	}

	const getChainConfig = (chainId: SupportedChainId): ChainConfig => {
		const config = configuredChains[chainId]
		if (!config) {
			throw new Error(`Unsupported chain ID: ${chainId}`)
		}

		return config
	}

	const getDefaultChainId = (): SupportedChainId => {
		if (params.defaultChainId !== undefined) {
			const parsed = Number(params.defaultChainId) as SupportedChainId
			if (configuredChains[parsed]) {
				return parsed
			}
			throw new Error(`Invalid default chain ID: ${params.defaultChainId}`)
		}

		if (configuredChains[11155111]) {
			return 11155111
		}

		const [firstConfigured] = Object.keys(configuredChains)
		return Number(firstConfigured) as SupportedChainId
	}

	return {
		chains: configuredChains,
		getChainConfig,
		getDefaultChainId,
	}
}

export type ChainConstants = ReturnType<typeof createChainConstants>
