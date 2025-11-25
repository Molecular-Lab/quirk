import { BookMarked, Hammer, LayoutDashboard, MessageCircleQuestion } from "lucide-react"

import { Coingecko, Github, Twitter } from "@rabbitswap/ui/icons"

import { Path } from "@/router"

type LinkType =
	| { to: Path; linkType: "internal" }
	| { to: string; linkType: "external" }
	| { linkType?: undefined; to?: undefined }

export interface IconMenuItemGroup {
	type: "icons"
	menus: ({ label: React.ReactNode } & LinkType)[]
}

interface DividerItem {
	type: "divider"
	linkType?: undefined
	to?: undefined
}

export type MenuItem =
	| (LinkType & {
			type?: undefined
			label: React.ReactNode
			decorator?: React.ReactNode
			menus?: (MenuItem | IconMenuItemGroup)[]
			className?: string
	  })
	| DividerItem

export const staticMenuItems: MenuItem[] = [
	{
		linkType: "internal",
		to: "/swap",
		label: "Trade",
		menus: [
			{
				linkType: "internal",
				to: "/swap",
				label: "Swap",
			},
			{
				linkType: "internal",
				to: "/limit",
				label: "Limit",
			},
		],
	},
	{
		linkType: "internal",
		to: "/pools",
		label: "Pool",
		menus: [
			{
				linkType: "internal",
				to: "/pools",
				label: "View position",
			},
			{
				linkType: "internal",
				to: "/add",
				label: "Create position",
			},
		],
	},
	{
		linkType: "internal",
		to: "/explore",
		label: "Explore",
	},
	{
		linkType: "internal",
		to: "/bridge",
		label: "Bridge",
	},
	{
		label: "More",
		menus: [
			{
				label: (
					<div className="flex items-center gap-1.5">
						<BookMarked className="size-4" />
						Document
					</div>
				),
				linkType: "external",
				to: "https://docs.rabbitswap.xyz",
				className: "text-gray-700 dark:text-gray-300",
			},

			{
				label: (
					<div className="flex items-center gap-1.5">
						<Hammer className="size-4" />
						Viction Ecosystem Tool
					</div>
				),
				menus: [
					{
						linkType: "external",
						to: "https://vault.rabbitswap.xyz/",
						label: "Rabbit Vault (Multisig)",
					},
				],
			},
			{
				label: (
					<div className="flex items-center gap-1.5">
						<LayoutDashboard className="size-4" />
						Dashboard
					</div>
				),
				menus: [
					{
						linkType: "external",
						to: "https://defillama.com/protocol/proxify-swap#information",
						label: "Defillama",
					},
				],
			},
			{
				label: (
					<div className="flex items-center gap-1.5">
						<MessageCircleQuestion className="size-4" />
						<span>Need help?</span>
					</div>
				),
				menus: [
					{
						linkType: "external",
						to: "https://rabbitswap.notion.site/1305f29d37be802e9764ea258357c61a",
						label: "Help Center",
					},
					{
						linkType: "external",
						to: "https://t.me/rabbitswap_community/2",
						label: "Community",
					},
				],
			},
			{
				type: "icons",
				menus: [
					{
						linkType: "external",
						label: <Github className="size-5" />,
						to: "https://github.com/RabbitDEX",
					},
					{
						linkType: "external",
						label: <Twitter className="size-4" />,
						to: "https://x.com/rabbitswapxyz",
					},
					{
						linkType: "external",
						label: <Coingecko className="size-5" />,
						to: "https://www.coingecko.com/en/exchanges/rabbitswap",
					},
				],
			},
		],
	},
]
