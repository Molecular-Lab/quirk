import { ArrowDown } from "lucide-react"

import { Button } from "@rabbitswap/ui/basic"
import { cn } from "@rabbitswap/ui/utils"

import { AnimateChangeInHeight } from "@/components/Animate/AnimateChangeInHeight"
import { SwapInput } from "@/feature/swap/components/SwapInput"
import { useSwapStore } from "@/feature/swap/swap/store/swapStore"

import { ConfirmSwapModal } from "../confirm"
import { useSwapQuote } from "../hooks/useSwapQuote"

import { FormQuoteInfo } from "./components/FormQuoteInfo"
import { SwapRouterBox } from "./components/SwapRouterBox"
import { useInitToken } from "./hooks/useInitToken"
import { useSwapState } from "./hooks/useSwapState"

export const SwapForm: React.FC = () => {
	const { amountIn, amountOut, setAmountIn, setType, setAmountOut, switchSides, type, setTyping } = useSwapStore()
	const { isLoading } = useSwapQuote()
	const {
		buttonState: { className: btnClassName, ...buttonState },
		review,
		onCloseReview,
	} = useSwapState()
	// const { data: priceImpact } = useUsdPriceImpact()
	useInitToken()

	return (
		<div className="flex w-full flex-col gap-3">
			<div className="relative flex w-full flex-col gap-2">
				{/* Inputs */}
				<SwapInput
					value={amountIn}
					onChange={(amount) => {
						// If the amountIn is changed, set the type to EXACT_IN
						if (amountIn && amountIn.string !== amount.string) setType("EXACT_INPUT")
						setAmountIn(amount)
					}}
					label="Sell"
					isLoading={type === "EXACT_OUTPUT" ? isLoading : false}
					setTyping={setTyping("amountIn")}
				/>
				<SwapInput
					value={amountOut}
					onChange={(amount) => {
						// If the amountOut is changed, set the type to EXACT_OUT
						if (amountOut && amountOut.string !== amount.string) setType("EXACT_OUTPUT")
						setAmountOut(amount)
					}}
					label="Buy"
					isLoading={type === "EXACT_INPUT" ? isLoading : false}
					// priceImpact={priceImpact}
					setTyping={setTyping("amountOut")}
					hideMaxButton
				/>

				{/* Switch Sides */}
				<div
					onClick={switchSides}
					className={cn(
						"absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
						"flex size-9 cursor-pointer items-center justify-center rounded-full",
						"bg-background dark:bg-background-dark",
					)}
				>
					<ArrowDown className="size-4" />
				</div>
			</div>

			<AnimateChangeInHeight motionClassName="overflow-visible">
				<SwapRouterBox />
			</AnimateChangeInHeight>

			{/* Action Button */}
			<Button className={cn("h-[60px] w-full text-xl font-medium lg:text-xl", btnClassName)} {...buttonState} />

			{/* Quote Info */}
			<FormQuoteInfo />

			{/* Confirm Modal */}
			<ConfirmSwapModal onClose={onCloseReview} open={review} />
		</div>
	)
}
