import { TransactionConfirmed } from "@/components/Transaction"
import { Transaction } from "@/types/transaction"

import { BaseProcess } from "./base"

export const LimitOrderSuccess: React.FC<{
	tx: Transaction | undefined
	onClose: () => void
}> = ({ tx, onClose }) => {
	return (
		<TransactionConfirmed title="Limit Order Created Successfully!" tx={tx} onClose={onClose} className="mb-3 mt-6">
			<BaseProcess />
		</TransactionConfirmed>
	)
}
