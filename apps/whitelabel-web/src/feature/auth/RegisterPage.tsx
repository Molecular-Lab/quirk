import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Building2, Mail, Lock, User, ArrowRight } from 'lucide-react'

export function RegisterPage() {
	const [formData, setFormData] = useState({
		companyName: '',
		fullName: '',
		email: '',
		password: '',
		confirmPassword: '',
	})
	const [loading, setLoading] = useState(false)

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		if (formData.password !== formData.confirmPassword) {
			alert('Passwords do not match')
			return
		}

		setLoading(true)

		// TODO: Implement registration and custodial wallet creation
		console.log('Register:', formData)

		// Simulate API call
		await new Promise((resolve) => setTimeout(resolve, 1500))
		setLoading(false)
	}

	const updateField = (field: keyof typeof formData) => (
		e: React.ChangeEvent<HTMLInputElement>
	) => {
		setFormData((prev) => ({ ...prev, [field]: e.target.value }))
	}

	return (
		<div>
			<h2 className="text-2xl font-bold text-gray-900 mb-6">
				Create your account
			</h2>

			<form onSubmit={handleSubmit} className="space-y-4">
				<div>
					<label
						htmlFor="companyName"
						className="block text-sm font-medium text-gray-700 mb-1"
					>
						Company name
					</label>
					<div className="relative">
						<Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
						<input
							id="companyName"
							type="text"
							required
							value={formData.companyName}
							onChange={updateField('companyName')}
							className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
							placeholder="Acme Inc."
						/>
					</div>
				</div>

				<div>
					<label
						htmlFor="fullName"
						className="block text-sm font-medium text-gray-700 mb-1"
					>
						Full name
					</label>
					<div className="relative">
						<User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
						<input
							id="fullName"
							type="text"
							required
							value={formData.fullName}
							onChange={updateField('fullName')}
							className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
							placeholder="John Doe"
						/>
					</div>
				</div>

				<div>
					<label
						htmlFor="email"
						className="block text-sm font-medium text-gray-700 mb-1"
					>
						Email address
					</label>
					<div className="relative">
						<Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
						<input
							id="email"
							type="email"
							required
							value={formData.email}
							onChange={updateField('email')}
							className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
							placeholder="you@company.com"
						/>
					</div>
				</div>

				<div>
					<label
						htmlFor="password"
						className="block text-sm font-medium text-gray-700 mb-1"
					>
						Password
					</label>
					<div className="relative">
						<Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
						<input
							id="password"
							type="password"
							required
							value={formData.password}
							onChange={updateField('password')}
							className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
							placeholder="Minimum 8 characters"
							minLength={8}
						/>
					</div>
				</div>

				<div>
					<label
						htmlFor="confirmPassword"
						className="block text-sm font-medium text-gray-700 mb-1"
					>
						Confirm password
					</label>
					<div className="relative">
						<Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
						<input
							id="confirmPassword"
							type="password"
							required
							value={formData.confirmPassword}
							onChange={updateField('confirmPassword')}
							className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
							placeholder="Re-enter password"
						/>
					</div>
				</div>

				<div className="flex items-start">
					<input
						type="checkbox"
						required
						className="w-4 h-4 mt-0.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
					/>
					<span className="ml-2 text-sm text-gray-600">
						I agree to the{' '}
						<a href="#" className="text-blue-600 hover:text-blue-700">
							Terms of Service
						</a>{' '}
						and{' '}
						<a href="#" className="text-blue-600 hover:text-blue-700">
							Privacy Policy
						</a>
					</span>
				</div>

				<button
					type="submit"
					disabled={loading}
					className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{loading ? 'Creating account...' : 'Create account'}
					{!loading && <ArrowRight className="w-4 h-4" />}
				</button>
			</form>

			<p className="mt-6 text-center text-sm text-gray-600">
				Already have an account?{' '}
				<Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
					Sign in
				</Link>
			</p>
		</div>
	)
}
