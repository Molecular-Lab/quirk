import { BigNumber } from "@ethersproject/bignumber"
import { type Address } from "viem"

import { FeeAmount } from "@/constants/dex"
import { TokenAmount } from "@/types/tokens"
import { Transaction } from "@/types/transaction"

export interface IncreaseLiquidityParams {
	amount0: TokenAmount
	amount1: TokenAmount
}

export interface CreatePositionParams extends IncreaseLiquidityParams {
	fee: FeeAmount
	tick: [number, number]
	needPoolInit: boolean
	sqrtPriceX96: bigint
	recipient?: Address
}

export interface CreatePositionResult {
	tx: Transaction<[TokenAmount, TokenAmount]>
}

export interface IncreaseLiquidityResult extends CreatePositionResult {
	tokenId: BigNumber
}
