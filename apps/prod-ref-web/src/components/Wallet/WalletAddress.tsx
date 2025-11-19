import { Copy } from "lucide-react"
import { Address } from "viem"

import { useCopyToClipboard } from "@rabbitswap/ui/hooks"
import { CheckCircle } from "@rabbitswap/ui/icons"
import { PropsWithClassName, cn } from "@rabbitswap/ui/utils"

import { WalletAvatar } from "@/components/Wallet/WalletAvatar"
import { WalletLabel } from "@/components/Wallet/WalletLabel"

interface WalletAddressProps extends PropsWithClassName {
	address: Address | undefined
	hideIcon?: boolean
	hideCopy?: boolean
}

export const WalletAddress: React.FC<WalletAddressProps> = ({ className, hideIcon, hideCopy, address }) => {
	const { copied, handleCopy } = useCopyToClipboard(address)

	if (!address) return null

	return (
		<div
			className={cn("group flex cursor-pointer items-center gap-2", hideCopy && "cursor-default", className)}
			onClick={hideCopy ? undefined : handleCopy}
		>
			{!hideIcon && <WalletAvatar address={address} />}
			<WalletLabel address={address} showAddress={!hideIcon} />
			{!hideCopy && (
				<div className="hidden transition-all group-hover:block">
					{copied ? (
						<CheckCircle className="size-4 text-success hover:text-success-hover" />
					) : (
						<Copy className="size-4 text-gray-400 hover:text-gray-500" />
					)}
				</div>
			)}
		</div>
	)
}
