/**
 * Gig Workers Platform Demo Mock Data
 * Simulates gig worker earnings and payouts
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

// Gig worker earnings transactions (Uber, DoorDash, Instacart, etc.)
export const gigWorkerEarningsTransactions: Transaction[] = [
	{
		id: "1",
		icon: "🚗",
		title: "Uber Trip Completed",
		amount: "+$45.50",
		isPositive: true,
		timestamp: "2 hours ago",
	},
	{
		id: "2",
		icon: "🍔",
		title: "DoorDash Delivery",
		amount: "+$28.75",
		isPositive: true,
		timestamp: "Yesterday",
	},
	{
		id: "3",
		icon: "💵",
		title: "Customer Tip",
		amount: "+$12.00",
		isPositive: true,
		timestamp: "Yesterday",
	},
	{
		id: "4",
		icon: "🏃",
		title: "Instacart Order",
		amount: "+$65.30",
		isPositive: true,
		timestamp: "2 days ago",
	},
]

// Quirk Earn savings transactions (deposits, withdrawals)
export const gigWorkersEarnTransactions: Transaction[] = [
	{
		id: "1",
		icon: "📥",
		title: "Deposit",
		amount: "+$1,500",
		isPositive: true,
		timestamp: "3 days ago",
	},
	{
		id: "2",
		icon: "📤",
		title: "Withdraw",
		amount: "-$500",
		isPositive: false,
		timestamp: "1 week ago",
	},
]

// Mock balances
export const gigWorkersMockBalances = {
	pendingPayouts: 5234.15,
	earnBalance: 4567.8,
	accruedInterest: 198.5,
	growthAmount: 287.45,
	growthPercentage: 5.8,
}

// Card configuration
export const gigWorkersCards = [
	{ id: "payouts", title: "Pending Payouts", transactions: gigWorkerEarningsTransactions },
	{ id: "savings", title: "Quirk Earn", transactions: gigWorkersEarnTransactions },
]
