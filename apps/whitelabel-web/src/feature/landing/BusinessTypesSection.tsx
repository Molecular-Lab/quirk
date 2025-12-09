import "./BusinessTypes.css"

export function BusinessTypesSection() {
	const businessTypes = [
		{
			title: "E-commerce",
			description:
				"Enable merchants to earn yield on idle balances. Seller pending payouts and treasury funds generate returns while waiting for settlement.",
			icon: "🛍️",
			companies: [
				{ name: "Shopify", logo: "🏪" },
				{ name: "Amazon", logo: "📦" },
				{ name: "Etsy", logo: "🎁" },
			],
			metrics: "$50K-500K avg idle per merchant",
		},
		{
			title: "Fintech",
			description:
				"User wallets and payment processing funds earn yield during settlement periods. Optimize treasury management with automated yield generation.",
			icon: "💳",
			companies: [
				{ name: "Stripe", logo: "💳" },
				{ name: "Square", logo: "⬜" },
				{ name: "PayPal", logo: "💰" },
			],
			metrics: "Settlement period optimization",
		},
		{
			title: "Creator Platforms",
			description:
				"Creator revenue earns yield until withdrawal. Boost creator retention and satisfaction by offering competitive returns on their earnings while they focus on content.",
			icon: "🎨",
			companies: [
				{ name: "Patreon", logo: "🎭" },
				{ name: "Substack", logo: "✍️" },
				{ name: "OnlyFans", logo: "💎" },
			],
			metrics: "Monthly withdrawal cycles",
		},
		{
			title: "Gig Worker Platforms",
			description:
				"Escrow funds and driver earnings earn yield until payout. Better than 0% checking accounts, creating a competitive advantage for platform adoption and retention.",
			icon: "🚗",
			companies: [
				{ name: "Uber", logo: "🚕" },
				{ name: "DoorDash", logo: "🍔" },
				{ name: "Upwork", logo: "💼" },
			],
			metrics: "Daily earnings accumulate",
		},
		{
			title: "Corporate Treasury",
			description:
				"Enterprise cash management with institutional-grade DeFi yield. Treasury departments can optimize idle corporate cash with better returns than traditional money market accounts.",
			icon: "🏢",
			companies: [
				{ name: "Startups", logo: "🚀" },
				{ name: "SMBs", logo: "📊" },
				{ name: "Enterprises", logo: "🏛️" },
			],
			metrics: "3-5% APY on idle cash",
		},
	]

	return (
		<section className="py-20 bg-white">
			<div className="max-w-7xl mx-auto px-6">
				{/* Section Header */}
				<div className="text-center mb-16">
					<h2 className="text-5xl font-bold text-gray-950 mb-4">Support Any Platform</h2>
					<p className="text-xl text-gray-700 max-w-3xl mx-auto">
						From fintech apps to creator platforms, successful businesses across industries grow and scale with Quirk's
						Earn-as-a-Service infrastructure.
					</p>
				</div>

				{/* Business Type Cards - Horizontal Scroll with Animation */}
				<div className="relative overflow-hidden pb-4">
					<div className="flex gap-6 animate-scroll-horizontal hover:pause-animation">
						{businessTypes.map((type, idx) => (
							<div
								key={idx}
								className="flex-shrink-0 w-[450px] bg-white rounded-xl border-t-4 border-blue-500 border-x border-b border-gray-200 p-8 hover:shadow-lg transition-all"
							>
								{/* Icon & Title */}
								<div className="flex items-center gap-3 mb-4">
									<div className="text-4xl w-14 h-14 bg-blue-50 rounded-lg flex items-center justify-center">
										{type.icon}
									</div>
									<h3 className="text-2xl font-bold text-gray-950">{type.title}</h3>
								</div>

								{/* Description */}
								<p className="text-gray-700 leading-relaxed mb-6">{type.description}</p>

								{/* Metrics */}
								<div className="bg-blue-50 rounded-lg px-4 py-2 mb-6 inline-block">
									<span className="text-sm font-medium text-gray-700">💡 {type.metrics}</span>
								</div>

								{/* Company Logos */}
								<div className="flex items-center gap-4 pt-4 border-t border-gray-100">
									<span className="text-sm text-gray-500 font-medium">Platforms:</span>
									<div className="flex items-center gap-3">
										{type.companies.map((company, companyIdx) => (
											<div
												key={companyIdx}
												className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
											>
												<span className="text-lg">{company.logo}</span>
												<span className="text-xs font-medium text-gray-600">{company.name}</span>
											</div>
										))}
									</div>
								</div>

								{/* Learn More Link */}
								<a
									href="#"
									className="inline-flex items-center gap-2 text-gray-900 hover:text-gray-700 font-medium text-sm mt-4 group"
								>
									Learn more
									<svg
										className="w-4 h-4 group-hover:translate-x-1 transition-transform"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
									</svg>
								</a>
							</div>
						))}
						{/* Duplicate for seamless loop */}
						{businessTypes.map((type, idx) => (
						<div
							key={`duplicate-${idx}`}
							className="flex-shrink-0 w-[450px] bg-white rounded-xl border-t-4 border-blue-500 border-x border-b border-gray-200 p-8 hover:shadow-lg transition-all"
						>
							{/* Icon & Title */}
							<div className="flex items-center gap-3 mb-4">
								<div className="text-4xl w-14 h-14 bg-blue-50 rounded-lg flex items-center justify-center">
									{type.icon}
								</div>
								<h3 className="text-2xl font-bold text-gray-950">{type.title}</h3>
							</div>

							{/* Description */}
							<p className="text-gray-700 leading-relaxed mb-6">{type.description}</p>

							{/* Metrics */}
							<div className="bg-blue-50 rounded-lg px-4 py-2 mb-6 inline-block">
								<span className="text-sm font-medium text-gray-700">💡 {type.metrics}</span>
							</div>

							{/* Company Logos */}
							<div className="flex items-center gap-4 pt-4 border-t border-gray-100">
								<span className="text-sm text-gray-500 font-medium">Platforms:</span>
								<div className="flex items-center gap-3">
									{type.companies.map((company, companyIdx) => (
										<div
											key={companyIdx}
											className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
										>
											<span className="text-lg">{company.logo}</span>
											<span className="text-xs font-medium text-gray-600">{company.name}</span>
										</div>
									))}
								</div>
							</div>

							{/* Learn More Link */}
							<a
								href="#"
								className="inline-flex items-center gap-2 text-gray-900 hover:text-gray-700 font-medium text-sm mt-4 group"
							>
								Learn more
								<svg
									className="w-4 h-4 group-hover:translate-x-1 transition-transform"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
								</svg>
							</a>
						</div>
					))}
					</div>
				</div>
			</div>
		</section>
	)
}
