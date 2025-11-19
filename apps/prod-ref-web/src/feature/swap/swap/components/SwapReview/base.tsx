import { PropsWithChildren, useState } from "react"

import { ChevronsDownUp, ChevronsUpDown } from "lucide-react"

import { ModalTitle, Separator } from "@rabbitswap/ui/basic"

import { TokenAmount } from "@/types/tokens"

import { SwapQuoteInfo } from "../QuoteInfo"

import { SwapAmountReview } from "./SwapAmountReview"

export interface SwapReviewBaseProps {
	amountIn: TokenAmount | undefined
	amountOut: TokenAmount | undefined
	hideInfo?: boolean
}

export const SwapReviewBase: React.FC<PropsWithChildren<SwapReviewBaseProps>> = ({
	children,
	hideInfo,
	amountIn,
	amountOut,
}) => {
	if (!amountIn || !amountOut) return null

	return (
		<>
			<ModalTitle className="text-lg font-semibold">Review Swap</ModalTitle>
			<SwapAmountReview amount={amountIn} label="Sell" />
			<SwapAmountReview amount={amountOut} label="Buy" />
			{!hideInfo && <ReviewInfo />}
			{children}
		</>
	)
}

export const ReviewInfo: React.FC = () => {
	const [expand, setExpand] = useState(false)

	return (
		<>
			<div
				onClick={() => {
					setExpand((prev) => !prev)
				}}
				className="flex cursor-pointer items-center gap-3 text-sm font-medium text-gray-400"
			>
				<Separator className="shrink grow" />
				<div className="flex gap-1 whitespace-nowrap">
					Show {expand ? "Less" : "More"}
					{expand ? <ChevronsDownUp className="size-4" /> : <ChevronsUpDown className="size-4" />}
				</div>
				<Separator className="shrink grow" />
			</div>

			<SwapQuoteInfo
				types={expand ? ["RATE", "PRICE_IMPACT", "SLIPPAGE", "FEE", "ROUTING"] : ["RATE", "FEE", "ROUTING"]}
			/>
		</>
	)
}
