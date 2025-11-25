import { Inbox } from "@rabbitswap/ui/icons"

import { InfoItem } from "@/components/LiquidityChartRangeInput/InfoItem"

export const Empty: React.FC = () => {
	return (
		<div className="flex flex-col gap-5">
			<div className="flex items-center justify-between gap-1">
				<InfoItem label="Current price" value="-" />
				<InfoItem label="Leverage" value="-" className="items-end text-right" />
			</div>
			<div className="flex h-32 flex-col items-center justify-center gap-3 rounded-xl bg-gray-50 p-4 dark:bg-gray-900">
				<Inbox className="text-gray-600" />
				<div className="text-sm text-gray-400 lg:text-base">Your positions will appear here.</div>
			</div>
		</div>
	)
}
