import BigNumber from "bignumber.js"
import { Address } from "viem"

import { Skeleton } from "@rabbitswap/ui/basic"
import { cn, shortenText } from "@rabbitswap/ui/utils"

import { TokenIcon } from "@/components/TokenIcon"
import { useBalance } from "@/hooks/token/useBalance"
import { useUsdPrice } from "@/hooks/token/useUsdPrice"
import { useAccount } from "@/hooks/useAccount"
import { EvmToken } from "@/types/tokens"
import { formatFiatValue } from "@/utils/number"

export interface TokenItemProps {
	token?: EvmToken
	onClick?: () => void
	showAddress?: boolean
	balanceWallet?: Address
}

export const TokenItem: React.FC<TokenItemProps> = ({ token, onClick, showAddress, balanceWallet }) => {
	const { data: balance } = useBalance({ token: token, walletAddress: balanceWallet })
	const usdPrice = useUsdPrice(balance)
	const { address } = useAccount()

	return (
		<div
			className={cn(
				"flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-950 md:px-6",
				token && "cursor-pointer",
			)}
			onClick={onClick}
		>
			<TokenIcon token={token} className="size-9" />
			<div className="flex w-full flex-col gap-1">
				<div className="flex justify-between">
					<Skeleton className="text-base font-medium text-gray-900 dark:text-gray-100" width={120}>
						{token?.name}
					</Skeleton>
					{address && !balance?.bigNumber.isZero() && (
						<Skeleton isLoading={!usdPrice} className="font-medium" width={50}>
							{formatFiatValue(usdPrice)}
						</Skeleton>
					)}
				</div>
				<div className="flex items-center gap-2 text-sm text-gray-400">
					<Skeleton width={50}>{token?.symbol}</Skeleton>
					{showAddress && !token?.isNative && (
						<div className="text-xs text-gray-300 dark:text-gray-700">
							{shortenText({
								text: token?.address,
								startLength: 6,
							})}
						</div>
					)}
					<div className="grow" />
					{address && (
						<Skeleton width={60}>
							{balance && balance.bigint > 0n && (
								<div>{balance.toFormat({ decimalPlaces: 3, rounding: BigNumber.ROUND_DOWN })}</div>
							)}
						</Skeleton>
					)}
				</div>
			</div>
		</div>
	)
}
