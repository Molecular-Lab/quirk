import { create } from "zustand"
import { persist } from "zustand/middleware"
import { NETWORK_CONFIG, type NetworkKey } from "@proxify/core/constants"

export type Environment = "dev" | "prod"

export interface EnvironmentConfig {
	chainId: number
	name: string
	rpcUrl: string
	explorerUrl: string
	enabled: boolean
	networkKey: NetworkKey // 'eth_mainnet' | 'eth_sepolia'
	isTestnet: boolean
}

/**
 * Environment configuration using centralized NETWORK_CONFIG
 * Maps UI environment (dev/prod) to network configuration
 */
export const ENV_CONFIG: Record<Environment, EnvironmentConfig> = {
	dev: {
		chainId: NETWORK_CONFIG.eth_sepolia.chainId,
		name: NETWORK_CONFIG.eth_sepolia.name,
		rpcUrl: NETWORK_CONFIG.eth_sepolia.rpcUrl || import.meta.env.VITE_SEPOLIA_RPC_URL || "https://eth-sepolia.g.alchemy.com/v2/demo",
		explorerUrl: NETWORK_CONFIG.eth_sepolia.explorerUrl,
		enabled: true,
		networkKey: "eth_sepolia",
		isTestnet: NETWORK_CONFIG.eth_sepolia.isTestnet,
	},
	prod: {
		chainId: NETWORK_CONFIG.eth_mainnet.chainId,
		name: NETWORK_CONFIG.eth_mainnet.name,
		rpcUrl: NETWORK_CONFIG.eth_mainnet.rpcUrl || import.meta.env.VITE_MAINNET_RPC_URL || "https://eth.llamarpc.com",
		explorerUrl: NETWORK_CONFIG.eth_mainnet.explorerUrl,
		enabled: false, // Disabled for now (MVP focuses on testnet)
		networkKey: "eth_mainnet",
		isTestnet: NETWORK_CONFIG.eth_mainnet.isTestnet,
	},
}

interface EnvironmentState {
	environment: Environment
	setEnvironment: (env: Environment) => void
	getConfig: () => EnvironmentConfig
	getNetworkKey: () => NetworkKey // Get current network key ('eth_mainnet' | 'eth_sepolia')
	getChainId: () => number // Get current chain ID
	isTestnet: () => boolean
	isEnabled: (env: Environment) => boolean
}

const initialState: Pick<EnvironmentState, "environment"> = {
	environment: "dev", // Default to dev/testnet
}

export const useEnvironmentStore = create<EnvironmentState>()(
	persist(
		(set, get) => ({
			...initialState,

			setEnvironment: (env: Environment) => {
				// Don't allow switching to disabled environments
				if (!ENV_CONFIG[env].enabled) {
					console.warn(`[environmentStore] Cannot switch to disabled environment: ${env}`)
					return
				}

				console.log("[environmentStore] Switching environment:", {
					from: get().environment,
					to: env,
					chainId: ENV_CONFIG[env].chainId,
					network: ENV_CONFIG[env].name,
				})

				set({ environment: env })
			},

			getConfig: () => {
				return ENV_CONFIG[get().environment]
			},

			getNetworkKey: () => {
				return ENV_CONFIG[get().environment].networkKey
			},

			getChainId: () => {
				return ENV_CONFIG[get().environment].chainId
			},

			isTestnet: () => {
				return ENV_CONFIG[get().environment].isTestnet
			},

			isEnabled: (env: Environment) => {
				return ENV_CONFIG[env].enabled
			},
		}),
		{
			name: "proxify-environment", // localStorage key
		},
	),
)
