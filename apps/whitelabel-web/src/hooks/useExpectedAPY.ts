/**
 * Expected APY Hook
 * Client-side calculation of blended APY from cached protocol data
 *
 * Formula: SUM(protocol_APY * allocation_percentage / 100)
 *
 * Example:
 * - AAVE: 4.25% APY, 50% allocation = 2.125%
 * - Compound: 3.80% APY, 30% allocation = 1.14%
 * - Morpho: 5.10% APY, 20% allocation = 1.02%
 * - Expected APY = 4.29%
 */

import { useMemo } from "react"
import { useAPYCacheStore, type Allocation } from "@/store/apyCacheStore"

export function useExpectedAPY(allocations: Allocation[]) {
	// Subscribe to apys map from cache
	const apys = useAPYCacheStore((state) => state.apys)

	// Calculate blended APY directly in the hook
	const expectedAPY = useMemo(() => {
		if (!apys || allocations.length === 0) {
			return "0.00"
		}

		// Calculate weighted average
		let blendedAPY = 0
		for (const alloc of allocations) {
			const protocolAPY = parseFloat(apys[alloc.protocol] || "0")
			blendedAPY += (protocolAPY * alloc.percentage) / 100
		}

		return blendedAPY.toFixed(2)
	}, [allocations, apys])

	return expectedAPY
}

/**
 * Hook to get individual protocol APYs from cache
 */
export function useProtocolAPYs() {
	const apys = useAPYCacheStore((state) => state.apys)

	return useMemo(() => {
		if (!apys) {
			return {
				aave: "0",
				compound: "0",
				morpho: "0",
			}
		}
		return {
			aave: apys.aave || "0",
			compound: apys.compound || "0",
			morpho: apys.morpho || "0",
		}
	}, [apys])
}
