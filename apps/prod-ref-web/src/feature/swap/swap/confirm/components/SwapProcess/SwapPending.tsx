import { TransactionPending } from "@/components/Transaction"

import { BaseProcess } from "./base"

export const SwapPending: React.FC = () => {
	return (
		<TransactionPending title="Confirm Swap" className="my-6">
			<BaseProcess />
		</TransactionPending>
	)
}
