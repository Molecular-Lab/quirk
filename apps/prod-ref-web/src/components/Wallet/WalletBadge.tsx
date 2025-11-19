import { ChartColumn, WalletIcon } from "lucide-react"
import { Address } from "viem"

import { Badge } from "@rabbitswap/ui/basic"
import { cn, shortenText } from "@rabbitswap/ui/utils"

import { WalletAvatar } from "@/components/Wallet/WalletAvatar"
import { AccountMode } from "@/feature/sub-account/types"

export const WalletBadge: React.FC<{ address: Address | undefined; accountMode: AccountMode }> = ({
	address,
	accountMode,
}) => {
	if (!address) {
		return <div className="h-12 w-full" />
	}
	return (
		<div className={cn("h-10 w-full rounded-full md:h-12", "py-1 md:py-2", "flex items-center gap-1.5 md:gap-2")}>
			<WalletAvatar address={address} className="size-6 md:size-[30px]" />
			<div className="text-sm text-gray-600 dark:text-gray-400 md:text-base">{shortenText({ text: address })}</div>
			<Badge
				type="translucent"
				className="ml-auto justify-center px-2 text-center text-xs text-primary-700 md:min-w-[54px] md:max-w-[54px] md:px-4"
			>
				{accountMode === "main" ? "Main" : "Sub"}
			</Badge>
		</div>
	)
}

export const MinimalWalletBadge: React.FC<{ address: Address | undefined; accountMode: AccountMode }> = ({
	address,
	accountMode,
}) => {
	if (!address) {
		return null
	}

	return (
		<div className="flex items-center gap-2">
			<div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-gray-50 dark:bg-gray-900">
				{accountMode === "main" ? <WalletIcon className="size-4" /> : <ChartColumn className="size-4" />}
			</div>
			<div className="flex h-7 w-full flex-col text-xs">
				<div className="font-medium">{accountMode === "main" ? "Main wallet" : "Sub-account"}</div>
				<div className="text-gray-600 dark:text-gray-400">{shortenText({ text: address })}</div>
			</div>
		</div>
	)
}
