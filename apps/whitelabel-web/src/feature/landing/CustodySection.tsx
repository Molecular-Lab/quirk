export function CustodySection() {
	return (
		<section className="py-20 bg-gray-50">
			<div className="max-w-7xl mx-auto px-6">
				<div className="grid md:grid-cols-2 gap-12 items-center">
					<div>
						<h2 className="text-5xl font-bold text-gray-900 mb-6">
							Secure Custody
							<br />
							with Privy
						</h2>
						<p className="text-xl text-gray-600 mb-8 leading-relaxed">
							Institutional-grade MPC (Multi-Party Computation) custody ensures your users' funds are
							always protected. No single point of failure, fully audited security infrastructure.
						</p>
						<ul className="space-y-4">
							<li className="flex items-start gap-3">
								<div className="w-6 h-6 bg-gray-900 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
									<span className="text-white text-sm">✓</span>
								</div>
								<div>
									<h4 className="font-semibold text-gray-900 mb-1">MPC Technology</h4>
									<p className="text-gray-600">
										Private keys are split across multiple secure nodes—no single point of compromise
									</p>
								</div>
							</li>
							<li className="flex items-start gap-3">
								<div className="w-6 h-6 bg-gray-900 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
									<span className="text-white text-sm">✓</span>
								</div>
								<div>
									<h4 className="font-semibold text-gray-900 mb-1">SOC 2 Compliant</h4>
									<p className="text-gray-600">
										Audited infrastructure meeting enterprise security standards
									</p>
								</div>
							</li>
							<li className="flex items-start gap-3">
								<div className="w-6 h-6 bg-gray-900 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
									<span className="text-white text-sm">✓</span>
								</div>
								<div>
									<h4 className="font-semibold text-gray-900 mb-1">Insurance Coverage</h4>
									<p className="text-gray-600">
										Assets protected by industry-leading custody insurance policies
									</p>
								</div>
							</li>
						</ul>
					</div>
					<div className="bg-white rounded-3xl p-12 border border-gray-200 flex items-center justify-center">
						<div className="text-center">
							<div className="w-32 h-32 bg-gray-50 rounded-full flex items-center justify-center mb-6 mx-auto border border-gray-200">
								<span className="text-6xl">🔐</span>
							</div>
							<h3 className="text-2xl font-bold text-gray-900 mb-2">Powered by Privy</h3>
							<p className="text-gray-600">Trusted by leading Web3 platforms</p>
						</div>
					</div>
				</div>
			</div>
		</section>
	)
}
