import { CreditCard, Smartphone, TrendingUp, Users } from "lucide-react"

export function EndUserEarningSection() {
	const features = [
		{
			icon: Smartphone,
			title: "Earn In Any App",
			description:
				"Your users can earn yield directly within your platform—no need to transfer funds to separate banking or investment apps.",
		},
		{
			icon: CreditCard,
			title: "Seamless Integration",
			description:
				"One SDK integration enables earning features across your entire product. No blockchain expertise required.",
		},
		{
			icon: TrendingUp,
			title: "Real Yield Generation",
			description:
				"Access institutional-grade DeFi protocols delivering 3-7% APY on stablecoins, automatically optimized for safety.",
		},
		{
			icon: Users,
			title: "Built for Scale",
			description:
				"From gig workers to e-commerce merchants, enable earning for millions of users with enterprise-grade infrastructure.",
		},
	]

	return (
		<section className="min-h-[90vh] py-20 bg-gradient-to-b from-blue-50/40 to-white flex items-center">
			<div className="max-w-7xl mx-auto px-6 w-full">
				<div className="text-center mb-16">
					<h2 className="text-5xl font-bold text-gray-950 mb-6">Enable Your Users to Earn Anywhere</h2>
					<p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
						Transform idle balances into yield-generating assets. Your users shouldn't need separate banking apps to
						earn—let them earn right where they transact.
					</p>
				</div>

				<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
					{features.map((feature, idx) => {
						const Icon = feature.icon
						return (
							<div
								key={idx}
								className="bg-white/90 backdrop-blur-md border border-gray-150 rounded-xl p-8 hover:shadow-md hover:border-gray-200 transition-all"
							>
								<Icon className="w-8 h-8 text-gray-700 mb-6" />
								<h3 className="text-lg font-semibold text-gray-950 mb-3">{feature.title}</h3>
								<p className="text-gray-700 text-sm leading-relaxed">{feature.description}</p>
							</div>
						)
					})}
				</div>

				{/* Use Cases */}
				<div className="bg-gray-50 border border-gray-200 rounded-xl p-12">
					<h3 className="text-2xl font-semibold text-gray-950 mb-8 text-center">
						Unlock $300B+ in Idle Cash Across Industries
					</h3>
					<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
						<div className="bg-white rounded-xl p-6 border border-gray-150 shadow-sm">
							<h4 className="font-semibold text-gray-950 mb-2">E-Commerce Platforms</h4>
							<p className="text-gray-700 text-sm">Merchant payouts earn yield until withdrawal</p>
						</div>
						<div className="bg-white rounded-xl p-6 border border-gray-150 shadow-sm">
							<h4 className="font-semibold text-gray-950 mb-2">Creator Platforms</h4>
							<p className="text-gray-700 text-sm">Creator revenues generate returns automatically</p>
						</div>
						<div className="bg-white rounded-xl p-6 border border-gray-150 shadow-sm">
							<h4 className="font-semibold text-gray-950 mb-2">Gig Economy Apps</h4>
							<p className="text-gray-700 text-sm">Driver earnings grow between withdrawals</p>
						</div>
						<div className="bg-white rounded-xl p-6 border border-gray-150 shadow-sm">
							<h4 className="font-semibold text-gray-950 mb-2">Freelance Platforms</h4>
							<p className="text-gray-700 text-sm">Escrow funds earn while projects complete</p>
						</div>
						<div className="bg-white rounded-xl p-6 border border-gray-150 shadow-sm">
							<h4 className="font-semibold text-gray-950 mb-2">Gaming Platforms</h4>
							<p className="text-gray-700 text-sm">In-game balances generate passive income</p>
						</div>
						<div className="bg-white rounded-xl p-6 border border-gray-150 shadow-sm">
							<h4 className="font-semibold text-gray-950 mb-2">SaaS Platforms</h4>
							<p className="text-gray-700 text-sm">Subscription float earns between billing cycles</p>
						</div>
					</div>
				</div>
			</div>
		</section>
	)
}
