import React from "react"
import { PrivyProvider as BasePrivyProvider, type PrivyClientConfig } from "@privy-io/react-auth"
import { ENV } from "@/config/env"

export default function PrivyProvider({ children }: { children: React.ReactNode }) {
	const config: PrivyClientConfig = {
		loginMethods: ["google", "email", "wallet"],
		appearance: {
			theme: "dark",
			walletChainType: "ethereum-only",
		},
	}

	return (
		<BasePrivyProvider appId={ENV.PRIVY_APP_ID} config={config}>
			{children}
		</BasePrivyProvider>
	)
}
