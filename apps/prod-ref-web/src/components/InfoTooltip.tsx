import { PropsWithChildren } from "react"

import { Tooltip, TooltipContent, TooltipTrigger } from "@rabbitswap/ui/basic"
import { Info } from "@rabbitswap/ui/icons"
import { PropsWithClassName, cn } from "@rabbitswap/ui/utils"

interface InfoTooltipProps extends PropsWithChildren, PropsWithClassName {}

/**
 * Tooltip over info icon (ⓘ)
 */
export const InfoTooltip: React.FC<InfoTooltipProps> = ({ className, children }) => {
	return (
		<div
			onClick={(e) => {
				e.stopPropagation()
			}}
		>
			<Tooltip>
				<TooltipTrigger>
					<Info className="size-5 text-gray-200 dark:text-gray-700" />
				</TooltipTrigger>
				<TooltipContent className={cn("max-w-[min(250px,95vw)] p-3", className)}>{children}</TooltipContent>
			</Tooltip>
		</div>
	)
}
