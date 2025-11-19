import { useCallback, useMemo } from "react"

import { BigNumber } from "@ethersproject/bignumber"

import { Button, ModalContent, ModalDescription, ModalHeader, ModalTitle } from "@rabbitswap/ui/basic"
import { cn } from "@rabbitswap/ui/utils"

import { AnimateChangeInHeight } from "@/components/Animate/AnimateChangeInHeight"
import { TransactionConfirmed, TransactionPending, TransactionSubmitted } from "@/components/Transaction"
import { TokenAmount } from "@/types/tokens"
import { Transaction } from "@/types/transaction"

import { useRemoveLiquidity } from "../hooks/useRemoveLiquidity"

import { RemoveDetail } from "./RemoveDetail"

interface ConfirmationModalProps {
	tokenId: BigNumber
	chainId: number | undefined
	currencyQuote: TokenAmount | undefined
	currencyBase: TokenAmount | undefined
	feeQuote: TokenAmount | undefined
	feeBase: TokenAmount | undefined
	removePercentageIn100: number
	receiveWETH: boolean

	removeTx: Transaction<[TokenAmount, TokenAmount]> | undefined
	onSubmitted: (tx: Transaction<[TokenAmount, TokenAmount]>) => void
	onSuccess: (tx: Transaction<[TokenAmount, TokenAmount]>) => void

	onClose: () => void
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
	tokenId,
	chainId,
	currencyQuote,
	currencyBase,
	feeQuote,
	feeBase,
	removePercentageIn100,
	receiveWETH,
	removeTx,
	onSubmitted,
	onSuccess,
	onClose,
}) => {
	const { mutateAsync: remove, isPendingTxSubmit: isPending } = useRemoveLiquidity({ tokenId, chainId, receiveWETH })

	const handleRemove = useCallback(() => {
		void remove(
			{ removePercentageIn100 },
			{
				onSubmitted: ({ tx }) => {
					onSubmitted(tx)
				},
				onSuccess: ({ tx }) => {
					onSuccess(tx)
				},
			},
		)
	}, [onSubmitted, onSuccess, remove, removePercentageIn100])

	const inner = useMemo(() => {
		if (removeTx !== undefined) {
			if (removeTx.status === "success") {
				return (
					<TransactionConfirmed className="my-3" tx={removeTx} onClose={onClose}>
						<div>
							Removed {removeTx.data[0].toFormat({ decimalPlaces: 2, withUnit: true })} and{" "}
							{removeTx.data[1].toFormat({ decimalPlaces: 2, withUnit: true })}
						</div>
					</TransactionConfirmed>
				)
			}
			return (
				<TransactionSubmitted className="my-3" tx={removeTx} onClose={onClose}>
					<div>
						Removed {removeTx.data[0].toFormat({ decimalPlaces: 2, withUnit: true })} and{" "}
						{removeTx.data[1].toFormat({ decimalPlaces: 2, withUnit: true })}
					</div>
				</TransactionSubmitted>
			)
		}
		if (isPending) {
			return (
				<TransactionPending className="my-6" title="Remove liquidity">
					<div>
						Removing {currencyQuote?.toFormat({ decimalPlaces: 2, withUnit: true })} and{" "}
						{currencyBase?.toFormat({ decimalPlaces: 2, withUnit: true })}
					</div>
				</TransactionPending>
			)
		}
		return (
			<div className="flex flex-col gap-3">
				<RemoveDetail currencyQuote={currencyQuote} currencyBase={currencyBase} feeQuote={feeQuote} feeBase={feeBase} />
				<Button onClick={handleRemove} loading={isPending} disabled={isPending} className="mt-2 py-4">
					Remove
				</Button>
			</div>
		)
	}, [currencyBase, currencyQuote, feeBase, feeQuote, handleRemove, isPending, onClose, removeTx])

	const hideTitle = removeTx !== undefined || isPending

	return (
		<ModalContent
			onOpenAutoFocus={(e) => {
				e.preventDefault()
			}}
			hideCloseButton={isPending}
		>
			<AnimateChangeInHeight className="flex flex-col">
				<ModalHeader className={cn(hideTitle && "m-0 space-y-0 p-0")}>
					<ModalTitle>{hideTitle ? undefined : "Remove liquidity"}</ModalTitle>
					<ModalDescription />
				</ModalHeader>
				{inner}
			</AnimateChangeInHeight>
		</ModalContent>
	)
}
