import { QueryClientProvider } from "@tanstack/react-query"
import { Outlet, createRootRoute } from "@tanstack/react-router"

import { AuthRedirectHandler } from "@/components/AuthRedirectHandler"
import { queryClient } from "@/lib/query-client"
import PrivyProvider from "@/providers/PrivyProvider"

export const Route = createRootRoute({
	component: RootComponent,
})

function RootComponent() {
	return (
		<QueryClientProvider client={queryClient}>
			<PrivyProvider>
				<AuthRedirectHandler />
				<Outlet />
			</PrivyProvider>
		</QueryClientProvider>
	)
}
