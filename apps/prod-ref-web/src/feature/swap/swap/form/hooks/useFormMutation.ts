import { useCallback } from "react"

import { useUnwrapMutation } from "@/hooks/swap/useUnwrapMutation"
import { useWrapMutation } from "@/hooks/swap/useWrapMutation"

import { useSwapStore } from "../../store/swapStore"

// create mutation fns that binds with swap store's state
export const useFormMutation = () => {
	const { amountIn, reset } = useSwapStore()

	const { mutateAsync: wrap, isPendingTxSubmit: pendingWrap } = useWrapMutation()
	const handleWrap = useCallback(
		() =>
			wrap(
				{ amount: amountIn! },
				{
					onSubmitted: () => {
						reset()
					},
				},
			),
		[wrap, amountIn, reset],
	)

	const { mutateAsync: unwrap, isPendingTxSubmit: pendingUnwrap } = useUnwrapMutation()
	const handleUnwrap = useCallback(
		() =>
			unwrap(
				{ amount: amountIn! },
				{
					onSubmitted: () => {
						reset()
					},
				},
			),
		[unwrap, amountIn, reset],
	)

	return {
		pending: pendingWrap || pendingUnwrap,
		wrap: handleWrap,
		unwrap: handleUnwrap,
	}
}
