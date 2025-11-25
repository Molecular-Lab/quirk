import { SwapStep, SwapStepProps } from "@/feature/swap/components/SwapStep"

import { SwapReviewBase, SwapReviewBaseProps } from "./base"

interface ReviewWithStepProps extends SwapReviewBaseProps {
	stepProps: Omit<SwapStepProps, "amountIn" | "tradingMode">
}

export const ReviewWithStep: React.FC<ReviewWithStepProps> = ({ stepProps, ...props }) => {
	return (
		<SwapReviewBase {...props}>
			<div className="h-px bg-gray-100" />
			<SwapStep {...stepProps} amountIn={props.amountIn} tradingMode="swap" />
		</SwapReviewBase>
	)
}
