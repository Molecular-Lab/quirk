import { useState } from 'react'
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from 'recharts'
import TimeFilter, { type TimeRange } from '../../components/dashboard/TimeFilter'

// Mock data generators
const generateMockData = (range: TimeRange) => {
  const now = new Date()
  const data: Array<{ date: string; tvl: number; users: number; apy: number; revenue: number }> = []
  
  let days = 7
  let dateFormat: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
  
  if (range === 'daily') days = 7
  else if (range === 'weekly') days = 12 * 7 // 12 weeks
  else if (range === 'monthly') days = 12 * 30 // 12 months
  else if (range === 'yearly') days = 5 * 365 // 5 years
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    
    let dateLabel = date.toLocaleDateString('en-US', dateFormat)
    if (range === 'monthly') dateLabel = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    if (range === 'yearly') dateLabel = date.getFullYear().toString()
    
    // Generate realistic growth curves
    const progress = 1 - (i / days)
    const tvl = 50000 + (progress * 450000) + (Math.random() * 50000)
    const users = Math.floor(100 + (progress * 4900) + (Math.random() * 200))
    const apy = 8 + (Math.random() * 7) // 8-15%
    const revenue = tvl * 0.015 // 1.5% of TVL
    
    data.push({
      date: dateLabel,
      tvl: Math.floor(tvl),
      users,
      apy: parseFloat(apy.toFixed(2)),
      revenue: Math.floor(revenue),
    })
  }
  
  return data
}

const MOCK_STRATEGIES = [
  { name: 'Balanced Portfolio', value: 45000, return: '+12.5%', color: 'bg-blue-500' },
  { name: 'Conservative Fund', value: 30000, return: '+8.2%', color: 'bg-green-500' },
  { name: 'Aggressive Yield', value: 25000, return: '+18.7%', color: 'bg-purple-500' },
]

const MOCK_END_USERS = [
  {
    id: '1',
    name: 'Alice Chen',
    walletAddress: '0x742d...a3f9',
    stakedAmount: 15000,
    apyEarned: 450,
    status: 'active',
    joinDate: '2024-10-15',
    apy: 12.5,
  },
  {
    id: '2',
    name: 'Bob Martinez',
    walletAddress: '0x8a3c...b2d1',
    stakedAmount: 8500,
    apyEarned: 255,
    status: 'active',
    joinDate: '2024-11-01',
    apy: 11.8,
  },
  {
    id: '3',
    name: 'Carol Wu',
    walletAddress: '0x1f7e...c8a2',
    stakedAmount: 22000,
    apyEarned: 770,
    status: 'active',
    joinDate: '2024-09-28',
    apy: 13.2,
  },
  {
    id: '4',
    name: 'David Kim',
    walletAddress: '0x9d2b...f4e3',
    stakedAmount: 12500,
    apyEarned: 375,
    status: 'active',
    joinDate: '2024-11-08',
    apy: 10.9,
  },
  {
    id: '5',
    name: 'Emma Johnson',
    walletAddress: '0x5c8a...d1b7',
    stakedAmount: 6800,
    apyEarned: 204,
    status: 'active',
    joinDate: '2024-11-12',
    apy: 11.5,
  },
]

export function OverviewPage() {
	const [timeRange, setTimeRange] = useState<TimeRange>('daily')
	const [selectedMetric, setSelectedMetric] = useState<'tvl' | 'users' | 'apy' | 'revenue'>('tvl')
	
	const data = generateMockData(timeRange)
	const latestData = data[data.length - 1]
	
	const metrics = {
		tvl: {
			label: 'Total Value Locked',
			value: `$${latestData.tvl.toLocaleString()}`,
			change: '+$52,340 (+15.2%)',
			color: '#00D9A3',
		},
		users: {
			label: 'Total Users',
			value: latestData.users.toLocaleString(),
			change: '+342 (+7.1%)',
			color: '#3B82F6',
		},
		apy: {
			label: 'Average APY',
			value: `${latestData.apy.toFixed(2)}%`,
			change: '+1.2% from last period',
			color: '#8B5CF6',
		},
		revenue: {
			label: 'Total Revenue',
			value: `$${latestData.revenue.toLocaleString()}`,
			change: '+$845 (+12.3%)',
			color: '#F59E0B',
		},
	}
	
	const currentMetric = metrics[selectedMetric]
	
	return (
		<div className="min-h-full bg-white">
			<div className="max-w-[1400px] mx-auto px-6 py-8">
				{/* Header with Time Filter */}
				<div className="flex items-center justify-between mb-8">
					<h1 className="text-[32px] font-bold text-gray-900">Dashboard</h1>
					<TimeFilter value={timeRange} onChange={setTimeRange} />
				</div>

				{/* Metrics Cards */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
					{Object.entries(metrics).map(([key, metric]) => (
						<div
							key={key}
							className={`bg-gray-50 rounded-2xl p-6 cursor-pointer transition-all ${
								selectedMetric === key
									? 'ring-2 ring-blue-500 shadow-lg'
									: 'hover:shadow-md'
							}`}
							onClick={() => setSelectedMetric(key as typeof selectedMetric)}
						>
							<div className="text-xs font-medium text-gray-500 mb-2">{metric.label}</div>
							<div className="text-3xl font-bold text-gray-900 mb-1">{metric.value}</div>
							<div className="text-sm text-primary-500 font-medium">{metric.change}</div>
						</div>
					))}
				</div>

				{/* Main Grid */}
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
					{/* Chart Card */}
					<div className="lg:col-span-2 bg-gray-50 rounded-3xl p-6">
						<div className="flex items-start justify-between mb-6">
							<div>
								<div className="text-gray-500 text-xs font-medium mb-1">
									{currentMetric.label}
								</div>
								<div className="text-[56px] font-bold text-gray-900 leading-none mb-2">
									{currentMetric.value}
								</div>
								<div className="text-sm text-primary-500 font-medium">
									{currentMetric.change}
								</div>
							</div>
							<div className="flex gap-1">
								{(['tvl', 'users', 'apy', 'revenue'] as const).map((metric) => (
									<button
										key={metric}
										onClick={() => setSelectedMetric(metric)}
										className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
											selectedMetric === metric
												? 'font-semibold text-gray-900 bg-white'
												: 'text-gray-500 hover:text-gray-900 hover:bg-white'
										}`}
									>
										{metric.toUpperCase()}
									</button>
								))}
							</div>
						</div>

						<div className="h-[280px] -mx-2">
							<ResponsiveContainer width="100%" height="100%">
								<LineChart data={data}>
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
										dataKey={selectedMetric}
										stroke={currentMetric.color}
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
								<span className="text-xs font-medium text-gray-500">Active Strategies</span>
							</div>
							<div className="text-[56px] font-bold text-gray-900 leading-none mb-4">3</div>
							<div className="space-y-2">
								{MOCK_STRATEGIES.map((strategy, idx) => (
									<div key={idx} className="flex items-center gap-2">
										<div className={`w-2 h-2 rounded-full ${strategy.color}`}></div>
										<span className="text-xs text-gray-600">{strategy.name}</span>
									</div>
								))}
							</div>
						</div>

						<div className="bg-gray-50 rounded-3xl p-6">
							<div className="flex items-center justify-between mb-1">
								<span className="text-xs font-medium text-gray-500">Total Portfolio Value</span>
							</div>
							<div className="text-[56px] font-bold text-gray-900 leading-none mb-2">
								${MOCK_STRATEGIES.reduce((sum, s) => sum + s.value, 0).toLocaleString()}
							</div>
							<div className="text-sm text-green-600 font-medium">
								+{((MOCK_STRATEGIES.reduce((sum, s) => sum + s.value, 0) / 90000) * 100 - 100).toFixed(1)}% Total Return
							</div>
						</div>
					</div>
				</div>

				{/* End-Users Section */}
				<div className="flex items-center justify-between mb-5 mt-10">
					<div>
						<h2 className="text-[28px] font-bold text-gray-900">End-Users</h2>
						<p className="text-sm text-gray-500 mt-1">Users staking through your platform</p>
					</div>
					<div className="flex items-center gap-3">
						<div className="text-right">
							<div className="text-xs text-gray-500">Total Users</div>
							<div className="text-2xl font-bold text-gray-900">{MOCK_END_USERS.length}</div>
						</div>
						<div className="text-right">
							<div className="text-xs text-gray-500">Total Staked</div>
							<div className="text-2xl font-bold text-primary-500">
								${MOCK_END_USERS.reduce((sum, user) => sum + user.stakedAmount, 0).toLocaleString()}
							</div>
						</div>
					</div>
				</div>

				{/* End-Users Table */}
				<div className="bg-white border border-gray-100 rounded-2xl overflow-hidden mb-10">
					<table className="w-full">
						<thead>
							<tr className="border-b border-gray-50 bg-gray-50">
								<th className="text-left py-3.5 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
									User
								</th>
								<th className="text-left py-3.5 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
									Wallet Address
								</th>
								<th className="text-right py-3.5 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
									Staked Amount
								</th>
								<th className="text-right py-3.5 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
									APY Earned
								</th>
								<th className="text-center py-3.5 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
									Current APY
								</th>
								<th className="text-center py-3.5 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
									Status
								</th>
								<th className="text-left py-3.5 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
									Join Date
								</th>
							</tr>
						</thead>
						<tbody>
							{MOCK_END_USERS.map((user) => (
								<tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
									<td className="py-4 px-5">
										<div className="flex items-center gap-2.5">
											<div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
												{user.name.charAt(0)}
											</div>
											<span className="font-semibold text-gray-900 text-sm">{user.name}</span>
										</div>
									</td>
									<td className="py-4 px-5">
										<code className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">{user.walletAddress}</code>
									</td>
									<td className="py-4 px-5 text-right">
										<span className="text-gray-900 font-semibold text-sm">${user.stakedAmount.toLocaleString()}</span>
									</td>
									<td className="py-4 px-5 text-right">
										<span className="text-green-600 font-semibold text-sm">+${user.apyEarned.toLocaleString()}</span>
									</td>
									<td className="py-4 px-5 text-center">
										<span className="text-primary-500 font-semibold text-sm">{user.apy}%</span>
									</td>
									<td className="py-4 px-5 text-center">
										<span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
											Active
										</span>
									</td>
									<td className="py-4 px-5">
										<span className="text-gray-600 text-sm">{new Date(user.joinDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
									</td>
								</tr>
							))}
						</tbody>
					</table>
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
