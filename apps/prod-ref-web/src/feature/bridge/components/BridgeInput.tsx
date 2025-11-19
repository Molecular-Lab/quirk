import { Button } from "@rabbitswap/ui/basic"
import { cn } from "@rabbitswap/ui/utils"

import { TokenAmountInput, TokenBalance } from "@/components/TokenAmountInput"
import { TokenIconWithChain } from "@/components/TokenIcon"
import { useUsdPrice } from "@/hooks/token/useUsdPrice"
import { TokenAmount } from "@/types/tokens"
import { formatFiatValue } from "@/utils/number"

interface BridgeInputProps {
	label?: string
	value: TokenAmount | undefined
	hideMaxButton?: boolean
	onChange?: (amount: TokenAmount) => void
	isLoading?: boolean
	disabled?: boolean
	placeholder?: string
}

export const BridgeInput: React.FC<BridgeInputProps> = ({
	value,
	onChange,
	label,
	hideMaxButton,
	isLoading,
	disabled = false,
	placeholder,
}) => {
	const priceUsd = useUsdPrice(value)

	return (
		<>
			<div className={cn("flex w-full flex-col justify-between gap-3 rounded-lg bg-gray-50 p-4 dark:bg-gray-925")}>
				{/* First Line */}
				<div className="flex items-center justify-between">
					<div className="font-medium">{label}</div>
					<TokenBalance value={value?.token} onChange={onChange} hideMaxButton={hideMaxButton} />
				</div>

				{/* Second Line */}
				<div className="flex items-end gap-4">
					<div className="flex flex-col gap-2 rounded-full">
						<Button
							disabled
							className={cn("flex h-12 shrink-0 items-center gap-2 rounded-full px-4 font-medium", [
								"bg-white hover:bg-gray-100 active:bg-gray-150",
								"disabled:bg-white disabled:text-gray-950 disabled:dark:bg-white disabled:dark:text-gray-950",
								"disabled:cursor-default disabled:pr-5",
							])}
						>
							{value ? (
								<div className={cn("flex items-center gap-4")}>
									<TokenIconWithChain
										token={value.token}
										className="dark:bg-white"
										chainIconClassName="dark:outline-white dark:bg-white"
									/>
									<div className="text-base font-medium">{value.token.symbol}</div>
								</div>
							) : (
								<div className="text-base font-medium text-gray-400">Select Token</div>
							)}
						</Button>
					</div>
					<div className="flex w-full flex-col items-end">
						<TokenAmountInput
							value={value}
							onChange={onChange}
							className="w-full"
							debounced={300}
							isLoading={isLoading}
							disabled={disabled}
							placeholder={placeholder}
						/>

						<div className="flex gap-1 text-base">
							<div className="text-gray-400">
								{value?.bigNumber.isZero() ? (disabled ? "" : "-") : formatFiatValue(priceUsd)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	)
}
