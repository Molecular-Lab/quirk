import { useEffect, useState } from "react"

import { usePrivy, useWallets } from "@privy-io/react-auth"
import { useNavigate } from "@tanstack/react-router"
import { LogIn, Mail, Wallet } from "lucide-react"

import { useCreatePrivyAccount, usePrivyAccount } from "@/hooks/privy/usePrivyAccount"
import { useUserStore } from "@/store/userStore"

export function LoginPage() {
	const { login, authenticated, ready, user, createWallet } = usePrivy()
	const { wallets } = useWallets()
	const navigate = useNavigate()
	const [hasCreatedWallet, setHasCreatedWallet] = useState(false)
	const [hasSavedToDatabase, setHasSavedToDatabase] = useState(false)
	const { setPrivyCredentials } = useUserStore()

	// Query to check if Privy account exists in database
	const { data: existingAccount, isLoading: isCheckingAccount } = usePrivyAccount(user?.id)
	const { mutateAsync: createPrivyAccount } = useCreatePrivyAccount()

	// After login: Create wallet (if needed) and save Privy account to database
	useEffect(() => {
		if (!authenticated || !ready || !user) return

		const embeddedWallet = wallets.find((wallet) => wallet.walletClientType === "privy")

		// eslint-disable-next-line no-console
		console.log("[LoginPage] 🔍 Wallet check:", {
			authenticated: authenticated,
			ready: ready,
			userId: user.id,
			hasEmail: !!user.email,
			hasUserWallet: !!user.wallet,
			embeddedWallet: embeddedWallet ? { address: embeddedWallet.address } : null,
			hasCreatedWallet: hasCreatedWallet,
			hasSavedToDatabase: hasSavedToDatabase,
			existingAccount: existingAccount ? "EXISTS" : "NOT_FOUND",
			isCheckingAccount: isCheckingAccount,
		})

		// Handle wallet creation and database save
		const handleWalletAndDatabase = async () => {
			try {
				// Step 1: Create embedded wallet if needed (email/social login)
				if (user.email && !user.wallet && !embeddedWallet && !hasCreatedWallet) {
					// eslint-disable-next-line no-console
					console.log("[LoginPage] 📱 Creating embedded wallet in Privy...")
					setHasCreatedWallet(true)

					await createWallet()
					// eslint-disable-next-line no-console
					console.log("[LoginPage] ✅ Wallet created successfully")
					// Wait for wallets array to update (Privy handles this automatically)
					return
				}

				// Step 2: Check if account exists in database, create if not
				if (embeddedWallet && !hasSavedToDatabase && !isCheckingAccount) {
					const walletType = user.wallet ? "USER_OWNED" : "MANAGED"

					// Check if account already exists
					if (existingAccount) {
						// eslint-disable-next-line no-console
						console.log("[LoginPage] ✅ Privy account already exists in database:", existingAccount)
						setHasSavedToDatabase(true)

						// Still save to UserStore
						setPrivyCredentials({
							privyOrganizationId: user.id,
							privyEmail: user.email?.address,
							privyWalletAddress: embeddedWallet.address,
							walletType: walletType,
						})
						return
					}

					// Account doesn't exist - create it
					// eslint-disable-next-line no-console
					console.log("[LoginPage] 💾 Privy account not found, creating in database...", {
						privyOrganizationId: user.id,
						privyWalletAddress: embeddedWallet.address,
						privyEmail: user.email?.address,
						walletType: walletType,
					})

					// Save to UserStore first
					setPrivyCredentials({
						privyOrganizationId: user.id,
						privyEmail: user.email?.address,
						privyWalletAddress: embeddedWallet.address,
						walletType: walletType,
					})

					// Then save to database
					const result = await createPrivyAccount({
						privyOrganizationId: user.id,
						privyWalletAddress: embeddedWallet.address,
						privyEmail: user.email?.address,
						walletType: walletType,
					})

					// eslint-disable-next-line no-console
					console.log("[LoginPage] ✅ Privy account created in database successfully:", result)
					setHasSavedToDatabase(true)
				}
			} catch (error) {
				// eslint-disable-next-line no-console
				console.error("[LoginPage] ❌ Error:", error)
				// Reset flags on error so user can retry
				setHasCreatedWallet(false)
				setHasSavedToDatabase(false)
			}
		}

		void handleWalletAndDatabase()
	}, [
		authenticated,
		ready,
		user,
		wallets,
		hasCreatedWallet,
		hasSavedToDatabase,
		existingAccount,
		isCheckingAccount,
		createWallet,
		setPrivyCredentials,
		createPrivyAccount,
	])

	// Reset state on logout
	useEffect(() => {
		if (!authenticated) {
			setHasCreatedWallet(false)
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
		if (existingAccount) {
			// Account exists - just update UserStore if needed
			if (!hasSavedToDatabase) {
				const embeddedWallet = wallets.find((wallet) => wallet.walletClientType === "privy")
				if (embeddedWallet) {
					const walletType = user.wallet ? "USER_OWNED" : "MANAGED"
					setPrivyCredentials({
						privyOrganizationId: user.id,
						privyEmail: user.email?.address,
						privyWalletAddress: embeddedWallet.address,
						walletType,
					})
					setHasSavedToDatabase(true)
				}
			}
			return
		}
		if (hasSavedToDatabase) return

		// Check if wallet is ready
		const embeddedWallet = wallets.find((wallet) => wallet.walletClientType === "privy")
		if (!embeddedWallet) return

		// Account doesn't exist - create it
		const saveToDatabase = async () => {
			try {
				const walletType = user.wallet ? "USER_OWNED" : "MANAGED"

				// eslint-disable-next-line no-console
				console.log("[LoginPage] 💾 Creating Privy account in database...", {
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
					console.log("[LoginPage] Waiting for embedded wallet creation...")
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
		<div className="min-h-screen bg-white flex items-center justify-center p-6">
			<div className="w-full max-w-md">
				{/* Logo */}
				<div className="text-center mb-8">
					<h1 className="text-4xl font-bold text-gray-900 mb-2">PROXIFY</h1>
					<p className="text-gray-600">Access your embedded wallet dashboard</p>
				</div>

				{/* Login Card */}
				<div className="bg-white border-2 border-gray-100 rounded-3xl p-8 shadow-sm">
					<h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome back</h2>
					<p className="text-gray-600 mb-8">Sign in to continue to your dashboard</p>

					{/* Privy Login Button */}
					<button
						onClick={handleLogin}
						disabled={!ready}
						className="w-full bg-primary-500 text-white py-4 rounded-xl hover:bg-primary-600 transition-all font-semibold text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
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
					<div className="space-y-4">
						<div className="flex items-start gap-3">
							<div className="bg-primary-100 p-2 rounded-lg">
								<Mail className="w-5 h-5 text-primary-600" />
							</div>
							<div className="flex-1">
								<h3 className="font-semibold text-gray-900">Email & Social</h3>
								<p className="text-sm text-gray-600">Login with email or Google</p>
							</div>
						</div>
						<div className="flex items-start gap-3">
							<div className="bg-blue-100 p-2 rounded-lg">
								<Wallet className="w-5 h-5 text-blue-600" />
							</div>
							<div className="flex-1">
								<h3 className="font-semibold text-gray-900">Web3 Wallet</h3>
								<p className="text-sm text-gray-600">Connect with MetaMask, WalletConnect</p>
							</div>
						</div>
					</div>
				</div>

				{/* Back to Home */}
				<div className="text-center mt-6">
					<button onClick={() => navigate({ to: "/" })} className="text-gray-600 hover:text-gray-900 transition-colors">
						← Back to home
					</button>
				</div>
			</div>
		</div>
	)
}
