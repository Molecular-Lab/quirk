import { Address } from "viem"

import { ShapeSkeleton } from "@rabbitswap/ui/basic"
import { PropsWithClassName, cn } from "@rabbitswap/ui/utils"

import { modWalletAddress } from "@/utils/oneId"

const profilePaths: string[] = [
	"/images/pfp/rabbit-pfp-0.png",
	"/images/pfp/rabbit-pfp-1.png",
	"/images/pfp/rabbit-pfp-2.png",
	"/images/pfp/rabbit-pfp-3.png",
	"/images/pfp/rabbit-pfp-4.png",
	"/images/pfp/rabbit-pfp-5.png",
	"/images/pfp/rabbit-pfp-6.png",
	"/images/pfp/rabbit-pfp-7.png",
	"/images/pfp/rabbit-pfp-8.png",
	"/images/pfp/rabbit-pfp-9.png",
	"/images/pfp/rabbit-pfp-10.png",
	"/images/pfp/rabbit-pfp-11.png",
	"/images/pfp/rabbit-pfp-12.png",
]

type RabbitSwapPfpProps = PropsWithClassName & ({ walletAddress: Address | undefined } | { imgIndex: number })

export const RabbitSwapPfp: React.FC<RabbitSwapPfpProps> = ({ className, ...props }) => {
	const resolvedAvatarGroup =
		"walletAddress" in props
			? props.walletAddress === undefined
				? -1
				: modWalletAddress(props.walletAddress, profilePaths.length)
			: props.imgIndex

	if (resolvedAvatarGroup === -1) {
		return <ShapeSkeleton className={cn("relative aspect-square size-8 shrink-0 overflow-visible", className)} />
	}

	return (
		<div className={cn("relative aspect-square size-8 shrink-0 overflow-visible", className)}>
			<img
				src={profilePaths[resolvedAvatarGroup]}
				alt="Profile picture"
				className={cn(
					"aspect-square size-[180%] shrink-0 object-cover",
					"overflow-visible",
					"absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
				)}
			/>
		</div>
	)
}
