import { useEffect, useState } from "react"

import { usePrivy } from "@privy-io/react-auth"
import { Link, Outlet, useNavigate } from "@tanstack/react-router"
import {
	Aperture,
	ArrowLeftRight,
	Bell,
	BookText,
	LayoutDashboard,
	LogOut,
	Menu,
	Search,
	Sliders,
	Sparkles,
	X,
} from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

import { FloatingConcierge } from "@/components/chat/FloatingConcierge"

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
		<div className="h-screen flex overflow-hidden bg-white">
			{/* Clean Minimal Sidebar */}
			<div className="hidden lg:flex lg:flex-shrink-0">
				<div className="flex flex-col w-[72px] bg-gray-50 border-r border-gray-200">
					{/* Simple Logo */}
					<div className="flex items-center justify-center h-16 border-b border-gray-200">
						<div className="w-8 h-8 bg-gradient-to-br from-blue-200 via-purple-200 to-cyan-200 rounded-lg flex items-center justify-center shadow-sm">
							<span className="text-blue-700 font-semibold text-sm">Q</span>
						</div>
					</div>

					{/* Clean Navigation Icons */}
					<TooltipProvider>
						<nav className="flex-1 px-3 py-6 space-y-2">
							{navigation.map((item) => {
								return (
									<Tooltip key={item.name}>
										<TooltipTrigger asChild>
											<Link
												to={item.href}
												className="flex items-center justify-center w-12 h-12 rounded-lg transition-colors text-gray-400 hover:text-gray-900 hover:bg-gray-100"
												activeProps={{
													className: "bg-gray-100 text-gray-900 font-medium",
												}}
												activeOptions={{
													exact: true,
												}}
											>
												<item.icon className="w-5 h-5" />
											</Link>
										</TooltipTrigger>
										<TooltipContent side="right">
											<p>{item.name}</p>
										</TooltipContent>
									</Tooltip>
								)
							})}
						</nav>
					</TooltipProvider>

					{/* User Avatar */}
					<div className="p-3 border-t border-gray-200">
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<button className="w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-all hover:scale-105">
									<Avatar className="w-12 h-12">
										<AvatarFallback className="bg-gradient-to-br from-blue-200 via-purple-200 to-cyan-200 text-blue-700 font-semibold text-sm shadow-sm">
											{userInitial}
										</AvatarFallback>
									</Avatar>
								</button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" className="w-56">
								<DropdownMenuLabel className="font-normal">
									<div className="flex flex-col space-y-1">
										<p className="text-sm font-medium leading-none">{userName}</p>
										<p className="text-xs leading-none text-muted-foreground">{user?.email?.address}</p>
									</div>
								</DropdownMenuLabel>
								<DropdownMenuSeparator />
								<DropdownMenuItem>Profile</DropdownMenuItem>
								<DropdownMenuItem>Settings</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem onClick={handleLogout} className="text-red-600">
									<LogOut className="mr-2 h-4 w-4" />
									<span>Log out</span>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>
			</div>

			{/* Main content */}
			<div className="flex flex-col flex-1 overflow-hidden">
				{/* Clean Top Bar */}
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
					<div className="flex-1 max-w-2xl mx-auto">
						<div className="relative">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
							<Input
								type="text"
								placeholder="Search portfolios, strategies, tokens..."
								className="w-full pl-10 pr-4 bg-gray-50 border-gray-200"
							/>
						</div>
					</div>

					{/* Right Side */}
					<div className="flex items-center gap-3">
						{/* Notifications */}
						<Button variant="ghost" size="icon" className="relative">
							<Bell className="w-5 h-5" />
							<span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
						</Button>

						{/* Desktop User Menu */}
						<div className="hidden lg:flex items-center gap-2">
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="ghost" className="flex items-center gap-2 px-3">
										<Avatar className="w-8 h-8">
											<AvatarFallback className="bg-gradient-to-br from-blue-200 via-purple-200 to-cyan-200 text-blue-700 text-xs shadow-sm">
												{userInitial}
											</AvatarFallback>
										</Avatar>
										<span className="text-sm font-medium hidden xl:inline">{userName}</span>
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end" className="w-64">
									<DropdownMenuLabel className="font-normal">
										<div className="flex flex-col space-y-1">
											<p className="text-sm font-medium leading-none">{userName}</p>
											<p className="text-xs leading-none text-muted-foreground">{user?.email?.address}</p>
										</div>
									</DropdownMenuLabel>
									<DropdownMenuSeparator />
									<DropdownMenuItem>
										<LayoutDashboard className="mr-2 h-4 w-4" />
										<span>Dashboard</span>
									</DropdownMenuItem>
									<DropdownMenuItem>
										<Sliders className="mr-2 h-4 w-4" />
										<span>Settings</span>
									</DropdownMenuItem>
									<DropdownMenuSeparator />
									<DropdownMenuItem onClick={handleLogout} className="text-red-600">
										<LogOut className="mr-2 h-4 w-4" />
										<span>Log out</span>
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					</div>
				</div>

				{/* Page content - Clean white background */}
				<main className="flex-1 overflow-y-auto bg-gray-50">
					<Outlet />
				</main>
			</div>

			{/* Mobile sidebar */}
			<div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? "" : "hidden"}`}>
				<div
					className="fixed inset-0 bg-gray-900/20"
					onClick={() => {
						setSidebarOpen(false)
					}}
				/>
				<div className="fixed inset-y-0 left-0 flex flex-col w-64 bg-white shadow-xl">
					<div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
						<div className="flex items-center gap-2">
							<div className="w-8 h-8 bg-gradient-to-br from-blue-200 via-purple-200 to-cyan-200 rounded-lg flex items-center justify-center shadow-sm">
								<span className="text-blue-700 font-semibold text-sm">Q</span>
							</div>
							<h1 className="text-xl font-bold text-gray-900">QUIRK</h1>
						</div>
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
									className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
									activeProps={{
										className: "bg-gray-100 text-gray-900",
									}}
									activeOptions={{
										exact: true,
									}}
								>
									<item.icon className="w-5 h-5" />
									{item.name}
								</Link>
							)
						})}
					</nav>
				</div>
			</div>

			{/* Floating AI Concierge */}
			<FloatingConcierge />
		</div>
	)
}
