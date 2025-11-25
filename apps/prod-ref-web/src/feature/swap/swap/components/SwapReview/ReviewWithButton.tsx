import { Button } from "@rabbitswap/ui/basic"
import { cn } from "@rabbitswap/ui/utils"

import { SwapReviewBase, SwapReviewBaseProps } from "./base"

interface ReviewWithButtonProps extends SwapReviewBaseProps {
	buttonProps: React.ComponentProps<typeof Button>
}

export const ReviewWithButton: React.FC<ReviewWithButtonProps> = ({ buttonProps, ...props }) => {
	return (
		<SwapReviewBase {...props}>
			<Button {...buttonProps} className={cn("h-12 w-full text-base font-medium", buttonProps.className)} />
		</SwapReviewBase>
	)
}
