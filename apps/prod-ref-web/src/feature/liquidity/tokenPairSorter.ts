import { EvmToken, TokenAmount } from "@/types/tokens"

export const tokenPairSorter = <T extends EvmToken | undefined>(
	token0: T,
	token1: T,
): T extends EvmToken ? [EvmToken, EvmToken] : [undefined, undefined] | [EvmToken, EvmToken] => {
	if (token0 === undefined || token1 === undefined) {
		return [undefined, undefined] as T extends EvmToken ? never : [undefined, undefined]
	}

	return token0.compare(token1) <= 0 ? [token0, token1] : [token1, token0]
}

export const tokenAmountPairSorter = <T extends TokenAmount | undefined>(
	amount0: T,
	amount1: T,
): T extends TokenAmount ? [TokenAmount, TokenAmount] : [undefined, undefined] | [TokenAmount, TokenAmount] => {
	if (amount0 === undefined || amount1 === undefined) {
		return [undefined, undefined] as T extends TokenAmount ? never : [undefined, undefined]
	}

	const isFront = amount0.token.compare(amount1.token) <= 0
	return isFront ? [amount0, amount1] : [amount1, amount0]
}
