import { Address } from "@rabbitswap/api-core/entity"

export const WalletQueryKeys = {
	domains: (walletAddress: Address | undefined) => ["domains", walletAddress],
	txHistory: (walletAddress: Address | undefined) => ["tx-history", walletAddress],
	limitOrderTxHistory: (walletAddress: Address | undefined) => ["limit-order-tx-history", walletAddress],
} as const
