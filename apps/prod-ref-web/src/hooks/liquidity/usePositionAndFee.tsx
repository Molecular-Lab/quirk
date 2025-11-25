import { useMemo } from "react"

import { BigNumber } from "@ethersproject/bignumber"

import { usePosition } from "@/hooks/liquidity/usePosition"
import { usePositionFee } from "@/hooks/liquidity/usePositionFee"
import { Position } from "@/types/position"
import { TokenAmount } from "@/types/tokens"

export const usePositionAndFee = (
	tokenId: BigNumber,
	chainId: number | undefined,
	unwrapped?: boolean,
): {
	isLoading: boolean
	position: Position | undefined
	fee: [TokenAmount | undefined, TokenAmount | undefined]
} => {
	const { data: position, isLoading: positionLoading } = usePosition(tokenId, chainId)
	const { data: feeAmount, isLoading: feeLoading } = usePositionFee(tokenId, chainId, position?.position.ownerAddress)

	const [feeQuote, feeBase] = useMemo<[TokenAmount, TokenAmount] | [undefined, undefined]>(() => {
		if (position === undefined || feeAmount === undefined || feeAmount === null) {
			return [undefined, undefined]
		}
		const fQ = new TokenAmount({ token: position.position.token0, amount: feeAmount.amount0 })
		const fB = new TokenAmount({ token: position.position.token1, amount: feeAmount.amount1 })

		return [fB, fQ]
	}, [position, feeAmount])

	return {
		isLoading: positionLoading || feeLoading,
		position: unwrapped ? position?.unwrapped : position,
		fee: unwrapped ? [feeBase?.unwrapped, feeQuote?.unwrapped] : [feeBase, feeQuote],
	}
}
