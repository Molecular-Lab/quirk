import { PropsWithChildren } from "react"
import { Link } from "react-router-dom"

import { ArrowUpCircle } from "lucide-react"

import { Button } from "@rabbitswap/ui/basic"
import { PropsWithClassName, cn } from "@rabbitswap/ui/utils"

import { Transaction } from "@/types/transaction"

interface TransactionSubmittedProps extends PropsWithChildren, PropsWithClassName {
	tx: Transaction | undefined
	title?: string
	onClose?: () => void
}

export const TransactionSubmitted: React.FC<TransactionSubmittedProps> = ({
	tx,
	title = "Transaction submitted",
	onClose,
	children,
	className,
}) => {
	return (
		<div className={cn("flex w-full flex-col items-center gap-4", className)}>
			<ArrowUpCircle className="size-24 text-primary-200" strokeWidth={1} />
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
