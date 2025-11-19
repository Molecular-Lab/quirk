import { Skeleton } from "@rabbitswap/ui/basic"
import { PropsWithClassName, cn } from "@rabbitswap/ui/utils"

import { DoubleTokenIcon } from "@/components/TokenIcon"
import { EvmToken } from "@/types/tokens"
import { sortDisplayTokens } from "@/utils/token"

export interface TokenPairItemProps extends PropsWithClassName {
	tokenPair: [EvmToken, EvmToken] | undefined
	onClick?: () => void
}

export const TokenPairItem: React.FC<TokenPairItemProps> = ({ tokenPair, onClick, className }) => {
	const [token0, token1]: [EvmToken | undefined, EvmToken | undefined] = tokenPair
		? sortDisplayTokens(tokenPair)
		: [undefined, undefined]

	return (
		<div className={cn("flex w-full items-center gap-2 lg:gap-3", className)} onClick={onClick}>
			<DoubleTokenIcon token={[token0, token1]} tokenClassName="size-6 lg:size-8" />
			<div className="flex w-full flex-col gap-1">
				<div className="flex justify-between">
					<Skeleton
						className="text-sm font-medium text-gray-900 dark:text-gray-100 lg:text-base"
						width={120}
						isLoading={!token0 || !token1}
					>
						{token0?.symbol} / {token1?.symbol}
					</Skeleton>
				</div>
			</div>
		</div>
	)
}
