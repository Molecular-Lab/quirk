import { useEffect, useMemo, useState } from "react"

import BigNumber from "bignumber.js"

import { Button } from "@rabbitswap/ui/basic"
import { cn } from "@rabbitswap/ui/utils"

import { TokenAmountInput } from "@/components/TokenAmountInput"
import { MaxButton } from "@/components/TokenAmountInput/MaxButton"
import { TokenSelector } from "@/components/TokenSelector"
import { useBalance } from "@/hooks/token/useBalance"
import { useAccount } from "@/hooks/useAccount"
import { useSwapChainId } from "@/hooks/useChainId"
import { EvmToken, TokenAmount } from "@/types/tokens"
import { getChainEvmToken } from "@/utils/token"

interface DepositFormProps {
	token?: EvmToken
	onDepositClick: (tokenAmount: TokenAmount) => void
	isPendingTxSubmit: boolean
}

export const DepositForm: React.FC<DepositFormProps> = ({ token, onDepositClick, isPendingTxSubmit }) => {
	const { mainAddress } = useAccount()
	const chainId = useSwapChainId()
	const { native } = getChainEvmToken(chainId)
	const [tokenAmount, setTokenAmount] = useState<TokenAmount>(TokenAmount.fromString(token ?? native, "0"))

	useEffect(() => {
		setTokenAmount(TokenAmount.fromString(token ?? native, "0"))
	}, [native, token])

	const { data: balance } = useBalance({
		walletAddress: mainAddress,
		token: tokenAmount.token,
	})

	const buttonTitle = useMemo(() => {
		if (tokenAmount.bigNumber.eq(0)) return "Enter amount"
		return "Deposit"
	}, [tokenAmount])

	return (
		<div className="flex flex-col gap-3">
			<div className="flex flex-col gap-2">
				<div className="font-medium text-gray-500">Token</div>
				<div>
					<TokenSelector
						balanceWallet={mainAddress}
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
						Available Balance: {balance ? balance.toFormat({ decimalPlaces: 6, rounding: BigNumber.ROUND_DOWN }) : "-"}
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
					onDepositClick(tokenAmount)
				}}
				disabled={tokenAmount.bigNumber.eq(0)}
				className={cn("h-[60px] w-full text-xl font-medium lg:text-xl", "mt-4")}
			>
				{buttonTitle}
			</Button>
		</div>
	)
}
