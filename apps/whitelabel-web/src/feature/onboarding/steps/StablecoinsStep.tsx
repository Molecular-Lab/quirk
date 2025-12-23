/**
 * Step 2: Stablecoins 101
 * Explain what stablecoins are and why they're used
 */

import { Clock, Globe, Shield, TrendingUp } from "lucide-react"

const benefits = [
	{
		icon: TrendingUp,
		title: "Earn Passive Yield",
		description: "Generate consistent returns without active trading",
	},
	{
		icon: Globe,
		title: "Global Access",
		description: "Send and receive value anywhere, 24/7",
	},
	{
		icon: Clock,
		title: "Instant Settlement",
		description: "No waiting for bank transfers or business hours",
	},
	{
		icon: Shield,
		title: "Hedge Against Volatility",
		description: "Stay protected from crypto market swings",
	},
]

export function StablecoinsStep() {
	return (
		<div className="flex flex-col items-center text-center animate-fade-up">
			<div className="w-20 h-20 rounded-3xl bg-violet-200 flex items-center justify-center mb-6">
				<TrendingUp className="w-10 h-10 text-gray-800" />
			</div>

			<h1 className="text-2xl font-bold text-foreground mb-3">Benefits of Stablecoins</h1>

			<p className="text-muted-foreground text-base leading-relaxed mb-8 max-w-xs">
				Why holding stablecoins is smarter than traditional savings.
			</p>

			<div className="w-full space-y-3">
				{benefits.map((benefit, index) => {
					const Icon = benefit.icon
					return (
						<div
							key={benefit.title}
							className="glass-card rounded-2xl p-4 flex items-center gap-4 text-left animate-fade-up"
							style={{ animationDelay: `${0.1 + index * 0.05}s` }}
						>
							<div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
								<Icon className="w-6 h-6 text-gray-700" />
							</div>
							<div>
								<h3 className="font-semibold text-foreground text-sm mb-0.5">{benefit.title}</h3>
								<p className="text-muted-foreground text-xs leading-relaxed">{benefit.description}</p>
							</div>
						</div>
					)
				})}
			</div>
		</div>
	)
}
