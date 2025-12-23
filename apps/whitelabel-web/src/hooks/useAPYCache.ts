/**
 * APY Cache Hook
 * Fetches APY data once and syncs to Zustand cache
 *
 * Features:
 * - Initial fetch on mount if cache is stale
 * - 5-minute auto-refresh in background
 * - Calls lightweight GET /defi/apys endpoint
 * - Returns cached data for instant access
 */

import { useEffect, useCallback, useRef } from "react"
import axios from "axios"
import { useAPYCacheStore, type APYMap } from "@/store/apyCacheStore"

const API_BASE_URL = import.meta.env.VITE_API_URL
const AUTO_REFRESH_INTERVAL_MS = 5 * 60 * 1000 // 5 minutes

export function useAPYCache(token = "USDC", chainId = 8453) {
	const {
		apys,
		isFetching,
		error,
		lastFetchTimestamp,
		isCacheStale,
		getCacheAgeSeconds,
		setAPYs,
		setIsFetching,
		setError,
	} = useAPYCacheStore()

	// Track interval ID for cleanup
	const intervalRef = useRef<NodeJS.Timeout | null>(null)

	// Fetch function - calls lightweight /defi/apys endpoint
	const fetchAPYs = useCallback(async () => {
		// Prevent duplicate fetches
		if (useAPYCacheStore.getState().isFetching) {
			console.log("[useAPYCache] Fetch already in progress, skipping")
			return
		}

		setIsFetching(true)
		setError(null)

		try {
			console.log("[useAPYCache] Fetching APYs from /defi/apys...")

			const response = await axios.get<APYMap>(`${API_BASE_URL}/defi/apys`, {
				params: { token, chainId: chainId.toString() },
			})

			setAPYs(response.data)
			console.log("[useAPYCache] APYs cached successfully:", response.data)
		} catch (err) {
			console.error("[useAPYCache] Failed to fetch APYs:", err)
			setError(err instanceof Error ? err.message : "Failed to fetch APYs")
		} finally {
			setIsFetching(false)
		}
	}, [token, chainId, setAPYs, setIsFetching, setError])

	// Initial fetch + auto-refresh setup
	useEffect(() => {
		// Fetch on mount if cache is stale or empty
		if (isCacheStale() || !apys) {
			console.log("[useAPYCache] Cache stale or empty, fetching...")
			fetchAPYs()
		} else {
			console.log("[useAPYCache] Using cached data, age:", getCacheAgeSeconds(), "seconds")
		}

		// Start 5-minute auto-refresh
		console.log("[useAPYCache] Starting 5-minute auto-refresh")
		intervalRef.current = setInterval(() => {
			console.log("[useAPYCache] Auto-refresh triggered")
			fetchAPYs()
		}, AUTO_REFRESH_INTERVAL_MS)

		// Cleanup on unmount
		return () => {
			if (intervalRef.current) {
				console.log("[useAPYCache] Stopping auto-refresh")
				clearInterval(intervalRef.current)
				intervalRef.current = null
			}
		}
	}, []) // Only run on mount - fetchAPYs is stable via useCallback

	return {
		// Cached APY data
		apys,

		// Loading states
		isLoading: isFetching && !apys,
		isRefreshing: isFetching && !!apys,

		// Error state
		error,

		// Cache metadata
		cacheAgeSeconds: getCacheAgeSeconds(),
		lastFetchTimestamp,
		isCacheStale: isCacheStale(),

		// Actions
		refetch: fetchAPYs,
	}
}
