import { useEffect, useState } from "react"

import { RadioButtonGroup } from "@rabbitswap/ui/basic"
import { cn } from "@rabbitswap/ui/utils"

import { PriceInput } from "@/components/PriceInput"
import { Price } from "@/types/price"

type MarketCondition = 0 | 0.01 | 0.05 | 0.1

export const PriceConditionInput: React.FC<{
	side: "Buy" | "Sell"
	value: Price | undefined
	setValue: (value: Price) => void
	marketPrice: Price | undefined
}> = ({ side, value, setValue, marketPrice }) => {
	const [, setMarketCondition] = useState<MarketCondition | undefined>(0)

	// reset market condition when market price changes
	useEffect(() => {
		setMarketCondition(0)
	}, [marketPrice])

	return (
		<div
			className={cn(
				"rounded-lg",
				"bg-gray-50 dark:bg-gray-925",
				"flex w-full items-start gap-2",
				"px-2.5 py-3 lg:px-4 lg:py-3",
			)}
		>
			{/* title */}
			<div className="whitespace-nowrap text-sm xl:text-base">When Price</div>

			<div className="flex w-full flex-col gap-1">
				{/* input */}
				<div className="flex items-center gap-2 text-base font-medium xl:text-xl">
					<PriceInput
						disabled={!value}
						value={value}
						onValueChange={(p) => {
							setMarketCondition(undefined)
							setValue(p)
						}}
						className="text-right text-lg xl:text-2xl"
					/>
					<div className="">{value?.quoteCurrency.symbol ?? "???"}</div>
				</div>

				{/* market condition selector */}
				<RadioButtonGroup
					disabled={!value}
					buttonStyle="outline"
					buttonColor="gray"
					groupingStyle="gap"
					size="sm"
					className="ml-auto gap-1"
					itemClassName={cn("px-2 py-0.5 lg:px-3 lg:py-1.5 lg:font-medium")}
					value=""
					onValueChange={(v) => {
						const mktCond = Number(v) as MarketCondition
						setMarketCondition(mktCond)
						const mktPrice = marketPrice?.quoteCurrency.equals(value?.quoteCurrency)
							? marketPrice
							: marketPrice?.invert()
						const newPrice = mktPrice?.multipliedBy(1 + mktCond * (side === "Buy" ? -1 : 1))
						if (!newPrice) return
						setValue(newPrice)
					}}
					options={[
						{ label: "Market", value: 0 },
						{ label: side === "Buy" ? "-1%" : "1%", value: 0.01 },
						{ label: side === "Buy" ? "-5%" : "5%", value: 0.05 },
						{ label: side === "Buy" ? "-10%" : "10%", value: 0.1 },
					]}
				/>
			</div>
		</div>
	)
}
