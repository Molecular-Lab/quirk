import React, { useEffect, useMemo, useState } from "react"

import { ChevronDown } from "lucide-react"

import { PoolDataTimeframe } from "@rabbitswap/api-core/dto"
import { Button, Popover, PopoverContent, PopoverTrigger, RadioButtonGroup, RadioOption } from "@rabbitswap/ui/basic"
import { cn } from "@rabbitswap/ui/utils"

import { usePoolChart } from "./context"
import { PoolChartType } from "./type"

const chartTypeLabel: Record<PoolChartType, string> = {
	VOL: "Volume",
	PRICE: "Price",
	LIQ: "Liquidity",
}

const ChartTypeController: React.FC = () => {
	const { chartType, setChartType } = usePoolChart()
	const [open, setOpen] = useState(false)
	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger>
				<Button
					buttonColor="gray"
					className="w-24 justify-between bg-gray-50 text-xs hover:bg-gray-100 lg:w-28 lg:text-sm"
				>
					{chartTypeLabel[chartType]}{" "}
					<ChevronDown className={cn("size-4", "transition-transform", open && "rotate-180")} />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-24 p-3 lg:w-28">
				{Object.entries(chartTypeLabel).map(([k, v], i) => {
					return (
						<div
							key={i}
							className={cn(
								"flex cursor-pointer items-center gap-2 rounded-md p-2 text-xs hover:bg-gray-50 dark:hover:bg-gray-900 lg:text-sm",
								k === chartType &&
									"text-primary-500 hover:text-primary-600 active:text-primary-700 dark:hover:text-primary-400 dark:active:text-primary-300",
							)}
							onClick={() => {
								setChartType(k as PoolChartType)
								setOpen(false)
							}}
						>
							{v}
						</div>
					)
				})}
			</PopoverContent>
		</Popover>
	)
}

const ChartTimeFrameController: React.FC<{ options: RadioOption<PoolDataTimeframe>[] }> = ({ options }) => {
	const { chartTimeFrame, setChartTimeFrame, chartType } = usePoolChart()
	useEffect(() => {
		const selectedOption = options.find((e) => e.value === chartTimeFrame)
		if (selectedOption === undefined) {
			switch (chartType) {
				case "VOL":
				case "PRICE": {
					setChartTimeFrame("M")
					break
				}

				default: {
					break
				}
			}
		}
	}, [chartTimeFrame, chartType, options, setChartTimeFrame])

	return (
		<RadioButtonGroup
			size="sm"
			options={options}
			value={chartTimeFrame}
			itemClassName="px-3 aria-[checked=false]:px-3"
			onValueChange={(v) => {
				setChartTimeFrame(v as PoolDataTimeframe)
			}}
		/>
	)
}

export const ChartController: React.FC = () => {
	const { chartType } = usePoolChart()

	const options = useMemo<RadioOption<PoolDataTimeframe>[]>(() => {
		switch (chartType) {
			case "VOL":
			case "PRICE": {
				return [
					{ label: "1H", value: "H" },
					{ label: "1D", value: "D" },
					{ label: "1W", value: "W" },
					{ label: "1M", value: "M" },
					{ label: "1Y", value: "Y" },
				]
			}

			case "LIQ": {
				return []
			}

			default: {
				return []
			}
		}
	}, [chartType])

	return (
		<div className={cn("flex items-center justify-between gap-2", options.length === 0 && "justify-end")}>
			{options.length > 0 && <ChartTimeFrameController options={options} />}
			<ChartTypeController />
		</div>
	)
}
