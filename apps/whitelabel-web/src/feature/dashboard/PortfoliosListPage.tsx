export function PortfoliosListPage() {
	return (
		<div className="min-h-full bg-white">
			<div className="max-w-[1400px] mx-auto px-6 py-8">
				{/* Header */}
				<div className="flex items-center justify-between mb-8">
					<h1 className="text-[32px] font-bold text-gray-900">My Portfolios</h1>
					<button className="bg-primary-500 hover:bg-primary-600 text-white px-5 py-2.5 rounded-full font-medium text-sm transition-colors">
						Create new portfolio
					</button>
				</div>

				{/* Tabs */}
				<div className="flex gap-8 mb-4 border-b border-gray-100">
					<button className="pb-3 text-sm font-semibold text-gray-900 border-b-2 border-gray-900 -mb-px">
						Active (1)
					</button>
					<button className="pb-3 text-sm font-medium text-gray-400 hover:text-gray-600">Drafts (0)</button>
					<button className="pb-3 text-sm font-medium text-gray-400 hover:text-gray-600">Archived (0)</button>
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
									Total Deposits
								</th>
								<th className="text-right py-3.5 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
									Current Value ↕
								</th>
								<th className="text-right py-3.5 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
									Return ↕
								</th>
								<th className="w-24"></th>
							</tr>
						</thead>
						<tbody>
							<tr className="hover:bg-gray-50 transition-colors group">
								<td className="py-4 px-5">
									<div className="flex items-center gap-2.5">
										<div className="w-2 h-2 rounded-full bg-primary-500"></div>
										<span className="font-semibold text-gray-900 text-sm">Main Portfolio</span>
									</div>
								</td>
								<td className="py-4 px-5">
									<span className="text-gray-900 font-medium text-sm">$10,000</span>
								</td>
								<td className="py-4 px-5 text-right">
									<span className="text-gray-900 font-semibold text-sm">$10,070</span>
								</td>
								<td className="py-4 px-5 text-right">
									<span className="text-number-positive text-sm font-medium">+0.7%</span>
								</td>
								<td className="py-4 px-5 text-right">
									<button className="px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
										View
									</button>
								</td>
							</tr>
							<tr className="hover:bg-gray-50 transition-colors group">
								<td className="py-4 px-5">
									<div className="flex items-center gap-2.5">
										<div className="w-2 h-2 rounded-full bg-gray-300"></div>
										<span className="font-semibold text-gray-900 text-sm">Test Environment</span>
									</div>
								</td>
								<td className="py-4 px-5">
									<span className="text-gray-900 font-medium text-sm">$500</span>
								</td>
								<td className="py-4 px-5 text-right">
									<span className="text-gray-900 font-semibold text-sm">$503</span>
								</td>
								<td className="py-4 px-5 text-right">
									<span className="text-number-positive text-sm font-medium">+0.6%</span>
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
