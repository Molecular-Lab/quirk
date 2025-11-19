import { useMemo } from "react"

import { ShapeSkeleton } from "@rabbitswap/ui/basic"
import { cn } from "@rabbitswap/ui/utils"

import { TokenIcon } from "@/components/TokenIcon"
import { WalletTransactionItem } from "@/hooks/wallet/useWalletTxHistory"
import { TokenAmount } from "@/types/tokenAmount"
import { sortDisplayAmount } from "@/utils/token"

/**
 * @returns components of 2 lines of token amount
 */
export const MainContent: React.FC<{
	tx: WalletTransactionItem | undefined
}> = ({ tx }) => {
	const sortedTokenAmts = useMemo(() => {
		const token0Amount = tx?.token0Amount
		const token1Amount = tx?.token1Amount

		if (tx) {
			if (tx.type === "buy") {
				return [token1Amount, token0Amount]
			}
			if (tx.type === "sell") {
				return [token0Amount, token1Amount]
			}
		}
		return sortDisplayAmount([token0Amount, token1Amount])
	}, [tx])

	if (!tx)
		return (
			<>
				<TokenAmountDisplay tokenAmount={undefined} positive={false} isLoading />
				<TokenAmountDisplay tokenAmount={undefined} positive={false} isLoading />
			</>
		)

	switch (tx.type) {
		case "add":
		case "remove":
		case "collectFee":
		case "remove+collect": {
			return (
				<>
					<TokenAmountDisplay tokenAmount={sortedTokenAmts[0]} positive={tx.type !== "add"} />
					<TokenAmountDisplay tokenAmount={sortedTokenAmts[1]} positive={tx.type !== "add"} />
				</>
			)
		}
		case "buy":
		case "sell": {
			return (
				<>
					<TokenAmountDisplay tokenAmount={sortedTokenAmts[1]} positive={true} />
					<TokenAmountDisplay tokenAmount={sortedTokenAmts[0]} positive={false} />
				</>
			)
		}
		case "limit-create":
		case "limit-cancel":
		case "limit-exec": {
			return (
				<>
					<TokenAmountDisplay tokenAmount={sortedTokenAmts[1]} positive={true} />
					<TokenAmountDisplay tokenAmount={sortedTokenAmts[0]} positive={false} />
				</>
			)
		}
		default: {
			return <></>
		}
	}
}

const TokenAmountDisplay: React.FC<{
	tokenAmount: TokenAmount | undefined
	positive: boolean
	isLoading?: boolean
}> = ({ tokenAmount, positive, isLoading }) => {
	if (isLoading) {
		return (
			<div className="flex items-center gap-1">
				<TokenIcon token={undefined} className="size-3 md:size-3.5" />
				<ShapeSkeleton className="h-4 w-full" />
			</div>
		)
	}

	if (!tokenAmount) return null

	if (tokenAmount.bigNumber.isZero()) return null

	return (
		<div className="flex items-center gap-1">
			<TokenIcon token={tokenAmount.token} className="size-3 md:size-3.5" />
			<span
				className={cn(positive && "text-success-darken")}
			>{`${positive ? "+" : "-"}${tokenAmount.bigNumber.abs().toFormat(6)}`}</span>
			<span className="text-2xs text-gray-600 dark:text-gray-500 md:text-xs">{tokenAmount.token.symbol}</span>
		</div>
	)
}
