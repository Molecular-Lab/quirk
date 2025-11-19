import { motion } from "framer-motion"

import { cn } from "@rabbitswap/ui/utils"

interface AnimateHeightProps extends React.ComponentProps<typeof motion.div> {
	duration?: number
}

export const AnimateHeight: React.FC<AnimateHeightProps> = ({ duration = 0.2, className, ...props }) => {
	return (
		<motion.div
			initial={{
				height: 0,
			}}
			animate={{
				height: "auto",
			}}
			exit={{
				height: 0,
			}}
			transition={{ duration: duration, ease: "linear" }}
			className={cn("overflow-hidden", className)}
			{...props}
		/>
	)
}
