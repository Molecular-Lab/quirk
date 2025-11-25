import { PropsWithChildren } from "react"

import { AuthType } from "@particle-network/auth-core"
import { AuthCoreContextProvider } from "@particle-network/authkit"
import { ConnectKitProvider } from "@particle-network/connectkit"

import { useTheme } from "@rabbitswap/ui/providers"

import { useParticleConfig } from "@/providers/ParticleProvider/config"

export const ParticleProvider = ({ children }: PropsWithChildren) => {
	const { particleConfig, projectId, clientKey, appId, chains } = useParticleConfig()
	const { theme } = useTheme()

	return (
		<ConnectKitProvider config={particleConfig}>
			<AuthCoreContextProvider
				options={{
					projectId: projectId,
					clientKey: clientKey,
					appId: appId,
					chains: chains,
					authTypes: [AuthType.jwt],
					themeType: theme,
					wallet: false,
					promptSettingConfig: {
						// silent signing box
						// https://developers.particle.network/api-reference/auth/desktop-sdks/web#enabling-blind-signatures
						promptPaymentPasswordSettingWhenSign: false,
					},
				}}
			>
				{children}
			</AuthCoreContextProvider>
		</ConnectKitProvider>
	)
}
