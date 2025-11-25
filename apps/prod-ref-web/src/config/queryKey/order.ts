import { Address } from "viem"

export const OrderQueryKeys = {
	orderById: (orderId: string) => ["order", orderId],
	ordersByWallet: (walletAddress: Address | undefined) => ["orders", "wallet-address", walletAddress],
} as const
