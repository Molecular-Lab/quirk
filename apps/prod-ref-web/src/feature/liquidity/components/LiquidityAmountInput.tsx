import { Skeleton } from "@rabbitswap/ui/basic"
import { cn } from "@rabbitswap/ui/utils"

import { TokenAmountInput, TokenBalance } from "@/components/TokenAmountInput"
import { TokenSelector } from "@/components/TokenSelector"
import { useBalance } from "@/hooks/token/useBalance"
import { useUsdPrice } from "@/hooks/token/useUsdPrice"
import { EvmToken, TokenAmount } from "@/types/tokens"
import { formatFiatValue } from "@/utils/number"

export interface LiquidityAmountInputProps {
	value: TokenAmount | undefined
	onChange: (value: TokenAmount) => void
}

export const LiquidityAmountInput: React.FC<LiquidityAmountInputProps> = ({ value, onChange }) => {
	const priceUsd = useUsdPrice(value)
	const isTokenSelected = !!value

	const handleSelectToken = (token: EvmToken) => {
		onChange(TokenAmount.fromString(token, value?.string))
	}

	const { data: balance } = useBalance({
		token: value?.token,
	})

	return (
		<div className={cn("flex w-full flex-col gap-3 rounded-2xl", "px-4 py-3", "bg-gray-50 dark:bg-gray-925")}>
			{/* First Row */}
			<div className="flex items-center gap-4">
				<TokenSelector disabled={isTokenSelected} token={value?.token} onSelect={handleSelectToken} />
				{isTokenSelected ? (
					<TokenAmountInput
						value={value}
						onChange={onChange}
						placeholder="0"
						className={cn(balance?.lt(value) && "text-error")}
					/>
				) : (
					<div className="grow text-right text-[36px] font-medium leading-[44px] text-gray-300">0</div>
				)}
			</div>

			{/* Second Row */}
			{isTokenSelected && (
				<div className="flex items-center justify-between">
					<TokenBalance value={value.token} onChange={onChange} />
					<Skeleton isLoading={!priceUsd} width={60} className="text-sm text-gray-400">
						{formatFiatValue(priceUsd)}
					</Skeleton>
				</div>
			)}
		</div>
	)
}
