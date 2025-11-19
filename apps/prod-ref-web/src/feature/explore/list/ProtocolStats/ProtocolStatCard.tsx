import { Link } from "react-router-dom"

import { ExternalLink } from "lucide-react"

import { Button, Skeleton } from "@rabbitswap/ui/basic"
import { Defillama } from "@rabbitswap/ui/icons"
import { cn } from "@rabbitswap/ui/utils"

import { formatFiatValue } from "@/utils/number"

interface Props {
	type: string
	title: string | React.ReactNode
	subtitle: string | React.ReactNode
	value: number | undefined
	link?: string
	isLoading: boolean
}

export const ProtocolStatCard: React.FC<Props> = ({ type, title, subtitle, value, link, isLoading }) => {
	return (
		<div className={cn("flex size-full flex-col gap-3 rounded-xl", "p-3 md:p-4 lg:p-5", "bg-gray-50 dark:bg-gray-950")}>
			<div className="relative flex w-full items-center justify-between gap-2">
				<div className={cn("text-gray-700 dark:text-gray-300", "text-sm font-medium lg:text-base")}>{title}</div>
				{type === "TVL" && link && (
					<Link
						to={link}
						target="_blank"
						rel="noreferrer"
						className="absolute right-0 top-0 md:-right-1 md:-top-1 lg:-right-2 lg:-top-2"
					>
						<Button
							buttonColor="gray"
							buttonType="outline"
							size="sm"
							className="h-5 text-gray-800 dark:text-gray-200 sm:h-6 md:h-auto"
						>
							<Defillama className="size-4 sm:size-5 lg:flex" />
							<div className="hidden text-xs sm:leading-5 lg:block lg:text-sm">Chart</div>
							<ExternalLink className="size-3 text-gray-500 dark:text-gray-50 sm:size-4 " />
						</Button>
					</Link>
				)}
			</div>
			<Skeleton
				className="flex w-full items-center justify-start truncate text-xl tabular-nums md:text-2xl lg:text-[32px]"
				isLoading={isLoading}
			>
				{formatFiatValue(value, { showFullValue: true })}
			</Skeleton>
			<div className="text-xs lg:text-sm">{subtitle}</div>
		</div>
	)
}
