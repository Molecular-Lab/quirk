import { ComponentProps, useMemo } from "react"

import { Button } from "@rabbitswap/ui/basic"

import { useInsufficientBalance } from "@/hooks/token/useInsufficientBalance"
import { useWalletButtonState } from "@/hooks/wallet/useWalletButtonState"

import { useSwapStore } from "../../store/swapStore"

/**
 * Handle the state before reaching the real swap
 * 1. Check wallet state
 * 2. Select token
 * 3. Enter amount
 * 4. Check if amount in is insufficient
 */
export const usePreSwapState = () => {
	const { amountOut, amountIn, type } = useSwapStore()
	const insufficientState = useInsufficientState()

	const isAmountEntered = useMemo<boolean | undefined>(() => {
		if (type === "EXACT_INPUT") return amountIn && !amountIn.bigNumber.isZero()
		return amountOut && !amountOut.bigNumber.isZero()
	}, [amountIn, amountOut, type])

	const walletButtonState = useWalletButtonState()

	const buttonState = useMemo<Partial<ComponentProps<typeof Button>> | null>(() => {
		if (walletButtonState) return walletButtonState

		// token is not selected
		const isTokenSelected = !!amountIn && !!amountOut
		if (!isTokenSelected) {
			return {
				disabled: true,
				children: "Select a token",
			}
		}

		if (!isAmountEntered) {
			return {
				disabled: true,
				children: "Enter an amount",
			}
		}

		if (insufficientState) return insufficientState

		return null
	}, [walletButtonState, amountIn, amountOut, isAmountEntered, insufficientState])

	return buttonState
}

/**
 * check if the wallet's balance is sufficient or not
 */
const useInsufficientState = () => {
	const {
		amountIn,
		computed: { maxAmountIn, swapFn },
	} = useSwapStore()

	// if the swapFn is wrap/unwrap, use the exact amountIn
	// if the swapFn is swap, also consider slippage
	const targetAmount = swapFn === "swap" ? maxAmountIn : amountIn

	const insufficient = useInsufficientBalance({ amount: targetAmount })

	const buttonState = useMemo<Partial<ComponentProps<typeof Button>> | null>(() => {
		if (insufficient.isLoading) {
			return {
				disabled: true,
				loading: true,
				children: "Loading",
			}
		}
		if (insufficient.value) {
			return {
				disabled: true,
				children: `Insufficient ${amountIn?.token.symbol} balance`,
			}
		}
		return null
	}, [insufficient.value, insufficient.isLoading, amountIn?.token])

	return buttonState
}
