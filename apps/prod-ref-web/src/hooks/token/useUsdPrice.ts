import { useMemo } from "react"

import BigNumber from "bignumber.js"

import { useTokenStats, useTokensStats } from "@/hooks/token/useTokenStats"
import { TokenAmount } from "@/types/tokens"
import { getWrapped } from "@/utils/token"

export const useUsdPrice = (amount?: TokenAmount): BigNumber | undefined => {
	const { data: stats, isLoading } = useTokenStats(amount?.token)

	const price = useMemo<BigNumber | undefined>(() => {
		if (stats?.price === undefined) return undefined
		return stats.price.multipliedBy(amount?.bigNumber ?? BigNumber(0))
	}, [amount, stats])

	// If not loading, but price is undefined, return 0
	return isLoading ? undefined : (price ?? BigNumber(0))
}

export const useSumUsdPrice = (amounts: TokenAmount[]) => {
	const { data: stats, isLoading } = useTokensStats(amounts.map((amount) => amount.token))

	const [usdPrice, error] = useMemo(() => {
		if (!stats) {
			return [BigNumber(0), true]
		}
		let error = false
		let usdPrice = new BigNumber(0)
		for (const amount of amounts) {
			const stat = stats[getWrapped(amount.token).address.toLocaleLowerCase()]
			if (!stat) {
				error = true
				continue
			}
			const tokenValue = stat.price.multipliedBy(amount.bigNumber)
			usdPrice = usdPrice.plus(tokenValue)
		}

		return [usdPrice, error]
	}, [amounts, stats])

	return {
		data: usdPrice,
		error: error,
		isLoading: isLoading,
	}
}
