import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from 'recharts'

// Mock data
const valueData = [
	{ date: 'Nov 8', value: 0 },
	{ date: 'Nov 9', value: 0 },
	{ date: 'Nov 10', value: 0 },
	{ date: 'Nov 11', value: 0 },
	{ date: 'Nov 12', value: 0 },
	{ date: 'Nov 13', value: 0 },
	{ date: 'Nov 14', value: 0 },
	{ date: 'Nov 15', value: 0 },
]

export function OverviewPage() {
	return (
		<div className="min-h-full bg-white">
			<div className="max-w-[1400px] mx-auto px-6 py-8">
				{/* Header */}
				<h1 className="text-[32px] font-bold text-gray-900 mb-8">Dashboard</h1>

				{/* Main Grid */}
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
					{/* Chart Card */}
					<div className="lg:col-span-2 bg-gray-50 rounded-3xl p-6">
						<div className="flex items-start justify-between mb-6">
							<div>
								<div className="text-gray-500 text-xs font-medium mb-1">Total Value</div>
								<div className="text-[56px] font-bold text-gray-900 leading-none mb-2">$0.00</div>
								<div className="text-sm text-primary-500 font-medium">+$0.00 (0.00%)</div>
							</div>
							<div className="flex gap-1">
								<button className="px-2.5 py-1 text-xs text-gray-500 hover:text-gray-900 hover:bg-white rounded-md transition-colors">1D</button>
								<button className="px-2.5 py-1 text-xs text-gray-500 hover:text-gray-900 hover:bg-white rounded-md transition-colors">1W</button>
								<button className="px-2.5 py-1 text-xs text-gray-500 hover:text-gray-900 hover:bg-white rounded-md transition-colors">1M</button>
								<button className="px-2.5 py-1 text-xs text-gray-500 hover:text-gray-900 hover:bg-white rounded-md transition-colors">1Y</button>
								<button className="px-2.5 py-1 text-xs font-semibold text-gray-900 bg-white rounded-md">All</button>
							</div>
						</div>

						<div className="h-[280px] -mx-2">
							<ResponsiveContainer width="100%" height="100%">
								<LineChart data={valueData}>
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

					{/* Right Stats */}
					<div className="space-y-4">
						<div className="bg-gray-50 rounded-3xl p-6">
							<div className="flex items-center justify-between mb-1">
								<span className="text-xs font-medium text-gray-500">Points</span>
								<span className="text-xs text-gray-400">⏰ Earning 0/day</span>
							</div>
							<div className="text-[56px] font-bold text-gray-900 leading-none">0</div>
						</div>

						<div className="bg-gray-50 rounded-3xl p-6">
							<div className="flex items-center justify-between mb-1">
								<span className="text-xs font-medium text-gray-500">Proxify Reserve</span>
								<button className="text-gray-400 hover:text-gray-600">
									<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
									</svg>
								</button>
							</div>
							<div className="text-[56px] font-bold text-gray-900 leading-none">$0.00</div>
						</div>
					</div>
				</div>

				{/* Portfolios Section */}
				<div className="flex items-center justify-between mb-5 mt-10">
					<h2 className="text-[28px] font-bold text-gray-900">My Portfolios</h2>
					<button className="bg-primary-500 hover:bg-primary-600 text-white px-5 py-2.5 rounded-full font-medium text-sm transition-colors">
						Create new portfolio
					</button>
				</div>

				{/* Tabs */}
				<div className="flex gap-8 mb-4 border-b border-gray-100">
					<button className="pb-3 text-sm font-semibold text-gray-900 border-b-2 border-gray-900 -mb-px">
						Active (1)
					</button>
					<button className="pb-3 text-sm font-medium text-gray-400 hover:text-gray-600">
						Drafts (0)
					</button>
					<button className="pb-3 text-sm font-medium text-gray-400 hover:text-gray-600">
						Archived (0)
					</button>
				</div>

				{/* Table */}
				<div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
					<table className="w-full">
						<thead>
							<tr className="border-b border-gray-50">
								<th className="text-left py-3.5 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
									Portfolio ↕
								</th>
								<th className="text-left py-3.5 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
									Current Tokens
								</th>
								<th className="text-right py-3.5 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
									Current Value ↕
								</th>
								<th className="text-right py-3.5 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
									Total Return ↕
								</th>
								<th className="w-24"></th>
							</tr>
						</thead>
						<tbody>
							<tr className="hover:bg-gray-50 transition-colors group">
								<td className="py-4 px-5">
									<div className="flex items-center gap-2.5">
										<div className="w-2 h-2 rounded-full bg-primary-500"></div>
										<span className="font-semibold text-gray-900 text-sm">DeFi Token Mix</span>
									</div>
								</td>
								<td className="py-4 px-5">
									<span className="text-gray-600 text-sm">-</span>
								</td>
								<td className="py-4 px-5 text-right">
									<span className="text-gray-900 font-semibold text-sm">$0.00</span>
								</td>
								<td className="py-4 px-5 text-right">
									<span className="text-gray-600 text-sm">-</span>
								</td>
								<td className="py-4 px-5 text-right">
									<button className="px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
										View
									</button>
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		</div>
	)
}
