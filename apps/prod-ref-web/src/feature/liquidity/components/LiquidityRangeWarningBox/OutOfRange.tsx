import { AlertTriangle } from "lucide-react"

export const OutOfRange: React.FC = () => {
	return (
		<div className="flex items-center gap-3 rounded-xl bg-warning/20 p-3 text-xs">
			<AlertTriangle className="size-4 shrink-0" />
			<div>Your position will not earn fees or be used in trades until the market price moves into your range.</div>
		</div>
	)
}
