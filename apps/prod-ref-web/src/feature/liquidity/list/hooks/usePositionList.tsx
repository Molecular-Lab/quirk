import { useMemo } from "react"

import { Address } from "viem"

import { useAddressPositionDetails } from "@/hooks/liquidity/usePosition"
import { useSwapChainId } from "@/hooks/useChainId"

export const usePositionList = (address: Address | undefined, options: { hideClosed: boolean }) => {
	const chainId = useSwapChainId()
	const { data: positions, isLoading } = useAddressPositionDetails(address, chainId)

	/**
	 * sorted positions by opened first, and filtering by user preference
	 */
	const displayPositionList = useMemo(() => {
		const sortedPositions = positions?.sort((a, b) => {
			if (a.liquidity === 0n) {
				return 1
			}
			if (b.liquidity === 0n) {
				return -1
			}
			return 0
		})

		if (!options.hideClosed) {
			return sortedPositions
		}

		const filteredPositions = sortedPositions?.filter((p) => !(p.liquidity === 0n))
		return filteredPositions
	}, [options.hideClosed, positions])

	return {
		displayPositionList,
		isLoading,
	}
}
