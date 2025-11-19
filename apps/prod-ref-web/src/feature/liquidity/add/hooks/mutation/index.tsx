import { BigNumber } from "@ethersproject/bignumber"

import { useCreatePositionMutation } from "./useCreatePositionMutation"
import { useIncreaseLiquidityMutation } from "./useIncreaseLiquidityMutation"

export const useAddLiquidityMutation = (tokenId?: BigNumber) => {
	const create = useCreatePositionMutation()
	const increase = useIncreaseLiquidityMutation(tokenId)

	// if the position is provided, increase liquidity, otherwise create new position
	return tokenId ? increase : create
}
