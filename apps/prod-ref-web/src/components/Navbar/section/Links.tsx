import { Fragment, useMemo } from "react"
import { useLocation } from "react-router-dom"

import { ChevronDown } from "lucide-react"

import { Separator, Tooltip, TooltipContent, TooltipTrigger } from "@rabbitswap/ui/basic"
import { cn } from "@rabbitswap/ui/utils"

import { Redirect } from "@/components/Redirect"

import { IconMenuItemGroup, MenuItem, staticMenuItems } from "./staticMenuItems"

function isActiveMenu(actual: string, expected: string | undefined): boolean {
	const hasPrefix = expected !== undefined && actual.startsWith(expected)
	return hasPrefix || actual === expected
}

const InnerMenuLink: React.FC<{
	menu: MenuItem
}> = ({ menu }) => {
	const { to } = menu

	const { pathname } = useLocation()
	const isActive = useMemo(() => {
		return isActiveMenu(pathname, to)
	}, [pathname, to])

	if (menu.type === "divider") {
		return <Separator />
	}

	const { label, decorator, menus, className } = menu

	return (
		<div className="flex flex-col gap-4 lg:gap-5">
			<Redirect
				to={to}
				className={cn(
					"w-full whitespace-nowrap font-medium",
					"flex items-center gap-x-1",
					menus
						? "text-gray-700 dark:text-gray-300"
						: [
								"text-gray-500 hover:text-gray-600 active:text-gray-700",
								"dark:text-gray-500 dark:hover:text-gray-400 dark:active:text-gray-300",
							],
					isActive && [
						"font-semibold text-rabbit-black hover:text-gray-950 active:text-gray-900",
						"dark:text-rabbit-white dark:hover:text-gray-50 dark:active:text-gray-100",
					],
					className,
				)}
			>
				<span>{label}</span>
				{decorator}
			</Redirect>

			{menus && (
				<div className="-mt-1 mb-1 flex flex-col gap-2 text-xs lg:gap-3 lg:text-sm">
					{menus.map((menu, i) => (
						<Fragment key={i}>
							{menu.type === "icons" ? <InnerMenuIcons menu={menu} /> : <InnerMenuLink menu={menu} />}
						</Fragment>
					))}
				</div>
			)}
		</div>
	)
}

/**
 * group of clickable icons
 */
const InnerMenuIcons: React.FC<{ menu: IconMenuItemGroup }> = ({ menu }) => {
	return (
		<div className="flex items-center gap-6">
			{menu.menus.map(({ label: icon, to }) => (
				<Redirect
					key={to}
					to={to}
					className="cursor-pointer text-gray-500 hover:text-gray-600 active:text-gray-700 dark:text-gray-500 dark:hover:text-gray-400 dark:active:text-gray-300"
					hideArrow
				>
					{icon}
				</Redirect>
			))}
		</div>
	)
}

const MenuLink: React.FC<{
	menu: MenuItem
	isMobile: boolean
}> = ({ menu, isMobile }) => {
	const { to } = menu

	const { pathname } = useLocation()
	const isActive = useMemo(() => {
		return isActiveMenu(pathname, to)
	}, [pathname, to])

	if (menu.type === "divider") {
		return <Separator />
	}

	const { label, decorator, menus } = menu

	const hasInnerMenu = menus !== undefined && menus.length > 0

	const inner = (
		<Redirect
			to={to}
			className={cn(
				"w-fit",
				"whitespace-nowrap font-medium",
				"flex items-center justify-center gap-x-1",
				"text-gray-500 hover:text-gray-600 active:text-gray-700 dark:text-gray-500 dark:hover:text-gray-400 dark:active:text-gray-300",
				isActive &&
					"font-semibold text-rabbit-black hover:text-gray-950 active:text-gray-900 dark:text-rabbit-white dark:hover:text-gray-50 dark:active:text-gray-100",
				isMobile && "text-left",
				!isMobile && "w-full",
			)}
		>
			<span className="p-2 uppercase">{label}</span>
			{decorator ?? (
				<>
					{hasInnerMenu && <ChevronDown className="-ml-1 hidden transition-transform group-hover:rotate-180 lg:flex" />}
				</>
			)}
		</Redirect>
	)

	if (hasInnerMenu && !isMobile) {
		return (
			<Tooltip className="group w-full">
				<TooltipTrigger>{inner}</TooltipTrigger>
				<TooltipContent>
					<div className="flex flex-col gap-4 px-2 py-3 text-sm lg:gap-6 lg:px-3 lg:py-5 lg:text-base">
						{menus.map((menu, i) => {
							return (
								<Fragment key={i}>
									{menu.type === "icons" ? <InnerMenuIcons menu={menu} /> : <InnerMenuLink menu={menu} />}
								</Fragment>
							)
						})}
					</div>
				</TooltipContent>
			</Tooltip>
		)
	}

	if (hasInnerMenu && isMobile) {
		return (
			<div className="flex w-full flex-col">
				{inner}
				<div className="flex w-full flex-col gap-3 px-2 py-1 pl-6 text-sm lg:gap-6 lg:px-3 lg:py-5 lg:text-base">
					{menus.map((menu, i) => {
						return (
							<Fragment key={i}>
								{menu.type === "icons" ? <InnerMenuIcons menu={menu} /> : <InnerMenuLink menu={menu} />}
							</Fragment>
						)
					})}
				</div>
			</div>
		)
	}

	return inner
}

export const LinksSection: React.FC<{ isMobile: boolean }> = ({ isMobile }) => {
	return (
		<div
			className={cn(
				"w-full",
				"text-sm lg:text-base",
				"flex flex-col items-start",
				"lg:flex-row lg:items-center lg:gap-x-6",
				isMobile && "gap-2",
			)}
		>
			{staticMenuItems.map((menu, i) => {
				return (
					<Fragment key={i}>
						<MenuLink isMobile={isMobile} menu={menu} />
					</Fragment>
				)
			})}
		</div>
	)
}
