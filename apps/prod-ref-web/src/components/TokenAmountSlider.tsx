import React, { useCallback, useMemo } from "react"

import BigNumber from "bignumber.js"

import { PercentageSlider } from "@rabbitswap/ui/components"

import { useBalance } from "@/hooks/token/useBalance"
import { TokenAmount } from "@/types/tokens"

export const TokenAmountSlider: React.FC<{
	value: TokenAmount | undefined
	onValueChange: (_: TokenAmount | undefined) => void
}> = ({ value, onValueChange }) => {
	const { data: balance } = useBalance({ token: value?.token })

	const handleOnPctChange = useCallback(
		(pct: BigNumber) => {
			if (value === undefined) {
				onValueChange(value)
				return
			}
			const newTokenAmt = balance?.multiply(pct.shiftedBy(-2))
			onValueChange(newTokenAmt)
		},
		[balance, onValueChange, value],
	)

	const valuePct = useMemo<BigNumber>(() => {
		if (!value || !balance) return BigNumber(0)
		if (balance.bigNumber.eq(0)) return BigNumber(0)
		return value.bigNumber.div(balance.bigNumber).shiftedBy(2)
	}, [balance, value])

	return (
		<PercentageSlider
			value={valuePct.toNumber()}
			onValueChange={(v) => {
				handleOnPctChange(BigNumber(v ?? 0))
			}}
		/>
	)
}
