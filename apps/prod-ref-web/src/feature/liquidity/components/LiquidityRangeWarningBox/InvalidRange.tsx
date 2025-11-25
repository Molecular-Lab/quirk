import { AlertTriangle } from "lucide-react"

export const InvalidRange: React.FC = () => {
	return (
		<div className="flex items-center gap-3 rounded-xl bg-warning/20 p-3 text-xs">
			<AlertTriangle className="size-4 shrink-0" />
			<div>Invalid range selected. The min price must be lower than the max price.</div>
		</div>
	)
}
