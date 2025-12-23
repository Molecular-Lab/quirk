/**
 * APY Cache Store
 * Caches DeFi protocol APY data for instant client-side calculations
 *
 * Features:
 * - Stores simple APY map: { aave, compound, morpho }
 * - localStorage persistence for offline fallback
 * - Client-side Expected APY calculation (weighted average)
 */

import { create } from "zustand"
import { persist } from "zustand/middleware"

// Simple APY map from GET /defi/apys endpoint
export interface APYMap {
	aave: string
	compound: string
	morpho: string
	timestamp: string
}

export interface Allocation {
	protocol: "aave" | "compound" | "morpho"
	percentage: number
}

interface APYCacheState {
	// Cached APY data (simple map)
	apys: APYMap | null

	// Cache metadata
	lastFetchTimestamp: number | null
	isFetching: boolean
	error: string | null
}

export interface APYCacheStore extends APYCacheState {
	// Data management
	setAPYs: (apys: APYMap) => void

	// Fetch control
	setIsFetching: (isFetching: boolean) => void
	setError: (error: string | null) => void

	// Getters
	getAPY: (protocol: "aave" | "compound" | "morpho") => string
	isCacheStale: () => boolean
	getCacheAgeSeconds: () => number

	// Blended APY calculation
	calculateExpectedAPY: (allocations: Allocation[]) => string

	// Reset
	clearCache: () => void
}

// Constants
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

const initialState: APYCacheState = {
	apys: null,
	lastFetchTimestamp: null,
	isFetching: false,
	error: null,
}

export const useAPYCacheStore = create<APYCacheStore>()(
	persist(
		(set, get) => ({
			...initialState,

			// Set APYs from API response
			setAPYs: (apys) => {
				console.log("[APYCacheStore] Caching APYs:", apys)

				set({
					apys,
					lastFetchTimestamp: Date.now(),
					error: null,
				})
			},

			setIsFetching: (isFetching) => set({ isFetching }),
			setError: (error) => set({ error }),

			// Get APY for single protocol
			getAPY: (protocol) => {
				const apys = get().apys
				if (!apys) return "0"
				return apys[protocol] || "0"
			},

			// Check if cache is stale (older than 5 minutes)
			isCacheStale: () => {
				const { lastFetchTimestamp } = get()
				if (!lastFetchTimestamp) return true
				return Date.now() - lastFetchTimestamp > CACHE_TTL_MS
			},

			// Get cache age in seconds
			getCacheAgeSeconds: () => {
				const { lastFetchTimestamp } = get()
				if (!lastFetchTimestamp) return Infinity
				return Math.floor((Date.now() - lastFetchTimestamp) / 1000)
			},

			// Calculate blended expected APY from allocations
			// Formula: SUM(protocol_APY * allocation_percentage / 100)
			calculateExpectedAPY: (allocations) => {
				const apys = get().apys
				if (!apys) return "0.00"

				let blendedAPY = 0
				for (const alloc of allocations) {
					const protocolAPY = parseFloat(apys[alloc.protocol] || "0")
					blendedAPY += (protocolAPY * alloc.percentage) / 100
				}

				return blendedAPY.toFixed(2)
			},

			// Clear all cached data
			clearCache: () => {
				set(initialState)
				console.log("[APYCacheStore] Cache cleared")
			},
		}),
		{
			name: "proxify-apy-cache",
			// Only persist APYs and timestamp (not transient state)
			partialize: (state) =>
				({
					apys: state.apys,
					lastFetchTimestamp: state.lastFetchTimestamp,
				}) as Partial<APYCacheStore>,
		},
	),
)
