import { useEffect } from "react"

import { PoolDataTimeframe } from "@rabbitswap/api-core/dto"
import { RadioButtonGroup } from "@rabbitswap/ui/basic"

const chartOptions = [
	// { label: "1H", value: "H" },
	{ label: "1D", value: "D" },
	{ label: "1W", value: "W" },
	{ label: "1M", value: "M" },
	// { label: "1Y", value: "Y" },
]

export const ChartTimeFrameController: React.FC<{
	chartTimeFrame: PoolDataTimeframe
	setChartTimeFrame: (v: PoolDataTimeframe) => void
}> = ({ chartTimeFrame, setChartTimeFrame }) => {
	useEffect(() => {
		const selectedOption = chartOptions.find((e) => e.value === chartTimeFrame)
		if (selectedOption === undefined) {
			setChartTimeFrame("M")
		}
	}, [chartTimeFrame, setChartTimeFrame])

	return (
		<RadioButtonGroup
			size="sm"
			buttonColor="gray"
			options={chartOptions}
			value={chartTimeFrame}
			className="bg-gray-100 dark:bg-gray-800"
			itemClassName="px-3 aria-[checked=false]:px-3 dark:aria-[checked=false]:text-gray-200 aria-checked:text-gray-950"
			onValueChange={(v) => {
				setChartTimeFrame(v as PoolDataTimeframe)
			}}
		/>
	)
}
