import { Calendar, Download } from "lucide-react"
import {
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	Legend,
	Line,
	LineChart,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts"

const monthlyData = [
	{ month: "Jan", requests: 12400, users: 890, wallets: 1200 },
	{ month: "Feb", requests: 15600, users: 1050, wallets: 1450 },
	{ month: "Mar", requests: 18900, users: 1280, wallets: 1780 },
	{ month: "Apr", requests: 22100, users: 1520, wallets: 2100 },
	{ month: "May", requests: 28500, users: 1890, wallets: 2450 },
	{ month: "Jun", requests: 35200, users: 2240, wallets: 2890 },
]

const endpointUsage = [
	{ name: "createWallet", value: 35, color: "#3b82f6" },
	{ name: "getBalance", value: 28, color: "#8b5cf6" },
	{ name: "transfer", value: 22, color: "#ec4899" },
	{ name: "getTransactions", value: 15, color: "#f59e0b" },
]

const geographicData = [
	{ country: "United States", users: 1240 },
	{ country: "United Kingdom", users: 890 },
	{ country: "Germany", users: 650 },
	{ country: "Japan", users: 520 },
	{ country: "Canada", users: 410 },
]

export function AnalyticsPage() {
	return (
		<div className="p-6 space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
					<p className="text-gray-600 mt-1">Detailed insights into your API usage and user behavior</p>
				</div>
				<div className="flex gap-3">
					<button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
						<Calendar className="w-4 h-4" />
						Last 30 Days
					</button>
					<button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
						<Download className="w-4 h-4" />
						Export
					</button>
				</div>
			</div>

			{/* Monthly Trends */}
			<div className="bg-white rounded-xl p-6 border border-gray-200">
				<h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Trends</h3>
				<ResponsiveContainer width="100%" height={350}>
					<LineChart data={monthlyData}>
						<CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
						<XAxis dataKey="month" stroke="#9ca3af" />
						<YAxis stroke="#9ca3af" />
						<Tooltip />
						<Legend />
						<Line type="monotone" dataKey="requests" stroke="#3b82f6" strokeWidth={2} name="API Requests" />
						<Line type="monotone" dataKey="users" stroke="#8b5cf6" strokeWidth={2} name="Active Users" />
						<Line type="monotone" dataKey="wallets" stroke="#ec4899" strokeWidth={2} name="Wallets Created" />
					</LineChart>
				</ResponsiveContainer>
			</div>

			{/* Two Column Charts */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Endpoint Usage */}
				<div className="bg-white rounded-xl p-6 border border-gray-200">
					<h3 className="text-lg font-semibold text-gray-900 mb-4">Endpoint Usage Distribution</h3>
					<ResponsiveContainer width="100%" height={300}>
						<PieChart>
							<Pie
								data={endpointUsage}
								cx="50%"
								cy="50%"
								labelLine={false}
								label={({ name, value }) => `${name}: ${value}%`}
								outerRadius={100}
								fill="#8884d8"
								dataKey="value"
							>
								{endpointUsage.map((entry, index) => (
									<Cell key={`cell-${index}`} fill={entry.color} />
								))}
							</Pie>
							<Tooltip />
						</PieChart>
					</ResponsiveContainer>
					<div className="mt-4 space-y-2">
						{endpointUsage.map((endpoint) => (
							<div key={endpoint.name} className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<div className="w-3 h-3 rounded-full" style={{ backgroundColor: endpoint.color }} />
									<span className="text-sm text-gray-700">{endpoint.name}</span>
								</div>
								<span className="text-sm font-medium text-gray-900">{endpoint.value}%</span>
							</div>
						))}
					</div>
				</div>

				{/* Geographic Distribution */}
				<div className="bg-white rounded-xl p-6 border border-gray-200">
					<h3 className="text-lg font-semibold text-gray-900 mb-4">Users by Country</h3>
					<ResponsiveContainer width="100%" height={300}>
						<BarChart data={geographicData} layout="vertical">
							<CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
							<XAxis type="number" stroke="#9ca3af" />
							<YAxis dataKey="country" type="category" stroke="#9ca3af" width={100} />
							<Tooltip />
							<Bar dataKey="users" fill="#3b82f6" radius={[0, 8, 8, 0]} />
						</BarChart>
					</ResponsiveContainer>
				</div>
			</div>

			{/* Performance Metrics */}
			<div className="bg-white rounded-xl p-6 border border-gray-200">
				<h3 className="text-lg font-semibold text-gray-900 mb-6">Performance Metrics</h3>
				<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
					<div className="text-center p-4 bg-blue-50 rounded-xl">
						<p className="text-3xl font-bold text-blue-600">99.9%</p>
						<p className="text-sm text-gray-600 mt-1">Uptime</p>
					</div>
					<div className="text-center p-4 bg-purple-50 rounded-xl">
						<p className="text-3xl font-bold text-purple-600">145ms</p>
						<p className="text-sm text-gray-600 mt-1">Avg Response Time</p>
					</div>
					<div className="text-center p-4 bg-green-50 rounded-xl">
						<p className="text-3xl font-bold text-green-600">99.2%</p>
						<p className="text-sm text-gray-600 mt-1">Success Rate</p>
					</div>
					<div className="text-center p-4 bg-amber-50 rounded-xl">
						<p className="text-3xl font-bold text-amber-600">0.8%</p>
						<p className="text-sm text-gray-600 mt-1">Error Rate</p>
					</div>
				</div>
			</div>
		</div>
	)
}
