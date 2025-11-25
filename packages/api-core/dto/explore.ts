import { z } from "zod"

import { Address, Hash } from "../entity"

export interface ChartData {
	timestamp: number
	data: number
}

export interface TickData {
	tick: number
	liquidityNet: string
}

export interface PoolData {
	token0: Address
	token1: Address
	feeRate: number
	address: Address
	totalValueLockedUsd: number
	volume24HUsd: number
	fee24HUsd: number
	apr: number
}

export interface ExplorePoolStats {
	totalValueLockedUsd: number
	volume24HUsd: number
	fee24HUsd: number
	totalValueLockedToken0: string
	totalValueLockedToken1: string
	tvlChangePercent: number
	volumeChangePercent: number
}

export type TransactionType = "add" | "remove" | "buy" | "sell" | "collectFee"
export interface PoolTransactionItem {
	timestamp: number // unix
	txHash: Hash
	type: TransactionType
	token0Amount: string
	token1Amount: string
	valueUsd: string
	wallet: Address
}

export const PoolSortBy = z.enum(["totalValueLockedUsd", "volume24HUsd", "fee24HUsd", "apr"]).optional()
export type PoolSortBy = z.infer<typeof PoolSortBy>

export const ProtocolChartTimeframe = z.enum(["D", "W", "M"])
export type ProtocolChartTimeframe = z.infer<typeof ProtocolChartTimeframe>

export const PoolDataTimeframe = z.enum(["H", "D", "W", "M", "Y"])
export type PoolDataTimeframe = z.infer<typeof PoolDataTimeframe>

export const SortDirection = z.enum(["asc", "desc"]).optional()
export type SortDirection = z.infer<typeof SortDirection>

export interface WalletTransactionItem {
	timestamp: number // unix
	txHash: Hash
	type: TransactionType
	token0: Address
	token0Amount: string // wei
	token1: Address
	token1Amount: string // wei
	valueUsd: string
	walletAddress: Address
	poolAddress: Address
}
