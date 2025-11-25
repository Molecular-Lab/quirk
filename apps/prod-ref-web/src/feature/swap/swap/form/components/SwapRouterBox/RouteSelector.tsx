import { Badge, RadioButtonGroup, Skeleton } from "@rabbitswap/ui/basic"
import { PropsWithClassName, cn } from "@rabbitswap/ui/utils"

import { Price } from "@/types/price"

import { RouteName, RoutePriceItem } from "./type"

const ROUTE_OPTIONS: {
	name: RouteName
	label: React.ReactNode
}[] = [
	{
		name: "rabbitswap",
		label: (
			<div className="flex items-center gap-1">
				<img src="/favicon.png" className="max-h-5 min-h-5 min-w-5 max-w-5 shrink-0" />
				<div className="hidden text-xs sm:inline-flex">Native</div>
			</div>
		),
	},
	{
		name: "arken",
		label: (
			<div className="flex items-center gap-1">
				<img src="/logo/arken-logo.png" className="max-h-5 min-h-5 min-w-5 max-w-5 shrink-0" />
				<div className="hidden text-xs sm:inline-flex">Arken</div>
			</div>
		),
	},
]

interface RouteSelectorProps extends PropsWithClassName {
	selectedRoute: RouteName
	onSelect: (route: RouteName) => void
	bestRoute?: RouteName
	routePrice: Record<RouteName, RoutePriceItem> | undefined
}

export const RouteSelector: React.FC<RouteSelectorProps> = ({
	selectedRoute,
	onSelect,
	bestRoute,
	routePrice,
	className,
}) => {
	return (
		<RadioButtonGroup
			value={selectedRoute}
			onValueChange={(v) => {
				onSelect(v as RouteName)
			}}
			className={cn("grid w-full grid-cols-2 justify-stretch gap-2 lg:gap-3", className)}
			itemClassName={cn(
				"relative rounded-xl p-3 aria-checked:font-normal",
				"aria-checked:outline aria-checked:outline-1 aria-checked:outline-offset-0 aria-checked:outline-primary",
			)}
			groupingStyle="gap"
			buttonStyle="outline"
			options={ROUTE_OPTIONS.map((o) => {
				const price = routePrice?.[o.name]
				return {
					disabled: price?.price === undefined,
					value: o.name,
					label: (
						<div className="relative">
							{bestRoute === o.name && (
								<Badge
									size="small"
									type="solid"
									className="absolute -right-1.5 -top-5 h-fit !text-2xs dark:bg-primary dark:text-rabbit-black lg:right-1"
								>
									Best
								</Badge>
							)}

							<div className="flex items-center justify-between gap-x-2 gap-y-0.5">
								<div className="relative flex items-center gap-2 font-medium">{o.label}</div>
								<PriceDisplay price={price?.price} isLoading={price?.isLoading} />
							</div>
						</div>
					),
				}
			})}
		/>
	)
}

const PriceDisplay: React.FC<{ price: Price | undefined; isLoading: boolean | undefined }> = ({ price, isLoading }) => {
	if (isLoading) return <Skeleton className="h-4 w-full" />
	return <div className="text-left text-xs">{price ? price.toLongFormat(4) : "No route"}</div>
}
