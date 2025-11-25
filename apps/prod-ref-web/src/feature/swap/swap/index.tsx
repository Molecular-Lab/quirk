import { SwapTitle } from "@/feature/swap/components/SwapTitle"

import { SwapForm } from "./form"

export const SwapPage: React.FC = () => {
	return (
		<div className="w-full max-w-[560px]">
			<SwapTitle mode="swap" className="mb-4 lg:mb-9" />
			<SwapForm />
		</div>
	)
}
