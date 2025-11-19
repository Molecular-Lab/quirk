import { PropsWithClassName, cn } from "@rabbitswap/ui/utils"

import { ChainIcon } from "@/components/ChainIcon"
import { TokenIcon, TokenIconProps } from "@/components/TokenIcon"

interface TokenIconWithChainProps extends PropsWithClassName {
	token: TokenIconProps["token"]
	/**
	 * @default true
	 */
	showChainIcon?: boolean
	chainIconClassName?: string
}

export const TokenIconWithChain: React.FC<TokenIconWithChainProps> = ({
	token,
	showChainIcon = true,
	className,
	chainIconClassName,
}) => {
	const isDouble = Array.isArray(token)
	const chainId = !isDouble ? token?.chainId : token[0]?.chainId === token[1]?.chainId ? token[0]?.chainId : undefined

	return (
		<div className="relative">
			<TokenIcon token={token} className={className} />
			{showChainIcon && (
				<ChainIcon
					chainId={chainId}
					className={cn(
						"absolute -bottom-px -right-1/4 size-1/2",
						"outline outline-background dark:outline-background-dark",
						chainIconClassName,
					)}
				/>
			)}
		</div>
	)
}
