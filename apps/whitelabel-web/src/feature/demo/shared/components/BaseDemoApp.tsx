/**
 * BaseDemoApp - Reusable Demo Platform Component
 *
 * A unified component that powers all demo platforms (ecommerce, gig-workers, creators).
 * Consolidates ~1,950 lines of duplicated code into a single, parameterized component.
 *
 * Platform-specific behavior is controlled via the PlatformConfig prop.
 */

import { useEffect, useMemo, useState } from "react"

import { useNavigate } from "@tanstack/react-router"
import { Home, Loader2, RefreshCw, TrendingUp, Wallet } from "lucide-react"

import { NETWORK_CONFIG } from "@quirk/core/constants"

import { createFiatDeposit, createUser, createWithdrawal, getUserByClientUserId } from "@/api/b2bClientHelpers"
import { LandingNavbar } from "@/feature/landing/LandingNavbar"
import { useClientContextStore } from "@/store/clientContextStore"
import { useDemoProductStore } from "@/store/demoProductStore"
import { useDemoStore, useHydrated } from "@/store/demoStore"
import { useEnvironmentStore } from "@/store/environmentStore"

import { DemoSettings } from "../DemoSettings"
import { DepositModal } from "../DepositModal"
import { WithdrawModal } from "../WithdrawModal"
import { useDemoBalance } from "../hooks/useDemoBalance"

import { SetupWizardModal } from "./SetupWizardModal"

import type { PlatformConfig } from "../config/platform-config.types"

interface BaseDemoAppProps {
	config: PlatformConfig
}

export function BaseDemoApp({ config }: BaseDemoAppProps) {
	// CRITICAL: Check if Zustand has finished hydrating from localStorage
	const hasHydrated = useHydrated()
	const navigate = useNavigate()

	const [currentCardIndex, setCurrentCardIndex] = useState(0)
	const [isDepositModalOpen, setIsDepositModalOpen] = useState(false)
	const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false)
	const [touchStart, setTouchStart] = useState(0)
	const [touchEnd, setTouchEnd] = useState(0)

	// Get Privy user for logging

	// Get client context (productId, clientId, apiKey)
	const { productId, clientId, hasApiKey } = useClientContextStore()

	// Get selected product info
	const { hasSelectedProduct } = useDemoProductStore()

	// Get environment config for vaultId construction
	const { getConfig } = useEnvironmentStore()
	const networkConfig = getConfig()

	// Get demo-specific state from demoStore
	const {
		hasEarnAccount,
		isCreatingAccount,
		endUserId,
		endUserClientUserId,
		error,
		selectedEnvironment,
		setIsCreatingAccount,
		setEndUser,
		setError,
		setIsDepositing,
		addDeposit,
		selectedPersona,
		personaData,
		setupWizardOpen,
		openSetupWizard,
		closeSetupWizard,
	} = useDemoStore()

	// Use custom hook for balance fetching
	const { realBalance, isLoadingBalance, balanceError, refetchBalance } = useDemoBalance({
		endUserClientUserId,
		hasEarnAccount,
		selectedEnvironment,
		platformName: config.platformName,
	})

	// Check if existing user is already active (e.g., returning from onboarding)
	useEffect(() => {
		// Wait for hydration
		if (!hasHydrated) {
			console.log(`[${config.platformName} Demo] ⏳ Waiting for Zustand hydration...`)
			return
		}

		// Skip if already activated or no clientId
		if (hasEarnAccount || !clientId || !endUserId || !endUserClientUserId) {
			return
		}

		const checkUserActivationStatus = async () => {
			try {
				const user = await getUserByClientUserId(clientId, endUserClientUserId)
				if (user?.status === "active") {
					console.log(`[${config.platformName} Demo] ✅ User is already active, activating account`)
					useDemoStore.getState().activateEarnAccount()
				}
			} catch (err) {
				console.warn(`[${config.platformName} Demo] Failed to check user status:`, err)
			}
		}

		checkUserActivationStatus()
	}, [hasHydrated, clientId, hasEarnAccount, endUserId, endUserClientUserId, config.platformName])

	// NEW ARCHITECTURE: Show wizard if setup incomplete
	useEffect(() => {
		// Wait for hydration
		if (!hasHydrated) {
			console.log(`[${config.platformName} Demo] ⏳ Waiting for hydration before checking setup`)
			return
		}

		// Check if wizard should be shown
		const shouldShowWizard = () => {
			// Missing environment selection
			if (!selectedEnvironment) {
				console.log(`[${config.platformName} Demo] 🌍 No environment selected`)
				return true
			}

			// Missing product selection
			if (!hasSelectedProduct()) {
				console.log(`[${config.platformName} Demo] 📦 No product selected`)
				return true
			}

			// Missing persona selection
			const hasClientUserId = endUserClientUserId || personaData?.clientUserId
			if (!selectedPersona && !hasClientUserId) {
				console.log(`[${config.platformName} Demo] 👤 No persona selected`)
				return true
			}

			return false
		}

		if (shouldShowWizard()) {
			console.log(`[${config.platformName} Demo] 🧙 Opening setup wizard`)
			openSetupWizard()
		} else {
			console.log(`[${config.platformName} Demo] ✅ Setup complete, showing demo UI`)
		}
	}, [
		hasHydrated,
		selectedEnvironment,
		hasSelectedProduct,
		selectedPersona,
		endUserClientUserId,
		personaData,
		config.platformName,
		openSetupWizard,
	])

	// Get platform mock data
	const mockData = useMemo(() => {
		if (config.supportsPersonas) {
			return config.mockDataProvider(selectedPersona)
		}
		return config.mockDataProvider(null)
	}, [config, selectedPersona])

	// Extract platform-specific balance
	const platformBalance = mockData.balances[config.platformBalanceKey]

	// Use real balance if available, otherwise use mock
	const earnBalance = realBalance ? parseFloat(realBalance.balance) : mockData.balances.earnBalance
	const yieldEarned = realBalance ? parseFloat(realBalance.yield_earned) : mockData.balances.accruedInterest
	const apy = realBalance ? parseFloat(realBalance.apy) : 0

	// Use platform-specific cards
	const cards = mockData.cards

	// Touch gesture handlers
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
	const isPlatformCard = currentCard.id === cards[0].id // First card is platform-specific
	const isSavingsCard = currentCard.id === "savings"

	const handleStartEarning = async () => {
		console.log(`[${config.platformName} Demo] 🚀 handleStartEarning() called:`, {
			endUserId,
			endUserClientUserId,
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

			// ✅ RESILIENT FIX: Check endUserClientUserId OR derive from personaData
			// This handles the race condition where setPersona() resets endUserClientUserId to null
			// but sets personaData.clientUserId at the same time
			const clientUserId = endUserClientUserId || personaData?.id

			if (!clientUserId) {
				throw new Error("No end-user client user ID set. Please select a persona.")
			}

			if (!clientId) {
				throw new Error("No client ID found. Please check product configuration.")
			}

			// ✅ STEP 1: Check if user exists with this Static Key
			console.log(`[${config.platformName} Demo] 🔄 Checking for existing user with Static Key:`, clientUserId)
			let user = await getUserByClientUserId(clientId, clientUserId)

			// ✅ STEP 2: Create user ONLY if doesn't exist
			if (!user) {
				console.log(`[${config.platformName} Demo] 🆕 User not found, creating new user with Static Key...`)

				const createResponse = await createUser(productId, {
					clientUserId: clientUserId, // Use Static Key as clientUserId
					email: "demo@example.com",
					status: "pending_onboarding",
				})

				console.log(`[${config.platformName} Demo] ✅ New user created:`, createResponse)

				// Fetch the created user to get full details
				user = await getUserByClientUserId(clientId, clientUserId)

				if (!user) {
					throw new Error("Failed to verify user creation")
				}
			} else {
				console.log(`[${config.platformName} Demo] ✅ Existing user found:`, {
					userId: user.id,
					status: user.status,
					clientUserId: user.clientUserId,
				})
			}

			// ✅ STEP 3: Sync demoStore with backend user ID
			if (!endUserId || endUserId !== user.id) {
				console.log(`[${config.platformName} Demo] 🔄 Syncing endUserId to demoStore...`)
				setEndUser({
					endUserId: user.id,
					endUserClientUserId: user.clientUserId,
				})
			}

			// ✅ STEP 4: Handle based on user status
			if (user.status === "pending_onboarding") {
				// User needs to complete onboarding
				console.log(`[${config.platformName} Demo] ➡️ User needs onboarding, redirecting...`)
				navigate({
					to: "/onboarding/$clientUserId",
					params: { clientUserId: clientUserId },
					search: {
						userId: user.id,
						clientId: clientId,
						productId: productId,
						returnPath: config.returnPath, // Platform-specific return path
					},
				})
			} else if (user.status === "active") {
				// User already completed onboarding
				console.log(`[${config.platformName} Demo] ✅ User is already active, activating earn account...`)
				useDemoStore.getState().activateEarnAccount()
				setIsCreatingAccount(false) // Hide loading state, show balance
			} else {
				throw new Error(`Invalid user status: ${user.status}`)
			}
		} catch (err) {
			console.error(`[${config.platformName} Demo] ❌ Failed to handle user:`, err)
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
			console.log(`[${config.platformName} Demo] Creating deposit order:`, {
				userId: endUserClientUserId,
				amount: amount.toString(),
				currency: "USD",
				tokenSymbol: "USDC",
			})

			// Call the API to create deposit order
			const response = await createFiatDeposit({
				userId: endUserClientUserId,
				amount: amount.toString(),
				currency: "USD",
				tokenSymbol: "USDC",
				environment: selectedEnvironment,
			})

			console.log(`[${config.platformName} Demo] Deposit order created:`, response)

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
				console.log(`[${config.platformName} Demo] Deposit successful, refreshing balance...`)
				setTimeout(() => {
					refetchBalance()
				}, 1000) // Wait 1s for backend to process
			}

			// Success - modal will show success UI
		} catch (err) {
			console.error(`[${config.platformName} Demo] Failed to create deposit:`, err)
			setError(err instanceof Error ? err.message : "Failed to create deposit. Please try again.")
		} finally {
			setIsDepositing(false)
		}
	}

	const handleWithdraw = () => {
		if (!endUserId || !endUserClientUserId) {
			setError("No end-user account found. Please create an account first.")
			return
		}

		// Get current balance
		const currentBalance = realBalance ? parseFloat(realBalance.balance) : 0
		if (currentBalance <= 0) {
			setError("Insufficient balance for withdrawal.")
			return
		}

		// Open withdraw modal
		setIsWithdrawModalOpen(true)
	}

	const handleWithdrawSubmit = async (amount: number) => {
		if (!endUserClientUserId) {
			throw new Error("No end-user account found. Please create an account first.")
		}

		setIsDepositing(true) // Reuse deposit loading state
		setError(null)

		try {
			// Determine vaultId based on environment using network config
			// Format: "chainId-tokenAddress"
			const chainId = networkConfig.chainId
			const usdcAddress = NETWORK_CONFIG[networkConfig.networkKey].token.usdc?.address
			
			if (!usdcAddress) {
				throw new Error(`USDC address not configured for ${networkConfig.name}`)
			}
			
			const vaultId = `${chainId}-${usdcAddress}`

			console.log(`[${config.platformName} Demo] Creating withdrawal:`, {
				userId: endUserClientUserId,
				amount: amount.toString(),
				vaultId,
				chainId,
				network: networkConfig.name,
				environment: selectedEnvironment,
			})

			// Call the API to create withdrawal
			const response = await createWithdrawal({
				userId: endUserClientUserId,
				amount: amount.toString(),
				vaultId,
				withdrawal_method: "fiat_to_client",
				destination_currency: "USD",
				environment: selectedEnvironment,
			})

			console.log(`[${config.platformName} Demo] Withdrawal created successfully:`, {
				withdrawalId: (response as any)?.id,
				orderId: (response as any)?.orderId,
				status: (response as any)?.status,
				amount: (response as any)?.requestedAmount,
				environment: selectedEnvironment,
			})

			// Refetch balance after successful withdrawal
			setTimeout(() => {
				refetchBalance()
			}, 1000)
		} catch (err) {
			console.error(`[${config.platformName} Demo] Failed to create withdrawal:`, err)
			
			// Extract detailed error message
			let errorMessage = "Failed to create withdrawal. Please try again."
			if (err instanceof Error) {
				errorMessage = err.message
			} else if (typeof err === "object" && err !== null && "body" in err) {
				const errorBody = err.body as any
				errorMessage = errorBody?.error || errorMessage
			}
			
			console.error(`[${config.platformName} Demo] Detailed error:`, errorMessage)
			setError(errorMessage)
			throw new Error(errorMessage)
		} finally {
			setIsDepositing(false)
		}
	}

	// Wizard Handler
	const handleWizardComplete = () => {
		console.log(`[${config.platformName} Demo] ✅ Wizard completed`)
		closeSetupWizard()
	}

	// Show loading state while Zustand is hydrating (prevents reading empty state)
	if (!hasHydrated) {
		console.log(`[${config.platformName} Demo] ⏳ Waiting for hydration...`, {
			hasHydrated,
			timestamp: new Date().toISOString(),
		})

		return (
			<div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-white flex items-center justify-center">
				<div className="text-center">
					<Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-accent" />
					<p className="text-gray-600">Loading demo...</p>
					<p className="text-xs text-gray-400 mt-2">Waiting for state hydration...</p>
				</div>
			</div>
		)
	}

	console.log(`[${config.platformName} Demo] ✅ Hydration complete, rendering demo`, {
		hasHydrated,
		selectedEnvironment,
		hasSelectedProduct: hasSelectedProduct(),
		selectedPersona,
	})

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
					{/* Balance Display */}
					{isPlatformCard ? (
						<>
							{/* Platform-Specific View (Merchant/Payouts/Revenue) */}
							<div className="mb-2">
								<p className="text-sm text-gray-500 mb-1">{config.labels.platformBalanceLabel}</p>
								<h2 className="text-6xl font-bold text-gray-950 mb-3">
									$
									{platformBalance.toLocaleString("en-US", {
										minimumFractionDigits: 2,
										maximumFractionDigits: 2,
									})}
								</h2>
								<div className="flex items-center gap-2">
									<span className="text-gray-700 font-medium">
										+$
										{mockData.balances.growthAmount.toLocaleString("en-US", {
											minimumFractionDigits: 2,
											maximumFractionDigits: 2,
										})}
									</span>
									<span className="text-gray-700 flex items-center gap-1">
										<span>▲</span>
										<span>{mockData.balances.growthPercentage}%</span>
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
											onClick={() => refetchBalance()}
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

				{/* Transactions - Show for Platform card or for Savings if account created */}
				{(isPlatformCard || (isSavingsCard && hasEarnAccount)) && (
					<div className="px-5 mb-6">
						<div className="flex items-center justify-between mb-4">
							<h3 className="text-lg font-bold text-gray-950">
								{isSavingsCard ? config.labels.earnTransactionHeader : config.labels.platformTransactionHeader}
							</h3>
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
				merchantBalance={platformBalance}
			/>

			{/* Withdraw Modal */}
			<WithdrawModal
				isOpen={isWithdrawModalOpen}
				onClose={() => {
					setIsWithdrawModalOpen(false)
				}}
				onWithdraw={handleWithdrawSubmit}
				currentBalance={realBalance ? parseFloat(realBalance.balance) : 0}
			/>

			{/* Demo Settings */}
			<DemoSettings />

			{/* Setup Wizard Modal */}
			<SetupWizardModal open={setupWizardOpen} onComplete={handleWizardComplete} />
		</div>
	)
}
