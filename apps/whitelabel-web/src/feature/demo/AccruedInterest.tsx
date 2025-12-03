export function AccruedInterest() {
	return (
		<div className="px-6 mb-6">
			<div className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
				<div className="flex items-center justify-between mb-3">
					<h3 className="text-white font-semibold text-lg">Accrued Interest</h3>
					<span className="text-xs text-gray-500">Last 30 days</span>
				</div>

				<div className="grid grid-cols-2 gap-4 mb-4">
					<div>
						<p className="text-gray-400 text-xs mb-1">Total Earned</p>
						<p className="text-green-400 text-2xl font-bold">+24.67 THB</p>
						<p className="text-gray-500 text-xs">≈ $0.73 USD</p>
					</div>
					<div>
						<p className="text-gray-400 text-xs mb-1">Current APY</p>
						<p className="text-white text-2xl font-bold">4.85%</p>
						<p className="text-gray-500 text-xs">Variable rate</p>
					</div>
				</div>

				<div className="space-y-3">
					<div className="flex items-center justify-between py-2 border-b border-gray-800">
						<div className="flex items-center gap-3">
							<div className="w-8 h-8 bg-green-900/30 rounded-lg flex items-center justify-center">
								<span className="text-green-400 text-sm">💰</span>
							</div>
							<div>
								<p className="text-white text-sm font-medium">AAVE Lending</p>
								<p className="text-gray-500 text-xs">70% allocation</p>
							</div>
						</div>
						<div className="text-right">
							<p className="text-green-400 text-sm font-semibold">+17.27 THB</p>
							<p className="text-gray-500 text-xs">5.2% APY</p>
						</div>
					</div>

					<div className="flex items-center justify-between py-2 border-b border-gray-800">
						<div className="flex items-center gap-3">
							<div className="w-8 h-8 bg-blue-900/30 rounded-lg flex items-center justify-center">
								<span className="text-blue-400 text-sm">🔄</span>
							</div>
							<div>
								<p className="text-white text-sm font-medium">Curve Pool</p>
								<p className="text-gray-500 text-xs">20% allocation</p>
							</div>
						</div>
						<div className="text-right">
							<p className="text-green-400 text-sm font-semibold">+5.14 THB</p>
							<p className="text-gray-500 text-xs">4.1% APY</p>
						</div>
					</div>

					<div className="flex items-center justify-between py-2">
						<div className="flex items-center gap-3">
							<div className="w-8 h-8 bg-purple-900/30 rounded-lg flex items-center justify-center">
								<span className="text-purple-400 text-sm">🦄</span>
							</div>
							<div>
								<p className="text-white text-sm font-medium">Uniswap V3</p>
								<p className="text-gray-500 text-xs">10% allocation</p>
							</div>
						</div>
						<div className="text-right">
							<p className="text-green-400 text-sm font-semibold">+2.26 THB</p>
							<p className="text-gray-500 text-xs">3.6% APY</p>
						</div>
					</div>
				</div>

				<button className="w-full mt-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl text-white text-sm font-medium transition-colors">
					View Detailed Breakdown
				</button>
			</div>
		</div>
	)
}
