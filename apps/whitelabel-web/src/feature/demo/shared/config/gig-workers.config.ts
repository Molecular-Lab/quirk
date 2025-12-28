/**
 * Gig Workers Platform Configuration
 *
 * Configuration for the gig workers demo platform.
 * Does not support persona switching (uses static mock data).
 */

import type { PlatformConfig, PlatformMockData } from "./platform-config.types"
import {
	gigWorkersCards,
	gigWorkersMockBalances,
	gigWorkerEarningsTransactions,
	gigWorkersEarnTransactions,
} from "../../gig-workers/gig-workers-data"

export const gigWorkersConfig: PlatformConfig = {
	platformId: "gig-workers",
	platformName: "Gig Workers",
	returnPath: "/demo/gig-workers",

	labels: {
		platformBalanceLabel: "Pending Payouts",
		platformCardTitle: "Pending Payouts",
		earnCardTitle: "Quirk Earn",
		platformTransactionHeader: "Gig Earnings",
		earnTransactionHeader: "Transactions",
	},

	platformBalanceKey: "pendingPayouts",
	supportsPersonas: false,

	mockDataProvider: (): PlatformMockData => {
		return {
			cards: gigWorkersCards,
			balances: gigWorkersMockBalances,
			platformTransactions: gigWorkerEarningsTransactions,
			earnTransactions: gigWorkersEarnTransactions,
		}
	},
}
