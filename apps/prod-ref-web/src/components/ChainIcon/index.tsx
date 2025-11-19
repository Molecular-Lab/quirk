import { ShapeSkeleton } from "@rabbitswap/ui/basic"
import { PropsWithClassName, cn } from "@rabbitswap/ui/utils"

import { CHAINS_ICON } from "@/constants/chain"

interface ChainIconProps extends PropsWithClassName {
	chainId: number | undefined
}

export const ChainIcon: React.FC<PropsWithClassName<ChainIconProps>> = ({ chainId, className }) => {
	if (!chainId) {
		return <ShapeSkeleton className={cn("size-5 shrink-0 rounded-full", className)} />
	}

	const chain = CHAINS_ICON[chainId]
	if (!chain) {
		return <div className={cn("size-5 shrink-0 rounded-full", className)} />
	}
	return (
		<img
			src={chain.iconURL}
			alt={chain.name}
			className={cn("pointer-events-none size-5 shrink-0 overflow-hidden rounded-full object-cover", className)}
		/>
	)
}
