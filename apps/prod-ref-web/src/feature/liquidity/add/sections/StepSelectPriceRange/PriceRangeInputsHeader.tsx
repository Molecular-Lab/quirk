import { RadioButtonGroup, RadioOption } from "@rabbitswap/ui/basic"

import { RangeBy } from "@/types/position"

interface PriceRangeInputsHeaderProp {
	bothTokenSelected: boolean
	rangeBy: RangeBy
	setRangeBy: (v: RangeBy) => void
	rangeByOptions: RadioOption<string>[]
}

export const PriceRangeInputsHeader: React.FC<PriceRangeInputsHeaderProp> = ({
	bothTokenSelected,
	rangeBy,
	setRangeBy,
	rangeByOptions,
}) => {
	return (
		<div className="flex items-center justify-between">
			<div className="text-primary-300 dark:text-primary-50">Set price range</div>
			{bothTokenSelected && (
				<div className="flex items-center gap-3">
					<RadioButtonGroup
						value={rangeBy}
						onValueChange={(v) => {
							setRangeBy(v as RangeBy)
						}}
						options={rangeByOptions}
					/>
				</div>
			)}
		</div>
	)
}
