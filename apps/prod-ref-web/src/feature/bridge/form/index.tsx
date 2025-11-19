import { Button } from "@rabbitswap/ui/basic"
import { cn } from "@rabbitswap/ui/utils"

import { BridgeInput } from "../components/BridgeInput"
import { BridgeReciever } from "../components/ReceiverInput"
import { ReviewModal } from "../components/ReviewModal"

import { useBridgeState } from "./hook/useBridgeState"
import { useBridgeStore } from "./store/bridgeStore"

export const BridgeForm: React.FC = () => {
	const { sourceToken, destToken, setSourceTokenAmount } = useBridgeStore()
	const {
		buttonProps: { className: btnClassName, ...buttonProps },
		reviewing,
		onCloseReview,
	} = useBridgeState()

	return (
		<>
			<div className="flex w-full flex-col gap-3">
				<div className="grid grid-rows-2 gap-2">
					<BridgeInput
						value={sourceToken}
						onChange={(amount) => {
							setSourceTokenAmount(() => amount)
						}}
						label="You Send"
						placeholder="0"
					/>
					<BridgeInput value={destToken} label="You Receive" disabled hideMaxButton />
				</div>
				<BridgeReciever />
				<Button className={cn("h-[60px] w-full text-xl font-medium lg:text-xl", btnClassName)} {...buttonProps} />
			</div>
			<ReviewModal onClose={onCloseReview} open={reviewing} />
		</>
	)
}
