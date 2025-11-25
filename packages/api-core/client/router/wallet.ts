import { coreContract } from "../../contracts"
import { WalletTransactionItem } from "../../dto"
import { Address } from "../../entity"
import { APIError } from "../error"

import { Router } from "./router"

export class WalletRouter extends Router<typeof coreContract> {
	async getWalletTxHistory(walletAddress: Address): Promise<WalletTransactionItem[]> {
		const response = await this.client.wallet.getWalletTransactions({
			params: { address: walletAddress },
		})
		switch (response.status) {
			case 200: {
				return response.body.result
			}
			case 400: {
				throw new APIError(response.status, "Failed to fetch wallet transactions", response.body)
			}
			default: {
				throw new APIError(response.status, "Failed to fetch wallet transactions")
			}
		}
	}
}
