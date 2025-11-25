import React from "react"

import { cn } from "@rabbitswap/ui/utils"

interface NavContainerProps extends React.HTMLAttributes<HTMLDivElement> {}

export const NavContainer: React.FC<NavContainerProps> = ({ className, children, ...props }) => {
	return (
		<nav
			className={cn("relative mx-auto flex backdrop-blur-0", "px-3 lg:px-4", "h-[56px] md:h-[72px]", className)}
			{...props}
		>
			{children}
		</nav>
	)
}
