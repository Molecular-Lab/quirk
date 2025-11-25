import { useMemo } from "react"

import { Badge, BadgeProps } from "@rabbitswap/ui/basic"
import { PropsWithClassName, cn } from "@rabbitswap/ui/utils"

import { LimitOrderItem } from "@/feature/swap/limit/types"

export const StatusBadge: React.FC<
	PropsWithClassName<{
		status: LimitOrderItem["status"] | undefined
		size?: "default" | "small"
	}>
> = ({ status, size, className }) => {
	const title = useMemo(() => {
		switch (status) {
			case "PENDING_CREATED": {
				return "Pending"
			}
			case "CREATED":
			case "READY": {
				return "Open"
			}
			case "EXECUTED": {
				return "Executed"
			}
			case "COMPLETED": {
				return "Filled"
			}
			case "PENDING_CANCELED": {
				return "Pending"
			}
			case "CANCELED": {
				return size === "small" ? "Cancel" : "Cancelled"
			}
			case "EXPIRED": {
				return "Expired"
			}
			default: {
				return ""
			}
		}
	}, [size, status])

	const badgeVariant = useMemo<BadgeProps["variant"]>(() => {
		switch (status) {
			case "PENDING_CREATED": {
				return "warning"
			}
			case "CREATED":
			case "READY": {
				return "success"
			}
			case "EXECUTED": {
				return "secondary"
			}
			case "COMPLETED": {
				return "primary"
			}
			case "PENDING_CANCELED": {
				return "gray"
			}
			case "CANCELED": {
				return "gray"
			}
			case "EXPIRED": {
				return "error"
			}
			default: {
				return "primary"
			}
		}
	}, [status])

	return (
		<Badge withDot variant={badgeVariant} size={size} className={cn("h-6 px-3 text-xs font-normal", className)}>
			{title}
		</Badge>
	)
}
