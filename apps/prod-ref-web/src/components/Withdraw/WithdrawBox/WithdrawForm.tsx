import { useMemo, useState } from "react"

import BigNumber from "bignumber.js"

import { Button, Modal, ModalContent, ModalDescription, ModalHeader, ModalTitle } from "@rabbitswap/ui/basic"
import { cn } from "@rabbitswap/ui/utils"

import { TokenAmountInput } from "@/components/TokenAmountInput"
import { MaxButton } from "@/components/TokenAmountInput/MaxButton"
import { TokenSelector } from "@/components/TokenSelector"
import { useBalance } from "@/hooks/token/useBalance"
import { useAccount } from "@/hooks/useAccount"
import { useSwapChainId } from "@/hooks/useChainId"
import { EvmToken, TokenAmount } from "@/types/tokens"
import { getChainEvmToken } from "@/utils/token"

interface WithdrawFormProps {
	onWithdrawClick: (tokenAmount: TokenAmount) => void
	isPendingTxSubmit: boolean
}

export const WithdrawForm: React.FC<WithdrawFormProps> = ({ onWithdrawClick, isPendingTxSubmit }) => {
	const { subAddress } = useAccount()
	const chainId = useSwapChainId()
	const { native } = getChainEvmToken(chainId)
	const [tokenAmount, setTokenAmount] = useState<TokenAmount>(TokenAmount.fromString(native, "0"))

	const { data: balance } = useBalance({
		walletAddress: subAddress,
		token: tokenAmount.token,
	})

	const buttonTitle = useMemo(() => {
		if (tokenAmount.bigNumber.eq(0)) return "Enter amount"
		return "Withdraw"
	}, [tokenAmount])

	const [confirmModalOpen, setConfirmModalOpen] = useState(false)

	return (
		<>
			<div className="flex flex-col gap-3">
				<div className="flex flex-col gap-2">
					<div className="font-medium text-gray-500">Token</div>
					<div>
						<TokenSelector
							balanceWallet={subAddress}
							token={tokenAmount.token}
							onSelect={(token: EvmToken) => {
								setTokenAmount(TokenAmount.fromString(token, "0"))
							}}
							buttonColor="gray"
							className="w-full bg-gray-50 dark:bg-gray-900"
						/>
					</div>
				</div>
				<div className="flex flex-col gap-2">
					<div className="flex items-center justify-between">
						<div className="font-medium text-gray-500">Amount</div>
						<div className="text-sm text-gray-400 dark:text-gray-600">
							Available Balance:{" "}
							{balance ? balance.toFormat({ decimalPlaces: 6, rounding: BigNumber.ROUND_DOWN }) : "-"}
						</div>
					</div>
					<div className="relative">
						<TokenAmountInput
							value={tokenAmount}
							onChange={(newTokenAmt) => {
								setTokenAmount(newTokenAmt)
							}}
							placeholder="Enter Amount"
							className="h-12 w-full rounded-full bg-gray-50 px-4 text-left text-base dark:bg-gray-900"
						/>
						<div className="absolute right-4 top-1/2 -translate-y-1/2">
							<MaxButton
								onValueChange={(value: 1 | 0.25 | 0.5 | 0.75) => {
									setTokenAmount((prev) => {
										if (!balance) return prev

										// preserve eth on max eth
										if (balance.token.isNative && value === 1) {
											const bigNumVal = balance.bigNumber.multipliedBy(value).minus("0.0001")
											if (bigNumVal.gt(balance.bigNumber)) return balance
											return TokenAmount.fromString(balance.token, bigNumVal.toString())
										}

										return TokenAmount.fromString(balance.token, balance.bigNumber.multipliedBy(value).toString())
									})
								}}
							/>
						</div>
					</div>
				</div>
				<Button
					loading={isPendingTxSubmit}
					onClick={() => {
						setConfirmModalOpen(true)
					}}
					disabled={tokenAmount.bigNumber.eq(0) || isPendingTxSubmit}
					className={cn("h-[60px] w-full text-xl font-medium lg:text-xl", "mt-4")}
				>
					{buttonTitle}
				</Button>
			</div>
			<Modal open={confirmModalOpen} onOpenChange={setConfirmModalOpen}>
				<ModalContent>
					<img
						src="/images/rabbit-aww.png"
						alt="Confirm withdraw"
						className={cn("mx-auto max-w-[320px] object-contain", "mt-6 lg:mt-10")}
					/>
					<ModalHeader>
						<ModalTitle className="text-center">
							Are you sure
							<br /> you want to withdraw?
						</ModalTitle>
						<ModalDescription />
					</ModalHeader>
					<Button
						className="h-12"
						onClick={() => {
							onWithdrawClick(tokenAmount)
							setConfirmModalOpen(false)
						}}
					>
						Confirm
					</Button>
				</ModalContent>
			</Modal>
		</>
	)
}
