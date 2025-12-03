import { Outlet } from "@tanstack/react-router"

export function AuthLayout() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
			<div className="w-full max-w-md">
				<div className="text-center mb-8">
					<h1 className="text-4xl font-bold text-blue-600 mb-2">Proxify</h1>
					<p className="text-gray-600">Embedded Wallet Infrastructure for Web2 Apps</p>
				</div>
				<div className="bg-white rounded-2xl shadow-xl p-8">
					<Outlet />
				</div>
				<div className="text-center mt-6 text-sm text-gray-500">
					<p>Powered by Account Abstraction • Non-custodial • Enterprise-grade Security</p>
				</div>
			</div>
		</div>
	)
}
