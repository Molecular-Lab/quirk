import { Skeleton } from "@proxify/ui/basic"

export const AccountDrawerTabSkeleton: React.FC = () => {
	return (
		<div className="flex p-3 md:px-6">
			<div className="flex min-w-0 flex-1 items-center gap-3">
				{/* circle placeholder for token image */}
				<Skeleton className="flex size-8 shrink-0 rounded-full" />
				<div className="flex flex-col gap-0.5">
					<Skeleton className="h-2 w-60" />
					<Skeleton className="h-2 w-60" />
				</div>
			</div>
		</div>
	)
}
