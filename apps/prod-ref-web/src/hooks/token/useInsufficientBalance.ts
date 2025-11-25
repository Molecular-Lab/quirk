import { useMemo } from "react"

import { type Address } from "viem"

import { useBalance } from "@/hooks/token/useBalance"
import { TokenAmount } from "@/types/tokens"

interface InsufficientBalanceParam {
	amount?: TokenAmount
	walletAddress?: Address
}

interface InsufficientBalanceResult {
	value: boolean
	isLoading: boolean
}

export const useInsufficientBalance = ({
	amount,
	walletAddress,
}: InsufficientBalanceParam): InsufficientBalanceResult => {
	const { data: balance, isLoading } = useBalance({ token: amount?.token, walletAddress: walletAddress })

	const isInsufficient = useMemo<boolean>(() => {
		if (!amount) return false
		if (!balance) return true
		return balance.bigNumber.lt(amount.bigNumber)
	}, [amount, balance])

	return {
		value: isInsufficient,
		isLoading: isLoading,
	}
}
