import { useState, useEffect } from "react"

import { Home, Loader2, RefreshCw, TrendingUp, Wallet } from "lucide-react"

import { createFiatDeposit, createUser, getUserBalance, getUserByClientUserId, createWithdrawal } from "@/api/b2bClientHelpers"
import { LandingNavbar } from "@/feature/landing/LandingNavbar"
import { useClientContextStore } from "@/store/clientContextStore"
import { useDemoStore } from "@/store/demoStore"

import { DemoSettings } from "../shared/DemoSettings"
import { DepositModal } from "../shared/DepositModal"

import { creatorsCards, creatorsMockBalances } from "./creators-data"

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

export function CreatorsDemoApp() {
	const [currentCardIndex, setCurrentCardIndex] = useState(0)
	const [isDepositModalOpen, setIsDepositModalOpen] = useState(false)
	const [touchStart, setTouchStart] = useState(0)
	const [touchEnd, setTouchEnd] = useState(0)

	// Real balance state
	const [realBalance, setRealBalance] = useState<UserBalance | null>(null)
	const [isLoadingBalance, setIsLoadingBalance] = useState(false)
	const [balanceError, setBalanceError] = useState<string | null>(null)

	// Get client context (productId, clientId, apiKey)
	const { productId, clientId, hasApiKey } = useClientContextStore()

	// Get demo-specific state from demoStore
	const {
		hasEarnAccount,
		isCreatingAccount,
		endUserId,
		error,
		selectedEnvironment,
		setIsCreatingAccount,
		setEndUser,
		setError,
		setIsDepositing,
		addDeposit,
		getPersonaUserId,
	} = useDemoStore()

	// Function to fetch balance
	const fetchBalance = async () => {
		if (!endUserId || !hasEarnAccount) {
			setRealBalance(null)
			return
		}

		setIsLoadingBalance(true)
		setBalanceError(null)

		try {
			console.log("[CreatorsDemoApp] Fetching real balance for user:", endUserId, "environment:", selectedEnvironment)
			const response = await getUserBalance(endUserId, { environment: selectedEnvironment })

			if (response.found && response.data) {
				console.log("[CreatorsDemoApp] Real balance fetched:", response.data)
				setRealBalance(response.data)
			} else {
				console.warn("[CreatorsDemoApp] Balance not found for user:", endUserId)
				setBalanceError("Balance not found")
			}
		} catch (err) {
			console.error("[CreatorsDemoApp] Failed to fetch balance:", err)
			setBalanceError(err instanceof Error ? err.message : "Failed to load balance")
		} finally {
			setIsLoadingBalance(false)
		}
	}

	// Fetch real balance when endUserId exists or environment changes
	useEffect(() => {
		fetchBalance()
	}, [endUserId, hasEarnAccount, selectedEnvironment])

	// Check for existing user on mount (sync local state with backend)
	useEffect(() => {
		const checkExistingUser = async () => {
			// Skip if already have an account loaded or no clientId
			if (hasEarnAccount || !clientId) return

			// Get persona's deterministic userId
			const personaUserId = getPersonaUserId()
			if (!personaUserId) return

			try {
				console.log("[CreatorsDemoApp] Checking for existing user:", personaUserId)
				const user = await getUserByClientUserId(clientId, personaUserId)
				if (user) {
					// User exists in backend - sync to local state
					setEndUser({
						endUserId: user.id,
						endUserClientUserId: personaUserId,
					})
					console.log("[CreatorsDemoApp] Found existing user:", user.id)
				}
			} catch (err) {
				// Non-blocking - user can still create new account
				console.warn("[CreatorsDemoApp] Failed to check for existing user:", err)
			}
		}

		checkExistingUser()
	}, [clientId, hasEarnAccount, selectedEnvironment, getPersonaUserId, setEndUser])

	// Use real balance if available, otherwise use mock
	const earnBalance = realBalance ? parseFloat(realBalance.balance) : creatorsMockBalances.earnBalance
	const yieldEarned = realBalance ? parseFloat(realBalance.yield_earned) : creatorsMockBalances.accruedInterest
	const apy = realBalance ? parseFloat(realBalance.apy) : 0

	// Mock creator revenue balance (from config) - keep this as mock for now
	const creatorBalance = creatorsMockBalances.creatorRevenue

	const cards = creatorsCards

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
	const isRevenueCard = currentCard.id === "revenue"
	const isSavingsCard = currentCard.id === "savings"

	const handleStartEarning = async () => {
		setIsCreatingAccount(true)
		setError(null)

		try {
			// Check if we have client context
			if (!productId) {
				throw new Error("No product ID configured. Please set up via Demo Settings.")
			}

			if (!hasApiKey()) {
				throw new Error("No API key configured. Please set up via Demo Settings.")
			}

			// Get persona's client user ID (product-scoped) or generate random
			const personaUserId = getPersonaUserId()
			const demoUserId = personaUserId || `demo_user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

			console.log("[DemoClientApp] Creating end-user account:", {
				productId,
				clientUserId: demoUserId,
				isPersona: !!personaUserId,
			})

			// Call the API to create end-user account with pending_onboarding status
			const response = await createUser(productId, {
				clientUserId: demoUserId,
				email: "demo@example.com", // Optional demo email
				status: "pending_onboarding", // ✅ User needs to complete onboarding first
			})

			console.log("[DemoClientApp] End-user created successfully:", response)

			// Store the end user ID in demoStore
			if (response && typeof response === "object" && "id" in response && "clientId" in response) {
				setEndUser({
					endUserId: response.id,
					endUserClientUserId: demoUserId,
				})

				// ✅ Redirect to onboarding flow (include productId for fetching strategies)
				window.location.href = `/onboarding/${demoUserId}?userId=${response.id}&clientId=${response.clientId}&productId=${productId}&returnPath=/demo`
			} else {
				throw new Error("Invalid response from API")
			}
		} catch (err) {
			console.error("[DemoClientApp] Failed to create end-user:", err)
			setError(err instanceof Error ? err.message : "Failed to create account. Please try again.")
			setIsCreatingAccount(false)
		}
	}

	const handleDeposit = async (amount: number) => {
		if (!endUserId) {
			throw new Error("No end-user account found. Please create an account first.")
		}

		setIsDepositing(true)
		setError(null)

		try {
			console.log("[DemoClientApp] Creating deposit order:", {
				userId: endUserId,
				amount: amount.toString(),
				currency: "USD",
				tokenSymbol: "USDC",
			})

			// Call the API to create deposit order
			const response = await createFiatDeposit({
				userId: endUserId,
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
				console.log("[CreatorsDemoApp] Deposit successful, refreshing balance...")
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
			console.log("[CreatorsDemoApp] Creating withdrawal:", {
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

			console.log("[CreatorsDemoApp] Withdrawal successful:", response)

			// Refetch balance after successful withdrawal
			setTimeout(() => {
				fetchBalance()
			}, 1000)

			// Show success message
			alert(`✅ Withdrawal of ${amount.toFixed(2)} initiated successfully!`)
		} catch (err) {
			console.error("[CreatorsDemoApp] Failed to create withdrawal:", err)
			setError(err instanceof Error ? err.message : "Failed to create withdrawal. Please try again.")
		} finally {
			setIsDepositing(false)
		}
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
					{isRevenueCard ? (
						<>
							{/* Creator Revenue View - Pure Numbers */}
							<div className="mb-2">
								<p className="text-sm text-gray-500 mb-1">Creator Revenue</p>
								<h2 className="text-6xl font-bold text-gray-950 mb-3">
									$
									{creatorsMockBalances.creatorRevenue.toLocaleString("en-US", {
										minimumFractionDigits: 2,
										maximumFractionDigits: 2,
									})}
								</h2>
								<div className="flex items-center gap-2">
									<span className="text-gray-700 font-medium">
										+$
										{creatorsMockBalances.growthAmount.toLocaleString("en-US", {
											minimumFractionDigits: 2,
											maximumFractionDigits: 2,
										})}
									</span>
									<span className="text-gray-700 flex items-center gap-1">
										<span>▲</span>
										<span>{creatorsMockBalances.growthPercentage}%</span>
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
									{hasEarnAccount
										? isLoadingBalance
											? <Loader2 className="h-12 w-12 animate-spin text-gray-400 mx-auto" />
											: `$${earnBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
										: "$0.00"}
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
										<span className="text-gray-500 text-sm">
											Yield Earned {apy > 0 && `(${apy.toFixed(2)}% APY)`}
										</span>
									</div>
								)}
								{balanceError && (
									<p className="text-sm text-red-500 mt-2">⚠️ {balanceError}</p>
								)}
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
								disabled={isCreatingAccount}
								className="w-full bg-gray-950 hover:bg-gray-800 text-white py-5 rounded-2xl font-semibold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{isCreatingAccount ? "Creating Account..." : "Start Earning"}
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

				{/* Transactions - Show for Creator Revenue or for Savings if account created */}
				{(isRevenueCard || (isSavingsCard && hasEarnAccount)) && (
					<div className="px-5 mb-6">
						<div className="flex items-center justify-between mb-4">
							<h3 className="text-lg font-bold text-gray-950">{isSavingsCard ? "Transactions" : "Creator Earnings"}</h3>
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
				merchantBalance={creatorBalance}
			/>

			{/* Demo Settings */}
			<DemoSettings />
		</div>
	)
}
