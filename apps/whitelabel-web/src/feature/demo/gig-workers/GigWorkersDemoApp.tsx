import { useEffect, useState } from "react"

import { usePrivy } from "@privy-io/react-auth"
import { useNavigate } from "@tanstack/react-router"
import { Home, Loader2, RefreshCw, TrendingUp, Wallet } from "lucide-react"

import { createFiatDeposit, createUser, createWithdrawal, getUserBalance, getUserByClientUserId } from "@/api/b2bClientHelpers"
import { generateDemoClientUserId } from "@/feature/demo/personas"
import { LandingNavbar } from "@/feature/landing/LandingNavbar"
import { useClientContextStore } from "@/store/clientContextStore"
import { useDemoProductStore } from "@/store/demoProductStore"
import { useDemoStore, useHydrated } from "@/store/demoStore"

import { DemoSettings } from "../shared/DemoSettings"
import { DepositModal } from "../shared/DepositModal"
import { PersonaSelector } from "../shared/PersonaSelector"

import { gigWorkersCards, gigWorkersMockBalances } from "./gig-workers-data"

// Real balance type from API
interface UserBalance {
	balance: string
	currency: string
	yield_earned: string
	apy: string
	status: string
	entry_index: string
	current_index: string
}

export function GigWorkersDemoApp() {
	// CRITICAL: Check if Zustand has finished hydrating from localStorage
	const hasHydrated = useHydrated()

	const navigate = useNavigate()
	const [currentCardIndex, setCurrentCardIndex] = useState(0)
	const [isDepositModalOpen, setIsDepositModalOpen] = useState(false)
	const [touchStart, setTouchStart] = useState(0)
	const [touchEnd, setTouchEnd] = useState(0)

	// Real balance state
	const [realBalance, setRealBalance] = useState<UserBalance | null>(null)
	const [isLoadingBalance, setIsLoadingBalance] = useState(false)
	const [balanceError, setBalanceError] = useState<string | null>(null)

	// Get Privy user for database sync
	const { user } = usePrivy()
	const privyUserId = user?.id

	// Get client context (productId, clientId, apiKey)
	const { productId, clientId, hasApiKey } = useClientContextStore()

	// Get selected product info
	const { selectedProductId } = useDemoProductStore()

	// Get demo-specific state from demoStore
	const {
		hasEarnAccount,
		isCreatingAccount,
		isRestoringFromDb,
		endUserId,
		endUserClientUserId, // ✅ Get client user ID for API calls
		error,
		selectedEnvironment,
		selectedPersona,
		setIsCreatingAccount,
		setEndUser,
		setError,
		setIsDepositing,
		addDeposit,

		hasPersonaForType,
		activateEarnAccount, // Call after confirming user is active in database
	} = useDemoStore()

	// Show PersonaSelector only if missing required context
	// This avoids duplicate persona selection when coming from DemoSelectorPage
	const [showPersonaSelector, setShowPersonaSelector] = useState(() => {
		// Check if we have valid persona for this demo type
		const hasValidPersona = hasPersonaForType("gig-workers")
		const hasValidContext = !!selectedProductId && !!privyUserId

		// Only show PersonaSelector if missing required context
		return !hasValidPersona || !hasValidContext
	})

	// Re-check showPersonaSelector after Zustand hydrates
	// This handles the case where user returns from onboarding with hasEarnAccount: true
	useEffect(() => {
		const hasValidPersona = hasPersonaForType("gig-workers")

		// If we have valid persona, account, and context - hide the PersonaSelector
		if (hasValidPersona && hasEarnAccount && privyUserId && selectedProductId) {
			console.log("[GigWorkersDemoApp] Valid state after hydration, hiding PersonaSelector")
			setShowPersonaSelector(false)
		}
	}, [hasEarnAccount, privyUserId, selectedProductId, hasPersonaForType])

	// Check database for user activation status on mount
	// This syncs local state with database state when user returns from onboarding
	useEffect(() => {
		// CRITICAL: Wait for Zustand to hydrate from localStorage
		if (!hasHydrated) {
			console.log("[GigWorkersDemoApp] ⏳ Waiting for Zustand hydration...")
			return // Exit early, will re-run when hasHydrated becomes true
		}

		console.log("[GigWorkersDemoApp] ✅ Zustand hydrated, proceeding with initialization...")

		async function checkUserActivationStatus() {
			// Need clientId and endUserClientUserId to check status
			if (!endUserClientUserId || !clientId) {
				console.log("[GigWorkersDemoApp] Skipping status check - missing clientId or endUserClientUserId")
				return
			}

			try {
				console.log("[GigWorkersDemoApp] Checking user activation status:", {
					clientId,
					endUserClientUserId,
				})

				const user = await getUserByClientUserId(clientId, endUserClientUserId)

				if (user?.status === "active") {
					console.log("[GigWorkersDemoApp] User is ACTIVE in database - syncing local state")

					// Ensure local state matches database state
					if (!hasEarnAccount) {
						activateEarnAccount()
					}

					// Hide PersonaSelector since user is already activated
					setShowPersonaSelector(false)
				} else {
					console.log("[GigWorkersDemoApp] User status:", user?.status || "not found")
				}
			} catch (error) {
				console.error("[GigWorkersDemoApp] Failed to check user status:", error)
				// Don't block UI on error - just log and continue
			}
		}

		void checkUserActivationStatus()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [hasHydrated, endUserClientUserId, clientId])

	// Function to fetch balance
	const fetchBalance = async () => {
		console.log("[fetchBalance] Called with:", { endUserId, endUserClientUserId, hasEarnAccount, selectedEnvironment })

		if (!endUserClientUserId || !hasEarnAccount) {
			setRealBalance(null)
			return
		}

		setIsLoadingBalance(true)
		setBalanceError(null)

		try {
			console.log(
				"[GigWorkersDemoApp] Fetching real balance for user:",
				endUserClientUserId,
				"environment:",
				selectedEnvironment,
			)
			const response = await getUserBalance(endUserClientUserId, { environment: selectedEnvironment }) // ✅ Use client user ID

			if (response.found && response.data) {
				console.log("[GigWorkersDemoApp] Real balance fetched:", response.data)
				setRealBalance(response.data)
			} else {
				console.warn("[GigWorkersDemoApp] Balance not found for user:", endUserId)
				setBalanceError("Balance not found")
			}
		} catch (err) {
			console.error("[GigWorkersDemoApp] Failed to fetch balance:", err)
			setBalanceError(err instanceof Error ? err.message : "Failed to load balance")
		} finally {
			setIsLoadingBalance(false)
		}
	}

	// Fetch real balance when endUserClientUserId exists or environment changes
	useEffect(() => {
		fetchBalance()
	}, [endUserClientUserId, hasEarnAccount, selectedEnvironment]) // ✅ Watch client user ID

	// NOTE: Database restore logic REMOVED (Dec 2024)
	// DemoSelectorPage now handles user creation via handleStartDemo()
	// Restoring from database was causing state bleeding when switching personas
	// The correct flow is:
	// 1. User selects persona in DemoSelectorPage
	// 2. DemoSelectorPage calls getOrCreateDemoUser() and sets state
	// 3. User navigates to demo app with state already set
	// 4. Demo app trusts the demoStore state

	// Mock gig worker pending payouts balance (from config)
	const payoutsBalance = gigWorkersMockBalances.pendingPayouts

	// Use real balance if available, otherwise show $0 (not mock data)
	const earnBalance = realBalance ? parseFloat(realBalance.balance) : 0
	const yieldEarned = realBalance ? parseFloat(realBalance.yield_earned) : 0
	const apy = realBalance ? parseFloat(realBalance.apy) : 0

	const cards = gigWorkersCards

	const handleTouchStart = (e: React.TouchEvent) => {
		setTouchStart(e.targetTouches[0].clientX)
	}

	const handleTouchMove = (e: React.TouchEvent) => {
		setTouchEnd(e.targetTouches[0].clientX)
	}

	const handleTouchEnd = () => {
		if (touchStart - touchEnd > 75) {
			// Swiped left - go to next card
			setCurrentCardIndex((prev) => Math.min(prev + 1, cards.length - 1))
		}

		if (touchStart - touchEnd < -75) {
			// Swiped right - go to previous card
			setCurrentCardIndex((prev) => Math.max(prev - 1, 0))
		}
	}

	const currentCard = cards[currentCardIndex]
	const isPayoutsCard = currentCard.id === "payouts"
	const isSavingsCard = currentCard.id === "savings"

	const handleStartEarning = async () => {
		console.log("[GigWorkersDemoApp] 🚀 handleStartEarning() called:", {
			endUserId,
			endUserClientUserId, // This is the Static Key
			selectedPersona,
			hasEarnAccount,
			selectedEnvironment,
		})

		setIsCreatingAccount(true)
		setError(null)

		try {
			// Validate context
			if (!productId) {
				throw new Error("No product ID configured. Please set up via Demo Settings.")
			}

			if (!hasApiKey()) {
				throw new Error("No API key configured. Please set up via Demo Settings.")
			}

			if (!privyUserId) {
				throw new Error("Please sign in to create an account.")
			}

			if (!selectedPersona) {
				throw new Error("No persona selected. Please select a persona first.")
			}

			if (!clientId) {
				throw new Error("No client ID found. Please check product configuration.")
			}

			// Use the Static Key format: {privy_id}:{type}:{persona}
			const demoUserId = generateDemoClientUserId(privyUserId, "gig-workers", selectedPersona)

			// ✅ STEP 1: Check if user exists with this Static Key
			console.log("[GigWorkersDemoApp] 🔄 Checking for existing user with Static Key:", demoUserId)
			let user = await getUserByClientUserId(clientId, demoUserId)

			// ✅ STEP 2: Create user ONLY if doesn't exist
			if (!user) {
				console.log("[GigWorkersDemoApp] 🆕 User not found, creating new user with Static Key...")

				const createResponse = await createUser(productId, {
					clientUserId: demoUserId, // Use Static Key as clientUserId
					email: "demo@example.com",
					status: "pending_onboarding",
				})

				console.log("[GigWorkersDemoApp] ✅ New user created:", createResponse)

				// Fetch the created user to get full details
				user = await getUserByClientUserId(clientId, demoUserId)

				if (!user) {
					throw new Error("Failed to verify user creation")
				}
			} else {
				console.log("[GigWorkersDemoApp] ✅ Existing user found:", {
					userId: user.id,
					status: user.status,
					clientUserId: user.clientUserId,
				})
			}

			// ✅ STEP 3: Sync demoStore with backend user ID
			if (!endUserId || endUserId !== user.id) {
				console.log("[GigWorkersDemoApp] 🔄 Syncing endUserId to demoStore...")
				setEndUser({
					endUserId: user.id,
					endUserClientUserId: user.clientUserId,
				})
			}

			// ✅ STEP 4: Handle based on user status
			if (user.status === "pending_onboarding") {
				// User needs to complete onboarding
				console.log("[GigWorkersDemoApp] ➡️ User needs onboarding, redirecting...")
				navigate({
					to: "/onboarding/$clientUserId",
					params: { clientUserId: demoUserId },
					search: {
						userId: user.id,
						clientId: clientId,
						productId: productId,
						returnPath: "/demo/gig-workers",
					},
				})
			} else if (user.status === "active") {
				// User already completed onboarding
				console.log("[GigWorkersDemoApp] ✅ User is already active, activating earn account...")
				activateEarnAccount()
				setIsCreatingAccount(false) // Hide loading state, show balance
			} else {
				throw new Error(`Invalid user status: ${user.status}`)
			}
		} catch (err) {
			console.error("[GigWorkersDemoApp] ❌ Failed to handle user:", err)
			setError(err instanceof Error ? err.message : "Failed to start earning. Please try again.")
			setIsCreatingAccount(false)
		}
	}

	const handleDeposit = async (amount: number) => {
		if (!endUserId || !endUserClientUserId) {
			throw new Error("No end-user account found. Please create an account first.")
		}

		setIsDepositing(true)
		setError(null)

		try {
			console.log("[DemoClientApp] Creating deposit order:", {
				userId: endUserClientUserId, // ✅ Use client user ID, not internal UUID
				amount: amount.toString(),
				currency: "USD",
				tokenSymbol: "USDC",
			})

			// Call the API to create deposit order
			const response = await createFiatDeposit({
				userId: endUserClientUserId, // ✅ Use client user ID for API calls
				amount: amount.toString(),
				currency: "USD",
				tokenSymbol: "USDC",
				environment: selectedEnvironment,
			})

			console.log("[DemoClientApp] Deposit order created:", response)

			// Add to deposit history in demoStore
			if (response && typeof response === "object" && "orderId" in response) {
				addDeposit({
					orderId: response.orderId,
					amount: amount.toString(),
					currency: "USD",
					status: "pending",
					createdAt: new Date().toISOString(),
				})

				// Refetch balance after successful deposit
				console.log("[GigWorkersDemoApp] Deposit successful, refreshing balance...")
				setTimeout(() => {
					fetchBalance()
				}, 1000) // Wait 1s for backend to process
			}

			// Success - modal will show success UI
		} catch (err) {
			console.error("[DemoClientApp] Failed to create deposit:", err)
			setError(err instanceof Error ? err.message : "Failed to create deposit. Please try again.")
		} finally {
			setIsDepositing(false)
		}
	}

	const handleWithdraw = async () => {
		if (!endUserId) {
			setError("No end-user account found. Please create an account first.")
			return
		}

		// Get current balance
		const currentBalance = realBalance ? parseFloat(realBalance.balance) : 0
		if (currentBalance <= 0) {
			setError("Insufficient balance for withdrawal.")
			return
		}

		// Prompt for withdrawal amount
		const amountStr = window.prompt(`Enter withdrawal amount (Available: ${currentBalance.toFixed(2)}):`)
		if (!amountStr) return // User cancelled

		const amount = parseFloat(amountStr)
		if (isNaN(amount) || amount <= 0) {
			setError("Please enter a valid amount.")
			return
		}

		if (amount > currentBalance) {
			setError(`Withdrawal amount (${amount.toFixed(2)}) exceeds available balance (${currentBalance.toFixed(2)}).`)
			return
		}

		setIsDepositing(true) // Reuse deposit loading state
		setError(null)

		try {
			console.log("[GigWorkersDemoApp] Creating withdrawal:", {
				userId: endUserId,
				amount: amount.toString(),
				environment: selectedEnvironment,
			})

			// Call the API to create withdrawal
			const response = await createWithdrawal({
				userId: endUserId,
				amount: amount.toString(),
				withdrawal_method: "fiat_to_end_user",
				destination_currency: "USD",
				environment: selectedEnvironment, // ✅ Pass environment parameter
			})

			console.log("[GigWorkersDemoApp] Withdrawal successful:", response)

			// Refetch balance after successful withdrawal
			setTimeout(() => {
				fetchBalance()
			}, 1000)

			// Show success message
			alert(`✅ Withdrawal of ${amount.toFixed(2)} initiated successfully!`)
		} catch (err) {
			console.error("[GigWorkersDemoApp] Failed to create withdrawal:", err)
			setError(err instanceof Error ? err.message : "Failed to create withdrawal. Please try again.")
		} finally {
			setIsDepositing(false)
		}
	}

	// Show loading state while Zustand is hydrating (prevents reading empty state)
	if (!hasHydrated) {
		return (
			<div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-white flex items-center justify-center">
				<div className="text-center">
					<Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-accent" />
					<p className="text-gray-600">Loading demo...</p>
				</div>
			</div>
		)
	}

	// Always show PersonaSelector when:
	// 1. showPersonaSelector state is true (default on mount)
	// 2. User not authenticated (required for demo to work)
	// 3. No product selected (required for API calls)
	const shouldShowPersonaSelector = showPersonaSelector || !privyUserId || !selectedProductId

	if (shouldShowPersonaSelector) {
		return (
			<>
				<LandingNavbar />
				<PersonaSelector
					visualizationType="gig-workers"
					onDemoStarted={() => {
						setShowPersonaSelector(false)
					}}
				/>
			</>
		)
	}

	return (
		<div className="min-h-screen bg-gradient-to-b from-gray-25 via-white to-white">
			{/* Navbar */}
			<LandingNavbar />

			{/* Main Content */}
			<div className="max-w-md mx-auto bg-white min-h-screen pt-20 pb-20">
				{/* Header */}
				<div className="px-5 pt-8 pb-5">
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-2xl font-bold text-gray-950">{currentCard.title}</h1>
							{/* Environment Badge */}
							<div className="mt-2">
								{selectedEnvironment === "production" ? (
									<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800 border border-orange-300">
										<span className="inline-flex h-1.5 w-1.5 rounded-full bg-orange-500"></span>
										Production
									</span>
								) : (
									<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-300">
										<span className="inline-flex h-1.5 w-1.5 rounded-full bg-green-500"></span>
										Sandbox
									</span>
								)}
							</div>
						</div>
						<button className="p-2 hover:bg-gray-50 rounded-lg transition-colors">
							<span className="text-2xl">⚙️</span>
						</button>
					</div>
				</div>

				{/* Swipeable Card Container */}
				<div
					className="px-5 mb-6"
					onTouchStart={handleTouchStart}
					onTouchMove={handleTouchMove}
					onTouchEnd={handleTouchEnd}
				>
					{/* Balance Display - Pure Numbers */}
					{isPayoutsCard ? (
						<>
							{/* Gig Worker Payouts View - Pure Numbers */}
							<div className="mb-2">
								<p className="text-sm text-gray-500 mb-1">Pending Payouts</p>
								<h2 className="text-6xl font-bold text-gray-950 mb-3">
									$
									{gigWorkersMockBalances.pendingPayouts.toLocaleString("en-US", {
										minimumFractionDigits: 2,
										maximumFractionDigits: 2,
									})}
								</h2>
								<div className="flex items-center gap-2">
									<span className="text-gray-700 font-medium">
										+$
										{gigWorkersMockBalances.growthAmount.toLocaleString("en-US", {
											minimumFractionDigits: 2,
											maximumFractionDigits: 2,
										})}
									</span>
									<span className="text-gray-700 flex items-center gap-1">
										<span>▲</span>
										<span>{gigWorkersMockBalances.growthPercentage}%</span>
									</span>
								</div>
							</div>
						</>
					) : (
						<>
							{/* Savings View - Real Balance from API */}
							<div className="mb-2">
								<div className="flex items-center justify-between mb-1">
									<p className="text-sm text-gray-500">USDC Balance</p>
									{hasEarnAccount && (
										<button
											onClick={() => fetchBalance()}
											disabled={isLoadingBalance}
											className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
											title="Refresh balance"
										>
											<RefreshCw className={`h-4 w-4 ${isLoadingBalance ? "animate-spin" : ""}`} />
										</button>
									)}
								</div>
								<h2 className="text-6xl font-bold text-gray-950 mb-3">
									{hasEarnAccount ? (
										isLoadingBalance ? (
											<Loader2 className="h-12 w-12 animate-spin text-gray-400 mx-auto" />
										) : (
											`$${earnBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
										)
									) : (
										"$0.00"
									)}
								</h2>
								{hasEarnAccount && !isLoadingBalance && (
									<div className="flex items-center gap-2">
										<span className="text-gray-700 font-medium">
											+$
											{yieldEarned.toLocaleString("en-US", {
												minimumFractionDigits: 2,
												maximumFractionDigits: 2,
											})}
										</span>
										<span className="text-gray-500 text-sm">Yield Earned {apy > 0 && `(${apy.toFixed(2)}% APY)`}</span>
									</div>
								)}
								{balanceError && <p className="text-sm text-red-500 mt-2">⚠️ {balanceError}</p>}
							</div>
						</>
					)}
				</div>

				{/* Pagination Dots */}
				<div className="flex justify-center gap-2 mb-6">
					{cards.map((_, index) => (
						<button
							key={index}
							onClick={() => {
								setCurrentCardIndex(index)
							}}
							className={`h-2 rounded-full transition-all ${
								index === currentCardIndex ? "w-6 bg-gray-950" : "w-2 bg-gray-300"
							}`}
						/>
					))}
				</div>

				{/* Action Buttons - Only for Savings */}
				<div className="px-5 mb-8">
					{isSavingsCard && !hasEarnAccount ? (
						<>
							{/* Start Earning Button - Before Account Created */}
							<button
								onClick={handleStartEarning}
								disabled={isCreatingAccount || isRestoringFromDb}
								className="w-full bg-gray-950 hover:bg-gray-800 text-white py-5 rounded-2xl font-semibold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{isRestoringFromDb
									? "Checking existing account..."
									: isCreatingAccount
										? "Creating Account..."
										: "Start Earning"}
							</button>
							{error && (
								<div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl">
									<p className="text-sm text-red-600">{error}</p>
								</div>
							)}
							<p className="text-center text-sm text-gray-500 mt-3">
								Create a Quirk Earn account to start earning yield on your deposits
							</p>
						</>
					) : (
						isSavingsCard &&
						hasEarnAccount && (
							<div className="flex items-center gap-3">
								<button
									onClick={() => {
										setIsDepositModalOpen(true)
									}}
									className="flex-1 bg-gray-900 hover:bg-gray-800 text-white py-4 rounded-2xl font-medium text-base transition-colors"
								>
									Deposit
								</button>
								<button
									onClick={handleWithdraw}
									disabled={!realBalance || parseFloat(realBalance.balance) <= 0}
									className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-900 py-4 rounded-2xl font-medium text-base transition-colors border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
								>
									Withdraw
								</button>
							</div>
						)
					)}
				</div>

				{/* Transactions - Show for Pending Payouts or for Savings if account created */}
				{(isPayoutsCard || (isSavingsCard && hasEarnAccount)) && (
					<div className="px-5 mb-6">
						<div className="flex items-center justify-between mb-4">
							<h3 className="text-lg font-bold text-gray-950">{isSavingsCard ? "Transactions" : "Gig Earnings"}</h3>
							<button className="text-gray-400 hover:text-gray-600 transition-colors">→</button>
						</div>

						<div className="space-y-0">
							{currentCard.transactions.map((tx) => (
								<div
									key={tx.id}
									className="flex items-center justify-between py-4 hover:bg-gray-50 rounded-2xl px-3 -mx-3 transition-colors border-b border-gray-150 last:border-0"
								>
									<div className="flex items-center gap-3">
										<div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center flex-shrink-0 border border-gray-150">
											<span className="text-2xl">{tx.icon}</span>
										</div>
										<div>
											<p className="text-base font-semibold text-gray-950">{tx.title}</p>
											<p className="text-sm text-gray-500">{tx.timestamp}</p>
										</div>
									</div>
									<div className="text-right">
										<p className={`text-base font-bold ${tx.isPositive ? "text-gray-950" : "text-gray-700"}`}>
											{tx.amount}
										</p>
									</div>
								</div>
							))}
						</div>
					</div>
				)}
			</div>

			{/* Bottom Navigation */}
			<div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
				<div className="max-w-md mx-auto flex items-center justify-around py-4">
					<button className="flex flex-col items-center gap-1 px-6">
						<Home className="w-6 h-6 text-gray-400" />
					</button>
					<button className="flex flex-col items-center gap-1 px-6">
						<TrendingUp className="w-6 h-6 text-gray-400" />
					</button>
					<button className="flex flex-col items-center gap-1 px-6">
						<Wallet className="w-6 h-6 text-gray-900" />
					</button>
				</div>
			</div>

			{/* Deposit Modal */}
			<DepositModal
				isOpen={isDepositModalOpen}
				onClose={() => {
					setIsDepositModalOpen(false)
				}}
				onDeposit={handleDeposit}
				merchantBalance={payoutsBalance}
			/>

			{/* Demo Settings */}
			<DemoSettings />
		</div>
	)
}
