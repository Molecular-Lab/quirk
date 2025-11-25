import { useMemo, useState } from "react"

import { Button, Modal, ModalContent, ModalDescription, ModalHeader, ModalTitle } from "@rabbitswap/ui/basic"
import { cn } from "@rabbitswap/ui/utils"

import {
	TransactionConfirmed,
	TransactionError,
	TransactionPending,
	TransactionSubmitted,
} from "@/components/Transaction"
import { useCancelOrderModalStore } from "@/feature/swap/limit/components/CancelOrderModal/store"
import { CancelOrderTxData, useCancelOrderMutation } from "@/feature/swap/limit/hooks/useCancelOrderMutation"
import { useSwapChainId } from "@/hooks/useChainId"
import { Transaction } from "@/types/transaction"

export const CancelOrderModal: React.FC = () => {
	const chainId = useSwapChainId()
	const { mutateAsync: cancelOrder, isPendingTxSubmit: isCancelling } = useCancelOrderMutation()

	const { open, order, onClose } = useCancelOrderModalStore()
	const [cancelTx, setCancelTx] = useState<Transaction<CancelOrderTxData> | undefined>(undefined)
	const [error, setError] = useState(false)

	const content = useMemo(() => {
		if (cancelTx !== undefined && cancelTx.data.order.orderId === order?.orderId) {
			if (cancelTx.status === "success") {
				return (
					<TransactionConfirmed
						tx={cancelTx}
						title="Cancellation success!"
						className="mb-3 mt-6"
						onClose={() => {
							setCancelTx(undefined)
							setError(false)
							onClose()
						}}
					/>
				)
			}

			if (cancelTx.status === "pending") {
				return (
					<TransactionSubmitted
						tx={cancelTx}
						title="Cancellation submitted"
						className="mb-3 mt-6"
						onClose={() => {
							setCancelTx(undefined)
							setError(false)
							onClose()
						}}
					/>
				)
			}
		}

		if (isCancelling) {
			return <TransactionPending title="Cancelling order" className="mb-3 mt-6" />
		}

		if (error) {
			return (
				<TransactionError tx={cancelTx} title="Cancellation failed!" className="mb-3 mt-6">
					<Button
						className="h-12 w-full"
						onClick={() => {
							setError(false)
						}}
					>
						Try again
					</Button>
				</TransactionError>
			)
		}

		return (
			<>
				<img
					src="/images/rabbit-aww.png"
					alt="Enable Trading Account"
					className={cn("mx-auto max-w-[320px] object-contain", "mt-6 lg:mt-10")}
				/>
				<ModalHeader className="mt-4">
					<ModalTitle className="text-center">
						Are you sure you want to <br /> cancel the limit order?
					</ModalTitle>
					<ModalDescription className="text-center">
						Your swap could be executed before the cancellation is processed.
					</ModalDescription>
				</ModalHeader>
				<Button
					className="h-12"
					onClick={() => {
						if (!order) return
						void cancelOrder(
							{ order, chainId },
							{
								onSubmitted: (data) => {
									setCancelTx(data.tx)
								},
								onSuccess: (data) => {
									setCancelTx(data.tx)
								},
								onError: () => {
									setError(true)
								},
								onTxError: (_, { resp }) => {
									setError(true)
									setCancelTx(resp.tx)
								},
							},
						)
					}}
					loading={isCancelling}
				>
					Confirm
				</Button>
			</>
		)
	}, [cancelOrder, cancelTx, chainId, error, isCancelling, onClose, order])

	return (
		<Modal
			open={open}
			onOpenChange={(o) => {
				setError(false)
				setCancelTx(undefined)
				if (o) return
				onClose()
			}}
		>
			<ModalContent hideCloseButton={isCancelling}>{content}</ModalContent>
		</Modal>
	)
}
