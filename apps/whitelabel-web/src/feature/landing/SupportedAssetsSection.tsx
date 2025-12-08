import usdcLogo from "@/assets/usd-coin-usdc-logo.png"

export function SupportedAssetsSection() {
	const protocols = [
		{
			name: "AAVE",
			icon: "🏦",
			description: "Leading DeFi lending protocol",
		},
		{
			name: "Compound",
			icon: "🔷",
			description: "Autonomous money market protocol",
		},
		{
			name: "Morpho",
			icon: "🦋",
			description: "Optimized lending protocol",
		},
		{
			name: "USDC",
			logo: usdcLogo,
			description: "USD Coin - Stablecoin",
		},
		{
			name: "USDT",
			icon: "💲",
			description: "Tether - Stablecoin",
		},
		{
			name: "More",
			icon: "+",
			description: "More protocols coming soon",
		},
	]

	return (
		<section className="py-20 bg-white">
			<div className="max-w-7xl mx-auto px-6">
				<div className="text-center mb-12">
					<h3 className="text-4xl font-bold text-gray-950 mb-2">Supported Protocols & Assets</h3>
					<p className="text-gray-700 text-lg">Stablecoin infrastructure with leading DeFi protocols</p>
				</div>

				{/* Draggable Protocol Carousel */}
				<div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide cursor-grab active:cursor-grabbing">
					{protocols.map((protocol, idx) => (
						<div
							key={idx}
							className="flex-shrink-0 w-[200px] bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-blue-300 transition-all snap-start"
						>
							<div className="flex flex-col items-center gap-3">
								<div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center border-2 border-blue-200 shadow-sm">
									{protocol.logo ? (
										<img src={protocol.logo} alt={protocol.name} className="w-12 h-12" />
									) : protocol.icon === "+" ? (
										<span className="text-3xl font-bold text-gray-500">{protocol.icon}</span>
									) : (
										<span className="text-3xl">{protocol.icon}</span>
									)}
								</div>
								<div className="text-center">
									<span className="block text-lg font-bold text-gray-950">{protocol.name}</span>
									<span className="text-xs text-gray-600 mt-1 block">{protocol.description}</span>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	)
}
