import { useEffect, useState } from "react"

import { usePrivy } from "@privy-io/react-auth"
import { Link, Outlet, useNavigate } from "@tanstack/react-router"
import { Aperture, ArrowLeftRight, BookText, LayoutDashboard, LogOut, Menu, Sliders, Sparkles, X } from "lucide-react"

const navigation = [
	{ name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
	{ name: "Explore", href: "/dashboard/explore", icon: Aperture },
	{ name: "Market", href: "/dashboard/market", icon: Sparkles },
	{ name: "Products", href: "/dashboard/products", icon: Sliders },
	{ name: "Operations", href: "/dashboard/operations", icon: ArrowLeftRight },
	{ name: "Integration", href: "/dashboard/integration", icon: BookText },
]

export function DashboardLayout() {
	const navigate = useNavigate()
	const [sidebarOpen, setSidebarOpen] = useState(false)
	const { user, logout } = usePrivy()

	const handleLogout = async () => {
		await logout()
		void navigate({ to: "/" })
	}

	const userName = user?.email?.address.split("@")[0] ?? "User"
	const userInitial = userName.charAt(0).toUpperCase()
	useEffect(() => {
		console.log("User changed:", user)
	}, [user])
	return (
		<div className="h-screen flex overflow-hidden bg-gray-50">
			{/* Desktop sidebar - Icon only style like Glider */}
			<div className="hidden lg:flex lg:flex-shrink-0">
				<div className="flex flex-col w-[72px] bg-white border-r border-gray-200">
					{/* Logo */}
					<div className="flex items-center justify-center h-16 border-b border-gray-200">
						<div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center">
							<span className="text-white font-bold text-sm">P</span>
						</div>
					</div>

					{/* Nav Icons */}
					<nav className="flex-1 px-3 py-6 space-y-2">
						{navigation.map((item) => {
							return (
								<Link
									key={item.name}
									to={item.href}
									className="flex items-center justify-center w-12 h-12 rounded-xl transition-all group relative text-gray-500 hover:bg-gray-50 hover:text-gray-900"
									activeProps={{
										className: "bg-gray-100 text-gray-900",
									}}
									title={item.name}
								>
									<item.icon className="w-5 h-5" />
									{/* Tooltip on hover */}
									<span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
										{item.name}
									</span>
								</Link>
							)
						})}
					</nav>

					{/* User Avatar */}
					<div className="p-3 border-t border-gray-200">
						<div className="relative group">
							<div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center cursor-pointer">
								<span className="text-white font-semibold text-sm">{userInitial}</span>
							</div>
							{/* Logout on hover */}
							<div className="absolute bottom-full left-0 mb-2 w-32 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto z-50">
								<button
									onClick={handleLogout}
									className="w-full px-3 py-2 text-sm text-left text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-2"
								>
									<LogOut className="w-4 h-4" />
									Logout
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Main content */}
			<div className="flex flex-col flex-1 overflow-hidden">
				{/* Top Header Bar - Like Glider */}
				<div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
					{/* Mobile menu button */}
					<button
						onClick={() => {
							setSidebarOpen(true)
						}}
						className="lg:hidden text-gray-500 hover:text-gray-700"
					>
						<Menu className="w-6 h-6" />
					</button>

					{/* Search Bar */}
					<div className="flex-1 max-w-xl mx-auto">
						<div className="relative">
							<svg
								className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
								/>
							</svg>
							<input
								type="text"
								placeholder="Search portfolios, strategies, tokens..."
								className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
							/>
							<kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 bg-white border border-gray-200 rounded text-xs text-gray-500">
								/
							</kbd>
						</div>
					</div>

					{/* Right Side - Wallet Info */}
					<div className="flex items-center gap-4">
						<button className="text-gray-500 hover:text-gray-700">
							<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
								/>
							</svg>
						</button>
						<div className="flex items-center gap-2">
							<svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
							</svg>
							<span className="text-sm font-medium text-gray-900">0</span>
							<span className="text-xs text-gray-500">total</span>
						</div>

						{/* Privy Account Button */}
						<div className="relative group">
							<button className="flex items-center gap-2 px-3 py-2 bg-primary-50 hover:bg-primary-100 rounded-lg border border-primary-200 transition-colors">
								<div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
									<span className="text-white font-semibold text-xs">{userInitial}</span>
								</div>
								<span className="text-sm font-medium text-gray-900 hidden sm:inline">{userName}</span>
								<svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
								</svg>
							</button>

							{/* Dropdown Menu */}
							<div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
								<div className="p-3 border-b border-gray-100">
									<p className="text-xs text-gray-500 mb-1">Logged in as</p>
									<p className="text-sm font-medium text-gray-900 truncate">{user?.email?.address ?? "User"}</p>
								</div>
								<div className="p-2">
									<button className="w-full px-3 py-2 text-sm text-left text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-2">
										<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
											/>
										</svg>
										Profile
									</button>
									<button className="w-full px-3 py-2 text-sm text-left text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-2">
										<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
											/>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
											/>
										</svg>
										Settings
									</button>
								</div>
								<div className="p-2 border-t border-gray-100">
									<button
										onClick={handleLogout}
										className="w-full px-3 py-2 text-sm text-left text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2"
									>
										<LogOut className="w-4 h-4" />
										Logout
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Page content */}
				<main className="flex-1 overflow-y-auto bg-gray-50">
					<Outlet />
				</main>
			</div>

			{/* Mobile sidebar */}
			<div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? "" : "hidden"}`}>
				<div
					className="fixed inset-0 bg-gray-900 bg-opacity-50"
					onClick={() => {
						setSidebarOpen(false)
					}}
				/>
				<div className="fixed inset-y-0 left-0 flex flex-col w-64 bg-white">
					<div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
						<h1 className="text-xl font-bold text-gray-900">PROXIFY</h1>
						<button
							onClick={() => {
								setSidebarOpen(false)
							}}
							className="text-gray-500 hover:text-gray-700"
						>
							<X className="w-6 h-6" />
						</button>
					</div>
					<nav className="flex-1 px-3 py-6 space-y-1">
						{navigation.map((item) => {
							return (
								<Link
									key={item.name}
									to={item.href}
									onClick={() => {
										setSidebarOpen(false)
									}}
									className="flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900"
									activeProps={{
										className: "bg-gray-50 text-gray-900",
									}}
								>
									<item.icon className="w-5 h-5 mr-3" />
									{item.name}
								</Link>
							)
						})}
					</nav>
				</div>
			</div>
		</div>
	)
}
