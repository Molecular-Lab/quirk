import { Address } from "viem"

export interface ArkenTokenStatRequest {
	chain: string
	tokens: Address[]
	requirePrice: boolean
}

export interface ArkenTokenStatResponseItem {
	token: {
		address: Address
		chain: string
	}
	open24h: number
	close24h: number
	high24h: number
	low24h: number
	change24h: number
	transaction24h: number
	volumeUsd: number
	volumeUSD: number
	price: number
	totalLiquidity: number
	circulatingSupply: number
	totalSupply: number
	marketCap: number
	updatedAt: number
}
