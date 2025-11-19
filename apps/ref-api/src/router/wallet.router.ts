import { initServer } from "@ts-rest/fastify"

import { walletContract } from "@rabbitswap/api-core/contracts/wallet"

import { WalletService } from "@/service/wallet"
import { withLock } from "@/utils/cacheLock"

export function createWalletRouter(
	s: ReturnType<typeof initServer>,
	{ walletService }: { walletService: WalletService },
) {
	return s.router(walletContract, {
		getWalletTransactions: async ({ params: { address } }) => {
			try {
				const cacheKey = `wallet:${address}:transactions`
				const data = await withLock(cacheKey, async () => {
					return walletService.getWalletTransactions(address)
				})
				return {
					status: 200,
					body: {
						result: data,
					},
				}
			} catch (error) {
				return {
					status: 500,
					body: {
						errorCode: "INTERNAL_ERROR",
						message: `Internal server error: ${error}`,
					},
				}
			}
		},
	})
}
