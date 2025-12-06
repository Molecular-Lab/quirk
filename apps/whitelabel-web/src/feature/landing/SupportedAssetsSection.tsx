import usdcLogo from "@/assets/usd-coin-usdc-logo.png"

export function SupportedAssetsSection() {
	const assets = [
		{
			name: "USDC",
			logo: usdcLogo,
			description: "USD Coin - Stablecoin",
		},
		{
			name: "USDT",
			// Using emoji placeholder until USDT logo is added
			icon: "💲",
			description: "Tether - Stablecoin",
		},
	]

	return (
		<section className="py-16 bg-white">
			<div className="max-w-7xl mx-auto px-6">
				<div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl p-10 border border-gray-200 shadow-sm">
					<div className="flex items-center justify-between">
						<div>
							<h3 className="text-3xl font-bold text-gray-900 mb-2">Supported Assets</h3>
							<p className="text-gray-600">Stablecoin infrastructure for seamless DeFi yield</p>
						</div>
						<div className="flex items-center gap-8">
							{assets.map((asset, idx) => (
								<div key={idx} className="flex flex-col items-center gap-3">
									<div className="w-16 h-16 bg-white rounded-full flex items-center justify-center border-2 border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all">
										{asset.logo ? (
											<img src={asset.logo} alt={asset.name} className="w-10 h-10" />
										) : (
											<span className="text-2xl">{asset.icon}</span>
										)}
									</div>
									<div className="text-center">
										<span className="block text-sm font-bold text-gray-900">{asset.name}</span>
										<span className="text-xs text-gray-500">{asset.description}</span>
									</div>
								</div>
							))}
							<div className="flex flex-col items-center gap-3">
								<div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full flex items-center justify-center border-2 border-blue-200">
									<span className="text-2xl font-bold text-blue-600">+</span>
								</div>
								<span className="text-sm font-semibold text-gray-500">more soon</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	)
}
