import BigNumber from "bignumber.js"

import { cn } from "@rabbitswap/ui/utils"

import { TokenAmountInput, TokenBalance } from "@/components/TokenAmountInput"
import { TokenSelector } from "@/components/TokenSelector"
import { useSelectTokenModal } from "@/components/TokenSelector/hooks/useSelectTokenModal"
import { getPriceImpactColor } from "@/feature/swap/utils/priceImpact"
import { useBalance } from "@/hooks/token/useBalance"
import { useUsdPrice } from "@/hooks/token/useUsdPrice"
import { EvmToken, TokenAmount } from "@/types/tokens"
import { formatFiatValue } from "@/utils/number"

interface SwapInputProps {
	label?: "Sell" | "Buy"
	value?: TokenAmount
	hideMaxButton?: boolean
	onChange: (amount: TokenAmount) => void
	isLoading?: boolean
	priceImpact?: BigNumber
	setTyping: (typing: boolean) => void
	disabled?: boolean
}

export const SwapInput: React.FC<SwapInputProps> = ({
	value,
	onChange,
	label,
	hideMaxButton,
	isLoading,
	priceImpact,
	setTyping,
	disabled,
}) => {
	const selectTokenModal = useSelectTokenModal()

	const priceUsd = useUsdPrice(value)
	const isTokenSelected = !!value

	const handleSelectToken = (token: EvmToken) => {
		onChange(TokenAmount.fromString(token, value?.string))
	}

	const { data: balance } = useBalance({
		token: value?.token,
	})

	return (
		<>
			<div
				className={cn(
					"flex w-full flex-col gap-3 rounded-lg bg-gray-50 p-4 dark:bg-gray-925",
					!isTokenSelected && "cursor-pointer",
				)}
				onClick={() => {
					if (!isTokenSelected) selectTokenModal.open({ onSelect: handleSelectToken })
				}}
			>
				{/* First Line */}
				<div className="flex items-center justify-between">
					<div className="font-medium">{label}</div>
					{isTokenSelected && <TokenBalance value={value.token} onChange={onChange} hideMaxButton={hideMaxButton} />}
				</div>

				{/* Second Line */}
				<div className="flex items-end gap-4">
					<TokenSelector token={value?.token} onSelect={handleSelectToken} />
					<div className="flex w-full flex-col items-end">
						{isTokenSelected ? (
							<TokenAmountInput
								disabled={disabled}
								value={value}
								onChange={onChange}
								className={cn("w-full", label === "Sell" && balance?.lt(value) && "text-error")}
								debounced={300}
								isLoading={isLoading}
								setTyping={setTyping}
								placeholder="0"
							/>
						) : (
							<div className="grow text-right text-4xl font-medium leading-[44px] text-gray-300">0</div>
						)}
						<div className="flex gap-1 text-base">
							<div className="text-gray-400">{value?.bigNumber.isZero() ? "-" : formatFiatValue(priceUsd)}</div>
							{priceImpact && !priceImpact.isNaN() && (
								<div className={getPriceImpactColor(priceImpact)}>({priceImpact.toFixed(2)}%)</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</>
	)
}
