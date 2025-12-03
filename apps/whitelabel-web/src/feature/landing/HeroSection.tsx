import { Link } from "@tanstack/react-router"

export function HeroSection() {
	return (
		<section className="relative pt-32 pb-24 px-6 bg-gradient-to-br from-navy-950 via-navy-900 to-blue-950 overflow-hidden">
			{/* Animated background */}
			<div className="absolute inset-0 opacity-30">
				<div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
				<div
					className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"
					style={{ animationDelay: "1s" }}
				/>
				<div
					className="absolute top-1/2 left-1/2 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"
					style={{ animationDelay: "2s" }}
				/>
			</div>

			{/* Floating tags */}
			<div className="absolute inset-0 pointer-events-none">
				<div className="absolute top-1/3 right-1/4 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm border border-white/20 animate-float">
					● systemic alternative
				</div>
				<div
					className="absolute top-1/2 right-1/3 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm border border-white/20 animate-float"
					style={{ animationDelay: "0.5s" }}
				>
					● dispersion alpha
				</div>
				<div
					className="absolute bottom-1/3 left-1/4 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm border border-white/20 animate-float"
					style={{ animationDelay: "1s" }}
				>
					● systemic trend
				</div>
				<div
					className="absolute bottom-1/4 right-1/3 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm border border-white/20 animate-float"
					style={{ animationDelay: "1.5s" }}
				>
					● volatility relative
				</div>
				<div
					className="absolute top-1/4 left-1/3 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm border border-white/20 animate-float"
					style={{ animationDelay: "2s" }}
				>
					● risk mitigation
				</div>
			</div>

			{/* Content */}
			<div className="relative max-w-7xl mx-auto text-center z-10">
				<p className="text-gray-300 text-sm mb-4 tracking-wide uppercase">
					Grow your customer base and activate new revenue opportunities with
				</p>

				<h1 className="text-6xl md:text-7xl font-bold mb-6 text-white leading-tight">
					Customized Earn
					<br />
					Solutions At Scale
				</h1>

				<div className="flex items-center justify-center gap-4 mt-8">
					<Link
						to="/register"
						className="bg-white text-navy-950 px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors font-medium text-lg"
					>
						Talk to an Expert
					</Link>
				</div>

				{/* Visual Cards */}
				<div className="mt-20 relative">
					<div className="grid grid-cols-1 md:grid-cols-4 gap-4 perspective-1000">
						{/* Card 1 */}
						<div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 transform hover:scale-105 transition-transform duration-300">
							<div className="text-left">
								<div className="text-sm text-gray-400 mb-2">AI Curation</div>
								<div className="h-32 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg" />
							</div>
						</div>

						{/* Card 2 */}
						<div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 transform hover:scale-105 transition-transform duration-300">
							<div className="text-left">
								<div className="text-sm text-gray-400 mb-2">Compliance</div>
								<div className="h-32 bg-gradient-to-br from-green-500/20 to-teal-500/20 rounded-lg" />
							</div>
						</div>

						{/* Card 3 */}
						<div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 transform hover:scale-105 transition-transform duration-300">
							<div className="text-left">
								<div className="text-sm text-gray-400 mb-2">Security</div>
								<div className="h-32 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-lg" />
							</div>
						</div>

						{/* Card 4 */}
						<div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 transform hover:scale-105 transition-transform duration-300">
							<div className="text-left">
								<div className="text-sm text-gray-400 mb-2">Risk Management</div>
								<div className="h-32 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg" />
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	)
}
