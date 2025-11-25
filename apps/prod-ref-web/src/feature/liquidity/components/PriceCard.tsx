import { PropsWithChildren } from "react"

import { Skeleton } from "@rabbitswap/ui/basic"

interface PriceCardProps extends PropsWithChildren {
	title: string
	price: string | undefined
	unit: string | undefined
}

export const PriceCard: React.FC<PriceCardProps> = ({ title, price, unit, children }) => {
	return (
		<div className="flex w-full flex-col items-center gap-1.5 overflow-hidden rounded-xl bg-gray-50 p-3 dark:bg-gray-900">
			<div className="text-sm text-gray-500 dark:text-gray-400">{title}</div>
			<Skeleton className="max-w-full truncate text-xl text-gray-950 dark:text-rabbit-white lg:text-2xl">
				{price ?? "-"}
			</Skeleton>
			<Skeleton className="whitespace-nowrap text-center text-sm text-gray-500 dark:text-gray-400">{unit}</Skeleton>
			{children}
		</div>
	)
}
