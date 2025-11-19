import { cn } from "@rabbitswap/ui/utils"

import { useAccount } from "@/hooks/useAccount"
import { useWalletAllTxHistory } from "@/hooks/wallet/useWalletTxHistory"

import { Empty } from "./Empty"
import { TransactionTabItem } from "./TransactionTabItem"

export const TransactionTab: React.FC = () => {
	const { address } = useAccount()
	const { isLoadingCoreTxs, isLoadingLimitOrderTxs, txs } = useWalletAllTxHistory(address)

	if (isLoadingCoreTxs && isLoadingLimitOrderTxs) {
		return (
			<div className="h-full flex-1 overflow-y-auto">
				{Array.from({ length: 5 }).map((_, i) => (
					<TransactionTabItem key={i} tx={undefined} isLoading />
				))}
			</div>
		)
	}

	return (
		<div className={cn("flex h-full flex-1 flex-col overflow-y-auto", "divide-y divide-gray-200 dark:divide-gray-800")}>
			{txs?.length === 0 ? (
				<Empty />
			) : (
				txs?.map((tx, i) => {
					return <TransactionTabItem key={i} tx={tx} />
				})
			)}
			{/* some is loading */}
			{(isLoadingCoreTxs || isLoadingLimitOrderTxs) && (
				<>
					{Array.from({ length: 5 }).map((_, i) => (
						<TransactionTabItem key={i} tx={undefined} isLoading />
					))}
				</>
			)}
		</div>
	)
}
