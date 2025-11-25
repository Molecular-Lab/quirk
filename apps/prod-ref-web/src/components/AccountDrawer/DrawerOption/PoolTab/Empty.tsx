import { Frown, Plus } from "lucide-react"

import { Button } from "@rabbitswap/ui/basic"

import { useAccountDrawer } from "@/hooks/useAccountDrawer"
import { Link } from "@/router"

export const Empty: React.FC = () => {
	const { handleOpenDrawer } = useAccountDrawer()

	return (
		<div className="mt-8 flex h-full flex-col items-center justify-center gap-4 px-2 md:px-6">
			<Frown className="size-12" />
			<div>No open pools yet</div>
			<p className="text-center text-sm font-light text-gray-400">
				Open a new position or create a pool to get started.
			</p>
			<Link to="/pools" onClick={handleOpenDrawer}>
				<Button>
					<Plus className="size-4" />
					<div>New position</div>
				</Button>
			</Link>
		</div>
	)
}
