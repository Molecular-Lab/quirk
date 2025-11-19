import { AlertTriangle } from "lucide-react"
import { type Address } from "viem"

import { Tooltip, TooltipContent, TooltipTrigger } from "@rabbitswap/ui/basic"

export const OwnershipWarningBox: React.FC<{ ownerAddress: Address | undefined }> = ({ ownerAddress }) => {
	if (ownerAddress === undefined) {
		return <></>
	}
	return (
		<div className="flex items-center gap-3 rounded-xl bg-error/20 p-3 text-xs">
			<AlertTriangle className="size-4 shrink-0" />
			<div>
				You are not the owner of this LP position. You will not be able to withdraw the liquidity from this position
				unless you own the following address: {ownerAddress}
			</div>
		</div>
	)
}

export const OwnershipWarningIcon: React.FC<{ ownerAddress: Address | undefined }> = ({ ownerAddress }) => {
	return (
		<Tooltip>
			<TooltipTrigger>
				<AlertTriangle className="size-4 shrink-0" />
			</TooltipTrigger>
			<TooltipContent side="left" className="max-w-[360px]">
				You are not the owner of this LP position. You will not be able to withdraw the liquidity from this position
				unless you own the following address: {ownerAddress}
			</TooltipContent>
		</Tooltip>
	)
}
