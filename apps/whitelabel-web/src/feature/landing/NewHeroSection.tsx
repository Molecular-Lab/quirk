import { Link } from "@tanstack/react-router"

export function NewHeroSection({ onGetStarted }: { onGetStarted: () => void }) {
	return (
		<section className="relative pt-32 pb-20 overflow-hidden">
			{/* Animated gradient background */}
			<div className="absolute inset-0">
				<div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-blue-100/40 via-purple-100/30 to-pink-100/40 rounded-full blur-3xl animate-pulse" />
				<div
					className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-cyan-100/40 via-blue-100/30 to-indigo-100/40 rounded-full blur-3xl animate-pulse"
					style={{ animationDelay: "2s" }}
				/>
			</div>

			<div className="relative z-10 max-w-7xl mx-auto px-6">
				<div className="text-center max-w-4xl mx-auto">
					<h1 className="text-6xl font-semibold text-gray-900 mb-6 leading-tight">
						Earn on anywhere,
						<br />
						<span className="bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
							onboard users to digital assets
						</span>
					</h1>
					<p className="text-xl text-gray-600 mb-10 leading-relaxed">
						White-label DeFi yield infrastructure for apps. Turn idle balances into yield-generating assets with
						institutional-grade custody and compliance.
					</p>
					<div className="flex items-center justify-center gap-4">
						<button
							onClick={onGetStarted}
							className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-8 py-4 rounded-full hover:from-blue-600 hover:to-indigo-600 transition-all font-medium text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
						>
							Get Started
						</button>
						<Link
							to="/demo"
							className="bg-white text-gray-700 px-8 py-4 rounded-full hover:bg-gray-50 transition-all font-medium text-lg border border-gray-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
						>
							View Demo
						</Link>
					</div>
				</div>
			</div>
		</section>
	)
}
