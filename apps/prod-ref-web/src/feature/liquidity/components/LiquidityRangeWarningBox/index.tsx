import { InvalidRange } from "./InvalidRange"
import { OutOfRange } from "./OutOfRange"

interface LiquidityRangeWarningBoxProps {
	outOfRange: boolean
	inValidRange: boolean
}

export const LiquidityRangeWarningBox: React.FC<LiquidityRangeWarningBoxProps> = ({ outOfRange, inValidRange }) => {
	return (
		<>
			{!inValidRange && outOfRange && <OutOfRange />}
			{inValidRange && <InvalidRange />}
		</>
	)
}
