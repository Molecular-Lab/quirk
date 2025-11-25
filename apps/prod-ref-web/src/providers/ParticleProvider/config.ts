import { useMemo } from "react"

import { createConfig } from "@particle-network/connectkit"
import { defaultConnectorFns, evmWalletConnectors, injected } from "@particle-network/connectkit/evm"
import { useSafeAppsSDK } from "@safe-global/safe-apps-react-sdk"
import { EIP1193Provider } from "viem"

import { useTheme } from "@rabbitswap/ui/providers"

import { SUPPORTED_CHAINS } from "@/constants/chain"

import { SafeAppProvider } from "./safe-apps-provider"

const projectId = import.meta.env.VITE_PARTICLE_PROJECT_ID
const clientKey = import.meta.env.VITE_PARTICLE_CLIENT_KEY
const appId = import.meta.env.VITE_PARTICLE_APP_ID
const chains = SUPPORTED_CHAINS

export const useParticleConfig = () => {
	const { sdk, safe } = useSafeAppsSDK()
	const { theme } = useTheme()

	const safeAppProvider = useMemo<EIP1193Provider>(() => {
		const provider = new SafeAppProvider(safe, sdk)
		return provider as EIP1193Provider
	}, [sdk, safe])

	const particleConfig = useMemo(
		() =>
			createConfig({
				projectId: projectId,
				clientKey: clientKey,
				appId: appId,
				chains: chains,

				appearance: {
					recommendedWallets: [{ walletId: "coin98", label: "Recommended" }],
					theme: {
						"--pcm-primary-button-color": "#262626",
						"--pcm-primary-button-bankground": "#C1E2FD",
						"--pcm-primary-button-hover-background": "#AED8FB",
						"--pcm-secondary-button-color": "#262626",
						"--pcm-secondary-button-bankground": "#C1E2FD",
						"--pcm-secondary-button-hover-background": "#AED8FB",
						"--pcm-accent-color": "#3098EB",
						"--pcm-error-color": "#EE4544",
						"--pcm-warning-color": "#FFEE00",
						"--pcm-success-color": "#4BDD80",
						"--pcm-font-family": "Poppins",
					},
					language: "en-US",
					mode: theme,
					logo: "/images/App_Logo.png",
				},

				walletConnectors: [
					evmWalletConnectors({
						metadata: {
							name: "RabbitSwap",
							icon: typeof window !== "undefined" ? `${window.location.origin}/favicon.ico` : "",
							url: typeof window !== "undefined" ? window.location.origin : "",
						},
						walletConnectProjectId: "",
						multiInjectedProviderDiscovery: true,
						connectorFns: [
							injected({ target: "coin98" }),
							...defaultConnectorFns(),
							...(safe.safeAddress !== ""
								? [
										injected({
											target: {
												icon: "https://intercom-help.eu/safe-global/assets/favicon",
												id: "safe", // Wallet Unique ID
												name: "Safe",
												provider: safeAppProvider,
											},
										}),
									]
								: []),
						],
					}),
				],
			}),
		[safe.safeAddress, safeAppProvider, theme],
	)

	return {
		particleConfig,
		projectId,
		clientKey,
		appId,
		chains,
	}
}
