import React, { useState } from "react"

import { BigNumber } from "@ethersproject/bignumber"
import BigNumJs from "bignumber.js"

import { Button, Modal, ModalTrigger } from "@rabbitswap/ui/basic"

import { TokenAmount } from "@/types/tokens"

import { ClaimFeeModal } from "../ClaimFeeModal"

interface CollectFeeBtnProps {
	disabled?: boolean
	unclaimedValue: BigNumJs
	quote: TokenAmount
	base: TokenAmount
	tokenId: BigNumber
	receiveWETH: boolean
}

export const CollectFeeBtn: React.FC<CollectFeeBtnProps> = ({
	disabled,
	unclaimedValue,
	quote,
	base,
	tokenId,
	receiveWETH,
}) => {
	const [open, setOpen] = useState(false)

	return (
		<Modal open={open} onOpenChange={setOpen}>
			<ModalTrigger
				asChild
				onClick={() => {
					setOpen(true)
				}}
			>
				<Button buttonColor="secondary" className="min-w-[160px]" disabled={disabled}>
					{getButtonLabel(unclaimedValue)}
				</Button>
			</ModalTrigger>
			<ClaimFeeModal
				onClose={() => {
					setOpen(false)
				}}
				quote={quote}
				base={base}
				tokenId={tokenId}
				receiveWETH={receiveWETH}
			/>
		</Modal>
	)
}

function getButtonLabel(unclaimedValue: BigNumJs): string {
	if (unclaimedValue.gt(0)) {
		return "Collect Fees"
	}

	return "Collected"
}
