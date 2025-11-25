import React, { PropsWithChildren } from "react"

import { Skeleton, Tooltip, TooltipContent, TooltipTrigger } from "@rabbitswap/ui/basic"
import { useBreakpoints } from "@rabbitswap/ui/hooks"
import { PropsWithClassName, cn } from "@rabbitswap/ui/utils"

interface InfoItemProps extends PropsWithChildren, PropsWithClassName {
	title: string
	tooltip?: React.ReactNode
	isLoading?: boolean
	tooltipContentClassName?: string
}

export const InfoItem: React.FC<InfoItemProps> = ({
	title,
	children,
	className,
	tooltip,
	isLoading,
	tooltipContentClassName,
}) => {
	const { isMdUp } = useBreakpoints()
	return (
		<div className="flex w-full items-center justify-between overflow-hidden pb-2 text-xs lg:text-sm">
			<div className="text-gray-400">{title}</div>
			<Tooltip>
				<TooltipTrigger>
					<Skeleton width={60} className={className} isLoading={isLoading}>
						{children}
					</Skeleton>
				</TooltipTrigger>
				{tooltip && (
					<TooltipContent
						className={cn("max-w-[min(250px,95vw)] p-3", tooltipContentClassName)}
						side={isMdUp ? "left" : "top"}
					>
						{tooltip}
					</TooltipContent>
				)}
			</Tooltip>
		</div>
	)
}
