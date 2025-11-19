import { ClipboardCopy } from "@rabbitswap/ui/components"
import { cn, shortenText } from "@rabbitswap/ui/utils"

import { TokenIcon } from "@/components/TokenIcon"
import { useUsdPrice } from "@/hooks/token/useUsdPrice"
import { TokenAmount } from "@/types/tokens"
import { formatFiatValue } from "@/utils/number"

export const LimitOrderAmountReview: React.FC<{ amount: TokenAmount; label: string }> = ({ amount, label }) => {
	const priceUsd = useUsdPrice(amount)
	return (
		<div className={cn("flex w-full flex-col gap-1 rounded-lg p-3", "bg-gray-50 dark:bg-gray-900")}>
			<div className="text-sm font-medium text-gray-400 lg:pb-1.5 lg:text-base">{label}</div>
			<div className="flex w-full items-start justify-between gap-2 truncate text-2xl font-medium lg:text-[32px]/10">
				<div className="flex flex-col truncate">
					<div className="truncate">{amount.string}</div>
					<div className="text-sm font-medium text-gray-400 lg:text-base">{formatFiatValue(priceUsd)}</div>
				</div>
				<div className="flex flex-col items-end">
					<div className="flex items-center gap-2">
						<div>{amount.token.symbol}</div>
						<TokenIcon token={amount.token} className="size-6 lg:size-8" />
					</div>
					<div className="flex items-center gap-1">
						<div className="text-xs font-normal text-gray-400">{shortenText({ text: amount.token.address })}</div>
						<ClipboardCopy text={amount.token.address} className="size-3" />
					</div>
				</div>
			</div>
		</div>
	)
}
