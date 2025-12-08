import { Navigate, Outlet, createFileRoute } from "@tanstack/react-router"

import { useAuthFlow } from "@/hooks/useAuthFlow"

function AuthenticatedLayout() {
	const { ready, authenticated } = useAuthFlow()

	// Show loading state while Privy is initializing
	if (!ready) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-pink-50">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
					<p className="mt-4 text-gray-600">Loading...</p>
				</div>
			</div>
		)
	}

	// Redirect to home if not authenticated
	if (!authenticated) {
		return <Navigate to="/" />
	}

	// Render child routes if authenticated
	return <Outlet />
}

export const Route = createFileRoute("/_authenticated")({
	component: AuthenticatedLayout,
})
