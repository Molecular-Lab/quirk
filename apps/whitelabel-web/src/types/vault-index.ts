/**
 * Vault Index Types
 * Based on PRODUCT_OWNER_FLOW.md - vault_indices table schema
 * Index grows as DeFi protocols generate yield
 */

import type { RiskTier } from "./client"

export interface VaultIndex {
	id: string
	clientId: string
	riskTier: RiskTier
	currentIndex: string // e.g., "1.0523" = 5.23% growth
	apy: string // e.g., "7.3000" = 7.3% APY
	lastUpdated: string
}

export interface IndexHistory {
	timestamp: string
	index: string
	apy: string
}

export interface IndexUpdateEvent {
	clientId: string
	oldIndex: string
	newIndex: string
	growthPercent: number
	timestamp: string
}

/**
 * Index growth metrics
 */
export interface IndexGrowthMetrics {
	currentIndex: number
	previousIndex: number
	dailyGrowth: number
	weeklyGrowth: number
	monthlyGrowth: number
	allTimeGrowth: number
	currentAPY: number
}
