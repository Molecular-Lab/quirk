import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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

				{/* Portfolios Tabs */}
				<Tabs defaultValue="active" className="w-full">
					<TabsList className="flex gap-8 mb-4 border-b border-gray-100 bg-transparent h-auto p-0 rounded-none w-full justify-start">
						<TabsTrigger
							value="active"
							className="pb-3 text-sm font-medium text-gray-400 hover:text-gray-600 data-[state=active]:text-gray-900 data-[state=active]:font-semibold data-[state=active]:border-b-2 data-[state=active]:border-gray-900 -mb-px bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none px-0"
						>
							Active (1)
						</TabsTrigger>
						<TabsTrigger
							value="drafts"
							className="pb-3 text-sm font-medium text-gray-400 hover:text-gray-600 data-[state=active]:text-gray-900 data-[state=active]:font-semibold data-[state=active]:border-b-2 data-[state=active]:border-gray-900 -mb-px bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none px-0"
						>
							Drafts (0)
						</TabsTrigger>
						<TabsTrigger
							value="archived"
							className="pb-3 text-sm font-medium text-gray-400 hover:text-gray-600 data-[state=active]:text-gray-900 data-[state=active]:font-semibold data-[state=active]:border-b-2 data-[state=active]:border-gray-900 -mb-px bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none px-0"
						>
							Archived (0)
						</TabsTrigger>
					</TabsList>

					<TabsContent value="active" className="mt-0">
						<div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
							<Table>
								<TableHeader>
									<TableRow className="border-b border-gray-50">
										<TableHead className="text-left py-3.5 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
											Portfolio ↕
										</TableHead>
										<TableHead className="text-left py-3.5 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
											Total Deposits
										</TableHead>
										<TableHead className="text-right py-3.5 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
											Current Value ↕
										</TableHead>
										<TableHead className="text-right py-3.5 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
											Return ↕
										</TableHead>
										<TableHead className="w-24"></TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									<TableRow className="hover:bg-gray-50 transition-colors group">
										<TableCell className="py-4 px-5">
											<div className="flex items-center gap-2.5">
												<div className="w-2 h-2 rounded-full bg-primary-500"></div>
												<span className="font-semibold text-gray-900 text-sm">Main Portfolio</span>
											</div>
										</TableCell>
										<TableCell className="py-4 px-5">
											<span className="text-gray-900 font-medium text-sm">$10,000</span>
										</TableCell>
										<TableCell className="py-4 px-5 text-right">
											<span className="text-gray-900 font-semibold text-sm">$10,070</span>
										</TableCell>
										<TableCell className="py-4 px-5 text-right">
											<span className="text-number-positive text-sm font-medium">+0.7%</span>
										</TableCell>
										<TableCell className="py-4 px-5 text-right">
											<button className="px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
												View
											</button>
										</TableCell>
									</TableRow>
									<TableRow className="hover:bg-gray-50 transition-colors group">
										<TableCell className="py-4 px-5">
											<div className="flex items-center gap-2.5">
												<div className="w-2 h-2 rounded-full bg-gray-300"></div>
												<span className="font-semibold text-gray-900 text-sm">Test Environment</span>
											</div>
										</TableCell>
										<TableCell className="py-4 px-5">
											<span className="text-gray-900 font-medium text-sm">$500</span>
										</TableCell>
										<TableCell className="py-4 px-5 text-right">
											<span className="text-gray-900 font-semibold text-sm">$503</span>
										</TableCell>
										<TableCell className="py-4 px-5 text-right">
											<span className="text-number-positive text-sm font-medium">+0.6%</span>
										</TableCell>
										<TableCell className="py-4 px-5 text-right">
											<button className="px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
												View
											</button>
										</TableCell>
									</TableRow>
								</TableBody>
							</Table>
						</div>
					</TabsContent>

					<TabsContent value="drafts" className="mt-0">
						<div className="bg-white border border-gray-100 rounded-2xl overflow-hidden p-8 text-center">
							<p className="text-gray-500">No draft portfolios</p>
						</div>
					</TabsContent>

					<TabsContent value="archived" className="mt-0">
						<div className="bg-white border border-gray-100 rounded-2xl overflow-hidden p-8 text-center">
							<p className="text-gray-500">No archived portfolios</p>
						</div>
					</TabsContent>
				</Tabs>
			</div>
		</div>
	)
}
