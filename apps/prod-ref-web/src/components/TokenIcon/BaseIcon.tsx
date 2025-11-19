import { ShapeSkeleton } from "@rabbitswap/ui/basic"
import { PropsWithClassName, cn } from "@rabbitswap/ui/utils"

import { EvmToken } from "@/types/tokens"

interface BaseIconProps extends PropsWithClassName {
	token?: EvmToken
	symbolLength?: number
}

export const BaseIcon: React.FC<BaseIconProps> = ({ token, className, symbolLength = 3 }) => {
	if (!token) return <ShapeSkeleton className={cn(className, "size-full rounded-full")} />
	if (token.iconURL) {
		return <img src={token.iconURL} alt={token.symbol} className={cn("object-cover", className)} />
	}

	return (
		<div
			className={cn(
				"flex w-full items-center justify-center overflow-hidden whitespace-nowrap bg-primary-200 text-2xs text-white dark:bg-primary-800",
				className,
			)}
		>
			{token.symbol?.slice(0, Math.max(symbolLength, 1)).toUpperCase()}
		</div>
	)
}
