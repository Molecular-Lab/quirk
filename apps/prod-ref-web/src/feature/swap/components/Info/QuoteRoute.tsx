import { SwapPool } from "@rabbitswap/api-core/dto"

import { TokenIcon } from "@/components/TokenIcon"
import { FeeAmount, formatFeeDisplay } from "@/constants/dex"
import { useToken } from "@/hooks/token/useToken"
import { TokenAmount } from "@/types/tokens"

export const QuoteRoute: React.FC<{
	amountIn: TokenAmount | undefined
	amountOut: TokenAmount | undefined
	route: SwapPool[][] | undefined
	chainId: number | undefined
}> = ({ amountIn, amountOut, route, chainId }) => {
	const route0 = route?.[0]

	return (
		<div className="relative flex items-center justify-between">
			<div className="absolute w-full border-t-4 border-dotted border-gray-300 dark:border-gray-700" />
			<TokenIcon token={amountIn?.token} className="z-[1] size-5" />
			{route0?.map((pool) => <RoutePoolItem pool={pool} key={pool.address} chainId={chainId} />)}
			<TokenIcon token={amountOut?.token} className="z-[1] size-5" />
		</div>
	)
}

const RoutePoolItem: React.FC<{ pool: SwapPool; chainId: number | undefined }> = ({ pool, chainId }) => {
	const { data: tokenIn } = useToken(chainId, pool.tokenIn.address)
	const { data: tokenOut } = useToken(chainId, pool.tokenOut.address)
	return (
		<div className="z-[1] flex items-center gap-1 rounded-full bg-gray-50 p-1 dark:bg-gray-900">
			<TokenIcon token={[tokenIn, tokenOut]} className="size-5" />
			<div className="mr-1 text-xs font-medium">{formatFeeDisplay(Number(pool.fee) as FeeAmount)}</div>
		</div>
	)
}
