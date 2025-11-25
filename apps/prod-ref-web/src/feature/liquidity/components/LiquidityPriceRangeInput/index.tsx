import { Minus, Plus } from "lucide-react"

import { Button, Input } from "@rabbitswap/ui/basic"
import { cn } from "@rabbitswap/ui/utils"

import { PriceInput } from "@/components/PriceInput"
import { Price } from "@/types/price"

interface LiquidityPriceRangeInputProps {
	label?: string
	isLoading?: boolean
	price: Price | undefined
	setPrice: (v: Price | undefined) => void
	priceDisplay: string | undefined
	clearPriceDisplay: () => void
	onIncrement: () => void
	onDecrement: () => void
	onPriceStringChange: (s: string) => void
}

export const LiquidityPriceRangeInput: React.FC<LiquidityPriceRangeInputProps> = ({
	label,
	isLoading,
	price,
	setPrice,
	priceDisplay,
	clearPriceDisplay,
	onIncrement,
	onDecrement,
	onPriceStringChange,
}) => {
	const disabledActionButton = price?.value === undefined || priceDisplay !== undefined

	return (
		<div className="flex w-full items-center gap-3 rounded-2xl bg-gray-50 px-4 py-3 dark:bg-gray-925">
			<div className="flex flex-1 flex-col gap-2">
				{label && <div className="text-sm text-gray-500">{label}</div>}
				{priceDisplay !== undefined ? (
					<Input value={priceDisplay} onChange={clearPriceDisplay} className="h-8 p-0 text-2xl leading-none" />
				) : (
					<PriceInput
						isLoading={isLoading}
						value={price}
						onValueChange={setPrice}
						className="h-8 text-2xl"
						onBlur={(e) => {
							onPriceStringChange(e.target.value)
						}}
						disabled={price === undefined}
					/>
				)}
				<div className="flex items-baseline gap-1 text-sm text-gray-400">
					<span className={cn(price !== undefined ? "" : "opacity-60")}>{price?.quoteCurrency.symbol ?? "Token"}</span>
					<span>per</span>
					<span className={cn(price !== undefined ? "" : "opacity-60")}>{price?.baseCurrency.symbol ?? "Token"}</span>
				</div>
			</div>
			<div className="flex flex-col gap-3">
				<Button buttonColor="gray" className="rounded-lg p-2" onClick={onIncrement} disabled={disabledActionButton}>
					<Plus className="size-4" />
				</Button>
				<Button buttonColor="gray" className="rounded-lg p-2" onClick={onDecrement} disabled={disabledActionButton}>
					<Minus className="size-4" />
				</Button>
			</div>
		</div>
	)
}
