/**
 * Demo Request Form Component
 * Collects user information for demo requests
 * PUBLIC form - no authentication required
 */

import { useState } from "react"

import { motion } from "framer-motion"
import { Briefcase, Building2, DollarSign, Globe, Mail, User, Users } from "lucide-react"
import { toast } from "sonner"

import { type SubmitDemoRequestParams, submitDemoRequest } from "@/api/demoRequestHelpers"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const COMPANY_SIZES = [
	{ value: "1-10", label: "1-10 employees" },
	{ value: "11-50", label: "11-50 employees" },
	{ value: "51-200", label: "51-200 employees" },
	{ value: "201-1000", label: "201-1,000 employees" },
	{ value: "1000+", label: "1,000+ employees" },
] as const

const INDUSTRIES = [
	{ value: "FinTech", label: "FinTech" },
	{ value: "E-commerce", label: "E-commerce" },
	{ value: "Gaming", label: "Gaming" },
	{ value: "Healthcare", label: "Healthcare" },
	{ value: "Education", label: "Education" },
	{ value: "Other", label: "Other" },
] as const

// Common countries for the dropdown
const COUNTRIES = [
	"United States",
	"United Kingdom",
	"Canada",
	"Australia",
	"Germany",
	"France",
	"Singapore",
	"Hong Kong",
	"Japan",
	"South Korea",
	"India",
	"Brazil",
	"Mexico",
	"Spain",
	"Italy",
	"Netherlands",
	"Switzerland",
	"Sweden",
	"Norway",
	"Denmark",
	"Other",
]

export function DemoRequestForm() {
	const [formData, setFormData] = useState<Partial<SubmitDemoRequestParams>>({
		firstName: "",
		lastName: "",
		email: "",
		companyName: "",
		country: "",
		companySize: undefined,
		capitalVolume: "",
		industry: undefined,
	})

	const [errors, setErrors] = useState<Record<string, string>>({})
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [isSuccess, setIsSuccess] = useState(false)

	const validateForm = (): boolean => {
		const newErrors: Record<string, string> = {}

		if (!formData.firstName?.trim()) {
			newErrors.firstName = "First name is required"
		}

		if (!formData.lastName?.trim()) {
			newErrors.lastName = "Last name is required"
		}

		if (!formData.email?.trim()) {
			newErrors.email = "Email is required"
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
			newErrors.email = "Please enter a valid email address"
		}

		if (!formData.companyName?.trim()) {
			newErrors.companyName = "Company name is required"
		}

		if (!formData.country?.trim()) {
			newErrors.country = "Country is required"
		}

		if (!formData.companySize) {
			newErrors.companySize = "Company size is required"
		}

		if (!formData.capitalVolume?.trim()) {
			newErrors.capitalVolume = "Capital volume is required"
		} else if (!/^\d+(\.\d{1,2})?$/.test(formData.capitalVolume)) {
			newErrors.capitalVolume = "Please enter a valid amount (e.g., 1000000 or 1000000.50)"
		}

		if (!formData.industry) {
			newErrors.industry = "Industry is required"
		}

		setErrors(newErrors)
		return Object.keys(newErrors).length === 0
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		if (!validateForm()) {
			toast.error("Please fix the errors in the form")
			return
		}

		setIsSubmitting(true)

		try {
			await submitDemoRequest(formData as SubmitDemoRequestParams)

			setIsSuccess(true)
			toast.success("Demo request submitted successfully! We'll be in touch soon.")

			// Reset form after 3 seconds
			setTimeout(() => {
				setFormData({
					firstName: "",
					lastName: "",
					email: "",
					companyName: "",
					country: "",
					companySize: undefined,
					capitalVolume: "",
					industry: undefined,
				})
				setIsSuccess(false)
			}, 3000)
		} catch (error) {
			const message = error instanceof Error ? error.message : "Failed to submit demo request"
			toast.error(message)
			console.error("Demo request submission error:", error)
		} finally {
			setIsSubmitting(false)
		}
	}

	if (isSuccess) {
		return (
			<motion.div
				initial={{ opacity: 0, scale: 0.95 }}
				animate={{ opacity: 1, scale: 1 }}
				className="bg-green-50 border-2 border-green-500 rounded-2xl p-12 text-center"
			>
				<div className="w-20 h-20 bg-green-500 rounded-full mx-auto mb-6 flex items-center justify-center">
					<svg
						className="w-10 h-10 text-white"
						fill="none"
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth="2"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path d="M5 13l4 4L19 7" />
					</svg>
				</div>
				<h3 className="text-2xl font-bold text-gray-900 mb-3">Thank You!</h3>
				<p className="text-gray-600 text-lg">
					Your demo request has been submitted successfully.
					<br />
					Our team will reach out to you within 24 hours.
				</p>
			</motion.div>
		)
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
			{/* Personal Information */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{/* First Name */}
				<div>
					<Label htmlFor="firstName" className="flex items-center gap-2 mb-2">
						<User className="w-4 h-4" />
						First Name
					</Label>
					<Input
						id="firstName"
						type="text"
						placeholder="John"
						value={formData.firstName}
						onChange={(e) => {
							setFormData({ ...formData, firstName: e.target.value })
						}}
						className={errors.firstName ? "border-red-500" : ""}
					/>
					{errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
				</div>

				{/* Last Name */}
				<div>
					<Label htmlFor="lastName" className="flex items-center gap-2 mb-2">
						<User className="w-4 h-4" />
						Last Name
					</Label>
					<Input
						id="lastName"
						type="text"
						placeholder="Doe"
						value={formData.lastName}
						onChange={(e) => {
							setFormData({ ...formData, lastName: e.target.value })
						}}
						className={errors.lastName ? "border-red-500" : ""}
					/>
					{errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
				</div>
			</div>

			{/* Email */}
			<div>
				<Label htmlFor="email" className="flex items-center gap-2 mb-2">
					<Mail className="w-4 h-4" />
					Email
				</Label>
				<Input
					id="email"
					type="email"
					placeholder="john.doe@company.com"
					value={formData.email}
					onChange={(e) => {
						setFormData({ ...formData, email: e.target.value })
					}}
					className={errors.email ? "border-red-500" : ""}
				/>
				{errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
			</div>

			{/* Company Information */}
			<div>
				<Label htmlFor="companyName" className="flex items-center gap-2 mb-2">
					<Building2 className="w-4 h-4" />
					Company Name
				</Label>
				<Input
					id="companyName"
					type="text"
					placeholder="Acme Corporation"
					value={formData.companyName}
					onChange={(e) => {
						setFormData({ ...formData, companyName: e.target.value })
					}}
					className={errors.companyName ? "border-red-500" : ""}
				/>
				{errors.companyName && <p className="text-red-500 text-sm mt-1">{errors.companyName}</p>}
			</div>

			{/* Country & Company Size */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{/* Country */}
				<div>
					<Label htmlFor="country" className="flex items-center gap-2 mb-2">
						<Globe className="w-4 h-4" />
						Country
					</Label>
					<Select
						value={formData.country}
						onValueChange={(value) => {
							setFormData({ ...formData, country: value })
						}}
					>
						<SelectTrigger className={errors.country ? "border-red-500" : ""}>
							<SelectValue placeholder="Select country" />
						</SelectTrigger>
						<SelectContent>
							{COUNTRIES.map((country) => (
								<SelectItem key={country} value={country}>
									{country}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					{errors.country && <p className="text-red-500 text-sm mt-1">{errors.country}</p>}
				</div>

				{/* Company Size */}
				<div>
					<Label htmlFor="companySize" className="flex items-center gap-2 mb-2">
						<Users className="w-4 h-4" />
						Company Size
					</Label>
					<Select
						value={formData.companySize}
						onValueChange={(value) => {
							setFormData({ ...formData, companySize: value as SubmitDemoRequestParams["companySize"] })
						}}
					>
						<SelectTrigger className={errors.companySize ? "border-red-500" : ""}>
							<SelectValue placeholder="Select company size" />
						</SelectTrigger>
						<SelectContent>
							{COMPANY_SIZES.map((size) => (
								<SelectItem key={size.value} value={size.value}>
									{size.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					{errors.companySize && <p className="text-red-500 text-sm mt-1">{errors.companySize}</p>}
				</div>
			</div>

			{/* Capital Volume */}
			<div>
				<Label htmlFor="capitalVolume" className="flex items-center gap-2 mb-2">
					<DollarSign className="w-4 h-4" />
					Capital Volume (USD)
				</Label>
				<Input
					id="capitalVolume"
					type="text"
					placeholder="1000000"
					value={formData.capitalVolume}
					onChange={(e) => {
						setFormData({ ...formData, capitalVolume: e.target.value })
					}}
					className={errors.capitalVolume ? "border-red-500" : ""}
				/>
				{errors.capitalVolume && <p className="text-red-500 text-sm mt-1">{errors.capitalVolume}</p>}
				<p className="text-gray-500 text-sm mt-1">Enter the amount without commas (e.g., 1000000 for $1M)</p>
			</div>

			{/* Industry */}
			<div>
				<Label htmlFor="industry" className="flex items-center gap-2 mb-2">
					<Briefcase className="w-4 h-4" />
					Industry
				</Label>
				<Select
					value={formData.industry}
					onValueChange={(value) => {
						setFormData({ ...formData, industry: value as SubmitDemoRequestParams["industry"] })
					}}
				>
					<SelectTrigger className={errors.industry ? "border-red-500" : ""}>
						<SelectValue placeholder="Select industry" />
					</SelectTrigger>
					<SelectContent>
						{INDUSTRIES.map((industry) => (
							<SelectItem key={industry.value} value={industry.value}>
								{industry.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				{errors.industry && <p className="text-red-500 text-sm mt-1">{errors.industry}</p>}
			</div>

			{/* Submit Button */}
			<div className="pt-4">
				<Button
					type="submit"
					className="w-full bg-gray-900 hover:bg-gray-800 text-white py-6 text-sm md:text-md font-medium rounded-xl"
					disabled={isSubmitting}
				>
					{isSubmitting ? (
						<div className="flex items-center justify-center gap-3">
							<div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
							Submitting...
						</div>
					) : (
						"Submit Demo Request"
					)}
				</Button>
			</div>
		</form>
	)
}
