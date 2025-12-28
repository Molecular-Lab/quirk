/**
 * Creators Platform Configuration
 *
 * Configuration for the creators demo platform.
 * Does not support persona switching (uses static mock data).
 */

import type { PlatformConfig, PlatformMockData } from "./platform-config.types"
import {
	creatorsCards,
	creatorsMockBalances,
	creatorRevenueTransactions,
	creatorsEarnTransactions,
} from "../../creators/creators-data"

export const creatorsConfig: PlatformConfig = {
	platformId: "creators",
	platformName: "Creators",
	returnPath: "/demo/creators",

	labels: {
		platformBalanceLabel: "Creator Revenue",
		platformCardTitle: "Creator Revenue",
		earnCardTitle: "Quirk Earn",
		platformTransactionHeader: "Creator Earnings",
		earnTransactionHeader: "Transactions",
	},

	platformBalanceKey: "creatorRevenue",
	supportsPersonas: false,

	mockDataProvider: (): PlatformMockData => {
		return {
			cards: creatorsCards,
			balances: creatorsMockBalances,
			platformTransactions: creatorRevenueTransactions,
			earnTransactions: creatorsEarnTransactions,
		}
	},
}
