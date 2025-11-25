import { useUsdPrice } from "@/hooks/token/useUsdPrice"
import { TokenAmount } from "@/types/tokens"

export const useUsdPriceImpact = ({
	amountIn,
	amountOut,
}: {
	amountIn: TokenAmount | undefined
	amountOut: TokenAmount | undefined
}) => {
	const inputUsd = useUsdPrice(amountIn)
	const outputUsd = useUsdPrice(amountOut)

	if (inputUsd?.isZero() || outputUsd?.isZero()) return { data: undefined, isLoading: false }

	return {
		data: inputUsd && outputUsd ? outputUsd.minus(inputUsd).div(inputUsd).shiftedBy(2) : undefined,
		isLoading: !inputUsd || !outputUsd,
	}
}
