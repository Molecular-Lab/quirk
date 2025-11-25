import { ArrowLeftRight, Landmark, Sparkles } from "lucide-react"

import { Badge, ShapeSkeleton } from "@rabbitswap/ui/basic"
import { PropsWithClassName } from "@rabbitswap/ui/utils"

import { WalletTransactionItem } from "@/hooks/wallet/useWalletTxHistory"

export const BadgeDisplay: React.FC<{
	txType: WalletTransactionItem["type"] | undefined
	isLoading?: boolean
}> = ({ txType, isLoading }) => {
	if (isLoading) {
		return (
			<div className="flex items-center gap-x-2">
				<ShapeSkeleton className="h-[18px] w-12 rounded-full" />
			</div>
		)
	}

	return (
		<div className="flex items-center gap-x-1">
			<Badge size="small" className="flex w-fit items-center gap-x-1 !pl-1.5 !pr-2 !text-2xs" variant="primary">
				<TxTypeIcon txType={txType} isLoading={isLoading} className="size-2.5 shrink-0" />
				{getTxTypeDisplay(txType)}
			</Badge>
		</div>
	)
}

function getTxTypeDisplay(type: WalletTransactionItem["type"] | undefined): string {
	switch (type) {
		case "add": {
			return "Add liquidity"
		}
		case "remove": {
			return "Remove liquidity"
		}
		case "collectFee": {
			return "Collect fee"
		}
		case "remove+collect": {
			return "Remove + Collect fee"
		}
		case "buy":
		case "sell": {
			return "Swap"
		}
		case "limit-create": {
			return "Create order"
		}
		case "limit-cancel": {
			return "Cancel order"
		}
		case "limit-exec": {
			return "Execute order"
		}
		default: {
			return ""
		}
	}
}

const TxTypeIcon: React.FC<
	PropsWithClassName<{
		txType: WalletTransactionItem["type"] | undefined
		isLoading?: boolean
	}>
> = ({ txType, isLoading, className }) => {
	if (isLoading || !txType) {
		return <ShapeSkeleton className={className} />
	}

	switch (txType) {
		case "add":
		case "remove":
		case "collectFee":
		case "remove+collect": {
			return <Landmark className={className} />
		}
		case "buy":
		case "sell": {
			return <ArrowLeftRight className={className} />
		}
		case "limit-create":
		case "limit-cancel":
		case "limit-exec": {
			return <Sparkles className={className} />
		}
		default: {
			return null
		}
	}
}
