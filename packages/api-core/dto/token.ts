import { Address } from "../entity"

export interface GetTokenItem {
	chain: string
	chainId: number
	address: Address
	symbol: string
	name: string
	decimals: number
	iconURL: string
	isStable: boolean
	contractCreatedAt?: number
	createdAt?: string
}

export interface TokenStats {
	address: Address
	price: number | undefined
	change24h: number
	change1h: number
	totalSupply: string | undefined
	volumeUSD?: number
}

export interface GetTokenStatsResponse {
	/**
	 * tokenAddress -> stat
	 */
	tokenStats: Record<string, TokenStats>
}
