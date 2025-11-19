import { Address } from "viem"

import { MinidentIcon } from "@rabbitswap/ui/components"
import { PropsWithClassName, cn } from "@rabbitswap/ui/utils"

import { RabbitSwapPfp } from "@/components/Wallet/RabbitSwapPfp"
import { useWalletDomain } from "@/hooks/wallet/useWalletDomain"

export const WalletAvatar: React.FC<PropsWithClassName<{ address: Address }>> = ({ address, className }) => {
	const { selectedDomain } = useWalletDomain(address, ".rabbit")

	return (
		<div
			className={cn(
				"size-7 shrink-0 rounded-full sm:size-8",
				!selectedDomain?.selectedDomain && "bg-gray-100 p-0.5 dark:bg-gray-800",
				className,
			)}
		>
			{selectedDomain?.selectedDomain ? (
				<RabbitSwapPfp walletAddress={address} className="size-full" />
			) : (
				<MinidentIcon seed={address} />
			)}
		</div>
	)
}
