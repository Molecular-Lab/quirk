import { TransactionSubmitted } from "@/components/Transaction"
import { Transaction } from "@/types/transaction"

import { BaseProcess } from "./base"

export const SwapSubmit: React.FC<{ tx: Transaction }> = ({ tx }) => {
	return (
		<TransactionSubmitted title="Swap Submitted!" tx={tx}>
			<BaseProcess />
		</TransactionSubmitted>
	)
}
