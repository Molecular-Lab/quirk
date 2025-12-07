/**
 * Creators Platform Demo Mock Data
 * Simulates creator revenue and earnings
 */

export interface Transaction {
	id: string
	icon: string
	title: string
	subtitle?: string
	amount: string
	isPositive: boolean
	timestamp: string
}

// Creator revenue transactions (Patreon, YouTube, sponsorships, etc.)
export const creatorRevenueTransactions: Transaction[] = [
	{
		id: "1",
		icon: "🎨",
		title: "Patreon Payment",
		amount: "+$500.00",
		isPositive: true,
		timestamp: "2 hours ago",
	},
	{
		id: "2",
		icon: "📹",
		title: "YouTube Revenue",
		amount: "+$1,200.00",
		isPositive: true,
		timestamp: "Yesterday",
	},
	{
		id: "3",
		icon: "💰",
		title: "Brand Sponsorship",
		amount: "+$3,000.00",
		isPositive: true,
		timestamp: "2 days ago",
	},
	{
		id: "4",
		icon: "🎬",
		title: "Course Sales",
		amount: "+$850.00",
		isPositive: true,
		timestamp: "3 days ago",
	},
]

// Quirk Earn savings transactions (deposits, withdrawals)
export const creatorsEarnTransactions: Transaction[] = [
	{
		id: "1",
		icon: "📥",
		title: "Deposit",
		amount: "+$2,500",
		isPositive: true,
		timestamp: "2 days ago",
	},
	{
		id: "2",
		icon: "📤",
		title: "Withdraw",
		amount: "-$800",
		isPositive: false,
		timestamp: "5 days ago",
	},
]

// Mock balances
export const creatorsMockBalances = {
	creatorRevenue: 8742.5,
	earnBalance: 6543.0,
	accruedInterest: 285.0,
	growthAmount: 412.8,
	growthPercentage: 4.96,
}

// Card configuration
export const creatorsCards = [
	{ id: "revenue", title: "Creator Revenue", transactions: creatorRevenueTransactions },
	{ id: "savings", title: "Quirk Earn", transactions: creatorsEarnTransactions },
]
