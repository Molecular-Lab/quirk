import { TransactionConfirmed } from "@/components/Transaction"
import { Transaction } from "@/types/transaction"

import { BaseProcess } from "./base"

export const SwapSuccess: React.FC<{ tx: Transaction }> = ({ tx }) => {
	return (
		<TransactionConfirmed title="Swapped Successfully!" tx={tx}>
			<BaseProcess />
		</TransactionConfirmed>
	)
}
