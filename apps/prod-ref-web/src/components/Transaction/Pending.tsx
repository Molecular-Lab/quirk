import { PropsWithChildren } from "react"

import { Spinner } from "@rabbitswap/ui/icons"
import { PropsWithClassName, cn } from "@rabbitswap/ui/utils"

import { useAccountMode } from "@/feature/sub-account/context"

interface TransactionPendingProps extends PropsWithChildren, PropsWithClassName {
	title: string
}

export const TransactionPending: React.FC<TransactionPendingProps> = ({ title, children, className }) => {
	const { accountMode } = useAccountMode()

	return (
		<div className={cn("flex flex-col items-center gap-4 text-center lg:gap-2", className)}>
			<Spinner className="size-24 text-primary" />
			<div className="text-lg font-semibold lg:text-xl">{title}</div>
			{children}
			{accountMode !== "sub" && (
				<div className="mt-1 text-sm text-gray-400 lg:mt-2">Confirm this transaction in your wallet</div>
			)}
		</div>
	)
}
