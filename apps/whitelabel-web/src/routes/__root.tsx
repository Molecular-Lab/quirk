import { createRootRoute, Outlet } from '@tanstack/react-router'
import { QueryClientProvider } from '@tanstack/react-query'
import PrivyProvider from '@/providers/PrivyProvider'
import { queryClient } from '@/lib/query-client'

export const Route = createRootRoute({
	component: RootComponent,
})

function RootComponent() {
	return (
		<QueryClientProvider client={queryClient}>
			<PrivyProvider>
				<Outlet />
			</PrivyProvider>
		</QueryClientProvider>
	)
}
