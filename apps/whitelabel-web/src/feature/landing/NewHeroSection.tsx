import { Link } from "@tanstack/react-router"

export function NewHeroSection({ onGetStarted }: { onGetStarted: () => void }) {
	return (
		<section className="relative min-h-[100vh] flex items-center overflow-hidden">
			{/* Animated gradient background - Soft purple/green */}
			<div className="absolute inset-0 opacity-40">
				<img src="/Loop Background GIF by Trakto.gif" className="w-full h-full object-cover" alt="" />
			</div>

			{/* Overlay to soften with purple/green tones */}
			<div className="absolute inset-0 bg-gradient-to-b from-purple-50/60 via-green-50/40 to-white/95" />

			{/* Luma-style soft decorative gradients */}
			<div className="absolute top-20 -right-20 w-[700px] h-[700px] bg-gradient-to-br from-blue-100/25 via-purple-100/20 to-cyan-100/15 rounded-full blur-3xl" />
			<div className="absolute bottom-0 -left-20 w-[700px] h-[700px] bg-gradient-to-tr from-purple-100/20 via-blue-100/15 to-transparent rounded-full blur-3xl" />

			<div className="relative z-10 max-w-7xl mx-auto px-6">
				<div className="text-center max-w-4xl mx-auto">
					<h1 className="text-6xl font-bold text-gray-950 mb-6 leading-tight">
						Earn on Anywhere, Everywhere
					</h1>
					<p className="text-xl text-gray-700 mb-10 leading-relaxed max-w-3xl mx-auto">
						Turn idle balances into active revenue streams with
						institutional-grade custody and compliance.
					</p>
					<div className="flex items-center justify-center gap-4">
						<button
							onClick={onGetStarted}
							className="bg-gray-900 text-white px-8 py-4 rounded-lg hover:bg-gray-800 transition-all font-medium text-lg shadow-sm hover:shadow-md"
						>
							Get Started
						</button>
						<Link
							to="/demo"
							className="bg-white text-gray-950 px-8 py-4 rounded-lg hover:bg-gray-50 transition-all font-medium text-lg border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md"
						>
							View Demo
						</Link>
					</div>
				</div>
			</div>
		</section>
	)
}
