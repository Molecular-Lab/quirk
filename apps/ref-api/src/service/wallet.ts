import { getAddress, isAddressEqual, isHash } from "viem"

import { WalletTransactionItem } from "@rabbitswap/api-core/dto"

import { GetPoolTransactionsQuery } from "@/graphql/pools"
import { SubgraphRepository } from "@/repository/graphql"
import { TransactionEventType, parseTransactionType } from "@/utils/transaction"

export class WalletService {
	private readonly subgraphRepo: SubgraphRepository

	constructor(init: { subgraphRepo: SubgraphRepository }) {
		this.subgraphRepo = init.subgraphRepo
	}

	/**
	 * get latest 500 transactions of a wallet on every pool
	 */
	async getWalletTransactions(_walletAddress: string): Promise<WalletTransactionItem[]> {
		const lowerWalletAddress = _walletAddress.toLowerCase()
		const walletAddress = getAddress(_walletAddress)

		try {
			const res = await this.subgraphRepo.execute(GetPoolTransactionsQuery, {
				filter: {
					maker: lowerWalletAddress,
				},
				first: 500,
				orderBy: "timestamp",
				orderDirection: "desc",
			})

			const walletTxs = res.poolTransactions
				.map<WalletTransactionItem | undefined>((res) => {
					const hash = res.id.split("#")[0]
					if (!hash || !isHash(hash)) return undefined
					const x: WalletTransactionItem = {
						timestamp: Number(res.timestamp),
						txHash: hash,
						walletAddress: getAddress(res.maker),
						token0: getAddress(res.token0),
						token0Amount: res.token0Amount,
						token1: getAddress(res.token1),
						token1Amount: res.token1Amount,
						valueUsd: res.amountUSD,
						type: parseTransactionType(TransactionEventType.parse(res.type), Number(res.token0Amount)),
						poolAddress: getAddress(res.pool),
					}
					return x
				})
				.filter((x) => x !== undefined)
				.filter((x) => isAddressEqual(x.walletAddress, walletAddress))

			return walletTxs
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(`Failed to fetch wallet transactions: ${error.message}`)
			}
			throw new Error("Unknown error")
		}
	}
}
