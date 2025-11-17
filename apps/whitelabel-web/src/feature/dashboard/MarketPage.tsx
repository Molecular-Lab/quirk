import { useState } from 'react'
import ChatBot from '../../components/registration/ChatBot'

// Mock market data
const MOCK_MARKET_DATA = {
	trending: [
		{ symbol: 'BTC', name: 'Bitcoin', price: '$43,250', change: '+5.2%', positive: true },
		{ symbol: 'ETH', name: 'Ethereum', price: '$2,280', change: '+3.8%', positive: true },
		{ symbol: 'SOL', name: 'Solana', price: '$98.50', change: '+12.1%', positive: true },
		{ symbol: 'AAVE', name: 'Aave', price: '$125.30', change: '-2.4%', positive: false },
	],
	defiProtocols: [
		{ name: 'Aave V3', tvl: '$5.2B', apy: '4.5%', change: '+$120M' },
		{ name: 'Uniswap V3', tvl: '$3.8B', apy: '12.3%', change: '+$85M' },
		{ name: 'Compound', tvl: '$2.1B', apy: '6.8%', change: '+$45M' },
	],
	insights: [
		{
			title: 'Ethereum Gas Fees Drop 40%',
			time: '2 hours ago',
			sentiment: 'positive',
		},
		{
			title: 'DeFi TVL Reaches All-Time High',
			time: '5 hours ago',
			sentiment: 'positive',
		},
		{
			title: 'New Yield Farming Opportunity on Aave',
			time: '1 day ago',
			sentiment: 'neutral',
		},
	],
}

export function MarketPage() {
	const [showChat, setShowChat] = useState(false)

	return (
		<div className="min-h-full bg-white">
			<div className="max-w-[1400px] mx-auto px-6 py-8">
				{/* Header */}
				<div className="mb-8 flex items-center justify-between">
					<div>
						<h1 className="text-[32px] font-bold text-gray-900 mb-2">Market Analysis</h1>
						<p className="text-gray-600">
							AI-powered insights and real-time market data
						</p>
					</div>
					<button
						onClick={() => setShowChat(!showChat)}
						className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-indigo-700 transition-all flex items-center gap-2"
					>
						<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
							/>
						</svg>
						{showChat ? 'Hide' : 'Ask AI'}
					</button>
				</div>

				<div className="grid lg:grid-cols-3 gap-6 mb-8">
					{/* Main Content */}
					<div className="lg:col-span-2 space-y-6">
						{/* Trending Tokens */}
						<div className="bg-gray-50 rounded-3xl p-6">
							<h2 className="text-xl font-bold text-gray-900 mb-4">Trending Tokens</h2>
							<div className="space-y-3">
								{MOCK_MARKET_DATA.trending.map((token) => (
									<div
										key={token.symbol}
										className="flex items-center justify-between bg-white rounded-lg p-4 hover:shadow-md transition-shadow"
									>
										<div className="flex items-center gap-3">
											<div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
												{token.symbol[0]}
											</div>
											<div>
												<div className="font-bold text-gray-900">{token.symbol}</div>
												<div className="text-sm text-gray-500">{token.name}</div>
											</div>
										</div>
										<div className="text-right">
											<div className="font-bold text-gray-900">{token.price}</div>
											<div
												className={`text-sm font-medium ${
													token.positive ? 'text-green-600' : 'text-red-600'
												}`}
											>
												{token.change}
											</div>
										</div>
									</div>
								))}
							</div>
						</div>

						{/* DeFi Protocols */}
						<div className="bg-gray-50 rounded-3xl p-6">
							<h2 className="text-xl font-bold text-gray-900 mb-4">Top DeFi Protocols</h2>
							<div className="space-y-3">
								{MOCK_MARKET_DATA.defiProtocols.map((protocol) => (
									<div
										key={protocol.name}
										className="bg-white rounded-lg p-4 hover:shadow-md transition-shadow"
									>
										<div className="flex items-center justify-between mb-2">
											<h3 className="font-bold text-gray-900">{protocol.name}</h3>
											<span className="text-sm text-green-600 font-medium">
												{protocol.change}
											</span>
										</div>
										<div className="grid grid-cols-2 gap-4">
											<div>
												<div className="text-xs text-gray-500">TVL</div>
												<div className="text-lg font-bold text-gray-900">{protocol.tvl}</div>
											</div>
											<div>
												<div className="text-xs text-gray-500">APY</div>
												<div className="text-lg font-bold text-blue-600">{protocol.apy}</div>
											</div>
										</div>
									</div>
								))}
							</div>
						</div>
					</div>

					{/* Sidebar */}
					<div className="space-y-6">
						{/* Market Insights */}
						<div className="bg-gray-50 rounded-3xl p-6">
							<h2 className="text-xl font-bold text-gray-900 mb-4">Market Insights</h2>
							<div className="space-y-3">
								{MOCK_MARKET_DATA.insights.map((insight, idx) => (
									<div
										key={idx}
										className="bg-white rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
									>
										<div className="flex items-start gap-2 mb-2">
											<div
												className={`w-2 h-2 rounded-full mt-1.5 ${
													insight.sentiment === 'positive'
														? 'bg-green-500'
														: insight.sentiment === 'negative'
														? 'bg-red-500'
														: 'bg-yellow-500'
												}`}
											/>
											<h3 className="text-sm font-medium text-gray-900 flex-1">
												{insight.title}
											</h3>
										</div>
										<div className="text-xs text-gray-500 ml-4">{insight.time}</div>
									</div>
								))}
							</div>
						</div>

						{/* Quick Stats */}
						<div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-6 border border-blue-200">
							<h2 className="text-lg font-bold text-gray-900 mb-4">Market Overview</h2>
							<div className="space-y-3">
								<div className="flex items-center justify-between">
									<span className="text-sm text-gray-600">Total DeFi TVL</span>
									<span className="font-bold text-gray-900">$52.3B</span>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-sm text-gray-600">24h Volume</span>
									<span className="font-bold text-gray-900">$12.1B</span>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-sm text-gray-600">Active Protocols</span>
									<span className="font-bold text-gray-900">1,247</span>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* AI Chat Section */}
				{showChat && (
					<div className="mb-8">
						<ChatBot
							onAnalysisComplete={(data) => {
								console.log('AI Analysis:', data)
							}}
						/>
					</div>
				)}
			</div>
		</div>
	)
}
