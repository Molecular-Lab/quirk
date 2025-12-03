import { useState } from "react"

import type { RevenuePackage } from "../../types/registration"

interface RevenuePackageSelectorProps {
	selectedPackage: RevenuePackage | null
	onSelect: (pkg: RevenuePackage) => void
}

const REVENUE_PACKAGES: RevenuePackage[] = [
	{
		id: "basic",
		model: "basic",
		name: "Basic",
		description: "Perfect for startups and small businesses getting started",
		features: [
			"Up to 1,000 end users",
			"Basic DeFi strategies",
			"Standard support",
			"Email notifications",
			"Basic analytics dashboard",
			"10,000 API calls/month",
		],
		pricing: {
			managementFee: 1.5,
			performanceFee: 10,
			minimumDeposit: 1000,
		},
		limits: {
			maxUsers: 1000,
			maxTVL: 100000,
			apiCallsPerMonth: 10000,
		},
	},
	{
		id: "standard",
		model: "standard",
		name: "Standard",
		description: "Ideal for growing businesses with moderate scale",
		features: [
			"Up to 10,000 end users",
			"Advanced DeFi strategies",
			"Priority support",
			"Real-time notifications",
			"Advanced analytics & insights",
			"Custom branding",
			"100,000 API calls/month",
			"Webhook integrations",
		],
		pricing: {
			managementFee: 1.0,
			performanceFee: 15,
			minimumDeposit: 10000,
		},
		limits: {
			maxUsers: 10000,
			maxTVL: 1000000,
			apiCallsPerMonth: 100000,
		},
	},
	{
		id: "enterprise",
		model: "enterprise",
		name: "Enterprise",
		description: "For large-scale operations requiring maximum flexibility",
		features: [
			"Unlimited end users",
			"Custom DeFi strategies",
			"Dedicated account manager",
			"White-glove support 24/7",
			"Custom analytics & reporting",
			"Full white-label solution",
			"Unlimited API calls",
			"SLA guarantees",
			"Custom integrations",
		],
		pricing: {
			managementFee: 0.75,
			performanceFee: 20,
			minimumDeposit: 100000,
		},
		limits: {
			maxUsers: null,
			maxTVL: null,
			apiCallsPerMonth: null,
		},
	},
]

export default function RevenuePackageSelector({ selectedPackage, onSelect }: RevenuePackageSelectorProps) {
	const [hoveredPackage, setHoveredPackage] = useState<string | null>(null)

	return (
		<div className="bg-white rounded-lg p-8">
			<h3 className="text-2xl font-bold text-gray-900 mb-2 text-center">Choose Your Revenue Package</h3>
			<p className="text-gray-600 mb-8 text-center">Select the plan that best fits your business needs</p>

			<div className="grid md:grid-cols-3 gap-6">
				{REVENUE_PACKAGES.map((pkg) => (
					<div
						key={pkg.id}
						className={`relative rounded-xl border-2 p-6 cursor-pointer transition-all ${
							selectedPackage?.id === pkg.id
								? "border-blue-500 shadow-xl scale-105"
								: hoveredPackage === pkg.id
									? "border-blue-300 shadow-lg scale-102"
									: "border-gray-200 hover:border-gray-300"
						}`}
						onClick={() => {
							onSelect(pkg)
						}}
						onMouseEnter={() => {
							setHoveredPackage(pkg.id)
						}}
						onMouseLeave={() => {
							setHoveredPackage(null)
						}}
					>
						{/* Recommended badge for Standard */}
						{pkg.model === "standard" && (
							<div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
								<span className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-1 rounded-full text-xs font-bold">
									RECOMMENDED
								</span>
							</div>
						)}

						{/* Package name */}
						<div className="text-center mb-4">
							<h4 className="text-2xl font-bold text-gray-900 mb-2">{pkg.name}</h4>
							<p className="text-sm text-gray-600">{pkg.description}</p>
						</div>

						{/* Pricing */}
						<div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 mb-6">
							<div className="space-y-2">
								<div className="flex justify-between items-center">
									<span className="text-sm text-gray-600">Management Fee</span>
									<span className="text-lg font-bold text-gray-900">{pkg.pricing.managementFee}%</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-sm text-gray-600">Performance Fee</span>
									<span className="text-lg font-bold text-gray-900">{pkg.pricing.performanceFee}%</span>
								</div>
								<div className="border-t border-gray-300 pt-2 mt-2">
									<div className="flex justify-between items-center">
										<span className="text-sm text-gray-600">Min. Deposit</span>
										<span className="text-xl font-bold text-blue-600">
											${pkg.pricing.minimumDeposit.toLocaleString()}
										</span>
									</div>
								</div>
							</div>
						</div>

						{/* Features */}
						<div className="space-y-3 mb-6">
							{pkg.features.map((feature, idx) => (
								<div key={idx} className="flex items-start gap-2">
									<svg
										className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
									</svg>
									<span className="text-sm text-gray-700">{feature}</span>
								</div>
							))}
						</div>

						{/* Select button */}
						<button
							className={`w-full py-3 rounded-lg font-medium transition-colors ${
								selectedPackage?.id === pkg.id
									? "bg-blue-600 text-white"
									: "bg-gray-100 text-gray-700 hover:bg-gray-200"
							}`}
						>
							{selectedPackage?.id === pkg.id ? "✓ Selected" : "Select Plan"}
						</button>
					</div>
				))}
			</div>

			{/* Comparison note */}
			<div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
				<p className="text-sm text-blue-900">
					💡 <strong>Performance fees</strong> are only charged on profits. Management fees are calculated on AUM
					(Assets Under Management).
				</p>
			</div>
		</div>
	)
}
