import { CircleX, X } from "lucide-react"

import { Toast, useToaster } from "@rabbitswap/ui/basic"

import { TokenIconWithChain } from "@/components/TokenIcon"
import { EvmToken } from "@/types/tokens"
import { Transaction } from "@/types/transaction"

export interface TxToastProps {
	token?: EvmToken | [EvmToken, EvmToken]
	title: string
	description: string
	tx: Transaction
	showChainIcon?: boolean
}

export const ToastContent: React.FC<{ error?: boolean; toastId: string | number } & TxToastProps> = ({
	title,
	description,
	token,
	tx,
	error,
	toastId,
	showChainIcon = false,
}) => {
	const { dismiss } = useToaster()
	return (
		<Toast.Container className="flex w-[var(--width)] flex-col overflow-hidden max-[600px]:w-full">
			<div className="flex grow items-start gap-3 p-6 pb-5">
				{error ? (
					<CircleX className="size-6 text-error" />
				) : (
					<TokenIconWithChain showChainIcon={showChainIcon} token={token} className="mt-1 size-9" />
				)}
				<div className="flex w-full flex-col gap-3">
					<div className="flex w-full flex-col">
						<div className="text-[18px] font-semibold leading-6">{title}</div>
						<div className="whitespace-pre-wrap text-base text-gray-400">{description}</div>
					</div>
					<a
						href={tx.explorerUrl}
						target="_blank"
						rel="noreferrer"
						className="w-fit text-primary-500 underline hover:text-primary-700 dark:hover:text-primary-300"
					>
						View Transaction
					</a>
				</div>
				<X
					className="self-start"
					onClick={(e) => {
						e.stopPropagation()
						dismiss({ customId: tx.hash })
					}}
				/>
			</div>
			<Toast.Progress className={error ? "bg-error" : "bg-success"} toastId={toastId} />
		</Toast.Container>
	)
}
