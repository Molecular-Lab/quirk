import { useMemo } from "react"

import BigNumber from "bignumber.js"

import { Skeleton } from "@rabbitswap/ui/basic"
import { useTheme } from "@rabbitswap/ui/providers"
import { cn } from "@rabbitswap/ui/utils"

import { TokenIcon } from "@/components/TokenIcon"
import { useUsdPrice } from "@/hooks/token/useUsdPrice"
import { TokenAmount } from "@/types/tokens"
import { useTokenColor } from "@/utils/token"

export const DepositRatio: React.FC<{
	token0Amount: TokenAmount | undefined
	token1Amount: TokenAmount | undefined
}> = ({ token0Amount, token1Amount }) => {
	const { theme } = useTheme()

	const token0Usd = useUsdPrice(token0Amount)
	const token1Usd = useUsdPrice(token1Amount)

	// 0-100
	const token0Pct = useMemo<number>(() => {
		if (token0Usd === undefined || token1Usd === undefined) {
			return 50
		}
		const totalUsd = token0Usd.plus(token1Usd)
		if (totalUsd.isZero()) {
			return 50
		}
		return token0Usd.div(totalUsd).shiftedBy(2).toNumber()
	}, [token0Usd, token1Usd])

	const { themeColor: token0Color } = useTokenColor(token0Amount?.token, theme)
	const { themeColor: token1Color } = useTokenColor(token1Amount?.token, theme)

	return (
		<div className="flex items-center justify-between gap-5 lg:gap-8">
			<div className="whitespace-nowrap text-sm text-gray-500">Deposit Ratio</div>
			<div
				className={cn("flex w-full flex-col gap-1.5", !token0Amount?.amount && !token1Amount?.amount && "opacity-20")}
			>
				<div className="flex items-center justify-between text-xs lg:text-sm">
					<div className="flex items-center gap-1">
						<div>{BigNumber(token0Pct).toFixed(2)}%</div>
						{token0Amount && (
							<>
								<TokenIcon token={token0Amount.token} className="size-4" />
								<Skeleton isLoading={!token0Amount}>{token0Amount.token.symbol}</Skeleton>
							</>
						)}
					</div>
					<div className="grow" />
					<div className="flex items-center gap-1">
						<div>{BigNumber(100 - token0Pct).toFixed(2)}%</div>
						{token1Amount && (
							<>
								<TokenIcon token={token1Amount.token} className="size-4" />
								<Skeleton isLoading={!token1Amount}>{token1Amount.token.symbol}</Skeleton>
							</>
						)}
					</div>
				</div>
				<div
					className={cn(
						"flex h-1 gap-1 overflow-hidden rounded-full",
						(!token0Amount?.amount || !token1Amount?.amount) && "gap-0",
						!token0Amount?.amount && !token1Amount?.amount && "gap-1",
					)}
				>
					<div style={{ width: `${token0Pct}%`, background: token0Color }} />
					<div style={{ width: `${100 - token0Pct}%`, background: token1Color }} />
				</div>
			</div>
		</div>
	)
}
