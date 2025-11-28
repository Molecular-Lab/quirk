import { useState } from 'react'
import { Home, TrendingUp, Wallet } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { b2bApiClient } from '@/api/b2bClient'
import { useDemoStore } from '@/store/demoStore'
import { useClientContext } from '@/store/clientContextStore'
import { DepositModal } from './DepositModal'
import { DemoSettings } from './DemoSettings'

interface Transaction {
	id: string
	icon: string
	title: string
	subtitle?: string
	amount: string
	isPositive: boolean
	timestamp: string
}

// Removed unused cards array - now using pure number displays

const revenueTransactions: Transaction[] = [
	{
		id: "1",
		icon: "🛍️",
		title: "Amazon Purchase",
		amount: "+$249.99",
		isPositive: true,
		timestamp: "2 hours ago",
	},
	{
		id: "2",
		icon: "💳",
		title: "Stripe Payment",
		amount: "+$1,450.00",
		isPositive: true,
		timestamp: "Yesterday",
	},
	{
		id: "3",
		icon: "🎯",
		title: "Client Payment",
		amount: "+$3,200.00",
		isPositive: true,
		timestamp: "2 days ago",
	},
	{
		id: "4",
		icon: "📦",
		title: "Product Sale",
		amount: "+$899.50",
		isPositive: true,
		timestamp: "3 days ago",
	},
]

const savingsTransactions: Transaction[] = [
	{
		id: "2",
		icon: "📤",
		title: "Withdraw",
		amount: "-$1,000",
		isPositive: false,
		timestamp: "Yesterday",
	},
	{
		id: "3",
		icon: "📥",
		title: "Deposit",
		amount: "+$3,000",
		isPositive: true,
		timestamp: "2 days ago",
	},
]

export function DemoClientApp() {
	const navigate = useNavigate()
	const [currentCardIndex, setCurrentCardIndex] = useState(0)
	const [isDepositModalOpen, setIsDepositModalOpen] = useState(false)
	const [touchStart, setTouchStart] = useState(0)
	const [touchEnd, setTouchEnd] = useState(0)

	// Get client context (productId, clientId, apiKey)
	const { productId, clientId, apiKey, hasApiKey } = useClientContext()

	// Get demo-specific state from demoStore
	const {
		hasEarnAccount,
		isCreatingAccount,
		endUserId,
		error,
		setIsCreatingAccount,
		setEndUser,
		setError,
		setIsDepositing,
		addDeposit,
	} = useDemoStore()

	// Mock merchant balance (in real app, fetch from API)
	const merchantBalance = 12458.32

	const cards = [
		{ id: 'merchant', title: 'Merchant', transactions: revenueTransactions },
		{ id: 'savings', title: 'Quirk Earn', transactions: savingsTransactions },
	]

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
	const isMerchantCard = currentCard.id === 'merchant'
	const isSavingsCard = currentCard.id === 'savings'

	const handleStartEarning = async () => {
		setIsCreatingAccount(true)
		setError(null)

		try {
			// Check if we have client context
			if (!productId) {
				throw new Error('No product ID configured. Please set up via Demo Settings.')
			}

			if (!hasApiKey()) {
				throw new Error('No API key configured. Please set up via Demo Settings.')
			}

			// Generate a unique client user ID for demo
			const demoUserId = `demo_user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

			console.log('[DemoClientApp] Creating end-user account:', {
				productId,
				clientUserId: demoUserId,
			})

			// Call the API to create end-user account
			const response = await b2bApiClient.createUser({
				clientId: productId, // Note: API parameter is named clientId but expects productId
				clientUserId: demoUserId,
				email: 'demo@example.com', // Optional demo email
			})

			console.log('[DemoClientApp] End-user created successfully:', response)

			// Store the end user ID in demoStore
			if (response && typeof response === 'object' && 'id' in response) {
				setEndUser({
					endUserId: response.id as string,
					endUserClientUserId: demoUserId,
				})
			} else {
				throw new Error('Invalid response from API')
			}
		} catch (err) {
			console.error('[DemoClientApp] Failed to create end-user:', err)
			setError(err instanceof Error ? err.message : 'Failed to create account. Please try again.')
			setIsCreatingAccount(false)
		}
	}

	const handleDeposit = async (amount: number) => {
		if (!endUserId) {
			throw new Error('No end-user account found. Please create an account first.')
		}

		setIsDepositing(true)
		setError(null)

		try {
			console.log('[DemoClientApp] Creating deposit order:', {
				userId: endUserId,
				amount: amount.toString(),
				currency: 'USD',
				chain: 'base',
				token: 'USDC',
			})

			// Call the API to create deposit order
			const response = await b2bApiClient.createDeposit({
				user_id: endUserId,
				amount: amount.toString(),
				currency: 'USD',
				chain: 'base',
				token: 'USDC',
				payment_method: 'proxify_gateway',
			})

			console.log('[DemoClientApp] Deposit order created:', response)

			// Add to deposit history in demoStore
			if (response && typeof response === 'object' && 'orderId' in response) {
				addDeposit({
					orderId: response.orderId as string,
					amount: amount.toString(),
					currency: 'USD',
					status: 'pending',
					createdAt: new Date().toISOString(),
				})
			}

			// Success - modal will show success UI
		} catch (err) {
			console.error('[DemoClientApp] Failed to create deposit:', err)
			setError(err instanceof Error ? err.message : 'Failed to create deposit. Please try again.')
		} finally {
			setIsDepositing(false)
		}
	}

	return (
		<div className="min-h-screen bg-white">
			{/* Main Content */}
			<div className="max-w-md mx-auto bg-white min-h-screen pb-20">
				{/* Header */}
				<div className="px-5 pt-8 pb-5">
					<div className="flex items-center justify-between">
						<h1 className="text-2xl font-bold text-gray-900">{currentCard.title}</h1>
						<button className="p-2">
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
					{isMerchantCard ? (
						<>
							{/* Merchant View - Pure Numbers */}
							<div className="mb-2">
								<p className="text-sm text-gray-500 mb-1">Total value</p>
								<h2 className="text-6xl font-bold text-gray-900 mb-3">$12,458.32</h2>
								<div className="flex items-center gap-2">
									<span className="text-green-600 font-medium">+$543.21</span>
									<span className="text-green-600 flex items-center gap-1">
										<span>▲</span>
										<span>4.56%</span>
									</span>
								</div>
							</div>
						</>
					) : (
						<>
							{/* Savings View - Pure Numbers */}
							<div className="mb-2">
								<p className="text-sm text-gray-500 mb-1">USDC Balance</p>
								<h2 className="text-6xl font-bold text-gray-900 mb-3">
									{hasEarnAccount ? '$10,821.00' : '$0.00'}
								</h2>
								{hasEarnAccount && (
									<div className="flex items-center gap-2">
										<span className="text-green-600 font-medium">+$400.00</span>
										<span className="text-gray-500 text-sm">Accrued Interest</span>
									</div>
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
							onClick={() => setCurrentCardIndex(index)}
							className={`h-2 rounded-full transition-all ${
								index === currentCardIndex ? 'w-6 bg-gray-900' : 'w-2 bg-gray-300'
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
								className="w-full bg-gray-900 hover:bg-gray-800 text-white py-5 rounded-2xl font-semibold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{isCreatingAccount ? 'Creating Account...' : 'Start Earning'}
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
									onClick={() => setIsDepositModalOpen(true)}
									className="flex-1 bg-gray-900 hover:bg-gray-800 text-white py-4 rounded-2xl font-medium text-base transition-colors"
								>
									Deposit
								</button>
								<button className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-900 py-4 rounded-2xl font-medium text-base transition-colors border border-gray-200">
									Withdraw
								</button>
							</div>
						)
					)}
				</div>

				{/* Transactions - Show for Merchant or for Savings if account created */}
				{(isMerchantCard || (isSavingsCard && hasEarnAccount)) && (
					<div className="px-5 mb-6">
						<div className="flex items-center justify-between mb-4">
							<h3 className="text-lg font-bold text-gray-900">
								{isSavingsCard ? 'Transactions' : 'Merchant Transactions'}
							</h3>
							<button className="text-gray-400 hover:text-gray-600 transition-colors">→</button>
						</div>

						<div className="space-y-0">
							{currentCard.transactions.map((tx) => (
								<div
									key={tx.id}
									className="flex items-center justify-between py-4 hover:bg-gray-50 rounded-2xl px-3 -mx-3 transition-colors border-b border-gray-100 last:border-0"
								>
									<div className="flex items-center gap-3">
										<div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center flex-shrink-0 border border-gray-100">
											<span className="text-2xl">{tx.icon}</span>
										</div>
										<div>
											<p className="text-base font-semibold text-gray-900">{tx.title}</p>
											<p className="text-sm text-gray-500">{tx.timestamp}</p>
										</div>
									</div>
									<div className="text-right">
										<p className={`text-base font-bold ${tx.isPositive ? 'text-green-600' : 'text-gray-900'}`}>
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
				onClose={() => setIsDepositModalOpen(false)}
				onDeposit={handleDeposit}
				merchantBalance={merchantBalance}
			/>

			{/* Demo Settings */}
			<DemoSettings />
		</div>
	)
}
