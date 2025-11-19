import { Badge, BadgeProps, ShapeSkeleton, Skeleton } from "@rabbitswap/ui/basic"
import { PropsWithClassName, cn } from "@rabbitswap/ui/utils"

import { DoubleTokenIcon } from "@/components/TokenIcon"
import { FeeAmount, formatFeeDisplay } from "@/constants/dex"
import { Position } from "@/types/position"
import { EvmToken } from "@/types/tokens"

export const PoolTitle: React.FC<{
	currencyQuote: EvmToken | undefined
	currencyBase: EvmToken | undefined
	feeRate: number | undefined
	iconClassName?: string
	titleClassName?: string
	subtitleClassName?: string
}> = ({ currencyQuote, currencyBase, feeRate, iconClassName, titleClassName, subtitleClassName }) => {
	const isLoading = !currencyBase || !currencyQuote

	return (
		<div className="flex items-center gap-x-3">
			<DoubleTokenIcon token={[currencyQuote, currencyBase]} tokenClassName={cn(iconClassName)} />
			<div className="flex w-full flex-col justify-between">
				<Skeleton className={cn("whitespace-nowrap font-medium", titleClassName)} isLoading={isLoading} width={100}>
					{currencyQuote?.symbol} / {currencyBase?.symbol}
				</Skeleton>
				<Skeleton
					className={cn(
						"flex items-center gap-1.5 whitespace-nowrap",
						"font-medium",
						"text-xs md:text-sm",
						"text-gray-400 dark:text-gray-600",
						subtitleClassName,
					)}
					isLoading={isLoading}
					width={60}
				>
					<div>V3</div>
					<div
						className={cn("h-full min-h-2.5 w-px bg-gray-400 dark:bg-gray-600", isLoading && "dark:bg-gray-600/70")}
					/>
					<div>{feeRate !== undefined ? formatFeeDisplay(feeRate as FeeAmount) : "-"}</div>
				</Skeleton>
			</div>
		</div>
	)
}

interface PoolFeeBadgeProps extends PropsWithClassName, BadgeProps {
	position: Position | undefined
}

export const PoolFeeBadge: React.FC<PoolFeeBadgeProps> = ({ position, className, ...props }) => {
	if (position === undefined) {
		return <ShapeSkeleton className={cn("h-6 w-8 rounded-full", className)} />
	}
	return (
		<Badge variant="gray" className={className} {...props}>
			{position.feeDisplay}
		</Badge>
	)
}
