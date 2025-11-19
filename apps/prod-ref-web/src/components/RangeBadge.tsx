import React, { useMemo } from "react"

import { Badge, BadgeProps, ShapeSkeleton, Tooltip, TooltipContent, TooltipTrigger } from "@rabbitswap/ui/basic"
import { cn } from "@rabbitswap/ui/utils"

import { PositionState } from "@/types/position"

interface RangeBadgeProps {
	positionState: PositionState | undefined
	size?: "default" | "small" | null | undefined
	className?: string
}

export const RangeBadge: React.FC<RangeBadgeProps> = ({ positionState, size, className }) => {
	const { badgeTitle, tooltipContent, badgeVariant, withDot } = useMemo<{
		badgeTitle: React.ReactNode
		tooltipContent: React.ReactNode
		badgeVariant: BadgeProps["variant"]
		withDot: BadgeProps["withDot"]
	}>(() => {
		switch (positionState) {
			case "removed": {
				return {
					badgeTitle: "Closed",
					tooltipContent: "Your position has 0 liquidity, and is not earning fees.",
					badgeVariant: "gray",
					withDot: false,
				}
			}
			case "outOfRange": {
				return {
					badgeTitle: "Out of range",
					tooltipContent:
						"The price of this pool is outside of your selected range. Your position is not currently earning fees.",
					badgeVariant: "warning",
					withDot: true,
				}
			}
			case "inRange": {
				return {
					badgeTitle: "In range",
					tooltipContent:
						"The price of this pool is within your selected range. Your position is currently earning fees.",
					badgeVariant: "success",
					withDot: true,
				}
			}
			default: {
				return {
					badgeTitle: undefined,
					tooltipContent: undefined,
					badgeVariant: undefined,
					withDot: undefined,
				}
			}
		}
	}, [positionState])

	if (!positionState) {
		return <ShapeSkeleton className={cn("h-[26px] w-[100px] rounded-full", className)} />
	}

	return (
		<Tooltip>
			<TooltipTrigger>
				<Badge className={className} size={size} variant={badgeVariant} withDot={withDot}>
					{badgeTitle}
				</Badge>
			</TooltipTrigger>
			<TooltipContent>{tooltipContent}</TooltipContent>
		</Tooltip>
	)
}
