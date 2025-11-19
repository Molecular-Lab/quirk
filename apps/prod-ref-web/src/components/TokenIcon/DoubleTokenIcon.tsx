import { PropsWithClassName, cn } from "@rabbitswap/ui/utils"

import { TokenIcon } from "@/components/TokenIcon/TokenIcon"
import { EvmToken } from "@/types/tokens"

interface DoubleTokenIconProps extends PropsWithClassName {
	token: [EvmToken | undefined, EvmToken | undefined] | undefined
	tokenClassName?: string
}

/**
 * Display of two token icons in a full circle, side by side with overlap
 */
export const DoubleTokenIcon: React.FC<DoubleTokenIconProps> = ({ token, className, tokenClassName }) => {
	const [token0, token1] = token ?? []

	return (
		<div className={cn("relative grid shrink-0 grid-cols-[1fr_2fr]", className)}>
			<TokenIcon
				token={token0}
				className={cn(
					"absolute left-0 mr-[50%]",
					"outline outline-1 outline-background dark:outline-background-dark",
					token0 && "bg-white",
					tokenClassName,
				)}
			/>
			<div />
			<TokenIcon
				token={token1}
				className={cn(
					"outline outline-1 outline-background dark:outline-background-dark",
					token1 && "bg-white",
					tokenClassName,
				)}
			/>
		</div>
	)
}
