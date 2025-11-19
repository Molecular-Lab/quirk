import { Dayjs } from "dayjs"

import { LimitOrderItem as _LimitOrderItem } from "@rabbitswap/api-core/dto"

import { Price } from "@/types/price"
import { TokenAmount } from "@/types/tokens"

export interface LimitOrderItem
	extends Omit<_LimitOrderItem, "fromToken" | "toToken" | "fromAmount" | "minimumReceived" | "expiredAt" | "priceX96"> {
	fromTokenAmount: TokenAmount
	toTokenAmount: TokenAmount
	expiredAt: Dayjs
	price: Price
}
