import { SwapStep, SwapStepProps } from "@/feature/swap/components/SwapStep"

import { LimitOrderReviewBase, LimitOrderReviewBaseProps } from "./base"

interface ReviewWithStepProps extends LimitOrderReviewBaseProps {
	stepProps: Omit<SwapStepProps, "amountIn" | "tradingMode">
}

export const ReviewWithStep: React.FC<ReviewWithStepProps> = ({ stepProps, ...props }) => {
	return (
		<LimitOrderReviewBase {...props}>
			<div className="h-px bg-gray-100" />
			<SwapStep {...stepProps} amountIn={props.amountIn} tradingMode="limit" />
		</LimitOrderReviewBase>
	)
}
