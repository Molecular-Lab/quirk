/**
 * Step 1: Welcome
 * Simple introduction to Quirk's philosophy
 */

import { Shield, Sparkles, TrendingUp } from "lucide-react"

export function WelcomeStep() {
	return (
		<div className="flex flex-col items-center text-center animate-fade-up">
			<div className="w-20 h-20 rounded-3xl bg-violet-200 flex items-center justify-center mb-6">
				<Sparkles className="w-10 h-10 text-gray-800" />
			</div>

			<h1 className="text-2xl font-bold text-foreground mb-3">Welcome to Quirk</h1>

			<p className="text-muted-foreground text-base leading-relaxed mb-8 max-w-xs">
				We believe in the uniqueness of every individual. Let us help you grow your wealth through our platform.
			</p>

			<div className="w-full space-y-3">
				<div
					className="glass-card rounded-2xl p-4 flex items-start gap-4 text-left animate-fade-up"
					style={{ animationDelay: "0.1s" }}
				>
					<div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
						<Shield className="w-6 h-6 text-gray-700" />
					</div>
					<div>
						<h3 className="font-semibold text-foreground text-sm mb-1">Institutional-Grade Security</h3>
						<p className="text-muted-foreground text-xs leading-relaxed">
							Your assets are protected with enterprise-level custody solutions.
						</p>
					</div>
				</div>

				<div
					className="glass-card rounded-2xl p-4 flex items-start gap-4 text-left animate-fade-up"
					style={{ animationDelay: "0.2s" }}
				>
					<div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
						<TrendingUp className="w-6 h-6 text-gray-700" />
					</div>
					<div>
						<h3 className="font-semibold text-foreground text-sm mb-1">Optimized Yield Generation</h3>
						<p className="text-muted-foreground text-xs leading-relaxed">
							We maximize returns through diversified DeFi and CeFi strategies.
						</p>
					</div>
				</div>
			</div>
		</div>
	)
}
