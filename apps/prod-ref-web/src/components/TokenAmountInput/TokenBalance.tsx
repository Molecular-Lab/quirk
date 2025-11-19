import BigNumber from "bignumber.js"

import { Skeleton } from "@rabbitswap/ui/basic"
import { PropsWithClassName, cn } from "@rabbitswap/ui/utils"

import { MaxButton } from "@/components/TokenAmountInput/MaxButton"
import { useBalance } from "@/hooks/token/useBalance"
import { useAccount } from "@/hooks/useAccount"
import { Token, TokenAmount } from "@/types/tokens"

interface TokenBalanceProps extends PropsWithClassName {
	value: Token | undefined
	onChange?: (amount: TokenAmount) => void
	hideMaxButton?: boolean
	showUnit?: boolean
}

export const TokenBalance: React.FC<TokenBalanceProps> = ({ onChange, value, hideMaxButton, showUnit, className }) => {
	const { address } = useAccount()
	const { data: balance, isLoading } = useBalance({
		token: value,
	})

	if (!address || !value) return <div />
	return (
		<div className={cn("flex items-center gap-1 text-sm leading-none text-gray-400", className)}>
			Balance:
			<Skeleton isLoading={isLoading} width={50}>
				{balance?.toFormat({ decimalPlaces: 4, rounding: BigNumber.ROUND_DOWN })}
			</Skeleton>
			{showUnit && <span>{value.symbol}</span>}
			{balance && balance.bigint !== 0n && !hideMaxButton && (
				<MaxButton
					onValueChange={(v) =>
						onChange?.(TokenAmount.fromString(balance.token, balance.bigNumber.multipliedBy(v).toString()))
					}
				/>
			)}
		</div>
	)
}
