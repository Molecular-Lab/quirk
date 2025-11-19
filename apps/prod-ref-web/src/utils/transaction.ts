import { ContractFunctionExecutionError, TransactionExecutionError, UserRejectedRequestError } from "viem"

import { TokenAmount } from "@/types/tokens"

/**
 * parse deadline to unix seconds
 * @param deadline in second
 */
export const parseDeadline = (deadline: number) => {
	return BigInt(Math.floor(Date.now() / 1000) + deadline)
}

export const parseMinimumOutput = <T extends TokenAmount | undefined>(amount: T, slippage: number) => {
	return amount?.multiply(1 - slippage / 100) as T
}

export const parseMaximumInput = <T extends TokenAmount | undefined>(amount: T, slippage: number) => {
	return amount?.multiply(1 + slippage / 100) as T
}

export function isUserRejectedError(error: unknown): boolean {
	if (
		error instanceof UserRejectedRequestError ||
		(error instanceof TransactionExecutionError && error.cause instanceof UserRejectedRequestError) ||
		(error instanceof ContractFunctionExecutionError && error.shortMessage === "User rejected the request.")
	) {
		return true
	}
	return false
}
