import { ComponentProps, useEffect, useMemo, useState } from "react"

import { Button, useToaster } from "@rabbitswap/ui/basic"

import { useEstimateLzFee } from "@/feature/bridge/form/hook/useEstimateLzFee"
import { useBridgeStore } from "@/feature/bridge/form/store/bridgeStore"
import { useInsufficientBalance } from "@/hooks/token/useInsufficientBalance"

import { usePreBridgeBtnProps } from "./usePreBridgeBtnProps"

export const useBridgeState = (): {
	buttonProps: Partial<ComponentProps<typeof Button>>
	reviewing: boolean
	onCloseReview: () => void
} => {
	const [reviewing, setReviewing] = useState<boolean>(false)
	const toast = useToaster()
	const preBridgeBtnProps = usePreBridgeBtnProps()
	const { sourceToken, setDestTokenAmount } = useBridgeStore()
	const { error: estimateFeeError, isLoading: isFeeLoading } = useEstimateLzFee()

	const buttonProps = useMemo<Partial<ComponentProps<typeof Button>>>(() => {
		if (preBridgeBtnProps) return preBridgeBtnProps

		if (isFeeLoading) {
			return {
				disabled: true,
				loading: true,
				children: "Loading",
			}
		}

		return {
			children: "Bridge",
			disabled: false,
			onClick: () => {
				setReviewing(true)
			},
		}
	}, [isFeeLoading, preBridgeBtnProps])

	// set destToken amount to sourceToken (1:1 bridge)
	useEffect(() => {
		setDestTokenAmount((prev) => prev.newAmount(sourceToken.amount))
	}, [sourceToken, setDestTokenAmount])

	// toast estimateFeeError if any
	useEffect(() => {
		if (estimateFeeError) {
			toast.showPreset.error({
				title: "Error to estimate fee",
				description: estimateFeeError.message,
			})
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [estimateFeeError])

	// ============= Insufficient gas fee =============
	// if user is reviewing and the gas fee is increased so that user has insufficient balance
	// close the review modal
	const { data } = useEstimateLzFee()
	const { value: insuffGas } = useInsufficientBalance({
		amount: data?.nativeFee,
	})

	useEffect(() => {
		if (insuffGas) setReviewing(false)
	}, [insuffGas])

	// ================================================

	if (isFeeLoading)
		return {
			buttonProps: buttonProps,
			reviewing: false,
			onCloseReview: () => {},
		}

	return {
		buttonProps: buttonProps,
		reviewing: reviewing,
		onCloseReview: () => {
			setReviewing(false)
		},
	}
}
