import { Frown } from "lucide-react"

export const Empty: React.FC = () => {
	return (
		<div className="mt-8 flex h-full flex-col items-center justify-center gap-4 px-2 md:px-6">
			<Frown className="size-12" />
			<div>No tokens yet</div>
			<p className="text-center text-sm font-light text-gray-400">
				Buy or transfer tokens to this wallet to get started.
			</p>
		</div>
	)
}
