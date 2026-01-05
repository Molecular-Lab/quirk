import { useEffect, useState } from "react"

import { usePrivy } from "@privy-io/react-auth"
import { Link, useNavigate } from "@tanstack/react-router"

import { listOrganizationsByPrivyId } from "@/api/b2bClientHelpers"
import quirkLogo from "@/assets/quirk-logo.svg"

export function LandingNavbar() {
	const { authenticated, ready, user } = usePrivy()
	const navigate = useNavigate()
	const [isScrolled, setIsScrolled] = useState(false)

	// Scroll event listener for navbar backdrop blur (Luma-style)
	useEffect(() => {
		const handleScroll = () => {
			setIsScrolled(window.scrollY > 10)
		}

		window.addEventListener("scroll", handleScroll)
		return () => {
			window.removeEventListener("scroll", handleScroll)
		}
	}, [])

	const handleAuthNavigation = async () => {
		// Wait for Privy to be ready
		if (!ready) {
			console.warn("Privy is not ready yet, redirecting to login")
			await navigate({ to: "/login" })
			return
		}

		// Check if user is authenticated
		if (!authenticated || !user) {
			await navigate({ to: "/login" })
			return
		}

		// User is authenticated - check if they have products
		try {
			const clients = await listOrganizationsByPrivyId(user.id)

			if (clients.length > 0) {
				// User has products → Dashboard
				await navigate({ to: "/dashboard" })
			} else {
				// User has no products → Onboarding
				await navigate({ to: "/onboarding/create-product" })
			}
		} catch (error) {
			console.error("Error checking user organizations:", error)
			// On error, redirect to onboarding
			await navigate({ to: "/onboarding/create-product" })
		}
	}

	return (
		<header
			className={`fixed top-0 w-full z-50 transition-all duration-300 backdrop-blur-xl ${
				isScrolled ? "border-b border-gray-200/30 shadow-sm" : "border-b border-transparent"
			}`}
		>
			<div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
				<Link to="/" className="flex items-center gap-3 group">
					<div className="relative p-2 -m-2 rounded-lg transition-all">
						<img src={quirkLogo} alt="Quirk Logo" className="size-12 cursor-pointer" />
					</div>
				</Link>
				<nav className="hidden md:flex items-center gap-6">
					<Link to="/demo" className="text-lg text-gray-700 hover:text-gray-950 transition-colors font-medium">
						Demo
					</Link>
					<button
						onClick={handleAuthNavigation}
						className="text-lg text-gray-700 hover:text-gray-950 transition-colors font-medium"
					>
						Sign In
					</button>
					<button
						onClick={handleAuthNavigation}
						className="bg-gray-900 text-white px-6 py-2.5 text-lg rounded-lg hover:bg-gray-800 transition-all font-medium shadow-sm hover:shadow-md cursor-pointer"
					>
						Get Started
					</button>
				</nav>
			</div>
		</header>
	)
}
