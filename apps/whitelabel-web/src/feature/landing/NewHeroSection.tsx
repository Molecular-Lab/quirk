export function NewHeroSection() {
	return (
		<section className="relative min-h-[100vh] flex items-center overflow-hidden">
			{/* Animated gradient background - Soft purple/green */}
			<div className="absolute inset-0 opacity-40">
				<img src="/Loop Background GIF by Trakto.gif" className="w-full h-full object-cover" alt="" />
			</div>

			{/* Overlay to soften with purple/green tones */}
			<div className="absolute inset-0 bg-gradient-to-b from-purple-50/60 via-green-50/40 to-white/95" />

			{/* Luma-style soft decorative gradients */}
			<div className="absolute top-20 -right-20 w-[700px] h-[700px] bg-gradient-to-br from-blue-100/25 via-purple-100/20 to-cyan-100/15 rounded-full blur-[120px]" />
			<div className="absolute bottom-0 -left-20 w-[700px] h-[700px] bg-gradient-to-tr from-purple-100/20 via-blue-100/15 to-transparent rounded-full blur-[120px]" />
			<div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/0 via-white/20 to-white/90" />

			<div className="relative z-10 max-w-7xl mx-auto px-6">
				<div className="text-center w-full mx-auto">
					<h1 className="text-8xl font-bold text-gray-950 mb-8 leading-tight">
						Earn Anywhere Everywhere with Stablecoin
					</h1>
					<p className="text-3xl text-gray-700 mb-12 leading-relaxed max-w-6xl mx-auto">
						Turn idle balances into active revenue streams with
						institutional-grade custody and compliance.
					</p>
					<div className="flex items-center justify-center">
						<a
							href="https://tally.so/r/VLGvyj"
							target="_blank"
							rel="noopener noreferrer"
							className="bg-gray-900 text-white px-10 py-5 rounded-lg hover:bg-gray-800 transition-all font-medium text-xl shadow-sm hover:shadow-md"
						>
							Join Our Waitlist
						</a>
					</div>
				</div>
			</div>
		</section>
	)
}
