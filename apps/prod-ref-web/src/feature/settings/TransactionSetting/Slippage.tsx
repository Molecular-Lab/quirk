import { useState } from "react"
import { NumericFormat } from "react-number-format"

import { AnimatePresence } from "framer-motion"
import { ChevronDown, TriangleAlert } from "lucide-react"

import { RadioButtonGroup } from "@rabbitswap/ui/basic"
import { cn } from "@rabbitswap/ui/utils"

import { AnimateHeight } from "@/components/Animate/AnimateHeight"
import { InfoTooltip } from "@/components/InfoTooltip"
import {
	DEFAULT_SLIPPAGE,
	MIN_SUGGEST_SLIPPAGE,
	useTxSetting,
} from "@/feature/settings/TransactionSetting/store/txSettingStore"

export const Slippage: React.FC = () => {
	const {
		internalState,
		setState,
		computed: { tooLowSlippage, tooHighSlippage },
	} = useTxSetting()
	const [expand, setExpand] = useState(!internalState.autoSlippage)

	return (
		<div className="flex flex-col">
			<div
				className="flex cursor-pointer items-center gap-1 text-sm lg:text-base"
				onClick={() => {
					setExpand((s) => !s)
				}}
			>
				Max. Slippage
				<InfoTooltip>
					Your transaction will revert if the price changes unfavorably by more than this percentage.
				</InfoTooltip>
				<div className="grow" />
				<div>{internalState.autoSlippage ? "Auto" : `${internalState.slippage || DEFAULT_SLIPPAGE}%`}</div>
				<ChevronDown className={cn("size-5", "transition-all", expand ? "rotate-180" : "")} />
			</div>

			{/* Expandable */}
			<AnimatePresence>
				{expand && (
					<AnimateHeight className="flex flex-col gap-3">
						<div className="flex gap-3 pt-3">
							<RadioButtonGroup
								value={String(internalState.autoSlippage)}
								onValueChange={(e) => {
									const isAuto = e === "true"
									setState({
										autoSlippage: isAuto,
										slippage: isAuto ? "" : internalState.slippage,
									})
								}}
								options={[
									{ label: "Auto", value: "true" },
									{ label: "Custom", value: "false" },
								]}
							/>

							<NumericFormat
								placeholder="0.5 %"
								allowNegative={false}
								value={internalState.slippage}
								onValueChange={({ value }) => {
									if (value) setState({ autoSlippage: false, slippage: value })
									else setState({ autoSlippage: true, slippage: "" })
								}}
								className="h-9 w-full rounded-lg bg-gray-50 px-3 py-2 text-right focus:outline-none dark:bg-gray-800"
								decimalScale={2}
								isAllowed={({ floatValue }) => {
									return floatValue !== undefined ? floatValue < 100 : true
								}}
								suffix=" %"
								inputMode="decimal"
							/>
						</div>
						{tooHighSlippage && (
							<div className="flex items-center gap-2 text-xs text-warning-darken">
								<TriangleAlert className="size-4 shrink-0" />
								Your transaction may be frontrun and result in an unfavorable trade.
							</div>
						)}
						{tooLowSlippage && (
							<div className="flex items-center gap-2 text-xs text-warning-darken">
								<TriangleAlert className="size-4 shrink-0" />
								Slippage below {MIN_SUGGEST_SLIPPAGE}% may result in a failed transaction.
							</div>
						)}
					</AnimateHeight>
				)}
			</AnimatePresence>
		</div>
	)
}
