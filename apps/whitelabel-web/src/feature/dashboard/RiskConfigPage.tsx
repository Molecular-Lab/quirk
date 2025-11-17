export function RiskConfigPage() {
	return (
		<div className="min-h-full bg-white">
			<div className="max-w-[800px] mx-auto px-6 py-8">
				{/* Header */}
				<h1 className="text-[32px] font-bold text-gray-900 mb-2">Risk Configuration</h1>
				<p className="text-gray-600 mb-8">Configure DeFi protocol allocation and auto-rebalancing settings</p>

				{/* Risk Tier Section */}
				<div className="bg-gray-50 rounded-3xl p-6 mb-6">
					<h2 className="text-[20px] font-bold text-gray-900 mb-4">Risk Tier</h2>
					<div className="mb-6">
						<div className="flex items-center justify-between mb-2">
							<span className="text-sm font-medium text-gray-600">Conservative</span>
							<span className="text-sm font-medium text-gray-600">Aggressive</span>
						</div>
						<input
							type="range"
							min="0"
							max="100"
							defaultValue="30"
							className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
						/>
					</div>
					<div className="text-sm text-gray-600">
						Current tier: <span className="font-semibold text-gray-900">Low-Moderate Risk</span>
					</div>
				</div>

				{/* Protocol Allocation Section */}
				<div className="bg-gray-50 rounded-3xl p-6 mb-6">
					<h2 className="text-[20px] font-bold text-gray-900 mb-4">Protocol Allocation</h2>
					<div className="space-y-4">
						{/* AAVE */}
						<div>
							<div className="flex items-center justify-between mb-2">
								<span className="text-sm font-medium text-gray-900">AAVE</span>
								<span className="text-sm font-semibold text-gray-900">70%</span>
							</div>
							<input
								type="range"
								min="0"
								max="100"
								defaultValue="70"
								className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
							/>
						</div>

						{/* Curve */}
						<div>
							<div className="flex items-center justify-between mb-2">
								<span className="text-sm font-medium text-gray-900">Curve</span>
								<span className="text-sm font-semibold text-gray-900">20%</span>
							</div>
							<input
								type="range"
								min="0"
								max="100"
								defaultValue="20"
								className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
							/>
						</div>

						{/* Compound */}
						<div>
							<div className="flex items-center justify-between mb-2">
								<span className="text-sm font-medium text-gray-900">Compound</span>
								<span className="text-sm font-semibold text-gray-900">5%</span>
							</div>
							<input
								type="range"
								min="0"
								max="100"
								defaultValue="5"
								className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
							/>
						</div>

						{/* Uniswap */}
						<div>
							<div className="flex items-center justify-between mb-2">
								<span className="text-sm font-medium text-gray-900">Uniswap</span>
								<span className="text-sm font-semibold text-gray-900">5%</span>
							</div>
							<input
								type="range"
								min="0"
								max="100"
								defaultValue="5"
								className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
							/>
						</div>
					</div>

					<div className="mt-4 p-3 bg-white rounded-lg border border-gray-200">
						<div className="text-xs text-gray-500 mb-1">Total Allocation</div>
						<div className="text-lg font-bold text-gray-900">100%</div>
					</div>
				</div>

				{/* Auto-Rebalance Section */}
				<div className="bg-gray-50 rounded-3xl p-6 mb-6">
					<h2 className="text-[20px] font-bold text-gray-900 mb-4">Auto-Rebalance</h2>
					<div className="flex items-center justify-between mb-4">
						<div>
							<div className="text-sm font-medium text-gray-900 mb-1">Enable Auto-Rebalancing</div>
							<div className="text-xs text-gray-500">Automatically rebalance portfolio based on target allocation</div>
						</div>
						<label className="relative inline-flex items-center cursor-pointer">
							<input type="checkbox" defaultChecked className="sr-only peer" />
							<div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
						</label>
					</div>
					<div>
						<label className="text-sm font-medium text-gray-900 mb-2 block">Frequency</label>
						<select className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none">
							<option value="daily">Daily</option>
							<option value="weekly">Weekly</option>
							<option value="monthly">Monthly</option>
						</select>
					</div>
				</div>

				{/* Save Button */}
				<button className="w-full bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-full font-medium text-sm transition-colors">
					Save Changes
				</button>
			</div>
		</div>
	)
}
