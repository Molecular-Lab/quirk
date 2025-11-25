import { useMemo } from "react"

import { BigNumber } from "@ethersproject/bignumber"

import { Button, ModalContent, ModalDescription, ModalHeader, ModalTitle } from "@rabbitswap/ui/basic"
import { cn } from "@rabbitswap/ui/utils"

import { AnimateChangeInHeight } from "@/components/Animate/AnimateChangeInHeight"
import { TransactionPending, TransactionSubmitted } from "@/components/Transaction"
import { FeeRow } from "@/feature/liquidity/components"
import { useCollectFee } from "@/feature/liquidity/detail/hooks/useCollectFee"
import { TokenAmount } from "@/types/tokens"

interface ClaimFeeModalProps {
	tokenId: BigNumber
	quote: TokenAmount
	base: TokenAmount
	receiveWETH: boolean
	onClose: () => void
}

export const ClaimFeeModal: React.FC<ClaimFeeModalProps> = ({ tokenId, quote, base, receiveWETH, onClose }) => {
	const {
		mutation: { isPendingTxSubmit: isPending, mutateAsync: collectFee },
		collectFeeTx,
		setCollectFeeTx,
	} = useCollectFee(tokenId, receiveWETH)

	const inner = useMemo(() => {
		if (collectFeeTx) {
			return (
				<TransactionSubmitted
					tx={collectFeeTx}
					onClose={() => {
						setCollectFeeTx(undefined)
						onClose()
					}}
				/>
			)
		}
		if (isPending) {
			return <TransactionPending className="my-6" title="Collecting fees" />
		}
		return (
			<div className="flex flex-col gap-3">
				<div className="flex flex-col gap-2 rounded-xl bg-gray-50 p-3 dark:bg-gray-900">
					<FeeRow tokenAmount={receiveWETH ? quote.wrapped : quote} tokenIconPosition="left" />
					<FeeRow tokenAmount={receiveWETH ? base.wrapped : base} tokenIconPosition="left" />
				</div>
				<div className="text-2xs text-gray-300 lg:text-xs">
					Collecting fees will withdraw currently available fees for you.
				</div>
				<Button loading={isPending} onClick={collectFee} className="mt-2 py-4">
					Collect
				</Button>
			</div>
		)
	}, [base, collectFee, collectFeeTx, isPending, onClose, quote, receiveWETH, setCollectFeeTx])

	const hideTitle = isPending

	return (
		<ModalContent
			onOpenAutoFocus={(e) => {
				e.preventDefault()
			}}
			hideCloseButton={isPending}
		>
			<AnimateChangeInHeight className="flex flex-col">
				<ModalHeader className={cn(hideTitle && "m-0 space-y-0 p-0")}>
					<ModalTitle>{hideTitle ? undefined : "Claim fees"}</ModalTitle>
					<ModalDescription />
				</ModalHeader>
				{inner}
			</AnimateChangeInHeight>
		</ModalContent>
	)
}
