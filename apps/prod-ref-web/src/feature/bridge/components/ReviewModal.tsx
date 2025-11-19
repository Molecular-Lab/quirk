import { useCallback } from "react"

import BigNumber from "bignumber.js"

import { Button, Modal, ModalContent, ModalHeader, ModalTitle, Separator, Skeleton } from "@rabbitswap/ui/basic"
import { shortenText } from "@rabbitswap/ui/utils"

import { TokenIconWithChain } from "@/components/TokenIcon"
import { useEstimateLzFee } from "@/feature/bridge/form/hook/useEstimateLzFee"
import { useRecipient } from "@/feature/bridge/form/hook/useRecipient"
import { useBalance } from "@/hooks/token/useBalance"
import { useUsdPrice } from "@/hooks/token/useUsdPrice"
import { useAccount } from "@/hooks/useAccount"
import { formatFiatValue } from "@/utils/number"

import { useBridgeMutation } from "../form/hook/useBridgeMutation"
import { useBridgeStore } from "../form/store/bridgeStore"

import { SwapChain } from "./SwapChain"

interface ReviewModalProps {
	open: boolean
	onClose: () => void
}

export const ReviewModal: React.FC<ReviewModalProps> = ({ onClose, open }) => {
	const { address } = useAccount()

	const { destToken, tab, sourceToken } = useBridgeStore()
	const { mutateAsync: bridgeMutation, isPendingTxSubmit } = useBridgeMutation()

	const { data: balanceToken } = useBalance({
		token: sourceToken.token,
		walletAddress: address,
	})

	const { recipient, customAddressInvalid } = useRecipient()

	const usdPrice = useUsdPrice(destToken)

	const handleBridge = useCallback(async () => {
		await bridgeMutation(
			{},
			{
				onSubmitted: () => {
					onClose()
				},
			},
		)
	}, [bridgeMutation, onClose])

	// Gas on destination
	const { data: lzFee, isLoading: isLzFeeLoading } = useEstimateLzFee()

	return (
		<Modal open={open} onOpenChange={onClose}>
			<ModalContent>
				<ModalHeader>
					<ModalTitle>Review {tab}</ModalTitle>
				</ModalHeader>
				<div className="mt-4 flex flex-col gap-6 md:mt-0">
					<SwapChain disabled showChainName />
					<div className="flex flex-col justify-center gap-1.5">
						<div className="text-base/5 font-medium text-gray-400">You Receive</div>
						<div className="flex justify-between gap-1">
							<div className="text-[32px]/10 font-medium">
								{destToken.toFixed()} {destToken.token.symbol ?? ""}
							</div>
							<div className="mr-2.5">
								<TokenIconWithChain className="size-9" token={destToken.token} />
							</div>
						</div>
						<div className="text-base text-gray-400">{formatFiatValue(usdPrice)}</div>
					</div>
					<Separator />
					<div className="flex flex-col gap-3 text-sm">
						<div className="flex items-center justify-between gap-1">
							<div className="text-gray-400">Receive wallet</div>
							<div>{shortenText({ text: recipient })}</div>
						</div>
						<div className="flex items-center justify-between gap-1">
							<div className="flex items-center gap-2 text-gray-400">
								Your {balanceToken?.token.symbol} Balance{" "}
								<TokenIconWithChain token={balanceToken?.token} className="size-[18px]" />
							</div>
							<div>{balanceToken?.toFormat({ decimalPlaces: 2, withUnit: true, rounding: BigNumber.ROUND_DOWN })}</div>
						</div>
						<div className="flex items-center justify-between gap-1">
							<div className="flex items-center gap-2 text-gray-400">Gas on destination</div>
							<Skeleton isLoading={isLzFeeLoading} width={60}>
								{lzFee?.nativeFee.toFormat({ decimalPlaces: 3, withUnit: true })}
							</Skeleton>
						</div>
					</div>
					<Button
						onClick={handleBridge}
						className="w-full p-4 text-base/5 font-medium"
						type="submit"
						disabled={customAddressInvalid}
						loading={isPendingTxSubmit}
					>
						{!customAddressInvalid ? (
							<>Confirm {tab === "deposit" ? "Deposit" : "Withdraw"}</>
						) : (
							"Invalid receive address"
						)}
					</Button>
				</div>
			</ModalContent>
		</Modal>
	)
}
