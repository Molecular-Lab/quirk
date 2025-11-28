export function SupportedAssetsSection() {
	const assets = [
		{ name: 'USDC', icon: '💵' },
		{ name: 'USDT', icon: '💲' },
		{ name: 'BTC', icon: '₿' },
		{ name: 'ETH', icon: 'Ξ' },
		{ name: 'LINK', icon: '🔗' },
		{ name: 'DOGE', icon: '🐕' },
		{ name: 'XRP', icon: '✕' },
	]

	return (
		<section className="py-12 bg-white">
			<div className="max-w-7xl mx-auto px-6">
				<div className="bg-gray-50 rounded-3xl p-8 border border-gray-200">
					<div className="flex items-center justify-between">
						<h3 className="text-2xl font-bold text-gray-900">Supported Assets</h3>
						<div className="flex items-center gap-6">
							{assets.map((asset, idx) => (
								<div key={idx} className="flex flex-col items-center gap-2">
									<div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border border-gray-200">
										<span className="text-xl">{asset.icon}</span>
									</div>
									<span className="text-xs font-medium text-gray-600">{asset.name}</span>
								</div>
							))}
							<div className="text-2xl font-bold text-gray-900">+more</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	)
}
