/**
 * React Query hooks for fetching DeFi protocol data
 * Separate query keys for independent caching per protocol
 */

import { useQuery } from "@tanstack/react-query"
import axios from "axios"

// API Base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8888/api/v1"

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
			const { data } = await axios.get<ProtocolData>(`${API_BASE_URL}/defi/protocols/aave`, {
				params: { token, chainId: chainId.toString() },
			})
			return data
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
			const { data } = await axios.get<ProtocolData>(`${API_BASE_URL}/defi/protocols/compound`, {
				params: { token, chainId: chainId.toString() },
			})
			return data
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
			const { data } = await axios.get<ProtocolData>(`${API_BASE_URL}/defi/protocols/morpho`, {
				params: { token, chainId: chainId.toString() },
			})
			return data
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
			const { data } = await axios.get<ProtocolsResponse>(`${API_BASE_URL}/defi/protocols`, {
				params: { token, chainId: chainId.toString() },
			})
			return data
		},
		refetchInterval: 60000, // 1 minute
		staleTime: 30000, // 30 seconds
	})
}

/**
 * Fetch all protocols using separate hooks (recommended for better granularity)
 * This allows independent caching and error handling per protocol
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
