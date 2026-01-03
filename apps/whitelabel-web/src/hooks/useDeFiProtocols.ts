/**
 * React Query hooks for fetching DeFi protocol data
 * Separate query keys for independent caching per protocol
 * 
 * Optimization: Uses lightweight APY cache for instant display,
 * then enriches with full protocol details in background
 */

import { useQuery } from "@tanstack/react-query"
import { b2bApiClient } from "@/api/b2bClient"
import { useAPYCache } from "./useAPYCache"
import { useMemo } from "react"

// Protocol Data Type (matching backend)
export interface ProtocolData {
	protocol: "aave" | "compound" | "morpho"
	token: string
	chainId: number
	supplyAPY: string
	borrowAPY?: string
	tvl: string
	liquidity: string
	totalSupplied: string
	totalBorrowed?: string
	utilization: string
	risk: "Low" | "Medium" | "High"
	status: "healthy" | "warning" | "critical"
	lastUpdate: Date
	protocolHealth: number
	rawMetrics?: any
}

export interface ProtocolsResponse {
	protocols: ProtocolData[]
	timestamp: Date
}

/**
 * Fetch AAVE protocol data
 */
export function useAAVEData(token = "USDC", chainId = 8453) {
	return useQuery({
		queryKey: ["defi", "aave", token, chainId],
		queryFn: async () => {
			const response = await b2bApiClient.defiProtocol.getAAVE({
				query: { token, chainId: chainId.toString() },
			})
			if (response.status !== 200) {
				throw new Error("Failed to fetch AAVE data")
			}
			return response.body
		},
		refetchInterval: 60000, // 1 minute
		staleTime: 30000, // 30 seconds
	})
}

/**
 * Fetch Compound protocol data
 */
export function useCompoundData(token = "USDC", chainId = 8453) {
	return useQuery({
		queryKey: ["defi", "compound", token, chainId],
		queryFn: async () => {
			const response = await b2bApiClient.defiProtocol.getCompound({
				query: { token, chainId: chainId.toString() },
			})
			if (response.status !== 200) {
				throw new Error("Failed to fetch Compound data")
			}
			return response.body
		},
		refetchInterval: 60000, // 1 minute
		staleTime: 30000, // 30 seconds
	})
}

/**
 * Fetch Morpho protocol data
 */
export function useMorphoData(token = "USDC", chainId = 8453) {
	return useQuery({
		queryKey: ["defi", "morpho", token, chainId],
		queryFn: async () => {
			const response = await b2bApiClient.defiProtocol.getMorpho({
				query: { token, chainId: chainId.toString() },
			})
			if (response.status !== 200) {
				throw new Error("Failed to fetch Morpho data")
			}
			return response.body
		},
		refetchInterval: 60000, // 1 minute
		staleTime: 30000, // 30 seconds
	})
}

/**
 * Fetch all protocols in one call (if you prefer combined approach)
 */
export function useAllDeFiProtocolsCombined(token = "USDC", chainId = 8453) {
	return useQuery({
		queryKey: ["defi", "all", token, chainId],
		queryFn: async () => {
			const response = await b2bApiClient.defiProtocol.getAll({
				query: { token, chainId: chainId.toString() },
			})
			if (response.status !== 200) {
				throw new Error("Failed to fetch all protocols")
			}
			return response.body
		},
		refetchInterval: 60000, // 1 minute
		staleTime: 30000, // 30 seconds
	})
}

/**
 * Fetch all protocols using separate hooks (recommended for better granularity)
 * This allows independent caching and error handling per protocol
 * 
 * LEGACY: Use useAllDeFiProtocolsOptimized for better performance
 */
export function useAllDeFiProtocols(token = "USDC", chainId = 8453) {
	const aave = useAAVEData(token, chainId)
	const compound = useCompoundData(token, chainId)
	const morpho = useMorphoData(token, chainId)

	// Combine results
	const protocols = [aave.data, compound.data, morpho.data].filter(Boolean) as ProtocolData[]

	// Combined loading state (any loading = true)
	const isLoading = aave.isLoading || compound.isLoading || morpho.isLoading

	// Combined error state
	const errors = [
		aave.error ? { protocol: "aave", error: aave.error } : null,
		compound.error ? { protocol: "compound", error: compound.error } : null,
		morpho.error ? { protocol: "morpho", error: morpho.error } : null,
	].filter(Boolean)

	return {
		protocols,
		isLoading,
		errors,
		// Individual states for granular control
		aave,
		compound,
		morpho,
	}
}

/**
 * OPTIMIZED: Fetch all protocols with instant APY display
 * 
 * Strategy:
 * 1. Use lightweight APY cache (shared, instant, 5-min refresh)
 * 2. Fetch full protocol details in parallel (TVL, liquidity, health)
 * 3. Merge APY cache with full data for complete view
 * 
 * Benefits:
 * - Instant APY display from cache
 * - Single combined API call instead of 3 separate calls
 * - Shared cache across ProductConfig, Strategies, and Explore pages
 * - Still gets full real-time data (TVL, liquidity, health)
 */
export function useAllDeFiProtocolsOptimized(token = "USDC", chainId = 8453) {
	// 1. Get instant APY data from cache (shared across app, 5-min refresh)
	const { apys, isLoading: apyLoading } = useAPYCache(token, chainId)

	// 2. Fetch full protocol details in ONE combined call
	const fullDataQuery = useQuery({
		queryKey: ["defi", "all-protocols", token, chainId],
		queryFn: async () => {
			console.log("[useDeFiProtocolsOptimized] Fetching full protocol data from /defi/protocols")
			const response = await b2bApiClient.defiProtocol.getAll({
				query: { token, chainId: chainId.toString() },
			})
			if (response.status !== 200) {
				throw new Error("Failed to fetch protocols")
			}
			console.log("[useDeFiProtocolsOptimized] Full protocol data received:", response.body)
			return response.body
		},
		refetchInterval: 60000, // 1 minute - for TVL, liquidity, health updates
		staleTime: 30000, // 30 seconds
		// Don't show loading if we have cached APY data
		enabled: true,
	})

	// 3. Merge cached APYs with full protocol data (smart merge)
	const protocols = useMemo(() => {
		const now = new Date()
		const protocolIds: Array<"aave" | "compound" | "morpho"> = ["aave", "compound", "morpho"]
		
		// Create a map of full protocol data by protocol ID
		const fullDataMap = new Map<string, ProtocolData>()
		if (fullDataQuery.data?.protocols) {
			fullDataQuery.data.protocols.forEach((p) => {
				fullDataMap.set(p.protocol, p)
			})
		}

		// Smart merge: For each protocol, use full data if available, otherwise use APY cache
		if (apys || fullDataQuery.data?.protocols) {
			console.log("[useDeFiProtocolsOptimized] Smart merge - APYs:", !!apys, "Full data:", fullDataMap.size, "protocols")
			
			return protocolIds.map((protocolId) => {
				// If we have full data for this protocol, use it
				if (fullDataMap.has(protocolId)) {
					const fullData = fullDataMap.get(protocolId)!
					console.log(`[useDeFiProtocolsOptimized] Using full data for ${protocolId}`)
					return fullData
				}

				// Otherwise, use APY cache (if available) to show at least the APY
				if (apys) {
					console.log(`[useDeFiProtocolsOptimized] Using APY cache for ${protocolId} (full data not available)`)
					return {
						protocol: protocolId,
						token,
						chainId,
						supplyAPY: apys[protocolId],
						tvl: "N/A",
						liquidity: "N/A",
						totalSupplied: "0",
						utilization: "0",
						risk: protocolId === "morpho" ? ("Medium" as const) : ("Low" as const),
						status: "healthy" as const,
						lastUpdate: now,
						protocolHealth: 100,
					} as ProtocolData
				}

				// Fallback: No data available for this protocol
				return null
			}).filter(Boolean) as ProtocolData[]
		}

		return []
	}, [apys, fullDataQuery.data, token, chainId])

	// Loading state: Only show loading if we have NO data (neither APY cache nor full data)
	const isLoading = apyLoading && fullDataQuery.isLoading

	// Refreshing state: Full data is loading but we have APY cache
	const isRefreshing = !apyLoading && fullDataQuery.isLoading && !!apys

	return {
		protocols,
		isLoading, // True only on first load with no cache
		isRefreshing, // True when enriching cached data with full details
		errors: fullDataQuery.error ? [{ protocol: "all", error: fullDataQuery.error }] : [],
		// Expose query for advanced usage
		fullDataQuery,
	}
}
