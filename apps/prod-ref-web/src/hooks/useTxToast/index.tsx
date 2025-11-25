import { useCallback } from "react"

import { useToaster } from "@rabbitswap/ui/basic"

import { ToastContent, TxToastProps } from "./component"

export const useTxToast = () => {
	const { show } = useToaster()

	const success = useCallback(
		(props: TxToastProps) => {
			show(
				(t) => <ToastContent {...props} toastId={t} />,
				{
					position: "top-right",
					duration: 5000,
				},
				props.tx.hash,
			)
		},
		[show],
	)

	const error = useCallback(
		(props: TxToastProps) => {
			show(
				(t) => <ToastContent {...props} toastId={t} error />,
				{
					position: "top-right",
					duration: 5000,
				},
				props.tx.hash,
			)
		},
		[show],
	)

	return { success, error }
}
