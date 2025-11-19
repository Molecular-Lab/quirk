import { ClipboardCopy } from "@rabbitswap/ui/components"
import { shortenText } from "@rabbitswap/ui/utils"

import { TokenIcon } from "@/components/TokenIcon"
import { useUsdPrice } from "@/hooks/token/useUsdPrice"
import { TokenAmount } from "@/types/tokens"
import { formatFiatValue } from "@/utils/number"

export const SwapAmountReview: React.FC<{ amount: TokenAmount; label: string }> = ({ amount, label }) => {
	const priceUsd = useUsdPrice(amount)
	return (
		<div className="flex w-full flex-col">
			<div className="pb-1.5 text-base font-medium text-gray-400">{label}</div>
			<div className="flex w-full items-start justify-between gap-2 truncate text-[32px]/10 font-medium">
				<div className="flex flex-col truncate">
					<div className="truncate">{amount.string}</div>
					<div className="text-base font-medium text-gray-400">{formatFiatValue(priceUsd)}</div>
				</div>
				<div className="flex flex-col items-end">
					<div className="flex items-center gap-2">
						<div>{amount.token.symbol}</div>
						<TokenIcon token={amount.token} className="size-8" />
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
