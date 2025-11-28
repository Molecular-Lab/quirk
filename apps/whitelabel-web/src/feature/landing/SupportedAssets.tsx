export function SupportedAssets() {
	const assets = [
		{ symbol: 'USDC', name: 'USD Coin', color: 'text-blue-600' },
		{ symbol: 'USDT', name: 'Tether', color: 'text-green-600' },
		{ symbol: 'BTC', name: 'Bitcoin', color: 'text-orange-500' },
		{ symbol: 'ETH', name: 'Ethereum', color: 'text-blue-500' },
		{ symbol: 'LINK', name: 'Chainlink', color: 'text-blue-600' },
		{ symbol: 'DOGE', name: 'Dogecoin', color: 'text-yellow-500' },
		{ symbol: 'XRP', name: 'Ripple', color: 'text-blue-400' },
	]

	return (
		<section className="py-16 px-6 bg-white">
			<div className="max-w-7xl mx-auto">
				<div className="text-center mb-12">
					<div className="inline-flex items-center gap-4 px-8 py-4 bg-gray-50 rounded-2xl border border-gray-200">
						<h3 className="text-lg font-semibold text-gray-900">Supported Assets</h3>
						<div className="flex items-center gap-4">
							{assets.map((asset) => (
								<div
									key={asset.symbol}
									className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-gray-200"
								>
									<div className={`w-8 h-8 rounded-full ${asset.color} bg-opacity-10 flex items-center justify-center font-bold ${asset.color}`}>
										{asset.symbol.charAt(0)}
									</div>
									<span className="text-sm font-medium text-gray-700">{asset.symbol}</span>
								</div>
							))}
							<div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-gray-200">
								<span className="text-sm font-medium text-gray-700">+more</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	)
}
