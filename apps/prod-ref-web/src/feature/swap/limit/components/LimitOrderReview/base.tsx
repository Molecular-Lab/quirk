import { PropsWithChildren } from "react"

import { ModalTitle, Separator } from "@rabbitswap/ui/basic"

import { TokenAmount } from "@/types/tokens"

import { LimitInfoItem } from "../QuoteInfo"

import { LimitOrderAmountReview } from "./LimitOrderAmountReview"

export interface LimitOrderReviewBaseProps {
	amountIn: TokenAmount | undefined
	amountOut: TokenAmount | undefined
}

export const LimitOrderReviewBase: React.FC<PropsWithChildren<LimitOrderReviewBaseProps>> = ({
	children,
	amountIn,
	amountOut,
}) => {
	if (!amountIn || !amountOut) return null

	return (
		<>
			<ModalTitle className="text-[18px] font-semibold lg:text-lg">Review Limit Order</ModalTitle>
			<div className="flex flex-col gap-2">
				<LimitOrderAmountReview amount={amountIn} label="Sell" />
				<LimitOrderAmountReview amount={amountOut} label="Buy" />
			</div>
			<LimitInfoItem infoType="RATE" />
			<Separator className="-mt-2 shrink grow" />
			<div className="flex flex-col">
				<LimitInfoItem infoType="EXPIRY" />
				<LimitInfoItem infoType="FEE" />
				<LimitInfoItem infoType="ROUTING" />
			</div>
			{children}
		</>
	)
}
