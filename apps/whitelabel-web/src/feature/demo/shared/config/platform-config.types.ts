/**
 * Platform Configuration Types for Demo Apps
 *
 * These types define the interface for platform-specific configurations
 * that power the BaseDemoApp reusable component.
 */

import type { PersonaType } from "../../personas"

/**
 * Transaction data structure
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

/**
 * Card configuration (Merchant/Payouts/Revenue vs Earn)
 */
export interface CardConfig {
	id: string
	title: string
	transactions: Transaction[]
}

/**
 * Mock balance data returned by platform mock data providers
 */
export interface MockBalances {
	// Platform-specific balance (merchantBalance | pendingPayouts | creatorRevenue)
	[key: string]: number

	// Shared balances across all platforms
	earnBalance: number
	accruedInterest: number
	growthAmount: number
	growthPercentage: number
}

/**
 * Complete platform mock data structure
 */
export interface PlatformMockData {
	cards: CardConfig[]
	balances: MockBalances
	platformTransactions: Transaction[]
	earnTransactions: Transaction[]
}

/**
 * Platform configuration interface
 *
 * Each platform (ecommerce, gig-workers, creators) implements this interface
 * to provide platform-specific behavior to the BaseDemoApp component.
 */
export interface PlatformConfig {
	/**
	 * Unique platform identifier
	 */
	platformId: "ecommerce" | "gig-workers" | "creators"

	/**
	 * Human-readable platform name (used in console logs)
	 */
	platformName: string

	/**
	 * Return path after onboarding completion
	 */
	returnPath: string

	/**
	 * UI labels for platform-specific elements
	 */
	labels: {
		/**
		 * Label for platform-specific balance
		 * e.g., "Total value" | "Pending Payouts" | "Creator Revenue"
		 */
		platformBalanceLabel: string

		/**
		 * Title for first card
		 * e.g., "Merchant" | "Payouts" | "Revenue"
		 */
		platformCardTitle: string

		/**
		 * Title for earn card (usually "Quirk Earn")
		 */
		earnCardTitle: string

		/**
		 * Header for platform transactions section
		 * e.g., "Merchant Transactions" | "Gig Earnings" | "Creator Earnings"
		 */
		platformTransactionHeader: string

		/**
		 * Header for earn transactions section (usually "Transactions")
		 */
		earnTransactionHeader: string
	}

	/**
	 * Function to provide mock data for the platform
	 * @param persona - Selected persona (only for ecommerce, null for others)
	 * @returns Platform mock data
	 */
	mockDataProvider: (persona: PersonaType | null) => PlatformMockData

	/**
	 * Key to access platform-specific balance from MockBalances
	 * e.g., "merchantBalance" | "pendingPayouts" | "creatorRevenue"
	 */
	platformBalanceKey: string

	/**
	 * Whether this platform supports persona switching (only ecommerce)
	 */
	supportsPersonas: boolean
}
