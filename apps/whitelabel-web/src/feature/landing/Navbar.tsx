import { usePrivy } from "@privy-io/react-auth"
import { Link, useNavigate } from "@tanstack/react-router"
import { motion } from "framer-motion"

import { listOrganizationsByPrivyId } from "@/api/b2bClientHelpers"
import quirkLogo from "@/assets/quirk-logo.svg"

import { MobileMenu } from "./MobileMenu"

export function Navbar() {
	const { authenticated, ready, user } = usePrivy()
	const navigate = useNavigate()

	const handleSignIn = async () => {
		// Wait for Privy to be ready
		if (!ready) {
			await navigate({ to: "/login" })
			return
		}

		// Check if user is already authenticated
		if (!authenticated || !user) {
			await navigate({ to: "/login" })
			return
		}

		// User is already authenticated - check if they have products
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
			// On error, redirect to onboarding
			await navigate({ to: "/onboarding/create-product" })
		}
	}

	return (
		<motion.header
			className="fixed top-0 w-full z-50 transition-all duration-300 backdrop-blur-xl"
			initial={{ y: -100 }}
			animate={{ y: 0 }}
			transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }}
		>
			<div className="max-w-7xl mx-auto px-6 py-1.5 flex items-center justify-between">
				<Link to="/" className="flex items-center gap-2 group">
					<motion.div
						className="relative p-1.5 -m-1.5 rounded-lg transition-all"
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
					>
						<img src={quirkLogo} alt="Quirk Logo" className="size-10 cursor-pointer" />
					</motion.div>
					<span className="text-lg font-medium text-gray-950">QUIRK</span>
				</Link>

				{/* Mobile Menu - shown below md breakpoint */}
				<MobileMenu onSignIn={handleSignIn} />

				{/* Desktop Navigation - hidden below md breakpoint */}
				<nav className="hidden md:flex items-center gap-5">
					<motion.button
						onClick={handleSignIn}
						className="text-sm text-claude-gray-700 hover:text-claude-gray-900 transition-colors font-medium"
						initial={{ opacity: 0, y: -10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.2 }}
						whileHover={{ scale: 1.02 }}
						whileTap={{ scale: 0.98 }}
					>
						Log In
					</motion.button>
					<Link to="/contact">
						<motion.button
							className="bg-claude-gray-900 text-white px-5 py-2 text-sm rounded-lg hover:bg-claude-gray-800 transition-all font-medium shadow-sm cursor-pointer"
							initial={{ opacity: 0, y: -10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.3 }}
							whileHover={{
								scale: 1.02,
								boxShadow: "0 10px 40px rgba(0, 0, 0, 0.15)",
							}}
							whileTap={{ scale: 0.98 }}
						>
							Get in Touch
						</motion.button>
					</Link>
				</nav>
			</div>
		</motion.header>
	)
}
