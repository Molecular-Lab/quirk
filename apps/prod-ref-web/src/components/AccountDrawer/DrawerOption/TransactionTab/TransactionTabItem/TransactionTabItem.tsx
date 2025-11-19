import { PropsWithClassName, cn } from "@rabbitswap/ui/utils"

import { useSwapChainId } from "@/hooks/useChainId"
import { WalletTransactionItem } from "@/hooks/wallet/useWalletTxHistory"

import { BadgeDisplay } from "./BadgeDisplay"
import { Buttons } from "./Buttons"
import { MainContent } from "./MainContent"
import { TimestampDisplay } from "./TimestampDisplay"

export const TransactionTabItem: React.FC<
	PropsWithClassName<{
		tx: WalletTransactionItem | undefined
		isLoading?: boolean
	}>
> = ({ tx, isLoading, className }) => {
	const chainId = useSwapChainId()

	return (
		<div
			className={cn(
				"relative",
				"p-3 md:px-6",
				"text-xs md:text-sm",
				"flex flex-col gap-2",
				"hover:bg-gray-50 hover:dark:bg-gray-900",
				className,
			)}
		>
			<div className="flex w-full items-center justify-between gap-x-2">
				<BadgeDisplay txType={tx?.type} isLoading={isLoading} />
				<TimestampDisplay timestamp={tx?.timestamp} isLoading={isLoading} />
			</div>
			<div className="flex justify-between gap-x-4">
				{/* main content */}
				<div className="flex w-full flex-col gap-1">
					<MainContent tx={tx} />
				</div>

				<Buttons txHash={tx?.txHash} chainId={chainId} isLoading={isLoading} />
			</div>
		</div>
	)
}
