import { z } from "zod"

import { TransactionType } from "@rabbitswap/api-core/dto"

export type TransactionEventType = z.infer<typeof TransactionEventType>
export const TransactionEventType = z.enum(["Swap", "IncreaseLiquidity", "DecreaseLiquidity", "CollectFees"])

export function parseTransactionType(type: TransactionEventType, token0Amount: number): TransactionType {
	switch (type) {
		case "IncreaseLiquidity": {
			return "add"
		}
		case "DecreaseLiquidity": {
			return "remove"
		}
		case "Swap": {
			if (token0Amount > 0) return "sell"
			return "buy"
		}
		case "CollectFees": {
			return "collectFee"
		}
	}
}
