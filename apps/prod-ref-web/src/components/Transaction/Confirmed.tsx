import { PropsWithChildren } from "react"
import { Link } from "react-router-dom"

import { Button } from "@rabbitswap/ui/basic"
import { CheckCircle } from "@rabbitswap/ui/icons"
import { PropsWithClassName, cn } from "@rabbitswap/ui/utils"

import { Transaction } from "@/types/transaction"

interface TransactionConfirmedProps extends PropsWithChildren, PropsWithClassName {
	title?: string
	tx: Transaction | undefined
	onClose?: () => void
}

export const TransactionConfirmed: React.FC<TransactionConfirmedProps> = ({
	tx,
	onClose,
	children,
	className,
	title = "Transaction confirmed",
}) => {
	return (
		<div className={cn("flex w-full flex-col items-center gap-4", className)}>
			<CheckCircle className="size-24 text-success" strokeWidth={1} />
			<div className="text-lg font-semibold lg:text-xl">{title}</div>
			{children}
			{onClose !== undefined && (
				<Button className="w-full py-4" onClick={onClose}>
					Close
				</Button>
			)}
			{tx && (
				<Link to={tx.explorerUrl} target="_blank" rel="noreferrer">
					<Button buttonType="text" className="w-full p-0">
						View on Explorer
					</Button>
				</Link>
			)}
		</div>
	)
}
