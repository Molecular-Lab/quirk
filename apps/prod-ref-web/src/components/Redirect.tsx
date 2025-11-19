import { PropsWithChildren } from "react"
import { Link as RouterLink } from "react-router-dom"

import { ArrowUpRight } from "@rabbitswap/ui/icons"
import { PropsWithClassName } from "@rabbitswap/ui/utils"

import { Link, Params, Path } from "@/router"

/**
 * This component determines whether the link is internal or external and renders the appropriate component.
 */
export const Redirect: React.FC<PropsWithClassName<PropsWithChildren<{ to?: string; hideArrow?: boolean }>>> = ({
	to,
	children,
	className,
	hideArrow,
}) => {
	if (!to) return <div className={className}>{children}</div>

	// internal
	if (to.startsWith("/"))
		return (
			<Link to={to as Exclude<Path, keyof Params>} className={className}>
				{children}
			</Link>
		)

	// external
	return (
		<RouterLink to={to} className={className} target="_blank" rel="noreferrer">
			{children}
			{!hideArrow && <ArrowUpRight className="ml-auto" />}
		</RouterLink>
	)
}
