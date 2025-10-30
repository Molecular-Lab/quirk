import { type Chain } from "viem"
import { arbitrum, base, mainnet, optimism, polygon, sepolia } from "viem/chains"

export type SupportedChainId = 1 | 11155111 | 10 | 42161 | 8453 | 137

const CHAIN_DEFINITIONS: Record<SupportedChainId, Chain> = {
	1: mainnet,
	11155111: sepolia,
	10: optimism,
	42161: arbitrum,
	8453: base,
	137: polygon,
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
		if (!value || !value.rpcUrl) {
			continue
		}

		const chainDefinition = CHAIN_DEFINITIONS[numericId]
		if (!chainDefinition) {
			continue
		}

		configuredChains[numericId] = {
			chain: chainDefinition,
			rpcUrl: value.rpcUrl,
			safeAddress: value.safeAddress,
			proxifyAddress: value.proxifyAddress,
			proxifyControllerAddress: value.proxifyControllerAddress,
			proxifyClientRegistryAddress: value.proxifyClientRegistryAddress,
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
