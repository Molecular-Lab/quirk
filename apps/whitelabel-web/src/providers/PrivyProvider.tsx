import React from "react"

import { PrivyProvider as BasePrivyProvider, type PrivyClientConfig } from "@privy-io/react-auth"

import { ENV, isDev } from "@/config/env"

// Inner component that has access to router context
function PrivyProviderInner({ children }: { children: React.ReactNode }) {
	const config: PrivyClientConfig = {
		loginMethods: ["email", "wallet"],
		appearance: {
			theme: "light",
			accentColor: "#3b82f6",
			walletChainType: "ethereum-only",
		},
		embeddedWallets: {
			createOnLogin: "all-users",
		},
		// Disable analytics in development to avoid CORS warnings
		...(isDev && {
			_experimental_clientAnalyticsEnabled: false,
		}),
	}

	// Check if PRIVY_APP_ID is configured
	if (!ENV.PRIVY_APP_ID || ENV.PRIVY_APP_ID === "your_privy_app_id_here") {
		console.error("⚠️ PRIVY_APP_ID is not configured. Please set VITE_PRIVY_APP_ID in your .env file")
		console.error("Get your app ID from https://dashboard.privy.io/")

		// Return a placeholder UI when Privy is not configured
		return (
			<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-pink-50">
				<div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md">
					<div className="text-red-500 mb-4">
						<svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
							/>
						</svg>
					</div>
					<h2 className="text-xl font-semibold text-gray-900 mb-2">Privy Configuration Required</h2>
					<p className="text-gray-600 mb-4">Please configure your Privy App ID to enable authentication.</p>
					<div className="bg-gray-100 rounded-lg p-4 text-left">
						<p className="text-sm font-mono text-gray-700">
							1. Create an app at{" "}
							<a
								href="https://dashboard.privy.io/"
								target="_blank"
								rel="noopener noreferrer"
								className="text-blue-500 hover:underline"
							>
								dashboard.privy.io
							</a>
						</p>
						<p className="text-sm font-mono text-gray-700 mt-2">2. Copy your app ID</p>
						<p className="text-sm font-mono text-gray-700 mt-2">
							3. Set <code className="bg-white px-1 py-0.5 rounded">VITE_PRIVY_APP_ID=your_id</code> in .env
						</p>
					</div>
				</div>
			</div>
		)
	}

	return (
		<BasePrivyProvider appId={ENV.PRIVY_APP_ID} config={config}>
			{children}
		</BasePrivyProvider>
	)
}

export default function PrivyProvider({ children }: { children: React.ReactNode }) {
	return <PrivyProviderInner>{children}</PrivyProviderInner>
}
