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
import { DepositTxData, useDepositMutation } from "@/feature/sub-account/hooks/useDepositMutation"
import { useAccount } from "@/hooks/useAccount"
import { EvmToken, TokenAmount } from "@/types/tokens"
import { Transaction } from "@/types/transaction"
import { isUserRejectedError } from "@/utils/transaction"

import { DepositForm } from "./DepositForm"

export const DepositContent: React.FC<{
	token?: EvmToken
	onClose: () => void
}> = ({ token, onClose }) => {
	const { mainAddress, subAddress } = useAccount()
	const [error, setError] = useState(false)
	const [depositTx, setDepositTx] = useState<Transaction<DepositTxData> | undefined>(undefined)
	const [depositingAmount, setDepositingAmount] = useState<TokenAmount | undefined>(undefined)

	const { mutateAsync: deposit, isPendingTxSubmit, isPendingTxConfirm } = useDepositMutation()

	if (error) {
		return (
			<>
				<ModalHeader>
					<ModalTitle />
					<ModalDescription />
				</ModalHeader>
				<TransactionError tx={depositTx} title="Depositing failed!" className="text-center">
					Token deposit to sub-account failed.
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

	if (depositTx) {
		if (depositTx.status === "success") {
			return (
				<>
					<ModalHeader>
						<ModalTitle />
						<ModalDescription />
					</ModalHeader>
					<TransactionConfirmed className="my-3" tx={depositTx} onClose={onClose} title="Deposited successfully!">
						<div className="flex items-center gap-2">
							<MinimalWalletBadge address={mainAddress} accountMode="main" />
							<ArrowRight className="mx-2 size-5" />
							<MinimalWalletBadge address={subAddress} accountMode="sub" />
						</div>
						<div className="text-sm">
							Deposited{" "}
							<span className="text-primary-700 dark:text-primary-300">
								{depositTx.data.amount.toFormat({ decimalPlaces: 6, withUnit: true, rounding: BigNumber.ROUND_DOWN })}
							</span>{" "}
							to{" "}
							<span className="text-primary-700 dark:text-primary-300">
								{shortenText({ text: depositTx.data.subAddress })}
							</span>{" "}
							successfully!
						</div>
					</TransactionConfirmed>
				</>
			)
		}
		if (depositTx.status === "pending") {
			return (
				<>
					<ModalHeader>
						<ModalTitle />
						<ModalDescription />
					</ModalHeader>
					<TransactionSubmitted className="my-3" tx={depositTx} onClose={onClose} title="Depositing">
						<div className="text-sm">
							Depositing{" "}
							<span className="text-primary-700 dark:text-primary-300">
								{depositTx.data.amount.toFormat({ decimalPlaces: 6, withUnit: true, rounding: BigNumber.ROUND_DOWN })}
							</span>{" "}
							to{" "}
							<span className="text-primary-700 dark:text-primary-300">
								{shortenText({ text: depositTx.data.subAddress })}
							</span>
						</div>
					</TransactionSubmitted>
				</>
			)
		}
	}

	if (isPendingTxConfirm && depositingAmount !== undefined) {
		return (
			<>
				<ModalHeader>
					<ModalTitle />
					<ModalDescription />
				</ModalHeader>
				<TransactionPending className="my-3" title="Depositing">
					<div className="text-sm">
						Depositing{" "}
						<span className="text-primary-700 dark:text-primary-300">
							{depositingAmount.toFormat({ decimalPlaces: 6, withUnit: true, rounding: BigNumber.ROUND_DOWN })}
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
				<ModalTitle className="text-center">Deposit Crypto</ModalTitle>
				<ModalDescription className="mx-auto max-w-[350px] pt-1.5 text-center text-sm text-gray-500">
					Fund your wallet by depositing crypto from your main account
				</ModalDescription>
			</ModalHeader>
			<div className="flex flex-col gap-2">
				<div className="my-2 flex items-end justify-between gap-x-2 md:gap-x-3.5">
					<div className="flex flex-1 flex-col gap-1">
						<div className="text-sm font-medium text-gray-500 lg:text-base">From</div>
						<WalletBadge address={mainAddress} accountMode="main" />
					</div>
					<ArrowRight className="my-2.5 size-5 md:my-3.5" />
					<div className="flex flex-1 flex-col gap-1">
						<div className="text-sm font-medium text-gray-500 lg:text-base">To</div>
						<WalletBadge address={subAddress} accountMode="sub" />
					</div>
				</div>
				<DepositForm
					token={token}
					onDepositClick={(tokenAmount) => {
						setDepositingAmount(tokenAmount)
						void deposit(
							{ amount: tokenAmount },
							{
								onSubmitted: ({ tx }) => {
									setDepositTx(tx)
								},
								onSuccess: ({ tx }) => {
									setDepositTx(tx)
								},
								onError: (error) => {
									if (isUserRejectedError(error)) return
									setError(true)
								},
								onTxError: () => {
									setError(true)
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
