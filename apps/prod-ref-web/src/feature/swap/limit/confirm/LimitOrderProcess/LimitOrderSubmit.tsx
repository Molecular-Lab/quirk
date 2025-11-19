import { TransactionSubmitted } from "@/components/Transaction"
import { Transaction } from "@/types/transaction"

import { BaseProcess } from "./base"

export const LimitOrderSubmit: React.FC<{
	tx: Transaction | undefined
	onClose: () => void
}> = ({ tx, onClose }) => {
	return (
		<TransactionSubmitted title="Limit Order Submitted!" tx={tx} onClose={onClose} className="mb-3 mt-6">
			<BaseProcess />
		</TransactionSubmitted>
	)
}
