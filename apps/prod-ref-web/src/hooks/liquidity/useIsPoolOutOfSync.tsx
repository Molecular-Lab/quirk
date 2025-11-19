import { useUsdPrice } from "@/hooks/token/useUsdPrice"
import { Price } from "@/types/price"
import { EvmToken, TokenAmount } from "@/types/tokens"

const WARNING_THRESHOLD = 0.05 // 5%

function useMarketPrice(token0: EvmToken | undefined, token1: EvmToken | undefined) {
	const token0UsdPrice = useUsdPrice(token0 !== undefined ? TokenAmount.fromString(token0, "1") : token0)
	const token1UsdPrice = useUsdPrice(token1 !== undefined ? TokenAmount.fromString(token1, "1") : token1)

	if (!token1 || !token0 || !token1UsdPrice || !token0UsdPrice) {
		return undefined
	}

	const marketPrice = Price.fromTokenAmounts(
		TokenAmount.fromString(token0, token0UsdPrice.toString()),
		TokenAmount.fromString(token1, token1UsdPrice.toString()),
	)

	return marketPrice
}

export function useIsPoolOutOfSync(_poolPrice?: Price) {
	const marketPrice = useMarketPrice(_poolPrice?.sortedTokenPair[0], _poolPrice?.sortedTokenPair[1])

	if (_poolPrice === undefined || !marketPrice || _poolPrice.value === undefined || !marketPrice.value) {
		return false
	}

	const poolPrice = _poolPrice.isSorted ? _poolPrice : _poolPrice.invert()
	if (poolPrice.value === undefined) {
		return false
	}

	const diff = poolPrice.value.minus(marketPrice.value).abs()
	const diffPct = diff.dividedBy(marketPrice.value)
	return diffPct.gt(WARNING_THRESHOLD)
}
