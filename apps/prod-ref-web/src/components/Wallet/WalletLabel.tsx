import { WalletIcon } from "lucide-react"
import { Address } from "viem"

import { PropsWithClassName, cn, shortenText } from "@rabbitswap/ui/utils"

import { RabbitSwapPfp } from "@/components/Wallet/RabbitSwapPfp"
import { useWalletDomain } from "@/hooks/wallet/useWalletDomain"

interface WalletLabelProps {
	address: Address | undefined
	showAddress?: boolean
	domainId?: string
}

export const WalletLabel: React.FC<PropsWithClassName<WalletLabelProps>> = ({
	address,
	domainId = ".rabbit",
	showAddress = false,
	className,
}) => {
	const { selectedDomain } = useWalletDomain(address, domainId)

	return (
		<div className={cn("flex flex-col items-start justify-start", className)}>
			<div className={cn("text-sm lg:text-base", selectedDomain?.displayDomain && "font-medium")}>
				{selectedDomain?.displayDomain ?? shortenText({ text: address })}
			</div>
			{showAddress && selectedDomain?.displayDomain && (
				<div className={cn("text-2xs lg:text-xs")}>{shortenText({ text: address })}</div>
			)}
		</div>
	)
}

interface WalletLabelWithIconProps extends WalletLabelProps {
	iconSize?: "medium" | "large"
}

export const WalletLabelWithIcon: React.FC<WalletLabelWithIconProps> = ({
	address,
	domainId = ".rabbit",
	showAddress,
	iconSize = "medium",
}) => {
	const { selectedDomain } = useWalletDomain(address, domainId)

	return (
		<div className={cn("flex items-center gap-1.5", !selectedDomain?.selectedDomain && "gap-1 md:gap-2")}>
			{selectedDomain?.selectedDomain ? (
				<RabbitSwapPfp
					walletAddress={address}
					className={cn("size-7 lg:size-8", iconSize === "large" && "size-8 lg:size-10")}
				/>
			) : (
				<WalletIcon className={cn("size-4 lg:size-5", iconSize === "large" && "size-5 lg:size-6")} />
			)}
			<WalletLabel address={address} showAddress={showAddress} />
		</div>
	)
}
