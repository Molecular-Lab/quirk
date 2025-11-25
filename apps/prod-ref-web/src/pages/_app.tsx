import { useEffect } from "react"
import { ErrorBoundary } from "react-error-boundary"
import { Outlet } from "react-router-dom"

import mixpanel from "mixpanel-browser"

import { Fallback } from "@/components/Error/Fallback"
import { getMixpanelEventKey } from "@/feature/analytics/mixpanel"
import { useAccount } from "@/hooks/useAccount"
import { GlobalModal } from "@/providers/GlobalModal"

export default function App() {
	const { address, mainAddress, subAddress } = useAccount()

	useEffect(() => {
		if (address) {
			mixpanel.identify(address.toLowerCase())
			mixpanel.people.set({
				mainAddress: mainAddress?.toLowerCase(),
				subAddress: subAddress?.toLowerCase(),
			})
			mixpanel.track(getMixpanelEventKey("connect"))
		}
	}, [address, mainAddress, subAddress])

	return (
		<ErrorBoundary FallbackComponent={Fallback}>
			<main className="relative flex min-h-screen flex-col overflow-hidden scroll-smooth text-gray-950 dark:text-rabbit-white">
				<div className="absolute left-0 top-0 -z-20 size-full bg-background dark:bg-background-dark" />
				<Outlet />
				<div id="portal-root" />
			</main>
			<GlobalModal />
		</ErrorBoundary>
	)
}
