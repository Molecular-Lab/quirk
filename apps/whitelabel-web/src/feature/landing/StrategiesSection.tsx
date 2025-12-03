export function StrategiesSection() {
	return (
		<section id="products" className="py-24 px-6 bg-gray-50">
			<div className="max-w-7xl mx-auto">
				<div className="text-center mb-16">
					<h2 className="text-5xl font-bold text-gray-900 mb-4">Featured Trading Strategies</h2>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
					{/* CeFi Delta Neutral */}
					<div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
						<h3 className="text-lg font-bold text-gray-900 mb-3">CeFi Delta Neutral:</h3>
						<ul className="space-y-2 text-gray-700 text-sm mb-4">
							<li>
								• Low-volatility "core yield" block. Captures funding-rate and basis spreads with minimal market beta
							</li>
							<li>• B2B partners—exchanges, wallets and neo-banks—seeking predictable, audit-friendly yield</li>
							<li>
								• Classic cash-and-carry: long spot vs. short perpetual / quarterly futures when annualised basis ≥ 6 %
							</li>
						</ul>
						<div className="text-xs text-gray-600 space-y-1">
							<p>
								<strong>Tier-1 Exchanges:</strong> Binance & OKX
							</p>
							<p>
								<strong>Collateral:</strong> USDT / USDC
							</p>
						</div>
					</div>

					{/* DeFi Delta Neutral */}
					<div className="bg-purple-50 rounded-2xl p-6 border border-purple-200">
						<h3 className="text-lg font-bold text-gray-900 mb-3">DeFi Delta Neutral</h3>
						<ul className="space-y-2 text-gray-700 text-sm mb-4">
							<li>• Generates yield without price-direction risk while diversifying away from CeFi counter-parties</li>
							<li>
								• Mitigates centralized counterparty risk by extending exposure to decentralized finance strategies
							</li>
							<li>
								• Provides liquidity and executes arbitrage on blue-chip DEXes (Uniswap v3 range orders, Pendle YT/PT
								basis, Drift perp funding)
							</li>
							<li>
								• Lends stablecoins on Aave & Morpho, simultaneously shorting perp or spot equivalents to keep net delta
								≈ 0
							</li>
						</ul>
						<div className="text-xs text-gray-600 space-y-1">
							<p>
								<strong>Platforms:</strong> Uniswap · Aave · Morpho · Pendle · Drift · Hypernative
							</p>
							<p>
								<strong>Collateral:</strong> USDT / USDC
							</p>
							<p>
								<strong>Lock-up:</strong> Daily liquidity
							</p>
						</div>
					</div>

					{/* CeFi Directional Hedged */}
					<div className="bg-green-50 rounded-2xl p-6 border border-green-200">
						<h3 className="text-lg font-bold text-gray-900 mb-3">CeFi Directional Hedged or No Leverage:</h3>
						<ul className="space-y-2 text-gray-700 text-sm mb-4">
							<li>
								• Participate in upside, cap the downside. A conservative, risk-aware programme that captures
								medium-term crypto price moves while keeping beta and draw-downs tightly controlled
							</li>
							<li>
								• High-net-worth users who want a higher return ceiling than pure market-neutral strategies, but refuse
								unmanaged downside volatility
							</li>
							<li>• Zero or 1 × leverage</li>
							<li>• Long-spot positions are hedged with perp shorts, listed options, or opposite-side spot</li>
						</ul>
						<div className="text-xs text-gray-600 space-y-1">
							<p>
								<strong>Tier-1 Exchange Mandate:</strong> Binance & OKX · USDT / USDC
							</p>
							<p>
								<strong>Collateral</strong>
							</p>
						</div>
					</div>

					{/* CeFi Directional Varying Risk */}
					<div className="bg-orange-50 rounded-2xl p-6 border border-orange-200">
						<h3 className="text-lg font-bold text-gray-900 mb-3">CeFi Directional with Varying Risk Profiles:</h3>
						<ul className="space-y-2 text-gray-700 text-sm mb-4">
							<li>
								• Primary return engine—deploys capital into high-conviction long or short trades, configurable from
								moderate to high risk-return targets
							</li>
							<li>
								• Clients who want explicit market exposure with choice of risk: Moderate tier for wealth managers
								needing directional beta with guard-rails
							</li>
							<li>
								• Generates returns by taking deliberate long or short positions based on anticipated market movements
							</li>
							<li>• Binance, OKX</li>
							<li>• USDT, USDC</li>
						</ul>
						<div className="text-xs text-gray-600 space-y-1">
							<p>
								<strong>Tier-1 Exchanges:</strong> Binance & OKX
							</p>
							<p>
								<strong>Collateral:</strong> USDT / USDC
							</p>
						</div>
					</div>
				</div>
			</div>
		</section>
	)
}
