/**
 * APY Cache Hook
 * Fetches APY data once and syncs to Zustand cache
 *
 * Features:
 * - Initial fetch on mount if cache is stale
 * - 5-minute auto-refresh in background
 * - Calls GET /defi/protocols endpoint and transforms to APY map
 * - Returns cached data for instant access
 */

import { useCallback, useEffect, useRef } from "react"

import { b2bApiClient } from "@/api/b2bClient"
import { type APYMap, useAPYCacheStore } from "@/store/apyCacheStore"


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

	// Fetch function - calls /defi/protocols endpoint and transforms response
	const fetchAPYs = useCallback(async () => {
		// Prevent duplicate fetches
		if (useAPYCacheStore.getState().isFetching) {
			console.log("[useAPYCache] Fetch already in progress, skipping")
			return
		}

		setIsFetching(true)
		setError(null)

		try {
			console.log("[useAPYCache] Fetching APYs from /defi/protocols...")

			const response = await b2bApiClient.defiProtocol.getAll({
				query: { token, chainId: chainId.toString() },
			})

			if (response.status !== 200) {
				throw new Error("Failed to fetch protocols")
			}

			// Transform response to APYMap format
			// Backend returns: { protocols: [{ protocol: "aave", supplyAPY: "3.64" }, ...], timestamp: "..." }
			const protocols = response.body?.protocols || []
			const apyMap: APYMap = {
				aave: protocols.find((p: any) => p.protocol === "aave")?.supplyAPY || "0.00",
				compound: protocols.find((p: any) => p.protocol === "compound")?.supplyAPY || "0.00",
				morpho: protocols.find((p: any) => p.protocol === "morpho")?.supplyAPY || "0.00",
				timestamp: response.body?.timestamp || new Date().toISOString(),
			}

			setAPYs(apyMap)
			console.log("[useAPYCache] APYs cached successfully:", apyMap)
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
