import { Skeleton } from "@rabbitswap/ui/basic"
import { cn } from "@rabbitswap/ui/utils"

import { TokenAmountInput } from "@/components/TokenAmountInput"
import { useBalance } from "@/hooks/token/useBalance"
import { TokenAmount } from "@/types/tokens"

interface LimitOrderInputProps {
	side: "Buy" | "Sell"
	label: "Amount" | "Total"
	value?: TokenAmount
	onChange: (amount: TokenAmount) => void
	isLoading?: boolean
	setTyping: (typing: boolean) => void
	disabled?: boolean
}

export const LimitOrderInput: React.FC<LimitOrderInputProps> = ({
	side,
	label,
	value,
	onChange,
	isLoading,
	setTyping,
	disabled,
}) => {
	const { data: balance } = useBalance({
		token: value?.token,
	})

	return (
		<div
			className={cn(
				"flex items-center justify-between gap-2",
				"rounded-lg bg-gray-50 dark:bg-gray-925",
				"px-2.5 py-2 lg:px-4 lg:py-3",
			)}
		>
			<div className="text-sm xl:text-base">{label}</div>
			<div className={cn("w-full")}>
				{/* Second Line */}
				<div className="flex items-center gap-2 text-base font-medium xl:text-xl">
					<TokenAmountInput
						disabled={disabled}
						value={value}
						onChange={onChange}
						className={cn(
							"w-full text-lg font-medium xl:text-2xl",
							side === "Sell" && label === "Amount" && balance?.lt(value) && "text-error",
							side === "Buy" && label === "Total" && balance?.lt(value) && "text-error",
						)}
						debounced={300}
						isLoading={isLoading}
						setTyping={setTyping}
						placeholder="0"
					/>
					<Skeleton width={40}>{value?.token.symbol}</Skeleton>
				</div>
			</div>
		</div>
	)
}
