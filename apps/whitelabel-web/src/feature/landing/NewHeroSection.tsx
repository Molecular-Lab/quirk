import { Link } from "@tanstack/react-router"

export function NewHeroSection() {
	return (
		<section className="pt-32 pb-20 bg-white">
			<div className="max-w-7xl mx-auto px-6">
				<div className="text-center max-w-4xl mx-auto">
					<h1 className="text-6xl font-bold text-gray-900 mb-6 leading-tight">
						Earn on anywhere,
						<br />
						onboard users to digital assets
					</h1>
					<p className="text-xl text-gray-600 mb-10 leading-relaxed">
						White-label DeFi yield infrastructure for apps. Turn idle balances into yield-generating assets with
						institutional-grade custody and compliance.
					</p>
					<div className="flex items-center justify-center gap-4">
						<Link
							to="/register"
							className="bg-gray-900 text-white px-8 py-4 rounded-2xl hover:bg-gray-800 transition-colors font-medium text-lg"
						>
							Get Started
						</Link>
						<Link
							to="/demo"
							className="bg-gray-50 text-gray-900 px-8 py-4 rounded-2xl hover:bg-gray-100 transition-colors font-medium text-lg border border-gray-200"
						>
							View Demo
						</Link>
					</div>
				</div>
			</div>
		</section>
	)
}
