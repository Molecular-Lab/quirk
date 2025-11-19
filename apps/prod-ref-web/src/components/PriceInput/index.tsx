import React, { useEffect, useRef, useState } from "react"
import { NumericFormat } from "react-number-format"
import { Timeout } from "react-number-format/types/types"

import BigNumber from "bignumber.js"

import { PropsWithClassName, cn } from "@rabbitswap/ui/utils"

import { Price } from "@/types/price"

interface PriceInputProps extends PropsWithClassName {
	isLoading?: boolean
	value: Price | undefined
	debounced?: number
	onValueChange: (p: Price) => void
	onBlur?: React.FocusEventHandler<HTMLInputElement> | undefined
	setTyping?: (typing: boolean) => void
	disabled?: boolean
}

export const PriceInput: React.FC<PriceInputProps> = ({
	isLoading,
	className,
	value,
	onValueChange,
	debounced,
	onBlur,
	setTyping,
	disabled,
}) => {
	const [amount, setAmount] = useState<undefined | string>()

	// sync value & amount
	useEffect(() => {
		if (value === undefined) {
			setAmount("")
			return
		}
		if (value.value === undefined) {
			setAmount("")
			return
		}
		setAmount(value.value.toString())
	}, [value])

	const syncValue = (amount: string | undefined) => {
		// it the value is undefined (not init), do nothing
		if (amount === undefined || value === undefined) return
		// if the value is the same as the amount, do nothing
		if (value.value?.eq(BigNumber(amount))) return

		const p = value.clone()
		p.value = amount === "" ? undefined : BigNumber(parseFloat(amount))
		onValueChange(p)
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
			placeholder="0"
			allowNegative={false}
			disabled={disabled}
			className={cn(
				"w-full grow focus:outline-none",
				"bg-gray-50 dark:bg-gray-925",
				"text-left",
				"text-gray-950 placeholder:text-gray-300",
				"dark:text-white dark:placeholder:text-gray-600",
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
			maxLength={30}
			onBlur={onBlur}
		/>
	)
}
