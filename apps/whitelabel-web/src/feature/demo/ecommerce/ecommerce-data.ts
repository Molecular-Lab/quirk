/**
 * E-commerce Demo Mock Data
 * Simulates merchant transactions and balances
 *
 * Supports persona-specific mock data (Bob/Alice)
 */

import type { PersonaType } from "../personas"

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

// ==========================================
// PERSONA-SPECIFIC MOCK DATA
// ==========================================

/**
 * Bob's Transactions - Conservative investor
 * Smaller amounts, fewer transactions, focus on stability
 */
export const bobMerchantTransactions: Transaction[] = [
	{
		id: "bob_1",
		icon: "🛍️",
		title: "Small Purchase",
		amount: "+$89.99",
		isPositive: true,
		timestamp: "3 hours ago",
	},
	{
		id: "bob_2",
		icon: "💳",
		title: "Payment Received",
		amount: "+$250.00",
		isPositive: true,
		timestamp: "Yesterday",
	},
	{
		id: "bob_3",
		icon: "📦",
		title: "Product Sale",
		amount: "+$120.50",
		isPositive: true,
		timestamp: "2 days ago",
	},
]

export const bobEarnTransactions: Transaction[] = [
	{
		id: "bob_earn_1",
		icon: "📥",
		title: "Initial Deposit",
		amount: "+$500",
		isPositive: true,
		timestamp: "1 week ago",
	},
	{
		id: "bob_earn_2",
		icon: "💰",
		title: "Yield Earned",
		amount: "+$12.50",
		isPositive: true,
		timestamp: "3 days ago",
	},
]

export const bobMockBalances = {
	merchantBalance: 1000.0,
	earnBalance: 512.5,
	accruedInterest: 12.5,
	growthAmount: 12.5,
	growthPercentage: 2.5,
}

/**
 * Alice's Transactions - Active trader
 * Larger amounts, more frequent transactions, growth focus
 */
export const aliceMerchantTransactions: Transaction[] = [
	{
		id: "alice_1",
		icon: "🛍️",
		title: "Enterprise Order",
		amount: "+$1,450.00",
		isPositive: true,
		timestamp: "1 hour ago",
	},
	{
		id: "alice_2",
		icon: "💳",
		title: "Bulk Payment",
		amount: "+$3,200.00",
		isPositive: true,
		timestamp: "Yesterday",
	},
	{
		id: "alice_3",
		icon: "🎯",
		title: "Contract Payment",
		amount: "+$5,000.00",
		isPositive: true,
		timestamp: "2 days ago",
	},
	{
		id: "alice_4",
		icon: "📦",
		title: "Product Bundle Sale",
		amount: "+$899.50",
		isPositive: true,
		timestamp: "3 days ago",
	},
	{
		id: "alice_5",
		icon: "💼",
		title: "Consulting Fee",
		amount: "+$2,500.00",
		isPositive: true,
		timestamp: "4 days ago",
	},
]

export const aliceEarnTransactions: Transaction[] = [
	{
		id: "alice_earn_1",
		icon: "📥",
		title: "Large Deposit",
		amount: "+$3,000",
		isPositive: true,
		timestamp: "1 week ago",
	},
	{
		id: "alice_earn_2",
		icon: "📥",
		title: "Additional Deposit",
		amount: "+$2,000",
		isPositive: true,
		timestamp: "5 days ago",
	},
	{
		id: "alice_earn_3",
		icon: "💰",
		title: "Yield Earned",
		amount: "+$75.00",
		isPositive: true,
		timestamp: "3 days ago",
	},
	{
		id: "alice_earn_4",
		icon: "📤",
		title: "Partial Withdrawal",
		amount: "-$500",
		isPositive: false,
		timestamp: "Yesterday",
	},
]

export const aliceMockBalances = {
	merchantBalance: 5000.0,
	earnBalance: 4575.0,
	accruedInterest: 75.0,
	growthAmount: 75.0,
	growthPercentage: 1.67,
}

/**
 * Get persona-specific mock data
 */
export function getPersonaMockData(persona: PersonaType | null) {
	if (!persona) {
		return {
			merchantTransactions,
			earnTransactions,
			balances: ecommerceMockBalances,
		}
	}

	switch (persona) {
		case "bob":
			return {
				merchantTransactions: bobMerchantTransactions,
				earnTransactions: bobEarnTransactions,
				balances: bobMockBalances,
			}
		case "alice":
			return {
				merchantTransactions: aliceMerchantTransactions,
				earnTransactions: aliceEarnTransactions,
				balances: aliceMockBalances,
			}
		default:
			return {
				merchantTransactions,
				earnTransactions,
				balances: ecommerceMockBalances,
			}
	}
}
