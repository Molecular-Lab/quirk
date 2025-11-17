import { useParams } from '@tanstack/react-router'
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from 'recharts'

// Mock data
const balanceData = [
	{ date: 'Nov 8', value: 10000 },
	{ date: 'Nov 9', value: 10015 },
	{ date: 'Nov 10', value: 10035 },
	{ date: 'Nov 11', value: 10042 },
	{ date: 'Nov 12', value: 10055 },
	{ date: 'Nov 13', value: 10063 },
	{ date: 'Nov 14', value: 10068 },
	{ date: 'Nov 15', value: 10070 },
]

export function PortfolioDetailPage() {
	const { id } = useParams({ from: '/dashboard/portfolios/$id' })

	return (
		<div className="min-h-full bg-white">
			<div className="max-w-[1400px] mx-auto px-6 py-8">
				{/* Header */}
				<div className="flex items-center justify-between mb-8">
					<h1 className="text-[32px] font-bold text-gray-900">Main Portfolio</h1>
					<div className="flex gap-3">
						<button className="px-5 py-2.5 rounded-full font-medium text-sm border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">
							Edit
						</button>
						<button className="px-5 py-2.5 rounded-full font-medium text-sm border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">
							Share
						</button>
					</div>
				</div>

				{/* Balance Chart */}
				<div className="bg-gray-50 rounded-3xl p-6 mb-6">
					<div className="flex items-start justify-between mb-6">
						<div>
							<div className="text-gray-500 text-xs font-medium mb-1">Portfolio Balance</div>
							<div className="text-[56px] font-bold text-gray-900 leading-none mb-2">$10,070</div>
							<div className="text-sm text-number-positive font-medium">+$70 (0.7%) • 1 month return</div>
						</div>
						<div className="flex gap-1">
							<button className="px-2.5 py-1 text-xs text-gray-500 hover:text-gray-900 hover:bg-white rounded-md transition-colors">1D</button>
							<button className="px-2.5 py-1 text-xs text-gray-500 hover:text-gray-900 hover:bg-white rounded-md transition-colors">1W</button>
							<button className="px-2.5 py-1 text-xs font-semibold text-gray-900 bg-white rounded-md">1M</button>
							<button className="px-2.5 py-1 text-xs text-gray-500 hover:text-gray-900 hover:bg-white rounded-md transition-colors">1Y</button>
							<button className="px-2.5 py-1 text-xs text-gray-500 hover:text-gray-900 hover:bg-white rounded-md transition-colors">All</button>
						</div>
					</div>

					<div className="h-[280px] -mx-2">
						<ResponsiveContainer width="100%" height="100%">
							<LineChart data={balanceData}>
								<XAxis
									dataKey="date"
									axisLine={false}
									tickLine={false}
									tick={{ fill: '#9ca3af', fontSize: 11 }}
									dy={10}
								/>
								<Tooltip
									contentStyle={{
										backgroundColor: 'white',
										border: '1px solid #e5e7eb',
										borderRadius: '12px',
										padding: '8px 12px',
										fontSize: '12px',
									}}
								/>
								<Line
									type="monotone"
									dataKey="value"
									stroke="#00D9A3"
									strokeWidth={2.5}
									dot={false}
								/>
							</LineChart>
						</ResponsiveContainer>
					</div>
				</div>

				{/* DeFi Allocations */}
				<div className="mb-6">
					<h2 className="text-[24px] font-bold text-gray-900 mb-4">DeFi Allocations</h2>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div className="bg-gray-50 rounded-2xl p-5">
							<div className="flex items-center justify-between mb-3">
								<span className="text-sm font-semibold text-gray-900">AAVE</span>
								<span className="text-xs text-gray-500">70%</span>
							</div>
							<div className="text-[32px] font-bold text-gray-900 mb-1">$7,049</div>
							<div className="text-sm text-gray-600">5.2% APY</div>
						</div>

						<div className="bg-gray-50 rounded-2xl p-5">
							<div className="flex items-center justify-between mb-3">
								<span className="text-sm font-semibold text-gray-900">Curve</span>
								<span className="text-xs text-gray-500">20%</span>
							</div>
							<div className="text-[32px] font-bold text-gray-900 mb-1">$2,014</div>
							<div className="text-sm text-gray-600">8.1% APY</div>
						</div>

						<div className="bg-gray-50 rounded-2xl p-5">
							<div className="flex items-center justify-between mb-3">
								<span className="text-sm font-semibold text-gray-900">Uniswap</span>
								<span className="text-xs text-gray-500">10%</span>
							</div>
							<div className="text-[32px] font-bold text-gray-900 mb-1">$1,007</div>
							<div className="text-sm text-gray-600">15.0% APY</div>
						</div>
					</div>
				</div>

				{/* End-Users */}
				<div className="mb-6">
					<div className="flex items-center justify-between mb-4">
						<h2 className="text-[24px] font-bold text-gray-900">End-Users (15)</h2>
						<button className="text-sm text-primary-500 hover:text-primary-600 font-medium">
							View All
						</button>
					</div>
					<div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
						<table className="w-full">
							<thead>
								<tr className="border-b border-gray-50">
									<th className="text-left py-3.5 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wide">User ID</th>
									<th className="text-right py-3.5 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Deposits</th>
									<th className="text-right py-3.5 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Current Value</th>
									<th className="text-right py-3.5 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Return</th>
								</tr>
							</thead>
							<tbody>
								<tr className="hover:bg-gray-50 transition-colors">
									<td className="py-4 px-5"><span className="text-gray-900 font-medium text-sm">user-001</span></td>
									<td className="py-4 px-5 text-right"><span className="text-gray-900 font-medium text-sm">$500</span></td>
									<td className="py-4 px-5 text-right"><span className="text-gray-900 font-semibold text-sm">$503.50</span></td>
									<td className="py-4 px-5 text-right"><span className="text-number-positive text-sm font-medium">+0.7%</span></td>
								</tr>
								<tr className="hover:bg-gray-50 transition-colors">
									<td className="py-4 px-5"><span className="text-gray-900 font-medium text-sm">user-002</span></td>
									<td className="py-4 px-5 text-right"><span className="text-gray-900 font-medium text-sm">$1,000</span></td>
									<td className="py-4 px-5 text-right"><span className="text-gray-900 font-semibold text-sm">$1,007</span></td>
									<td className="py-4 px-5 text-right"><span className="text-number-positive text-sm font-medium">+0.7%</span></td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>

				{/* Actions */}
				<div className="flex gap-3">
					<button className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-full font-medium text-sm transition-colors">
						Deposit
					</button>
					<button className="px-6 py-3 rounded-full font-medium text-sm border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">
						Withdraw
					</button>
					<button className="px-6 py-3 rounded-full font-medium text-sm border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">
						Rebalance
					</button>
				</div>
			</div>
		</div>
	)
}
