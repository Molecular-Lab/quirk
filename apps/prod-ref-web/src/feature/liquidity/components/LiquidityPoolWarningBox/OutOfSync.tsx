import { AlertTriangle } from "lucide-react"

export const OutOfSync: React.FC = () => {
	return (
		<div className="flex items-start gap-3 rounded-xl bg-warning/20 p-3 text-xs">
			<AlertTriangle className="mt-1 size-4 shrink-0" />
			<div className="flex flex-col gap-1">
				<div className="font-medium">Pool out of sync</div>
				<div className="text-gray-700 dark:text-gray-300">
					This pool is out of sync with market prices. Adding liquidity at the suggested ratios may result in loss of
					funds.
				</div>
			</div>
		</div>
	)
}
