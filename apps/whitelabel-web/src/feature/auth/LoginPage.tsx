import { useEffect, useRef, useState } from "react"

import { usePrivy, useWallets } from "@privy-io/react-auth"
import { useNavigate } from "@tanstack/react-router"
import { Eye, EyeOff, Sparkles } from "lucide-react"
import { toast } from "sonner"

import { listOrganizationsByPrivyId } from "@/api/b2bClientHelpers"
import { useCreatePrivyAccount, usePrivyAccount } from "@/hooks/privy/usePrivyAccount"
import { useUserStore } from "@/store/userStore"

export function LoginPage() {
	const { login, authenticated, ready, user } = usePrivy()
	const { wallets } = useWallets()
	const navigate = useNavigate()
	const [hasSavedToDatabase, setHasSavedToDatabase] = useState(false)
	const [isCheckingProduct, setIsCheckingProduct] = useState(false)
	const hasCheckedProduct = useRef(false)
	const { setPrivyCredentials, loadOrganizations, syncToClientStore, privyOrganizationId } = useUserStore()

	// UI state
	const [showPassword, setShowPassword] = useState(false)
	const [email, setEmail] = useState("")
	const [password, setPassword] = useState("")

	// Query to check if Privy account exists in database
	// Use privyOrganizationId from store (set after setPrivyCredentials) to prevent race condition
	const { data: existingAccount, isLoading: isCheckingAccount } = usePrivyAccount(privyOrganizationId || undefined)
	const { mutateAsync: createPrivyAccount } = useCreatePrivyAccount()

	// Initialize credentials in localStorage as soon as Privy auth completes
	// This ensures the axios interceptor can inject x-privy-org-id header for subsequent API calls
	useEffect(() => {
		if (!authenticated || !ready || !user) return

		const embeddedWallet = wallets.find((wallet) => wallet.walletClientType === "privy")
		if (!embeddedWallet) return

		// Save credentials to store/localStorage immediately (if not already saved)
		if (!privyOrganizationId) {
			const walletType: "MANAGED" | "USER_OWNED" = user.wallet ? "USER_OWNED" : "MANAGED"
			setPrivyCredentials({
				privyOrganizationId: user.id,
				privyEmail: user.email?.address,
				privyWalletAddress: embeddedWallet.address,
				walletType: walletType,
			})
		}
	}, [authenticated, ready, user, wallets, privyOrganizationId, setPrivyCredentials])

	// Reset state on logout
	useEffect(() => {
		if (!authenticated) {
			setHasSavedToDatabase(false)
			setIsCheckingProduct(false)
			hasCheckedProduct.current = false
		}
	}, [authenticated])

	// Save Privy account to database when account doesn't exist and wallet is ready
	useEffect(() => {
		if (!authenticated || !ready || !user) return
		if (isCheckingAccount) return

		const embeddedWallet = wallets.find((wallet) => wallet.walletClientType === "privy")

		// If the account exists in the DB, update UserStore
		if (existingAccount) {
			if (!hasSavedToDatabase && embeddedWallet) {
				const walletType: "MANAGED" | "USER_OWNED" = user.wallet ? "USER_OWNED" : "MANAGED"
				setPrivyCredentials({
					privyOrganizationId: user.id,
					privyEmail: user.email?.address,
					privyWalletAddress: embeddedWallet.address,
					walletType: walletType,
				})
				setHasSavedToDatabase(true)

				// Load user's organizations from database and sync to clientContextStore
				loadOrganizations().then(() => {
					syncToClientStore()
				})
			}
			return
		}

		if (hasSavedToDatabase) return
		if (!embeddedWallet) return

		// Save to database
		const saveToDatabase = async () => {
			try {
				const walletType: "MANAGED" | "USER_OWNED" = user.wallet ? "USER_OWNED" : "MANAGED"

				const payload = {
					privyOrganizationId: user.id,
					privyWalletAddress: embeddedWallet.address,
					privyEmail: user.email?.address,
					walletType,
				}

				setPrivyCredentials({
					privyOrganizationId: user.id,
					privyEmail: user.email?.address,
					privyWalletAddress: embeddedWallet.address,
					walletType,
				})

				await createPrivyAccount(payload)

				setHasSavedToDatabase(true)

				// Load user's organizations from database and sync to clientContextStore
				await loadOrganizations()
				syncToClientStore()
			} catch (error) {
				console.error("Error creating Privy account:", error)
			}
		}

		void saveToDatabase()
	}, [
		authenticated,
		ready,
		user,
		wallets,
		existingAccount,
		isCheckingAccount,
		hasSavedToDatabase,
		// Note: setPrivyCredentials, createPrivyAccount, loadOrganizations, syncToClientStore
		// are zustand/react-query functions (stable, don't include in deps)
	])

	// Check if user has product after successful login
	useEffect(() => {
		if (!ready || !authenticated || !user || isCheckingProduct || hasCheckedProduct.current) return

		// ✅ IMPORTANT: Wait for Privy credentials to be saved to userStore
		// This ensures localStorage is populated before the interceptor tries to read it
		if (!privyOrganizationId) {
			return
		}

		const embeddedWallet = wallets.find((wallet) => wallet.walletClientType === "privy")

		// Wait for wallet to be ready
		if (user?.email && !user.wallet && !embeddedWallet) {
			return
		}

		// Check if user has a product
		const checkProduct = async () => {
			try {
				hasCheckedProduct.current = true
				setIsCheckingProduct(true)

				const clients = await listOrganizationsByPrivyId(user.id)

				if (clients && clients.length > 0) {
					// User has existing product → Dashboard
					toast.success("Welcome back!")
					await navigate({ to: "/dashboard" })
				} else {
					// No product → Onboarding
					toast.success("Welcome! Let's create your product")
					await navigate({ to: "/onboarding/create-product" })
				}
			} catch (error: any) {
				// On error, assume no product and go to onboarding
				toast.error("Error checking account. Redirecting to onboarding...")
				await navigate({ to: "/onboarding/create-product" })
			} finally {
				setIsCheckingProduct(false)
			}
		}

		void checkProduct()
	}, [ready, authenticated, user, wallets, navigate, isCheckingProduct, privyOrganizationId])

	// Handle social login via Privy
	const handleSocialLogin = () => {
		login()
	}

	// Handle email/password login (placeholder)
	const handleEmailLogin = (e: React.FormEvent) => {
		e.preventDefault()
		toast.error("Email login coming soon! Please use social login.")
	}

	return (
		<div className="min-h-screen flex">
			{/* Left side - Animated GIF */}
			<div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-black">
				{/* GIF filling entire left side */}
				<img
					src="/Pink Glow GIF by Erica Anderson.gif"
					alt="Pink Glow Animation"
					className="absolute inset-0 w-full h-full object-cover"
				/>

				{/* Branding text */}
				<div className="absolute bottom-12 left-12 right-12 text-white z-10">
					<h1 className="text-4xl font-bold mb-4">Quirk</h1>
					<p className="text-lg text-blue-200">White-label DeFi yield infrastructure for apps</p>
				</div>
			</div>

			{/* Right side - Login form */}
			<div className="flex-1 flex items-center justify-center p-8 bg-white">
				<div className="w-full max-w-md">
					{/* Mobile logo */}
					<div className="lg:hidden text-center mb-8">
						<h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
							<Sparkles className="w-8 h-8 text-blue-500" />
							Quirk
						</h1>
						<p className="text-gray-600 text-sm">White-label DeFi infrastructure</p>
					</div>

					<div className="mb-8">
						<h2 className="text-3xl font-bold text-gray-900 mb-2">Log in</h2>
						<p className="text-gray-600">Welcome back! Please enter your details.</p>
					</div>

					{/* Email/Password form (placeholder) */}
					<form onSubmit={handleEmailLogin} className="space-y-4 mb-6">
						<div>
							<input
								type="email"
								value={email}
								onChange={(e) => {
									setEmail(e.target.value)
								}}
								placeholder="Enter email or phone number"
								className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
								disabled
							/>
						</div>

						<div className="relative">
							<input
								type={showPassword ? "text" : "password"}
								value={password}
								onChange={(e) => {
									setPassword(e.target.value)
								}}
								placeholder="Enter password"
								className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all pr-12"
								disabled
							/>
							<button
								type="button"
								onClick={() => {
									setShowPassword(!showPassword)
								}}
								className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
							>
								{showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
							</button>
						</div>

						<div className="text-right">
							<button type="button" className="text-sm text-gray-400 font-medium cursor-not-allowed">
								Forgot your password?
							</button>
						</div>

						<button
							type="submit"
							className="w-full bg-gray-100 text-gray-400 px-6 py-3 rounded-lg font-medium transition-all cursor-not-allowed"
							disabled
						>
							Log in (Coming Soon)
						</button>
					</form>

					{/* Divider */}
					<div className="relative mb-6">
						<div className="absolute inset-0 flex items-center">
							<div className="w-full border-t border-gray-200"></div>
						</div>
						<div className="relative flex justify-center text-sm">
							<span className="px-4 bg-white text-gray-500">Log in with</span>
						</div>
					</div>

					{/* Social login buttons via Privy */}
					<div className="grid grid-cols-3 gap-3 mb-6">
						<button
							onClick={handleSocialLogin}
							disabled={!ready || isCheckingProduct}
							className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
							title="Continue with Google"
						>
							<svg className="w-5 h-5" viewBox="0 0 24 24">
								<path
									fill="#4285F4"
									d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
								/>
								<path
									fill="#34A853"
									d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
								/>
								<path
									fill="#FBBC05"
									d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
								/>
								<path
									fill="#EA4335"
									d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
								/>
							</svg>
						</button>

						<button
							onClick={handleSocialLogin}
							disabled={!ready || isCheckingProduct}
							className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
							title="Continue with Wallet"
						>
							<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
								<rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
								<path d="M7 11V7a5 5 0 0110 0v4" />
							</svg>
						</button>

						<button
							onClick={handleSocialLogin}
							disabled={!ready || isCheckingProduct}
							className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
							title="Continue with Apple"
						>
							<svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
								<path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
							</svg>
						</button>
					</div>

					{/* Main Privy Login Button */}
					<button
						onClick={handleSocialLogin}
						disabled={!ready || isCheckingProduct}
						className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-indigo-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
					>
						{isCheckingProduct ? "Checking account..." : ready ? "Sign in with Privy" : "Loading..."}
					</button>

					{/* Sign up link */}
					<p className="mt-6 text-center text-sm text-gray-600">
						Don't have an account?{" "}
						<button
							onClick={handleSocialLogin}
							disabled={!ready || isCheckingProduct}
							className="text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
						>
							Sign up
						</button>
					</p>

					{/* Back to home */}
					<div className="text-center mt-6">
						<button
							onClick={() => navigate({ to: "/" })}
							className="text-gray-600 hover:text-gray-900 transition-colors text-sm"
						>
							← Back to home
						</button>
					</div>
				</div>
			</div>
		</div>
	)
}
