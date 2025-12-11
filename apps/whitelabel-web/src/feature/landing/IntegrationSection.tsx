export function IntegrationSection() {
	return (
		<section className="relative min-h-[90vh] py-20 bg-white flex items-center overflow-hidden">
			{/* Wave aurora (hero palette: purple/blue/cyan) */}
			<div className="absolute top-[32%] left-0 w-full h-[320px] -translate-y-1/2 pointer-events-none z-0">
				<div className="absolute inset-0 bg-gradient-to-r from-purple-100/32 via-blue-100/26 to-cyan-100/20 blur-[120px] opacity-80" />
				<div className="absolute inset-0">
					<div className="absolute -left-10 top-[34%] w-[120%] h-[130px] rounded-full bg-gradient-to-r from-purple-100/30 via-blue-100/26 to-cyan-100/18 blur-[90px] opacity-85 rotate-[1.8deg]" />
					<div className="absolute -right-12 top-[56%] w-[130%] h-[120px] rounded-full bg-gradient-to-r from-purple-50/26 via-blue-100/24 to-cyan-100/18 blur-[95px] opacity-75 -rotate-[1.6deg]" />
				</div>
				<div className="absolute inset-x-0 top-1/2 h-[14px] -translate-y-1/2 bg-gradient-to-r from-transparent via-purple-300/55 to-transparent opacity-65 blur-[12px]" />
			</div>
			<div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
				<div className="text-center mb-16">
					<h2 className="text-6xl font-bold text-gray-950 mb-8">
						Simple Integration
					</h2>
				</div>

				<div className="max-w-3xl mx-auto mb-12">
					<div className="bg-white/90 backdrop-blur-md rounded-xl p-10 border border-gray-150 hover:shadow-md hover:border-gray-200 transition-all">
						<h3 className="text-3xl font-semibold text-gray-950 mb-6">Quick Setup</h3>
						<p className="text-lg text-gray-700 leading-relaxed mb-6">
							Integrate our SDK in under 30 minutes. No blockchain expertise required—we handle all the complexity.
						</p>
						<div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
							<code className="text-base text-gray-700">
								<span className="text-gray-500">// Install</span>
								<br />
								npm install @quirk/sdk
								<br />
								<br />
								<span className="text-gray-500">// Initialize</span>
								<br />
								quirk.init(apiKey)
							</code>
						</div>
					</div>
				</div>

			</div>
		</section>
	)
}
