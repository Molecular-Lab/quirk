import { useState } from "react"

import { Building2, Globe } from "lucide-react"

import { type CustomerTier, useOnboardingStore } from "@/store/onboardingStore"

const BUSINESS_TYPES = [
	"E-commerce",
	"FinTech",
	"Gaming",
	"Streaming",
	"Marketplace",
	"DeFi Platform",
	"Payment Processor",
	"Neobank",
	"Other",
]

const INDUSTRIES = [
	"Technology",
	"Financial Services",
	"Entertainment & Media",
	"Retail & E-commerce",
	"Healthcare",
	"Education",
	"Travel & Hospitality",
	"Other",
]

const CUSTOMER_TIERS: { value: CustomerTier; label: string; description: string }[] = [
	{
		value: "0-1000",
		label: "0-1,000 customers",
		description: "Early-stage startup",
	},
	{
		value: "1000-10000",
		label: "1,000-10,000 customers",
		description: "Growing business",
	},
	{
		value: "10000-100000",
		label: "10,000-100,000 customers",
		description: "Established company",
	},
	{
		value: "100000-1000000",
		label: "100,000-1,000,000 customers",
		description: "Large enterprise",
	},
	{
		value: "1000000+",
		label: "1,000,000+ customers",
		description: "Industry leader",
	},
]

export function CompanyInfoForm() {
	const { companyInfo, setCompanyInfo, nextStep, isStepValid } = useOnboardingStore()
	const [errors, setErrors] = useState<Record<string, string>>({})

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()

		const newErrors: Record<string, string> = {}

		if (!companyInfo.companyName.trim()) {
			newErrors.companyName = "Company name is required"
		}

		if (!companyInfo.businessType.trim()) {
			newErrors.businessType = "Business type is required"
		}

		if (!companyInfo.industry.trim()) {
			newErrors.industry = "Industry is required"
		}

		if (!companyInfo.estimatedAUM.trim()) {
			newErrors.estimatedAUM = "Estimated AUM is required"
		} else if (!/^\d+$/.test(companyInfo.estimatedAUM)) {
			newErrors.estimatedAUM = "Please enter a valid number"
		}

		if (companyInfo.websiteUrl && !/^https?:\/\/.+/.test(companyInfo.websiteUrl)) {
			newErrors.websiteUrl = "Please enter a valid URL"
		}

		setErrors(newErrors)

		if (Object.keys(newErrors).length === 0) {
			nextStep()
		}
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			<div>
				<h2 className="text-2xl font-bold text-gray-900 mb-2">Company Information</h2>
				<p className="text-gray-600">Tell us about your business</p>
			</div>

			{/* Company Name */}
			<div>
				<label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
					Company Name *
				</label>
				<div className="relative">
					<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
						<Building2 className="h-5 w-5 text-gray-400" />
					</div>
					<input
						type="text"
						id="companyName"
						value={companyInfo.companyName}
						onChange={(e) => {
							setCompanyInfo({ companyName: e.target.value })
						}}
						className={`
							block w-full pl-10 pr-3 py-2 border rounded-lg shadow-sm
							focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent
							${errors.companyName ? "border-red-500" : "border-gray-300"}
						`}
						placeholder="Acme Corporation"
					/>
				</div>
				{errors.companyName && <p className="mt-1 text-sm text-red-600">{errors.companyName}</p>}
			</div>

			{/* Business Type */}
			<div>
				<label htmlFor="businessType" className="block text-sm font-medium text-gray-700 mb-2">
					Business Type *
				</label>
				<select
					id="businessType"
					value={companyInfo.businessType}
					onChange={(e) => {
						setCompanyInfo({ businessType: e.target.value })
					}}
					className={`
						block w-full px-3 py-2 border rounded-lg shadow-sm
						focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent
						${errors.businessType ? "border-red-500" : "border-gray-300"}
					`}
				>
					<option value="">Select a type</option>
					{BUSINESS_TYPES.map((type) => (
						<option key={type} value={type}>
							{type}
						</option>
					))}
				</select>
				{errors.businessType && <p className="mt-1 text-sm text-red-600">{errors.businessType}</p>}
			</div>

			{/* Industry */}
			<div>
				<label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-2">
					Industry Vertical *
				</label>
				<select
					id="industry"
					value={companyInfo.industry}
					onChange={(e) => {
						setCompanyInfo({ industry: e.target.value })
					}}
					className={`
						block w-full px-3 py-2 border rounded-lg shadow-sm
						focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent
						${errors.industry ? "border-red-500" : "border-gray-300"}
					`}
				>
					<option value="">Select an industry</option>
					{INDUSTRIES.map((ind) => (
						<option key={ind} value={ind}>
							{ind}
						</option>
					))}
				</select>
				{errors.industry && <p className="mt-1 text-sm text-red-600">{errors.industry}</p>}
			</div>

			{/* Website URL */}
			<div>
				<label htmlFor="websiteUrl" className="block text-sm font-medium text-gray-700 mb-2">
					Website URL
				</label>
				<div className="relative">
					<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
						<Globe className="h-5 w-5 text-gray-400" />
					</div>
					<input
						type="url"
						id="websiteUrl"
						value={companyInfo.websiteUrl}
						onChange={(e) => {
							setCompanyInfo({ websiteUrl: e.target.value })
						}}
						className={`
							block w-full pl-10 pr-3 py-2 border rounded-lg shadow-sm
							focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent
							${errors.websiteUrl ? "border-red-500" : "border-gray-300"}
						`}
						placeholder="https://example.com"
					/>
				</div>
				{errors.websiteUrl && <p className="mt-1 text-sm text-red-600">{errors.websiteUrl}</p>}
			</div>

			{/* Description */}
			<div>
				<label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
					Description
				</label>
				<textarea
					id="description"
					value={companyInfo.description}
					onChange={(e) => {
						setCompanyInfo({ description: e.target.value })
					}}
					rows={3}
					className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
					placeholder="Brief description of your business..."
				/>
			</div>

			{/* Customer Tier */}
			<div>
				<label className="block text-sm font-medium text-gray-700 mb-3">
					Customer Base Size * <span className="text-gray-500 font-normal">(affects AI recommendations & pricing)</span>
				</label>
				<div className="space-y-3">
					{CUSTOMER_TIERS.map((tier) => (
						<label
							key={tier.value}
							className={`
								flex items-start p-4 rounded-lg border-2 cursor-pointer transition-all
								${companyInfo.customerTier === tier.value ? "border-gray-900 bg-gray-50" : "border-gray-200 hover:border-gray-300"}
							`}
						>
							<input
								type="radio"
								name="customerTier"
								value={tier.value}
								checked={companyInfo.customerTier === tier.value}
								onChange={(e) => {
									setCompanyInfo({ customerTier: e.target.value as CustomerTier })
								}}
								className="mt-1 h-4 w-4 text-gray-900 focus:ring-gray-900"
							/>
							<div className="ml-3 flex-1">
								<div className="flex items-center justify-between">
									<div className="font-medium text-gray-900">{tier.label}</div>
									<div className="text-sm text-gray-500">{tier.description}</div>
								</div>
							</div>
						</label>
					))}
				</div>
			</div>

			{/* Estimated AUM */}
			<div>
				<label htmlFor="estimatedAUM" className="block text-sm font-medium text-gray-700 mb-2">
					Estimated Assets Under Management (USD) *
				</label>
				<div className="relative">
					<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
						<span className="text-gray-500 sm:text-sm">$</span>
					</div>
					<input
						type="text"
						id="estimatedAUM"
						value={companyInfo.estimatedAUM}
						onChange={(e) => {
							setCompanyInfo({ estimatedAUM: e.target.value.replace(/\D/g, "") })
						}}
						className={`
							block w-full pl-7 pr-3 py-2 border rounded-lg shadow-sm
							focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent
							${errors.estimatedAUM ? "border-red-500" : "border-gray-300"}
						`}
						placeholder="1000000"
					/>
				</div>
				{errors.estimatedAUM && <p className="mt-1 text-sm text-red-600">{errors.estimatedAUM}</p>}
				<p className="mt-1 text-sm text-gray-500">Total value of assets you expect to manage on the platform</p>
			</div>

			{/* Submit Button */}
			<div className="flex justify-end pt-4">
				<button
					type="submit"
					disabled={!isStepValid(0)}
					className="px-6 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
				>
					Next: Strategy Configuration →
				</button>
			</div>
		</form>
	)
}
