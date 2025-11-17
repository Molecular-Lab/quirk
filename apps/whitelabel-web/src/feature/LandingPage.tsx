import { Link } from '@tanstack/react-router'
import { ArrowRight, Shield, Zap, Users, Lock } from 'lucide-react'

export function LandingPage() {

	return (
		<div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
			{/* Header */}
			<header className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md">
				<div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
					<div className="flex items-center gap-2">
						<div className="text-2xl font-bold text-white">PROXIFY</div>
					</div>
					<nav className="flex items-center gap-6">
						<a href="#features" className="text-white/80 hover:text-white transition-colors">
							Features
						</a>
						<a href="#pricing" className="text-white/80 hover:text-white transition-colors">
							Pricing
						</a>
						<a href="#docs" className="text-white/80 hover:text-white transition-colors">
							Docs
						</a>
						<Link
							to="/login"
							className="bg-primary-500 text-white px-6 py-2 rounded-full hover:bg-primary-600 transition-colors font-medium"
						>
							Get Started
						</Link>
					</nav>
				</div>
			</header>

			{/* Hero Section */}
			<section className="pt-32 pb-20 px-6">
				<div className="max-w-7xl mx-auto text-center">
					<h1 className="text-6xl font-bold mb-6 text-gray-900">
						Embedded Wallets<br />for Web2 Apps
					</h1>
					<p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
						Add crypto functionality to your app in minutes. No blockchain knowledge required.
						Powered by Account Abstraction.
					</p>
					<div className="flex items-center justify-center gap-4">
						<Link
							to="/login"
							className="bg-primary-500 text-white px-8 py-4 rounded-full hover:bg-primary-600 transition-all font-medium text-lg flex items-center gap-2 shadow-lg hover:shadow-xl"
						>
							Start Building
							<ArrowRight className="w-5 h-5" />
						</Link>
						<button className="bg-white border-2 border-gray-200 text-gray-900 px-8 py-4 rounded-full hover:border-gray-300 transition-colors font-medium text-lg">
							View Demo
						</button>
					</div>
				</div>

				{/* Hero Visual */}
				<div className="mt-16 max-w-5xl mx-auto">
					<div className="relative">
						<div className="bg-white rounded-3xl shadow-2xl border border-gray-200 p-8">
							<div className="aspect-video bg-gradient-to-br from-primary-100 to-blue-100 rounded-2xl flex items-center justify-center">
								<div className="text-center">
									<div className="text-6xl mb-4">🚀</div>
									<div className="text-2xl font-bold text-gray-900">Wallet Dashboard Preview</div>
								</div>
							</div>
						</div>
						<div className="absolute -bottom-6 -right-6 bg-primary-500 text-white p-4 rounded-2xl shadow-xl">
							<div className="text-sm font-medium">API-First Infrastructure</div>
							<div className="text-2xl font-bold">99.9% Uptime</div>
						</div>
					</div>
				</div>
			</section>

			{/* Features */}
			<section id="features" className="py-20 bg-white">
				<div className="max-w-7xl mx-auto px-6">
					<h2 className="text-4xl font-bold text-center mb-16 text-gray-900">
						Everything you need to launch
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
						<div className="text-center">
							<div className="bg-primary-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
								<Zap className="w-8 h-8 text-primary-600" />
							</div>
							<h3 className="text-xl font-semibold mb-2 text-gray-900">Instant Setup</h3>
							<p className="text-gray-600">
								Get started in minutes with our simple SDK and APIs
							</p>
						</div>
						<div className="text-center">
							<div className="bg-blue-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
								<Shield className="w-8 h-8 text-blue-600" />
							</div>
							<h3 className="text-xl font-semibold mb-2 text-gray-900">Enterprise Security</h3>
							<p className="text-gray-600">
								Bank-grade security with MPC and Account Abstraction
							</p>
						</div>
						<div className="text-center">
							<div className="bg-purple-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
								<Users className="w-8 h-8 text-purple-600" />
							</div>
							<h3 className="text-xl font-semibold mb-2 text-gray-900">White-Label Ready</h3>
							<p className="text-gray-600">
								Fully customizable to match your brand
							</p>
						</div>
						<div className="text-center">
							<div className="bg-pink-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
								<Lock className="w-8 h-8 text-pink-600" />
							</div>
							<h3 className="text-xl font-semibold mb-2 text-gray-900">Non-Custodial</h3>
							<p className="text-gray-600">
								Users always control their own assets
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* CTA */}
			<section className="py-20 bg-gray-900 text-white">
				<div className="max-w-4xl mx-auto text-center px-6">
					<h2 className="text-4xl font-bold mb-6">
						Ready to add wallets to your app?
					</h2>
					<p className="text-xl text-gray-300 mb-8">
						Join hundreds of companies building the future of Web3
					</p>
					<Link
						to="/login"
						className="bg-primary-500 text-white px-8 py-4 rounded-full hover:bg-primary-600 transition-colors font-medium text-lg inline-flex items-center gap-2"
					>
						Get Started Free
						<ArrowRight className="w-5 h-5" />
					</Link>
				</div>
			</section>

			{/* Footer */}
			<footer className="bg-black text-white py-12">
				<div className="max-w-7xl mx-auto px-6">
					<div className="grid grid-cols-1 md:grid-cols-4 gap-8">
						<div>
							<div className="text-xl font-bold mb-4">PROXIFY</div>
							<p className="text-gray-400 text-sm">
								Embedded wallet infrastructure for modern apps
							</p>
						</div>
						<div>
							<h4 className="font-semibold mb-4">Product</h4>
							<div className="space-y-2 text-sm text-gray-400">
								<div>Features</div>
								<div>Pricing</div>
								<div>Documentation</div>
								<div>API Reference</div>
							</div>
						</div>
						<div>
							<h4 className="font-semibold mb-4">Company</h4>
							<div className="space-y-2 text-sm text-gray-400">
								<div>About</div>
								<div>Blog</div>
								<div>Careers</div>
								<div>Contact</div>
							</div>
						</div>
						<div>
							<h4 className="font-semibold mb-4">Legal</h4>
							<div className="space-y-2 text-sm text-gray-400">
								<div>Privacy</div>
								<div>Terms</div>
								<div>Security</div>
							</div>
						</div>
					</div>
					<div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
						© 2025 Proxify. All rights reserved.
					</div>
				</div>
			</footer>
		</div>
	)
}
