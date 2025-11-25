import { LockIcon } from "lucide-react"

export const SingleSideWarningBox: React.FC = () => {
	return (
		<div className="flex items-center gap-3 rounded-xl bg-primary/20 p-3 text-xs text-primary-300 dark:text-primary-50">
			<LockIcon className="size-4 shrink-0 lg:size-5" />
			<div>The market price is outside your specified price range. Single-asset deposit only.</div>
		</div>
	)
}
