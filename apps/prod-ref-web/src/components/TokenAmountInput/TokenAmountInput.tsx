import { useEffect, useRef, useState } from "react"
import { NumericFormat } from "react-number-format"
import { Timeout } from "react-number-format/types/types"

import BigNumber from "bignumber.js"

import { PropsWithClassName, cn } from "@rabbitswap/ui/utils"

import { EVM_DEFAULT_DECIMALS, TokenAmount } from "@/types/tokens"

interface TokenAmountInputProps extends PropsWithClassName {
	value: TokenAmount | undefined
	onChange?: (amount: TokenAmount) => void
	debounced?: number
	isLoading?: boolean
	setTyping?: (typing: boolean) => void
	disabled?: boolean
	placeholder?: string
}

export const TokenAmountInput: React.FC<TokenAmountInputProps> = ({
	value,
	onChange,
	className,
	debounced,
	isLoading,
	setTyping,
	disabled,
	placeholder,
}) => {
	const [amount, setAmount] = useState<string>("")

	// sync value & amount
	useEffect(() => {
		if (!value) return
		if (value.amount === undefined) {
			setAmount("")
			return
		}
		if (value.bigNumber.eq(BigNumber(amount))) return
		setAmount(value.string)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [value])

	const syncValue = (amount: string | undefined) => {
		if (!value) return
		// it the value is undefined (not init), do nothing
		if (amount === undefined) return
		// if the value is the same as the amount, do nothing
		if (value.bigNumber.eq(BigNumber(amount))) return
		onChange?.(TokenAmount.fromString(value.token, amount === "" ? undefined : amount))
	}

	useEffect(() => {
		const timeout = setTimeout(() => {
			syncValue(amount)
		}, debounced ?? 0)
		return () => {
			clearTimeout(timeout)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [amount])

	const typingTimeout = useRef<Timeout>()

	return (
		<NumericFormat
			placeholder={placeholder}
			allowNegative={false}
			className={cn(
				"w-0 grow bg-transparent text-right text-[36px] font-medium leading-[44px] placeholder:text-gray-300 focus:outline-none",
				isLoading && "animate-pulse text-gray-300",
				className,
			)}
			value={amount}
			onValueChange={({ value: stringValue }) => {
				if (stringValue === amount) return
				setAmount(stringValue)
				setTyping?.(true)
				if (typingTimeout.current) clearTimeout(typingTimeout.current)
				typingTimeout.current = setTimeout(() => setTyping?.(false), 500)
			}}
			decimalScale={value?.token.decimals ?? EVM_DEFAULT_DECIMALS}
			maxLength={30}
			inputMode="decimal"
			disabled={disabled}
		/>
	)
}
