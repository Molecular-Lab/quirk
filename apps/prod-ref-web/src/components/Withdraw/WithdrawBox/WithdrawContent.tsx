import { useState } from "react"

import BigNumber from "bignumber.js"
import { ArrowRight } from "lucide-react"

import { Button, ModalDescription, ModalHeader, ModalTitle } from "@rabbitswap/ui/basic"
import { shortenText } from "@rabbitswap/ui/utils"

import {
	TransactionConfirmed,
	TransactionError,
	TransactionPending,
	TransactionSubmitted,
} from "@/components/Transaction"
import { MinimalWalletBadge, WalletBadge } from "@/components/Wallet/WalletBadge"
import { WithdrawTxData, useWithdrawMutation } from "@/feature/sub-account/hooks/useWithdrawMutation"
import { useAccount } from "@/hooks/useAccount"
import { TokenAmount } from "@/types/tokens"
import { Transaction } from "@/types/transaction"
import { isUserRejectedError } from "@/utils/transaction"

import { WithdrawForm } from "./WithdrawForm"

export const WithdrawContent: React.FC<{
	onClose: () => void
}> = ({ onClose }) => {
	const { mainAddress, subAddress } = useAccount()

	const [error, setError] = useState(false)
	const [withdrawTx, setWithdrawTx] = useState<Transaction<WithdrawTxData> | undefined>(undefined)
	const [withdrawingAmount, setWithdrawingAmount] = useState<TokenAmount | undefined>(undefined)

	const { mutateAsync: withdraw, isPendingTxSubmit, isPendingTxConfirm } = useWithdrawMutation()

	if (error) {
		return (
			<>
				<ModalHeader>
					<ModalTitle />
					<ModalDescription />
				</ModalHeader>
				<TransactionError tx={withdrawTx} title="Withdrawing failed!" className="text-center">
					Token withdraw from sub-account failed.
					<br /> Please try again.
					<Button
						buttonColor="primary"
						className="w-full p-4"
						onClick={() => {
							setError(false)
						}}
					>
						Try again
					</Button>
				</TransactionError>
			</>
		)
	}

	if (withdrawTx) {
		if (withdrawTx.status === "success") {
			return (
				<>
					<ModalHeader>
						<ModalTitle />
						<ModalDescription />
					</ModalHeader>
					<TransactionConfirmed className="my-3" tx={withdrawTx} onClose={onClose} title="Withdrawn successfully!">
						<div className="flex items-center gap-2">
							<MinimalWalletBadge address={subAddress} accountMode="sub" />
							<ArrowRight className="mx-2 size-5" />
							<MinimalWalletBadge address={mainAddress} accountMode="main" />
						</div>
						<div className="text-sm">
							Withdrawn{" "}
							<span className="text-primary-700 dark:text-primary-300">
								{withdrawTx.data.amount.toFormat({ decimalPlaces: 6, withUnit: true, rounding: BigNumber.ROUND_DOWN })}
							</span>{" "}
							to{" "}
							<span className="text-primary-700 dark:text-primary-300">
								{shortenText({ text: withdrawTx.data.mainAddress })}
							</span>{" "}
							successfully!
						</div>
					</TransactionConfirmed>
				</>
			)
		}
		if (withdrawTx.status === "pending") {
			return (
				<>
					<ModalHeader>
						<ModalTitle />
						<ModalDescription />
					</ModalHeader>
					<TransactionSubmitted className="my-3" tx={withdrawTx} onClose={onClose} title="Withdrawing">
						<div className="text-sm">
							Withdrawing{" "}
							<span className="text-primary-700 dark:text-primary-300">
								{withdrawTx.data.amount.toFormat({ decimalPlaces: 6, withUnit: true, rounding: BigNumber.ROUND_DOWN })}
							</span>{" "}
							to{" "}
							<span className="text-primary-700 dark:text-primary-300">
								{shortenText({ text: withdrawTx.data.mainAddress })}
							</span>
						</div>
					</TransactionSubmitted>
				</>
			)
		}
	}

	if (isPendingTxConfirm && withdrawingAmount !== undefined) {
		return (
			<>
				<ModalHeader>
					<ModalTitle />
					<ModalDescription />
				</ModalHeader>
				<TransactionPending className="my-3" title="Withdrawing">
					<div className="text-sm">
						Withdrawing{" "}
						<span className="text-primary-700 dark:text-primary-300">
							{withdrawingAmount.toFormat({ decimalPlaces: 6, withUnit: true, rounding: BigNumber.ROUND_DOWN })}
						</span>{" "}
						to <span className="text-primary-700 dark:text-primary-300">{shortenText({ text: subAddress })}</span>
					</div>
				</TransactionPending>
			</>
		)
	}

	return (
		<>
			<ModalHeader>
				<ModalTitle className="text-center">Withdraw Crypto</ModalTitle>
				<ModalDescription className="mx-auto max-w-[350px] pt-1.5 text-center text-sm text-gray-500">
					Withdraw your crypto to your main account
				</ModalDescription>
			</ModalHeader>
			<div className="flex flex-col gap-2">
				<div className="my-2 flex items-end justify-between gap-x-2 md:gap-x-3.5">
					<div className="flex flex-1 flex-col gap-1">
						<div className="text-sm font-medium text-gray-500 lg:text-base">From</div>
						<WalletBadge address={subAddress} accountMode="sub" />
					</div>
					<ArrowRight className="my-2.5 size-5 md:my-3.5" />
					<div className="flex flex-1 flex-col gap-1">
						<div className="text-sm font-medium text-gray-500 lg:text-base">To</div>
						<WalletBadge address={mainAddress} accountMode="main" />
					</div>
				</div>
				<WithdrawForm
					onWithdrawClick={(tokenAmount) => {
						setWithdrawingAmount(tokenAmount)
						void withdraw(
							{ amount: tokenAmount },
							{
								onSubmitted: ({ tx }) => {
									setWithdrawTx(tx)
								},
								onSuccess: ({ tx }) => {
									setWithdrawTx(tx)
								},
								onError: (error) => {
									if (isUserRejectedError(error)) return
									if (error.message === "Insufficient gas") {
										onClose()
										return
									}
									setError(true)
								},
								onTxError: (_, { resp }) => {
									setError(true)
									setWithdrawTx(resp.tx)
								},
							},
						)
					}}
					isPendingTxSubmit={isPendingTxSubmit}
				/>
			</div>
		</>
	)
}
