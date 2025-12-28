/**
 * E-commerce Platform Configuration
 *
 * Configuration for the e-commerce demo platform.
 * Supports persona-specific mock data (Bob/Alice).
 */

import type { PlatformConfig, PlatformMockData } from "./platform-config.types"
import { ecommerceCards, getPersonaMockData } from "../../ecommerce/ecommerce-data"

export const ecommerceConfig: PlatformConfig = {
	platformId: "ecommerce",
	platformName: "E-commerce",
	returnPath: "/demo/ecommerce",

	labels: {
		platformBalanceLabel: "Total value",
		platformCardTitle: "Merchant",
		earnCardTitle: "Quirk Earn",
		platformTransactionHeader: "Merchant Transactions",
		earnTransactionHeader: "Transactions",
	},

	platformBalanceKey: "merchantBalance",
	supportsPersonas: true,

	mockDataProvider: (persona): PlatformMockData => {
		const mockData = getPersonaMockData(persona)
		return {
			cards: ecommerceCards,
			balances: mockData.balances,
			platformTransactions: mockData.merchantTransactions,
			earnTransactions: mockData.earnTransactions,
		}
	},
}
