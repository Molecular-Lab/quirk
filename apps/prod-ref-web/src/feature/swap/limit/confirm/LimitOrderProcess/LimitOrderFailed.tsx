import { TransactionError } from "@/components/Transaction"
import { useLimitProcessStore } from "@/feature/swap/limit/store/limitProcessStore"
import { Transaction } from "@/types/transaction"

import { BaseProcess } from "./base"

export const LimitOrderFailed: React.FC<{
	tx: Transaction | undefined
}> = ({ tx }) => {
	const { setProcess } = useLimitProcessStore()
	return (
		<TransactionError
			title="Create Limit Order Failed!"
			tx={tx}
			onClose={() => {
				setProcess("REVIEWING")
			}}
		>
			<BaseProcess />
			<div className="text-sm text-gray-400 dark:text-gray-600">
				Failed to create limit order.
				<br />
				Please try again.
			</div>
		</TransactionError>
	)
}
