import { ComponentProps, useMemo } from "react"

import { useLocalStorage } from "localstore"

import { Button } from "@rabbitswap/ui/basic"

import { useAcknowledgementModalStore } from "@/feature/sub-account/components/AcknowledgementModal/store"
import { useAccountMode } from "@/feature/sub-account/context"
import { useParticleLoginMutation } from "@/feature/sub-account/hooks/useParticleLoginMutation"
import { isAllowedLimitOrderTokenPair } from "@/feature/swap/limit/condition"
import { useLimitStore } from "@/feature/swap/limit/store/limitStore"
import { useInsufficientBalance } from "@/hooks/token/useInsufficientBalance"
import { useAccount } from "@/hooks/useAccount"
import { useWalletButtonState } from "@/hooks/wallet/useWalletButtonState"

/**
 * Handle the state before reaching the real limit order placing
 * 1. Check wallet state
 * 2. Select token
 * 3. Enter amount
 * 4. Check if amount in is insufficient
 */
export const usePreLimitOrderState = () => {
	const { accountMode, setAccountMode } = useAccountMode()
	const { mainAddress, subAddress } = useAccount()
	const { mutateAsync: login, isPending: isLogingIn } = useParticleLoginMutation({
		onSuccess: () => {
			setAccountMode("sub")
		},
	})

	const [subAccMap] = useLocalStorage("sub-account", {})

	const isAcknowledged = useMemo<boolean>(() => {
		if (!mainAddress) return false
		return subAccMap[mainAddress.toLowerCase()]?.ack ?? false
	}, [mainAddress, subAccMap])

	const { setOpen } = useAcknowledgementModalStore()

	const {
		computed: { amountOut, amountIn },
		priceCondition,
	} = useLimitStore()
	const insufficientState = useInsufficientState()

	const isAmountEntered = useMemo<boolean | undefined>(() => {
		return amountIn && !amountIn.bigNumber.isZero()
	}, [amountIn])

	const walletButtonState = useWalletButtonState()

	const buttonState = useMemo<Partial<ComponentProps<typeof Button>> | null>(() => {
		if (walletButtonState) return walletButtonState

		// not connect the wallet
		if (!subAddress) {
			return {
				disabled: !mainAddress,
				loading: isLogingIn,
				children: "Connect Trading Account",
				onClick: () => {
					if (!isAcknowledged) {
						setOpen(true)
						return
					} else {
						void login()
					}
				},
			}
		}

		// wrong account mode
		if (accountMode === "main") {
			return {
				children: "Switch to Trading Account",
				onClick: () => {
					setAccountMode("sub")
				},
			}
		}

		// token is not selected
		const isTokenSelected = !!amountIn && !!amountOut
		if (!isTokenSelected) {
			return {
				disabled: true,
				children: "Select a token",
			}
		}

		if (!isAllowedLimitOrderTokenPair([amountIn.token, amountOut.token])) {
			return {
				disabled: true,
				children: "Token pair is not supported",
			}
		}

		if (!isAmountEntered) {
			return {
				disabled: true,
				children: "Enter an amount",
			}
		}

		if (insufficientState) return insufficientState

		if (priceCondition?.value === undefined || priceCondition.value.eq(0))
			return {
				children: "Enter price condition",
				disabled: true,
			}

		return null
	}, [
		walletButtonState,
		subAddress,
		accountMode,
		amountIn,
		amountOut,
		isAmountEntered,
		insufficientState,
		priceCondition?.value,
		mainAddress,
		isLogingIn,
		isAcknowledged,
		login,
		setOpen,
		setAccountMode,
	])

	return buttonState
}

/**
 * check if the wallet's balance is sufficient or not
 */
const useInsufficientState = () => {
	const { subAddress } = useAccount()
	const {
		computed: { amountIn },
	} = useLimitStore()

	const insufficient = useInsufficientBalance({
		amount: amountIn,
		walletAddress: subAddress,
	})

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
