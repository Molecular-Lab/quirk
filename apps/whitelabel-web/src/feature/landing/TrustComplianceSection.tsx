export function TrustComplianceSection() {
	return (
		<section className="min-h-[90vh] py-20 bg-gradient-to-b from-gray-50 to-white flex items-center">
			<div className="max-w-7xl mx-auto px-6 w-full">
				{/* Section Header */}
				<div className="text-center mb-16">
					<h2 className="text-5xl font-bold text-gray-950 mb-4">Institutional-Grade Compliance</h2>
					<p className="text-xl text-gray-700 max-w-3xl mx-auto">
						We handle licensing, custody, and regulatory compliance so you can focus on your product.
					</p>
				</div>

				<div className="grid lg:grid-cols-2 gap-8 mb-12">
					{/* Singapore Licensing */}
					<div className="bg-white/90 backdrop-blur-md border border-gray-150 rounded-xl p-8">
						<h3 className="text-xl font-semibold text-gray-950 mb-6">Singapore Regulatory Framework</h3>
						<div className="space-y-4">
							<div className="flex items-start gap-4">
								<div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
									<span className="text-xl">🏛️</span>
								</div>
								<div className="flex-1">
									<div className="font-semibold text-gray-950 mb-1">MPIL License</div>
									<p className="text-sm text-gray-700">
										Major Payment Institution License covering custody, on/off ramp, and transfers
									</p>
									<a
										href="https://www.mas.gov.sg/regulation/payments/major-payment-institution-licence"
										target="_blank"
										rel="noopener noreferrer"
										className="text-xs text-accent hover:underline mt-1 inline-block"
									>
										View MAS documentation →
									</a>
								</div>
							</div>

							<div className="flex items-start gap-4">
								<div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
									<span className="text-xl">📊</span>
								</div>
								<div className="flex-1">
									<div className="font-semibold text-gray-950 mb-1">CMS License</div>
									<p className="text-sm text-gray-700">Capital Markets Services License for fund management services</p>
									<a
										href="https://www.mas.gov.sg/regulation/capital-markets/cms-licence"
										target="_blank"
										rel="noopener noreferrer"
										className="text-xs text-accent hover:underline mt-1 inline-block"
									>
										View MAS documentation →
									</a>
								</div>
							</div>
						</div>

						<div className="mt-6 pt-6 border-t border-gray-200">
							<div className="text-sm text-gray-700">
								<strong className="text-gray-950">Total Licensing Investment:</strong> ~$550K-650K
							</div>
							<div className="text-xs text-gray-500 mt-2">Reference: Sygnum Bank Crypto Yield Fund</div>
						</div>
					</div>

					{/* Security & Custody */}
					<div className="bg-white/90 backdrop-blur-md border border-gray-150 rounded-xl p-8">
						<h3 className="text-xl font-semibold text-gray-950 mb-6">Enterprise Security</h3>
						<div className="space-y-4">
							<div className="flex items-start gap-4">
								<div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
									<span className="text-xl">🔐</span>
								</div>
								<div className="flex-1">
									<div className="font-semibold text-gray-950 mb-1">Privy MPC Custody</div>
									<p className="text-sm text-gray-700">
										Multi-party computation wallets. Keys never stored in single location. Institutional-grade key
										management.
									</p>
								</div>
							</div>

							<div className="flex items-start gap-4">
								<div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
									<span className="text-xl">📝</span>
								</div>
								<div className="flex-1">
									<div className="font-semibold text-gray-950 mb-1">Audit Logging</div>
									<p className="text-sm text-gray-700">
										All transactions logged. Complete audit trail. Real-time monitoring and anomaly detection.
									</p>
								</div>
							</div>

							<div className="flex items-start gap-4">
								<div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
									<span className="text-xl">⚡</span>
								</div>
								<div className="flex-1">
									<div className="font-semibold text-gray-950 mb-1">Rate Limiting & Safety</div>
									<p className="text-sm text-gray-700">
										API rate limiting, max 2× index growth per update, KYB verification for all clients.
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Metrics */}
				<div className="grid md:grid-cols-4 gap-6">
					<div className="relative text-center p-6 rounded-xl bg-white border-t-4 border-blue-500 shadow-sm hover:shadow-md transition-shadow">
						<div className="text-4xl font-bold text-blue-600 mb-2">3-5%</div>
						<div className="text-sm text-gray-600">Average APY</div>
					</div>
					<div className="relative text-center p-6 rounded-xl bg-white border-t-4 border-gray-500 shadow-sm hover:shadow-md transition-shadow">
						<div className="text-4xl font-bold text-gray-700 mb-2">$300B+</div>
						<div className="text-sm text-gray-600">Addressable Market</div>
					</div>
					<div className="relative text-center p-6 rounded-xl bg-white border-t-4 border-green-500 shadow-sm hover:shadow-md transition-shadow">
						<div className="text-4xl font-bold text-green-600 mb-2">100%</div>
						<div className="text-sm text-gray-600">Regulatory Compliant</div>
					</div>
					<div className="relative text-center p-6 rounded-xl bg-white border-t-4 border-cyan-500 shadow-sm hover:shadow-md transition-shadow">
						<div className="text-4xl font-bold text-cyan-600 mb-2">24/7</div>
						<div className="text-sm text-gray-600">Monitoring</div>
					</div>
				</div>
			</div>
		</section>
	)
}
