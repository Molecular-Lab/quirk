/**
 * E-commerce Demo Mock Data
 * Simulates merchant transactions and balances
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

// Merchant revenue transactions (sales, payments, etc.)
export const merchantTransactions: Transaction[] = [
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

// Quirk Earn savings transactions (deposits, withdrawals)
export const earnTransactions: Transaction[] = [
	{
		id: "1",
		icon: "📥",
		title: "Deposit",
		amount: "+$3,000",
		isPositive: true,
		timestamp: "2 days ago",
	},
	{
		id: "2",
		icon: "📤",
		title: "Withdraw",
		amount: "-$1,000",
		isPositive: false,
		timestamp: "Yesterday",
	},
]

// Mock balances
export const ecommerceMockBalances = {
	merchantBalance: 12458.32,
	earnBalance: 10821.0,
	accruedInterest: 400.0,
	growthAmount: 543.21,
	growthPercentage: 4.56,
}

// Card configuration
export const ecommerceCards = [
	{ id: "merchant", title: "Merchant", transactions: merchantTransactions },
	{ id: "savings", title: "Quirk Earn", transactions: earnTransactions },
]
