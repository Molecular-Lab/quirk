import { useEffect, useState } from "react"
import { NumericFormat } from "react-number-format"

import { AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"

import { cn } from "@rabbitswap/ui/utils"

import { AnimateHeight } from "@/components/Animate/AnimateHeight"
import { InfoTooltip } from "@/components/InfoTooltip"
import { useTxSetting } from "@/feature/settings/TransactionSetting/store/txSettingStore"

export const Deadline: React.FC = () => {
	const {
		internalState,
		setState,
		computed: { deadline },
	} = useTxSetting()
	const [expand, setExpand] = useState(deadline !== 600)

	const isZeroError = Number(internalState.deadline) === 0 && internalState.deadline !== ""

	// Set the deadline to empty when opening the advanced setting and the value is 0
	useEffect(() => {
		if (isZeroError) setState({ deadline: "" })
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	return (
		<div className="flex flex-col">
			<div
				className="flex cursor-pointer items-center gap-1 text-sm lg:text-base"
				onClick={() => {
					setExpand((s) => !s)
				}}
			>
				Transaction deadline
				<InfoTooltip>Your transaction will revert if it is pending for more than this period of time.</InfoTooltip>
				<div className="grow" />
				<div>{deadline / 60}m</div>
				<ChevronDown className={cn("size-5", "transition-all", expand ? "rotate-180" : "")} />
			</div>

			{/* Expandable */}
			<AnimatePresence>
				{expand && (
					<AnimateHeight>
						<NumericFormat
							placeholder="10 minutes"
							allowNegative={false}
							value={internalState.deadline}
							onValueChange={({ value }) => {
								setState({ deadline: value })
							}}
							className={cn(
								"mt-3 h-9 w-full rounded-lg border border-gray-50 bg-gray-50 px-3 py-2 text-right focus:outline-none dark:border-gray-900 dark:bg-gray-800",
								isZeroError && "border-error",
							)}
							decimalScale={0}
							isAllowed={({ floatValue }) => {
								return floatValue !== undefined ? floatValue < 100 : true
							}}
							suffix=" minutes"
							inputMode="numeric"
						/>
					</AnimateHeight>
				)}
			</AnimatePresence>
		</div>
	)
}
