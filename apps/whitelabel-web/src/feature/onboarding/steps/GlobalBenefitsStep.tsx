/**
 * Step 3: Earn Strategies
 * Educational accordion explaining the 5 yield strategies
 */

import { useState } from "react"

import { Building2, ChevronDown, Layers, RefreshCw, Scale, Waves } from "lucide-react"

import { cn } from "@/lib/utils"

interface Strategy {
	id: string
	icon: React.ElementType
	title: string
	shortDesc: string
	details: string[]
}

const STRATEGIES: Strategy[] = [
	{
		id: "cefi",
		icon: Building2,
		title: "CeFi (Centralized Finance)",
		shortDesc: "Traditional platforms like exchanges offering lending and yield",
		details: [
			"Regulated platforms you may already know (Coinbase, Binance)",
			"Your funds are held by a trusted third party",
			"Often offer insurance and customer support",
			"Easier to use for beginners",
		],
	},
	{
		id: "defi",
		icon: Layers,
		title: "DeFi (Decentralized Finance)",
		shortDesc: "On-chain protocols that run automatically via smart contracts",
		details: [
			"No middlemen - code executes transactions automatically",
			"Transparent and auditable on the blockchain",
			"Higher potential yields due to lower overhead",
			"You maintain control of your assets",
		],
	},
	{
		id: "lp",
		icon: Waves,
		title: "Liquidity Pools (LP)",
		shortDesc: "Earn fees by providing liquidity to trading pairs",
		details: [
			"Deposit tokens into a pool that traders use for swaps",
			"Earn a share of trading fees from every transaction",
			"Automated market makers (AMMs) manage pricing",
			"We handle the complexity of pool management for you",
		],
	},
	{
		id: "hedging",
		icon: Scale,
		title: "Hedging Strategies",
		shortDesc: "Protect your portfolio from market volatility",
		details: [
			"Reduce risk during market downturns",
			"Use derivatives like options and futures",
			"Balance potential gains with downside protection",
			"Smart allocation between risky and stable assets",
		],
	},
	{
		id: "arbitrage",
		icon: RefreshCw,
		title: "Arbitrage",
		shortDesc: "Profit from price differences across markets",
		details: [
			"Buy low on one exchange, sell high on another",
			"Requires fast execution and low fees",
			"Low risk when executed correctly",
			"Our systems monitor markets 24/7 for opportunities",
		],
	},
]

export function GlobalBenefitsStep() {
	const [expandedId, setExpandedId] = useState<string | null>(null)

	const toggleExpand = (id: string) => {
		setExpandedId((current) => (current === id ? null : id))
	}

	return (
		<div className="flex flex-col items-center text-center animate-fade-up">
			<div className="w-20 h-20 rounded-3xl bg-violet-200 flex items-center justify-center mb-6">
				<Layers className="w-10 h-10 text-gray-800" />
			</div>

			<h1 className="text-2xl font-bold text-foreground mb-3">Earn Strategies</h1>

			<p className="text-muted-foreground text-base leading-relaxed mb-6 max-w-xs">
				Tap each strategy to learn how your money can work for you.
			</p>

			<div className="w-full space-y-3">
				{STRATEGIES.map((strategy) => {
					const Icon = strategy.icon
					const isExpanded = expandedId === strategy.id

					return (
						<div
							key={strategy.id}
							className="glass-card rounded-2xl overflow-hidden text-left cursor-pointer"
							onClick={() => toggleExpand(strategy.id)}
						>
							{/* Header - always visible */}
							<div className="p-4 flex items-center gap-3">
								<div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0">
									<Icon className="w-5 h-5 text-violet-600" />
								</div>
								<div className="flex-1 min-w-0">
									<h3 className="font-semibold text-foreground text-sm">{strategy.title}</h3>
									<p className="text-muted-foreground text-xs leading-relaxed truncate">
										{strategy.shortDesc}
									</p>
								</div>
								<ChevronDown
									className={cn(
										"w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform duration-200",
										isExpanded && "rotate-180"
									)}
								/>
							</div>

							{/* Expanded details */}
							<div
								className={cn(
									"overflow-hidden transition-all duration-300 ease-in-out",
									isExpanded ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
								)}
							>
								<div className="px-4 pb-4 pt-0">
									<div className="border-t border-gray-100 pt-3">
										<ul className="space-y-2">
											{strategy.details.map((detail, i) => (
												<li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
													<span className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-1.5 flex-shrink-0" />
													{detail}
												</li>
											))}
										</ul>
									</div>
								</div>
							</div>
						</div>
					)
				})}
			</div>
		</div>
	)
}
