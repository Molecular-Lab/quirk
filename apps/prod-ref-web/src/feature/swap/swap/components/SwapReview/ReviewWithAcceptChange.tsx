import { TriangleAlert } from "lucide-react"

import { Button } from "@rabbitswap/ui/basic"

import { SwapReviewBase, SwapReviewBaseProps } from "./base"

interface ReviewWithAcceptChangeProps extends SwapReviewBaseProps {
	onAccept: () => void
}

export const ReviewWithAcceptChange: React.FC<ReviewWithAcceptChangeProps> = ({ onAccept, ...props }) => {
	return (
		<SwapReviewBase {...props}>
			<div className="flex items-center justify-between rounded-xl bg-gray-50 p-3 text-sm font-medium dark:bg-gray-900">
				<div className="flex items-center gap-3">
					<TriangleAlert />
					Price Updated
				</div>
				<Button onClick={onAccept} className="text-base">
					Accept
				</Button>
			</div>
		</SwapReviewBase>
	)
}
