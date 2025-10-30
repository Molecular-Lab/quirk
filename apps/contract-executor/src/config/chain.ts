import {
	createChainConstants,
	type ChainConfigInput,
	type ChainConstants,
	type SupportedChainId,
} from "@proxify/core/constants/chain"
import { ENV } from "./env"

type ChainId = SupportedChainId

const chainInputs: Partial<Record<ChainId, ChainConfigInput>> = {}

const parseOptionalChainId = (value?: string | number | null): ChainId | undefined => {
	if (value === undefined || value === null || value === "") {
		return undefined
	}

	const parsed = Number(value)
	return Number.isNaN(parsed) ? undefined : (parsed as ChainId)
}

const registerChain = (chainId: ChainId, config?: ChainConfigInput) => {
	if (!config?.rpcUrl) {
		return
	}

	chainInputs[chainId] = config
}

if (ENV.RPC_URL_SEPOLIA) {
	registerChain(11155111, {
		rpcUrl: ENV.RPC_URL_SEPOLIA,
		safeAddress: ENV.SAFE_ADDRESS_SEPOLIA,
		proxifyAddress: ENV.PROXIFY_ADDRESS_SEPOLIA,
		proxifyControllerAddress: ENV.PROXIFY_CONTROLLER_ADDRESS_SEPOLIA,
		proxifyClientRegistryAddress: ENV.PROXIFY_CLIENT_REGISTRY_ADDRESS_SEPOLIA,
	})
}

if (ENV.RPC_URL_MAINNET) {
	registerChain(1, {
		rpcUrl: ENV.RPC_URL_MAINNET,
		safeAddress: ENV.SAFE_ADDRESS_MAINNET,
		proxifyAddress: ENV.PROXIFY_ADDRESS_MAINNET,
		proxifyControllerAddress: ENV.PROXIFY_CONTROLLER_ADDRESS_MAINNET,
		proxifyClientRegistryAddress: ENV.PROXIFY_CLIENT_REGISTRY_ADDRESS_MAINNET,
	})
}

if (ENV.RPC_URL_OPTIMISM) {
	registerChain(10, {
		rpcUrl: ENV.RPC_URL_OPTIMISM,
		safeAddress: ENV.SAFE_ADDRESS_OPTIMISM,
		proxifyAddress: ENV.PROXIFY_ADDRESS_OPTIMISM,
		proxifyControllerAddress: ENV.PROXIFY_CONTROLLER_ADDRESS_OPTIMISM,
		proxifyClientRegistryAddress: ENV.PROXIFY_CLIENT_REGISTRY_ADDRESS_OPTIMISM,
	})
}

if (ENV.RPC_URL_ARBITRUM) {
	registerChain(42161, {
		rpcUrl: ENV.RPC_URL_ARBITRUM,
		safeAddress: ENV.SAFE_ADDRESS_ARBITRUM,
		proxifyAddress: ENV.PROXIFY_ADDRESS_ARBITRUM,
		proxifyControllerAddress: ENV.PROXIFY_CONTROLLER_ADDRESS_ARBITRUM,
		proxifyClientRegistryAddress: ENV.PROXIFY_CLIENT_REGISTRY_ADDRESS_ARBITRUM,
	})
}

if (ENV.RPC_URL_BASE) {
	registerChain(8453, {
		rpcUrl: ENV.RPC_URL_BASE,
		safeAddress: ENV.SAFE_ADDRESS_BASE,
		proxifyAddress: ENV.PROXIFY_ADDRESS_BASE,
		proxifyControllerAddress: ENV.PROXIFY_CONTROLLER_ADDRESS_BASE,
		proxifyClientRegistryAddress: ENV.PROXIFY_CLIENT_REGISTRY_ADDRESS_BASE,
	})
}

if (ENV.RPC_URL_POLYGON) {
	registerChain(137, {
		rpcUrl: ENV.RPC_URL_POLYGON,
		safeAddress: ENV.SAFE_ADDRESS_POLYGON,
		proxifyAddress: ENV.PROXIFY_ADDRESS_POLYGON,
		proxifyControllerAddress: ENV.PROXIFY_CONTROLLER_ADDRESS_POLYGON,
		proxifyClientRegistryAddress: ENV.PROXIFY_CLIENT_REGISTRY_ADDRESS_POLYGON,
	})
}

export const CHAIN_CONSTANTS: ChainConstants = createChainConstants({
	chains: chainInputs,
	defaultChainId: parseOptionalChainId(ENV.DEFAULT_CHAIN_ID),
})

export const getChainConfig = (chainId: ChainId) => CHAIN_CONSTANTS.getChainConfig(chainId)
export const getDefaultChainId = () => CHAIN_CONSTANTS.getDefaultChainId()

export type { SupportedChainId } from "@proxify/core/constants/chain"
