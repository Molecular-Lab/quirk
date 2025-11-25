import { initContract } from "@ts-rest/core"

import { APIResponse, ErrorResponse, WalletTransactionItem } from "../dto"

const c = initContract()
export const walletContract = c.router({
	getWalletTransactions: {
		summary: "Get latest 500 wallet transactions",
		method: "GET",
		path: "/wallet/:address/transactions",
		responses: {
			200: c.type<APIResponse<WalletTransactionItem[]>>(),
			400: c.type<ErrorResponse>(),
		},
	},
})
