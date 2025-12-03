import { StrategyCard } from "@/components/ui/StrategyCard"

export function TradingStrategiesSection() {
	const strategies = [
		{
			title: "CeFi Delta Neutral",
			description:
				'Low-volatility "core yield" block. Captures funding-rate and basis spreads with minimal market beta—perfect complement to directional sleeves.',
			targetAudience:
				"B2B partners—exchanges, wallets and neo-banks—seeking predictable, audit-friendly yield they can pass to end-users via API or widgets. Also suits conservative LPs needing stable-coin income without draw-down spikes.",
			features: [
				"Classic cash-and-carry: long spot vs. short perpetual / quarterly futures when annualised basis ≥ 6%",
				"Volatility capture: short straddles / strangles with dynamic delta-hedge; rolls weekly to monetise time decay",
				"All legs in 1× or no leverage; positions auto-flatten when FARM™ VaR triggers or funding reverses",
			],
			platforms: "Binance & OKX",
			collateral: "USDT / USDC",
		},
		{
			title: "DeFi Delta Neutral",
			description:
				"Generates yield without price-direction risk while diversifying away from CeFi counter-parties. Adds a purely on-chain return stream to a multi-manager portfolio.",
			targetAudience:
				"Mitigates centralized counterparty risk by extending exposure to decentralized finance strategies, thereby creating a more diversified risk profile while preserving minimal market exposure.",
			features: [
				"Provides liquidity and executes arbitrage on blue-chip DEXes (Uniswap v3 range orders, Pendle YT/PT basis, Drift perp funding)",
				"Lends stablecoins on Aave & Morpho, simultaneously shorting perp or spot equivalents to keep net delta ≈ 0",
				"All legs in 1× or no leverage; positions auto-flatten when FARM™ VaR triggers or funding reverses",
			],
			platforms: "Uniswap · Aave · Morpho · Pendle · Drift · Hypernative",
			collateral: "USDT / USDC",
			lockup: "Daily liquidity",
		},
		{
			title: "CeFi Directional Hedged",
			description:
				"Participate in upside, cap the downside. A conservative, risk-aware programme that captures medium-term crypto price moves while keeping beta and draw-downs tightly controlled.",
			targetAudience:
				"High-net-worth users who want a higher return ceiling than pure market-neutral strategies, but refuse unmanaged downside volatility.",
			features: [
				"Zero or 1× leverage. Long-spot positions are hedged with perp shorts, listed options, or opposite-side spot",
				"Signal engine combines trend-following, momentum and mean-reversion models—built with ML classifiers & execution algos",
				"Positions auto-rebalanced when delta drift > 5% or VaR exceeds FARM™ limits",
			],
			platforms: "Binance & OKX",
			collateral: "USDT / USDC",
		},
		{
			title: "CeFi Directional with Varying Risk",
			description:
				"Primary return engine—deploys capital into high-conviction long or short trades, configurable from moderate to high risk-return targets.",
			targetAudience:
				"Clients who want explicit market exposure with choice of risk: Moderate tier for wealth managers needing directional beta with guard-rails.",
			features: [
				"Generates returns by taking deliberate long or short positions based on anticipated market movements",
				"Express a clear directional view — either bullish or bearish — using technical, quantitative, fundamental, and machine learning methods",
				"Multiple risk tiers available from moderate to aggressive, with appropriate risk controls for each level",
			],
			platforms: "Binance & OKX",
			collateral: "USDT / USDC",
		},
	]

	return (
		<section className="py-20 bg-white">
			<div className="max-w-7xl mx-auto px-6">
				<div className="text-center mb-16">
					<h2 className="text-5xl font-bold text-gray-900 mb-4">Featured Trading Strategies</h2>
					<p className="text-xl text-gray-600 max-w-3xl mx-auto">
						Institutional-grade strategies for every risk profile
					</p>
				</div>

				<div className="grid md:grid-cols-2 gap-6">
					{strategies.map((strategy, idx) => (
						<StrategyCard key={idx} {...strategy} />
					))}
				</div>
			</div>
		</section>
	)
}
