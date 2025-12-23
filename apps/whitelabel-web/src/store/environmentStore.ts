import { create } from "zustand"
import { persist } from "zustand/middleware"
import { NETWORK_CONFIG, type NetworkKey } from "@quirk/core/constants"

// Environment types
export type Environment = "dev" | "prod"
export type ApiEnvironment = "sandbox" | "production"

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
		enabled: true, // Enabled for production testing
		networkKey: "eth_mainnet",
		isTestnet: NETWORK_CONFIG.eth_mainnet.isTestnet,
	},
}

interface EnvironmentState {
	// Blockchain environment (dev = testnet, prod = mainnet)
	environment: Environment
	setEnvironment: (env: Environment) => void
	getConfig: () => EnvironmentConfig
	getNetworkKey: () => NetworkKey // Get current network key ('eth_mainnet' | 'eth_sepolia')
	getChainId: () => number // Get current chain ID
	isTestnet: () => boolean
	isEnabled: (env: Environment) => boolean

	// API environment (sandbox vs production for API keys)
	apiEnvironment: ApiEnvironment
	setApiEnvironment: (env: ApiEnvironment) => void
	toggleApiEnvironment: () => void
	isSandbox: () => boolean
	isProduction: () => boolean
	getApiKeyPrefix: () => "pk_test" | "pk_live"

	// Reset method
	reset: () => void
}

const initialState: Pick<EnvironmentState, "environment" | "apiEnvironment"> = {
	environment: "dev", // Default to dev/testnet for blockchain
	apiEnvironment: "sandbox", // Default to sandbox for API keys
}

export const useEnvironmentStore = create<EnvironmentState>()(
	persist(
		(set, get) => ({
			...initialState,

			// Blockchain environment methods
			setEnvironment: (env: Environment) => {
				// Don't allow switching to disabled environments
				if (!ENV_CONFIG[env].enabled) {
					console.warn(`[environmentStore] Cannot switch to disabled environment: ${env}`)
					return
				}

				// Sync apiEnvironment with blockchain environment
				const newApiEnv: ApiEnvironment = env === "prod" ? "production" : "sandbox"

				console.log("[environmentStore] Switching environment:", {
					from: get().environment,
					to: env,
					chainId: ENV_CONFIG[env].chainId,
					network: ENV_CONFIG[env].name,
					apiEnvironment: newApiEnv,
				})

				set({ environment: env, apiEnvironment: newApiEnv })
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

			// API environment methods (sandbox vs production for API keys)
			setApiEnvironment: (env: ApiEnvironment) => {
				console.log("[environmentStore] Switching API environment:", {
					from: get().apiEnvironment,
					to: env,
				})
				set({ apiEnvironment: env })
			},

			toggleApiEnvironment: () => {
				const current = get().apiEnvironment
				const next: ApiEnvironment = current === "sandbox" ? "production" : "sandbox"
				console.log("[environmentStore] Toggling API environment:", {
					from: current,
					to: next,
				})
				set({ apiEnvironment: next })
			},

			isSandbox: () => {
				return get().apiEnvironment === "sandbox"
			},

			isProduction: () => {
				return get().apiEnvironment === "production"
			},

			getApiKeyPrefix: () => {
				return get().apiEnvironment === "sandbox" ? "pk_test" : "pk_live"
			},

			// Reset to initial state
			reset: () => {
				set(initialState)
			},
		}),
		{
			name: "quirk-environment", // localStorage key
			partialize: (state) => ({
				environment: state.environment,
				apiEnvironment: state.apiEnvironment,
			}),
			// Sync environments on hydration to fix any desync'd localStorage values
			onRehydrateStorage: () => (state) => {
				if (state) {
					const expectedApiEnv: ApiEnvironment = state.environment === "prod" ? "production" : "sandbox"
					if (state.apiEnvironment !== expectedApiEnv) {
						console.log("[environmentStore] Fixing desync'd apiEnvironment on hydration:", {
							environment: state.environment,
							was: state.apiEnvironment,
							correctedTo: expectedApiEnv,
						})
						// Use setTimeout to avoid hydration race condition
						setTimeout(() => {
							useEnvironmentStore.setState({ apiEnvironment: expectedApiEnv })
						}, 0)
					}
				}
			},
		},
	),
)
