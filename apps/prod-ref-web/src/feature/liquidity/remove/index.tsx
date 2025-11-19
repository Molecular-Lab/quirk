import { useMemo, useState } from "react"

import { BigNumber } from "@ethersproject/bignumber"
import { BigNumber as BigNumJs } from "bignumber.js"

import { Button, Modal, ModalTrigger, Slider, Switch } from "@rabbitswap/ui/basic"

import { PositionHeader } from "@/components/PositionHeader"
import { PositionTitle } from "@/components/PositionTitle"
import { SwitchChainButton } from "@/components/SwitchChainButton"
import { usePositionAndFee } from "@/hooks/liquidity/usePositionAndFee"
import { useAccount } from "@/hooks/useAccount"
import { useSwapChainId } from "@/hooks/useChainId"
import { PositionState } from "@/types/position"
import { TokenAmount } from "@/types/tokens"
import { Transaction } from "@/types/transaction"
import { getChainEvmToken } from "@/utils/token"

import { ConfirmationModal } from "./components/ConfirmationModal"
import { RemoveDetail } from "./components/RemoveDetail"
import { RemovePercentageButtons } from "./components/RemovePercentageButtons"

interface RemoveLiquidityPageProps {
	tokenId: BigNumber
}

export const RemoveLiquidityPage: React.FC<RemoveLiquidityPageProps> = ({ tokenId }) => {
	const chainId = useSwapChainId()
	const account = useAccount()
	const { wrapped } = getChainEvmToken(chainId)

	const [modalOpen, setModalOpen] = useState(false)
	const [removeTx, setRemoveTx] = useState<Transaction<[TokenAmount, TokenAmount]> | undefined>()

	/**
	 * show receive as WETH when any token in pool is native
	 */
	const [receiveWETH, setReceiveWETH] = useState(false)
	const {
		position,
		fee: [feeQuote, feeBase],
		isLoading,
	} = usePositionAndFee(tokenId, chainId, !receiveWETH)

	// remove amount
	const [removePercentageIn100, setRemovePercentageIn100] = useState(0)

	const currencyQuoteAmount = useMemo(() => {
		return position?.amountQuote.multiply(BigNumJs(removePercentageIn100).shiftedBy(-2))
	}, [position, removePercentageIn100])

	const currencyBaseAmount = useMemo(() => {
		return position?.amountBase.multiply(BigNumJs(removePercentageIn100).shiftedBy(-2))
	}, [position, removePercentageIn100])

	const handleOnPercentSelect = (v: number) => {
		setRemovePercentageIn100(v)
	}

	const handleSliderChange = (v: number) => {
		setRemovePercentageIn100(v)
	}

	const handleOnSubmitted = (tx: Transaction<[TokenAmount, TokenAmount]>) => {
		setRemovePercentageIn100(0)
		setRemoveTx(tx)
	}

	const handleOnSuccess = (tx: Transaction<[TokenAmount, TokenAmount]>) => {
		setRemoveTx(tx)
	}

	const handleModalOpenChange = (v: boolean) => {
		setModalOpen(v)
		if (v) {
			setRemoveTx(undefined)
		}
	}

	const { address } = useAccount()

	const disabledRemoveButton: boolean =
		removePercentageIn100 === 0 || position?.positionState === "removed" || !position?.isOwner(address)

	return (
		<div className="flex w-full max-w-[514px] flex-col gap-3 sm:gap-5 lg:gap-7">
			<PositionHeader title="Remove liquidity" tokenId={tokenId} />
			{position !== undefined ? (
				<div className="flex w-full flex-col gap-3">
					<PositionTitle position={position} />
					<div className="flex flex-col rounded-lg bg-gray-50 px-4 py-3 dark:bg-gray-900">
						<div>Amount</div>
						<div className="mt-1 flex items-center justify-between">
							<div className="text-2xl lg:text-4xl">{removePercentageIn100}%</div>
							<RemovePercentageButtons onClick={handleOnPercentSelect} />
						</div>
						<Slider
							step={1}
							min={0}
							max={100}
							value={[removePercentageIn100]}
							onValueChange={(values) => {
								handleSliderChange(values[0]!)
							}}
							className="mt-5"
						/>
					</div>
					<RemoveDetail
						currencyQuote={currencyQuoteAmount}
						currencyBase={currencyBaseAmount}
						feeQuote={feeQuote}
						feeBase={feeBase}
					/>
					{position.showCollectAsWeth && (
						<div className="flex items-center justify-between">
							<div>Collect as {wrapped.symbol}</div>
							<Switch checked={receiveWETH} onCheckedChange={setReceiveWETH} />
						</div>
					)}
					{account.chainId !== chainId ? (
						<SwitchChainButton toChainId={chainId} className="w-full py-4" />
					) : (
						<Modal open={modalOpen} onOpenChange={handleModalOpenChange}>
							<ModalTrigger>
								<Button className="w-full py-4" disabled={disabledRemoveButton} loading={isLoading}>
									{getRemoveButtonLabel(position.positionState, removePercentageIn100, position.isOwner(address))}
								</Button>
							</ModalTrigger>
							<ConfirmationModal
								chainId={chainId}
								tokenId={tokenId}
								currencyQuote={currencyQuoteAmount}
								currencyBase={currencyBaseAmount}
								feeQuote={feeQuote}
								feeBase={feeBase}
								removePercentageIn100={removePercentageIn100}
								receiveWETH={receiveWETH}
								removeTx={removeTx}
								onSubmitted={handleOnSubmitted}
								onSuccess={handleOnSuccess}
								onClose={() => {
									setModalOpen(false)
								}}
							/>
						</Modal>
					)}
				</div>
			) : (
				<div className="flex h-64 w-full items-center justify-center rounded-lg bg-gray-50 p-3 dark:bg-gray-900">
					Position not available
				</div>
			)}
		</div>
	)
}

function getRemoveButtonLabel(
	positionState: PositionState | undefined,
	removePercentageIn100: number,
	isOwner: boolean | undefined,
): string {
	if (!positionState) {
		return "Loading"
	}
	if (isOwner === false) {
		return "You are not the owner of this position"
	}
	if (positionState === "removed") {
		return "Closed"
	}
	if (removePercentageIn100 === 0) {
		return "Enter a Percent"
	}
	return "Remove"
}
