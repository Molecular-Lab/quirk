import BigNumber from "bignumber.js"

import { Skeleton } from "@rabbitswap/ui/basic"
import { CaretUp } from "@rabbitswap/ui/icons"
import { PropsWithClassName, cn } from "@rabbitswap/ui/utils"

interface PercentChangeProps extends PropsWithClassName {
	/**
	 * percentage in range 0-100
	 */
	value: number | undefined
	isLoading?: boolean

	labelClassName?: string
	iconClassName?: string
}

export const PercentChange: React.FC<PercentChangeProps> = ({
	value,
	className,
	isLoading,
	labelClassName,
	iconClassName,
}) => {
	if (isLoading) return <Skeleton isLoading={isLoading} width={50} />
	if (!value) return <div className={className}>-</div>

	const absVal = BigNumber(value).abs()

	return (
		<div className={cn("flex items-center", getTextColor(value), className)}>
			<CaretUp className={cn("pb-px text-base", value < 0 && "rotate-180", value === 0 && "hidden", iconClassName)} />
			<span className={labelClassName}>{absVal.lt(0.01) ? "<0.01" : absVal.toFixed(2)}%</span>
		</div>
	)
}

const getTextColor = (value: number): string => {
	if (value === 0) return cn("text-gray-500")
	if (value > 0) return cn("text-number-positive")
	return cn("text-number-negative")
}
