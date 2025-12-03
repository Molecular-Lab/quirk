import { useState } from "react"

import { Check, CreditCard, Rocket, Zap } from "lucide-react"

const plans = [
	{
		name: "Starter",
		price: "Free",
		description: "Perfect for testing and small projects",
		features: [
			"1,000 API calls/month",
			"Up to 100 wallets",
			"Basic analytics",
			"Email support",
			"Test environment access",
		],
		limitations: ["No custom branding", "Limited endpoints"],
		icon: Zap,
		color: "blue",
		current: true,
	},
	{
		name: "Growth",
		price: "$99",
		period: "/month",
		description: "For growing businesses and startups",
		features: [
			"50,000 API calls/month",
			"Up to 5,000 wallets",
			"Advanced analytics",
			"Priority email support",
			"Custom webhooks",
			"White-label options",
		],
		limitations: [],
		icon: Rocket,
		color: "purple",
		current: false,
		popular: true,
	},
	{
		name: "Enterprise",
		price: "Custom",
		description: "For large-scale production applications",
		features: [
			"Unlimited API calls",
			"Unlimited wallets",
			"Real-time analytics",
			"24/7 dedicated support",
			"Custom integrations",
			"SLA guarantees",
			"On-premise deployment",
		],
		limitations: [],
		icon: CreditCard,
		color: "pink",
		current: false,
	},
]

const billingHistory = [
	{ id: "1", date: "2024-06-01", amount: "$0.00", plan: "Starter", status: "paid" },
	{ id: "2", date: "2024-05-01", amount: "$0.00", plan: "Starter", status: "paid" },
	{ id: "3", date: "2024-04-01", amount: "$0.00", plan: "Starter", status: "paid" },
]

export function BillingPage() {
	const [_selectedPlan, setSelectedPlan] = useState("Starter")

	return (
		<div className="p-6 space-y-6">
			{/* Header */}
			<div>
				<h1 className="text-3xl font-bold text-gray-900">Billing & Plans</h1>
				<p className="text-gray-600 mt-1">Manage your subscription and billing information</p>
			</div>

			{/* Current Usage */}
			<div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
				<h3 className="text-lg font-semibold text-gray-900 mb-4">Current Usage (Billing Cycle)</h3>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div className="bg-white rounded-lg p-4">
						<p className="text-sm text-gray-600 mb-1">API Calls</p>
						<p className="text-2xl font-bold text-gray-900">847 / 1,000</p>
						<div className="w-full bg-gray-200 rounded-full h-2 mt-2">
							<div className="bg-blue-600 h-2 rounded-full" style={{ width: "84.7%" }} />
						</div>
					</div>
					<div className="bg-white rounded-lg p-4">
						<p className="text-sm text-gray-600 mb-1">Wallets Created</p>
						<p className="text-2xl font-bold text-gray-900">54 / 100</p>
						<div className="w-full bg-gray-200 rounded-full h-2 mt-2">
							<div className="bg-purple-600 h-2 rounded-full" style={{ width: "54%" }} />
						</div>
					</div>
					<div className="bg-white rounded-lg p-4">
						<p className="text-sm text-gray-600 mb-1">Days Remaining</p>
						<p className="text-2xl font-bold text-gray-900">12 days</p>
						<p className="text-sm text-gray-600 mt-1">Resets on Jul 1, 2024</p>
					</div>
				</div>
			</div>

			{/* Pricing Plans */}
			<div>
				<h3 className="text-2xl font-bold text-gray-900 mb-6">Choose Your Plan</h3>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					{plans.map((plan) => {
						const Icon = plan.icon
						return (
							<div
								key={plan.name}
								className={`relative bg-white rounded-xl p-6 border-2 transition-all ${
									plan.popular
										? "border-purple-500 shadow-lg"
										: plan.current
											? "border-blue-500"
											: "border-gray-200 hover:border-gray-300"
								}`}
							>
								{plan.popular && (
									<div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
										<span className="bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full">
											MOST POPULAR
										</span>
									</div>
								)}
								{plan.current && (
									<div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
										<span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
											CURRENT PLAN
										</span>
									</div>
								)}

								<div className="text-center mb-6">
									<div className={`inline-flex p-3 bg-${plan.color}-50 rounded-xl mb-3`}>
										<Icon className={`w-8 h-8 text-${plan.color}-600`} />
									</div>
									<h4 className="text-xl font-bold text-gray-900">{plan.name}</h4>
									<p className="text-sm text-gray-600 mt-1">{plan.description}</p>
									<div className="mt-4">
										<span className="text-4xl font-bold text-gray-900">{plan.price}</span>
										{plan.period && <span className="text-gray-600">{plan.period}</span>}
									</div>
								</div>

								<ul className="space-y-3 mb-6">
									{plan.features.map((feature, idx) => (
										<li key={idx} className="flex items-start gap-2">
											<Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
											<span className="text-sm text-gray-700">{feature}</span>
										</li>
									))}
								</ul>

								<button
									onClick={() => {
										setSelectedPlan(plan.name)
									}}
									disabled={plan.current}
									className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
										plan.current
											? "bg-gray-100 text-gray-400 cursor-not-allowed"
											: plan.popular
												? "bg-purple-600 text-white hover:bg-purple-700"
												: "bg-blue-600 text-white hover:bg-blue-700"
									}`}
								>
									{plan.current ? "Current Plan" : `Upgrade to ${plan.name}`}
								</button>
							</div>
						)
					})}
				</div>
			</div>

			{/* Payment Method */}
			<div className="bg-white rounded-xl p-6 border border-gray-200">
				<h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h3>
				<div className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
					<CreditCard className="w-10 h-10 text-gray-400" />
					<div className="flex-1">
						<p className="font-medium text-gray-900">No payment method added</p>
						<p className="text-sm text-gray-600">Add a payment method to upgrade your plan</p>
					</div>
					<button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
						Add Card
					</button>
				</div>
			</div>

			{/* Billing History */}
			<div className="bg-white rounded-xl border border-gray-200">
				<div className="p-6 border-b border-gray-200">
					<h3 className="text-lg font-semibold text-gray-900">Billing History</h3>
				</div>
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead className="bg-gray-50">
							<tr>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Amount
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Status
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Invoice
								</th>
							</tr>
						</thead>
						<tbody className="bg-white divide-y divide-gray-200">
							{billingHistory.map((item) => (
								<tr key={item.id} className="hover:bg-gray-50">
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.date}</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.plan}</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.amount}</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
											{item.status}
										</span>
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm">
										<button className="text-blue-600 hover:text-blue-700 font-medium">Download</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	)
}
