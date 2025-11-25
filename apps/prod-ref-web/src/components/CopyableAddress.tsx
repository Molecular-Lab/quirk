import { PropsWithChildren } from "react"

import { Copy } from "lucide-react"
import { type Address } from "viem"

import { useCopyToClipboard } from "@rabbitswap/ui/hooks"
import { CheckCircle } from "@rabbitswap/ui/icons"
import { PropsWithClassName, cn, shortenText } from "@rabbitswap/ui/utils"

interface CopyableAddressProps extends PropsWithClassName, PropsWithChildren {
	address: Address | undefined
	hideCopy?: boolean
}

export const CopyableAddress: React.FC<CopyableAddressProps> = ({
	address,
	hideCopy,
	className,
	children: _children,
}) => {
	const { copied, handleCopy } = useCopyToClipboard(address)
	if (!address) return null

	const children = _children ?? <div className="leading-none">{shortenText({ text: address })}</div>

	return (
		<div
			className={cn("group flex cursor-pointer items-center gap-2", hideCopy && "cursor-default", className)}
			onClick={hideCopy ? undefined : handleCopy}
		>
			{children}
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
