import { TransactionPending } from "@/components/Transaction"

import { BaseProcess } from "./base"

export const LimitOrderPending: React.FC = () => {
	return (
		<TransactionPending title="Placing Limit Order" className="mb-4 mt-6">
			<BaseProcess />
		</TransactionPending>
	)
}
