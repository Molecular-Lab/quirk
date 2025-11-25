import { Button } from "@rabbitswap/ui/basic"

import { SwitchChainButton } from "@/components/SwitchChainButton"
import { useSwapChainId } from "@/hooks/useChainId"
import { useNavigate } from "@/router"

export const UnsupportedContent: React.FC = () => {
	const navigate = useNavigate()
	const chainId = useSwapChainId()

	return (
		<div className="flex flex-col items-center gap-2">
			<h1 className="mb-2 text-2xl">Position unavailable</h1>
			<div className="mb-8">To view a position, you must be connected to the network it belongs to.</div>
			<SwitchChainButton toChainId={chainId} className="w-full py-4" />
			<Button
				buttonType="outline"
				className="w-full"
				onClick={() => {
					void navigate("/pools")
				}}
			>
				Back
			</Button>
		</div>
	)
}
