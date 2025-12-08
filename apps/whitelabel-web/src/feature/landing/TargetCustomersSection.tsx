export function TargetCustomersSection() {
	const customers = [
		{
			icon: "🏪",
			title: "E-commerce Platforms",
			description: "Seller pending payouts generate yield while waiting for settlement",
			metric: "Avg. $50K-500K idle per merchant",
		},
		{
			icon: "🎨",
			title: "Creator Platforms",
			description: "Creator revenue earns until withdrawal. Boost creator retention.",
			metric: "Creators withdraw monthly",
		},
		{
			icon: "💼",
			title: "Gig Worker Platforms",
			description: "Escrow funds earn yield until payout. Better than 0% checking.",
			metric: "Daily earnings accumulate",
		},
		{
			icon: "💳",
			title: "Fintech Apps",
			description: "Embedded yield for user balances. Differentiate from competitors.",
			metric: "3-5% APY on idle cash",
		},
	]

	return (
		<section className="min-h-[90vh] py-20 bg-gradient-to-b from-purple-50/30 to-white flex items-center">
			<div className="max-w-7xl mx-auto px-6 w-full">
				{/* Section Header */}
				<div className="text-center mb-16">
					<h2 className="text-5xl font-bold text-gray-950 mb-4">Built for Modern Platforms</h2>
					<p className="text-xl text-gray-700 max-w-3xl mx-auto">
						Turn idle balances into revenue streams. Your users earn, you earn platform fees.
					</p>
				</div>

				{/* Customer Cards Grid */}
				<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
					{customers.map((customer, idx) => (
						<div
							key={idx}
							className="bg-white/90 backdrop-blur-md border border-gray-150 rounded-xl p-6 hover:shadow-md hover:border-gray-200 transition-all group"
						>
							<div className="text-4xl mb-4">{customer.icon}</div>
							<h3 className="text-lg font-semibold text-gray-950 mb-2">{customer.title}</h3>
							<p className="text-sm text-gray-700 mb-4 leading-relaxed">{customer.description}</p>
							<div className="pt-4 border-t border-gray-100">
								<div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Use Case</div>
								<div className="text-sm text-gray-950 font-medium mt-1">{customer.metric}</div>
							</div>
						</div>
					))}
				</div>

				{/* CTA */}
				<div className="text-center">
					<a
						href="https://miro.com/app/board/uXjVJoTZufk=/"
						target="_blank"
						rel="noopener noreferrer"
						className="inline-flex items-center gap-2 text-accent font-medium hover:underline"
					>
						View detailed customer personas →
					</a>
				</div>
			</div>
		</section>
	)
}
