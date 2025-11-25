import { Button } from "@rabbitswap/ui/basic"
import { cn } from "@rabbitswap/ui/utils"

import { LimitOrderReviewBase, LimitOrderReviewBaseProps } from "./base"

interface ReviewWithButtonProps extends LimitOrderReviewBaseProps {
	buttonProps: React.ComponentProps<typeof Button>
}

export const ReviewWithButton: React.FC<ReviewWithButtonProps> = ({ buttonProps, ...props }) => {
	return (
		<LimitOrderReviewBase {...props}>
			<Button {...buttonProps} className={cn("h-12 w-full text-base font-medium", buttonProps.className)} />
		</LimitOrderReviewBase>
	)
}
