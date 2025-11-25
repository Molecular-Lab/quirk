import { Skeleton } from "@rabbitswap/ui/basic"

export const Loading: React.FC = () => {
	return (
		<div className="flex w-full flex-col gap-6 lg:gap-9">
			{/* title */}
			<div className="flex gap-2 lg:gap-3">
				<Skeleton className="size-6 rounded-full lg:size-9" />
				<Skeleton className="h-6 w-full rounded-xl lg:h-9" />
			</div>
			{/* LiquidityCard and UnclaimedFeeCard */}
			<div className="flex flex-col gap-5 lg:grid lg:grid-cols-2 lg:gap-8">
				<div className="flex flex-col gap-2">
					<Skeleton className="h-6 w-full rounded-xl" />
					<Skeleton className="h-12 w-full rounded-xl" />
					<Skeleton className="h-24 w-full rounded-xl" />
				</div>
				<div className="flex flex-col gap-2">
					<Skeleton className="h-6 w-full rounded-xl" />
					<Skeleton className="h-12 w-full rounded-xl" />
					<Skeleton className="h-24 w-full rounded-xl" />
				</div>
			</div>
			{/* PriceRangeCard */}
			<Skeleton className="h-48 w-full rounded-xl" />
		</div>
	)
}
