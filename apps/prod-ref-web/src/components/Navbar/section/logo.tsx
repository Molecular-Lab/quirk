import React from "react"

import { PropsWithClassName, cn } from "@rabbitswap/ui/utils"

import { Link } from "@/router"

export const NavBarLogo: React.FC<PropsWithClassName> = ({ className }) => {
	return (
		<Link to="/" className={cn("flex items-center justify-center", className)}>
			<img
				src="/logo/logo.png"
				className="pointer-events-none hidden h-12 w-[207.5px] object-contain md:inline-block"
				alt="RabbitSwap Logo"
			/>
			<img
				src="/images/512x512_App_Icon.png"
				className="pointer-events-none size-10 object-contain md:hidden"
				alt="RabbitSwap Icon"
			/>
		</Link>
	)
}
