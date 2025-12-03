import { useEffect, useState } from "react"

import { usePrivy, useWallets } from "@privy-io/react-auth"
import { useNavigate } from "@tanstack/react-router"
import { LogIn, Mail, Wallet } from "lucide-react"

import { useCreatePrivyAccount, usePrivyAccount } from "@/hooks/privy/usePrivyAccount"
import { useUserStore } from "@/store/userStore"

export function LoginPage() {
	const { login, authenticated, ready, user } = usePrivy()
	const { wallets } = useWallets()
	const navigate = useNavigate()
	const [hasSavedToDatabase, setHasSavedToDatabase] = useState(false)
	const { setPrivyCredentials } = useUserStore()

	// Query to check if Privy account exists in database
	const { data: existingAccount, isLoading: isCheckingAccount } = usePrivyAccount(user?.id)
	const { mutateAsync: createPrivyAccount } = useCreatePrivyAccount()

	// Reset state on logout
	useEffect(() => {
		if (!authenticated) {
			setHasSavedToDatabase(false)
		}
	}, [authenticated])

	// Save Privy account to database when account doesn't exist and wallet is ready
	useEffect(() => {
		// Don't run if:
		// - Not authenticated
		// - Still checking if account exists
		// - Account already exists
		// - Already saved in this session
		if (!authenticated || !ready || !user) return
		if (isCheckingAccount) return

		// With createOnLogin, privy automatically creates a wallet, and it will
		// appear in the `wallets` array. We just need to wait for it.
		const embeddedWallet = wallets.find((wallet) => wallet.walletClientType === "privy")

		// If the account exists in the DB, we're good. Just ensure the user store is up to date.
		if (existingAccount) {
			// Account exists - just update UserStore if needed
			if (!hasSavedToDatabase && embeddedWallet) {
				const walletType = user.wallet ? "USER_OWNED" : "MANAGED"
				setPrivyCredentials({
					privyOrganizationId: user.id,
					privyEmail: user.email?.address,
					privyWalletAddress: embeddedWallet.address,
					walletType,
				})
				setHasSavedToDatabase(true)
			}
			return
		}

		// If we've already tried to save, don't try again
		if (hasSavedToDatabase) return

		// If the wallet isn't ready yet, wait.
		if (!embeddedWallet) return

		// Account doesn't exist in DB, wallet is ready, and we haven't saved yet.
		// Let's save it.
		const saveToDatabase = async () => {
			try {
				const walletType = user.wallet ? "USER_OWNED" : "MANAGED"

				// eslint-disable-next-line no-console
				console.log("[LoginPage] 💾 Privy account not found, creating in database...", {
					privyOrganizationId: user.id,
					privyWalletAddress: embeddedWallet.address,
					privyEmail: user.email?.address,
					walletType,
				})

				// Save to UserStore first
				setPrivyCredentials({
					privyOrganizationId: user.id,
					privyEmail: user.email?.address,
					privyWalletAddress: embeddedWallet.address,
					walletType,
				})

				// Then save to database
				const result = await createPrivyAccount({
					privyOrganizationId: user.id,
					privyWalletAddress: embeddedWallet.address,
					privyEmail: user.email?.address,
					walletType,
				})

				// eslint-disable-next-line no-console
				console.log("[LoginPage] ✅ Privy account created successfully:", result)
				setHasSavedToDatabase(true)
			} catch (error) {
				// eslint-disable-next-line no-console
				console.error("[LoginPage] ❌ Error creating Privy account:", error)
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
		setPrivyCredentials,
		createPrivyAccount,
	])

	// Navigate to dashboard after successful login AND wallet is ready
	useEffect(() => {
		if (ready && authenticated) {
			const embeddedWallet = wallets.find((wallet) => wallet.walletClientType === "privy")

			// If user logged in with email, wait for wallet creation
			if (user?.email && !user.wallet) {
				if (embeddedWallet) {
					// eslint-disable-next-line no-console
					console.log("[LoginPage] Embedded wallet ready, navigating to dashboard...")
					void navigate({ to: "/dashboard" })
				} else {
					// eslint-disable-next-line no-console
					console.log("[LoginPage] Waiting for automatic embedded wallet creation...")
				}
			} else {
				// External wallet login - navigate immediately
				void navigate({ to: "/dashboard" })
			}
		}
	}, [ready, authenticated, user, wallets, navigate])

	const handleLogin = () => {
		login()
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-purple-50 via-gray-50 via-30% to-gray-50 flex items-center justify-center p-6">
			<div className="w-full max-w-md">
				{/* Logo */}
				<div className="text-center mb-8">
					<h1 className="text-5xl font-bold text-black mb-2">PROXIFY</h1>
					<p className="text-gray-600">Access your embedded wallet dashboard</p>
				</div>

				{/* Login Card */}
				<div className="bg-white rounded-3xl p-8 shadow-lg">
					<h2 className="text-2xl font-bold text-black mb-2">Welcome back</h2>
					<p className="text-gray-600 mb-8">Sign in to continue to your dashboard</p>

					{/* Privy Login Button */}
					<button
						onClick={handleLogin}
						disabled={!ready}
						className="w-full bg-black text-white py-4 rounded-2xl hover:bg-gray-800 transition-all font-semibold text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						<LogIn className="w-5 h-5" />
						{ready ? "Sign In" : "Loading..."}
					</button>

					{/* Divider */}
					<div className="relative my-8">
						<div className="absolute inset-0 flex items-center">
							<div className="w-full border-t border-gray-200"></div>
						</div>
						<div className="relative flex justify-center text-sm">
							<span className="px-4 bg-white text-gray-500">Login methods available</span>
						</div>
					</div>

					{/* Features */}
					<div className="space-y-3">
						<div className="flex items-start gap-3">
							<div className="bg-gray-100 p-2 rounded-lg">
								<Mail className="w-5 h-5 text-gray-700" />
							</div>
							<div className="flex-1">
								<h3 className="font-semibold text-black">Email & Social</h3>
								<p className="text-sm text-gray-600">Login with email or Google</p>
							</div>
						</div>
						<div className="flex items-start gap-3">
							<div className="bg-gray-100 p-2 rounded-lg">
								<Wallet className="w-5 h-5 text-gray-700" />
							</div>
							<div className="flex-1">
								<h3 className="font-semibold text-black">Web3 Wallet</h3>
								<p className="text-sm text-gray-600">Connect with MetaMask, WalletConnect</p>
							</div>
						</div>
					</div>
				</div>

				{/* Back to Home */}
				<div className="text-center mt-6">
					<button
						onClick={() => navigate({ to: "/" })}
						className="text-gray-600 hover:text-black transition-colors font-medium"
					>
						← Back to home
					</button>
				</div>
			</div>
		</div>
	)
}
